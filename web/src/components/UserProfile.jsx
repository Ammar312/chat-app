import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
// import Post from "./Post";
// import EditPostComp from "./EditPostComp";
import { message } from "antd";
import { baseURL } from "../core";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../context/context";

const UserProfile = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [allPosts, setAllPosts] = useState([]);
  const [toggleRefresh, setToggleRefresh] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const titleInput = useRef();
  const bodyInput = useRef();
  const searchRef = useRef(null);
  const { userId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${baseURL}api/v1/posts?_id=${userId || ""}`,
          {
            withCredentials: true,
          }
        );
        setAllPosts(response.data);
      } catch (error) {}
    };
    fetchData();
    getProfile();
  }, [toggleRefresh]);

  const getProfile = async () => {
    try {
      const response = await axios.get(
        `${baseURL}api/v1/profile/${userId || ""}`
      );
      console.log(response);
      console.log("userId:", userId);
      setProfile(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}api/v1/post`, {
        title: titleInput.current.value,
        text: bodyInput.current.value,
      });
      console.log(response.data);
      setToggleRefresh(!toggleRefresh);
      // Clear the input fields after successful submission
      titleInput.current.value = "";
      bodyInput.current.value = "";
      message.success(`${response.data}`);
    } catch (error) {
      console.log(error);
      message.error("Error in posting");
    }
  };
  const searchHandler = async (e) => {
    e.preventDefault();
    setConfirmLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}api/v1/search?q=${searchRef.current.value}`
      );
      console.log("searchresponse", response);
      setAllPosts([...response.data]);
      setConfirmLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const deleteHandle = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}api/v1/post/${id}`);
      console.log(response.data);
      setConfirmLoading(true);
      message.success(`${response.data}`);
      setToggleRefresh(!toggleRefresh);
    } catch (error) {
      console.log(error);
    }
  };
  const editPost = (index) => {
    allPosts[index].isEdit = true;
    setAllPosts([...allPosts]);
    console.log("clicked", index);
  };
  const cancelEdit = (index) => {
    allPosts[index].isEdit = false;
    setAllPosts([...allPosts]);
    console.log("canceled", index);
  };
  const saveEdit = async (e, id) => {
    const title =
      e.target.parentElement.previousElementSibling.firstChild.value;
    const text = e.target.parentElement.previousElementSibling.lastChild.value;

    try {
      const response = await axios.put(`${baseURL}api/v1/post/${id}`, {
        title: title,
        text: text,
      });
      setToggleRefresh(!toggleRefresh);
      console.log(response.data);
      message.success(`${response.data}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-start gap-y-6">
        <div>
          <h1>
            {profile?.data?.firstName}
            {profile?.data?.lastName}
          </h1>
        </div>
        {state.user._id === userId && (
          <div className=" border-2 max-w-lg md:w-[450px]">
            <form onSubmit={submitPost} className=" flex flex-col gap-2 p-4">
              <input
                className="border-2 p-2 text-lg outline-none"
                type="text"
                required
                placeholder="Title of the post"
                minLength={3}
                maxLength={70}
                ref={titleInput}
              />
              <textarea
                type="text"
                required
                placeholder="What's in your mind!"
                minLength={3}
                ref={bodyInput}
                rows="3"
                className="border-2 p-2 text-lg outline-none "
              ></textarea>
              <button
                type="submit"
                className="border-2 border-black text-[1.1rem] text-black font-medium w-44 p-3 rounded-xl hover:text-black hover:bg-white transition-all"
              >
                Publish
              </button>
            </form>
          </div>
        )}
        <div className=" lg:mr-12">
          <form
            className="flex items-center border-2 border-white bg-white w-[300px] px-2 max-[470px]:w-full"
            onSubmit={searchHandler}
          >
            <input
              type="search"
              ref={searchRef}
              placeholder="Search"
              className=" px-4 py-2 text-xl bg-transparent w-full outline-none"
            />
            <button
              type="submit"
              className=" text-blue-500 text-2xl flex items-center"
            >
              {/* <SearchOutlined /> */}
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      {allPosts?.map((eachPost, index) => {
        return (
          <div key={index}>
            {eachPost.isEdit ? (
              <EditPostComp
                eachPost={eachPost}
                cancelEdit={cancelEdit}
                index={index}
                saveEdit={saveEdit}
              />
            ) : (
              <Post
                eachPost={eachPost}
                deleteHandle={deleteHandle}
                editPost={editPost}
                index={index}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserProfile;
