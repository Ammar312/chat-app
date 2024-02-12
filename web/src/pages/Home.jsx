import React, { useContext } from "react";
import CreatePost from "../components/CreatePost";
import Bar from "../components/Bar";
import { GlobalContext } from "../context/context";
import axios from "axios";
import { baseURL } from "../core";
import { Link } from "react-router-dom";
import MyChats from "../components/MyChats";

const Home = () => {
  const { state, dispatch } = useContext(GlobalContext);

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
  return (
    <div>
      <header className="w-full  px-3 py-2 bg-blue-400 text-white flex justify-between">
        <div className="text-[36px] font-poppins">Chat App</div>
        <button
          onClick={logoutHandle}
          className="p-1 m-2 border-2 border-white text-white cursor-pointer"
        >
          Logout
        </button>
      </header>
      <MyChats />

      <div>{JSON.stringify(state)}</div>
    </div>
  );
};

export default Home;
