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
      <h1 className="text-4xl font-medium mb-4 mt-2 mx-1">My Chats</h1>
      <div>
        {chats.map((chat, index) => {
          return (
            <div
              className="border-b flex gap-4 p-2 items-center cursor-pointer hover:bg-gray-200"
              key={index}
            >
              <span className="w-12 h-12 rounded-full bg-gray-300 flex items-end justify-center overflow-hidden">
                <FaUser className="text-white text-4xl" />
              </span>
              {chat.participants
                .filter((per) => per._id !== state.user._id)
                .map((participant, index) => (
                  <div
                    key={index}
                    className="text-2xl first-letter:capitalize w-full"
                    onClick={() =>
                      navigate(`/conversation/${chat._id}`, {
                        state: participant,
                      })
                    }
                  >
                    {participant.username}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyChats;
