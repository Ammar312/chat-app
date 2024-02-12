import axios from "axios";
import React, { useEffect, useState } from "react";
import { baseURL } from "../core";

const MyChats = () => {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const getMyChats = async () => {
      try {
        const response = await axios.get(`${baseURL}api/mychats`);
        console.log(response);
        setChats(response.data);
        console.log(chats);
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
            <div className="border" key={index}>
              <span className="w-8 h-8 rounded-full bg-green-200"></span>
              {/* {chat.participants.map((per)=>())} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyChats;
