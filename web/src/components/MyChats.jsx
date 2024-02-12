import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { baseURL } from "../core";
import { GlobalContext } from "../context/context";
import { FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const MyChats = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const getMyChats = async () => {
      try {
        const response = await axios.get(`${baseURL}api/mychats`);
        setChats(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getMyChats();
  }, []);
  return (
    <div>
      <div>
        {chats.map((chat, index) => {
          return (
            <div
              className="border-b flex gap-4 p-2 items-center cursor-pointer"
              key={index}
              onClick={() =>
                navigate(`/conversation/${chat._id}`, { state: chat })
              }
            >
              <span className="w-12 h-12 rounded-full bg-gray-200 flex items-end justify-center">
                <FaUser className="text-white text-4xl" />
              </span>
              {chat.participants
                .filter((per) => per._id !== state.user._id)
                .map((participant, index) => (
                  <span
                    key={index}
                    className="text-2xl first-letter:capitalize"
                  >
                    {participant.username}
                  </span>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyChats;
