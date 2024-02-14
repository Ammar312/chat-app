import React, { useContext, useState } from "react";
import CreatePost from "../components/CreatePost";
import Bar from "../components/Bar";
import { GlobalContext } from "../context/context";
import axios from "axios";
import { baseURL } from "../core";
import { Link } from "react-router-dom";
import MyChats from "../components/MyChats";
import { Dropdown, Modal } from "antd";
import { FaUser } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
const Home = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const currentUserId = state.user._id;

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
      label: <div onClick={logoutHandle}>Logout</div>,
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
              <span className="text-2xl">{state.user.username}</span>
            </div>
          </Dropdown>
        </div>
      </header>
      <MyChats />

      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <form>
          <input type="text" />
        </form>
        <div className="max-h-[250px] overflow-y-auto">
          {users
            .filter((user) => currentUserId !== user._id)
            .map((eachUser, index) => {
              return (
                <div
                  key={index}
                  className="border-b flex gap-4 p-2 items-center cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full bg-gray-300 flex items-end justify-center overflow-hidden">
                    <FaUser className="text-white text-3xl" />
                  </span>
                  <div className="text-black">{eachUser.username}</div>
                </div>
              );
            })}
        </div>
      </Modal>
    </div>
  );
};

export default Home;
