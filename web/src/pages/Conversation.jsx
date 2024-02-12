import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Link, useParams } from "react-router-dom";
import { baseURL } from "../core";
import { FaChevronCircleLeft, FaChevronRight } from "react-icons/fa";
import { GlobalContext } from "../context/context";
const Conversation = () => {
  const [messages, setMessages] = useState(null);
  const [reciepent, setReciepent] = useState(null);
  const { conversationId } = useParams();
  const messageRef = useRef();
  const { state, dispatch } = useContext(GlobalContext);
  const currentUserId = state.user._id;
  // const reciepentData = messages.filter((q)=>)
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected");
    });
    socket.on("Test Topic", (data) => {
      console.log(data);
    });
    socket.on("disconnect", (message) => {
      console.log("Socket diconnected", message);
    });
    return () => {
      socket.close();
    };
  }, []);
  useEffect(() => {
    getConversation();
    // setReciepentData();
  }, []);
  const getConversation = async () => {
    try {
      const response = await axios.post(`${baseURL}api/getmessages`, {
        conversationId,
      });
      console.log(response);
      setMessages(response.data);
      console.log(messages);
    } catch (error) {
      console.log(error);
    }
  };
  const setReciepentData = () => {
    if (currentUserId === messages?.[0]?.from._id) {
      setReciepent({
        username: messages?.[0]?.to.username,
        id: messages?.[0]?.to?._id,
      });
    } else {
      setReciepent({
        username: messages?.[0]?.from?.username,
        id: messages?.[0]?.from?._id,
      });
    }
  };
  const sendMessage = async () => {
    try {
      const response = await axios.post(`${baseURL}api/sendmessage`, {
        to,
        message: messageRef.current.value,
      });
    } catch (error) {}
  };

  console.log(reciepent);
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <header className="w-full  px-3 py-2 bg-blue-400 text-white flex">
        <Link to="/" className="cursor-pointer">
          <FaChevronCircleLeft className="text-[42px]" />
        </Link>
        <p>{reciepent?.username}</p>
      </header>
      <div className="p-2 flex-1 flex flex-col justify-end gap-2 w-full h-full overflow-y-auto bg-gray-300">
        {messages?.map((message, index) => {
          return (
            <span
              key={index}
              className={
                state.user._id !== message.from._id
                  ? `p-2 border inline rounded-tr-2xl rounded-br-2xl rounded-bl-2xl self-start bg-white`
                  : `p-2 border rounded-tl-2xl rounded-br-2xl rounded-bl-2xl self-end bg-blue-400 text-white`
              }
            >
              {message.message}
            </span>
          );
        })}
      </div>
      <div className=" border flex items-center gap-4 px-4 rounded-md cursor-pointer">
        <textarea
          name=""
          id=""
          rows="1"
          className="w-full resize-none text-[22px] py-2 outline-none"
          placeholder="Send message..."
          ref={messageRef}
        ></textarea>
        <span
          className="w-[40px] h-[40px] rounded-full flex justify-center items-center bg-blue-400"
          onClick={sendMessage}
        >
          <FaChevronRight className="text-white font-bold" />
        </span>
      </div>
    </div>
  );
};

export default Conversation;
