import React, { useContext, useRef, useState } from "react";
import { GlobalContext } from "../context/context";
import axios from "axios";
import { baseURL } from "../core";
import { Link, useNavigate } from "react-router-dom";
import MyChats from "../components/MyChats";
import { Dropdown, Modal } from "antd";
import { FaUser } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
const Home = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const currentUserId = state.user._id;
  const searchRef = useRef();
  const navigate = useNavigate();

  const logoutHandle = async () => {
    try {
      const response = await axios.post(
        `${baseURL}api/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch({
        type: "USER_LOGOUT",
      });
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const items = [
    {
      label: (
        <div onClick={logoutHandle} className="text-red-400">
          Logout
        </div>
      ),
      key: "0",
    },
  ];

  const showModal = async () => {
    setIsModalOpen(true);
    try {
      const response = await axios.get(`${baseURL}api/allusers`);
      console.log(response.data);
      // setUsers((prev) => [...prev, response.data]);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setUsers([]);
    searchRef.current.value = "";
  };
  const searchUser = async (e) => {
    e.preventDefault();
    try {
      const user = searchRef.current.value;
      const response = await axios.get(`${baseURL}api/search?search=${user}`);
      console.log(response);
      setUsers(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <header className="w-full  px-3 py-2 bg-blue-400 text-white flex justify-between">
        <div className="text-[36px] font-poppins">Chat App</div>
        <div className="cursor-pointer flex gap-6 items-center">
          <IoSearchOutline className="text-2xl" onClick={showModal} />
          <Dropdown
            menu={{ items }}
            // trigger={["click"]}
          >
            <div className="flex flex-col items-center">
              {/* <span className="w-10 h-10 rounded-full bg-gray-200 flex items-end justify-center overflow-hidden">
                <FaUser className="text-white text-4xl" />
              </span> */}
              <span className="text-2xl first-letter:capitalize">
                {state.user.username}
              </span>
            </div>
          </Dropdown>
        </div>
      </header>
      <MyChats />

      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <form className="border-b mt-5 mb-3" onSubmit={searchUser}>
          <input
            type="text"
            className="p-2 pb-0 text-xl w-full outline-none placeholder:text-lg"
            placeholder="Search a user..."
            ref={searchRef}
          />
        </form>
        <div className="max-h-[250px] overflow-y-auto">
          {users?.length ? (
            users
              ?.filter((user) => currentUserId !== user._id)
              ?.map((eachUser, index) => {
                return (
                  <div
                    key={index}
                    className="border-b flex gap-4 p-2 items-center cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      navigate(`/conversation`, { state: eachUser })
                    }
                  >
                    <span className="w-10 h-10 rounded-full bg-gray-300 flex items-end justify-center overflow-hidden">
                      <FaUser className="text-white text-3xl" />
                    </span>
                    <div className="text-black first-letter:capitalize text-lg">
                      {eachUser.username}
                    </div>
                  </div>
                );
              })
          ) : (
            <div>No User Found</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Home;
