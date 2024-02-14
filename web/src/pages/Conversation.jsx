import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Link, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { baseURL } from "../core";
import { FaChevronCircleLeft, FaChevronRight } from "react-icons/fa";
import { GlobalContext } from "../context/context";
import relativeTime from "dayjs/plugin/relativeTime";

const Conversation = () => {
  const [messages, setMessages] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { conversationId } = useParams();
  const { state, dispatch } = useContext(GlobalContext);
  const messageRef = useRef();
  const location = useLocation();
  const currentUserId = state.user._id;
  const ref = useRef();
  dayjs.extend(relativeTime);

  useEffect(() => {
    setRecipient(location.state);
  }, [location.state]);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [loading]);
  useEffect(() => {
    getConversation();
  }, []);
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected");
      console.log("subscribed:", `${currentUserId}-${recipient?._id}`);
    });
    socket.on("disconnect", (message) => {
      console.log("Socket diconnected", message);
    });

    socket.on(`${currentUserId}-${recipient?._id}`, (data) => {
      console.log(data);
      setMessages((prev) => {
        return [...prev, data];
      });
    });
    return () => {
      socket.close();
    };
  }, [recipient]);

  const getConversation = async () => {
    try {
      const response = await axios.post(`${baseURL}api/getmessages`, {
        conversationId,
      });
      console.log(response.data);
      setMessages([...response.data]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  // const setrecipientData = () => {
  //   if (currentUserId === messages?.[0]?.from._id) {
  //     setrecipient({
  //       username: messages?.[0]?.to.username,
  //       id: messages?.[0]?.to?._id,
  //     });
  //   } else {
  //     setrecipient({
  //       username: messages?.[0]?.from?.username,
  //       id: messages?.[0]?.from?._id,
  //     });
  //   }
  // };
  const sendMessage = async (e) => {
    try {
      const response = await axios.post(`${baseURL}api/sendmessage`, {
        to: recipient?._id,
        message: messageRef.current.value,
      });

      const newMessage = {
        from: {
          _id: currentUserId,
        },
        message: messageRef.current.value,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      messageRef.current.value = "";
    } catch (error) {
      console.log(error);
    }
  };
  const handleKey = (e) => {
    e.code === "Enter" && sendMessage();
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while data is being fetched
  }
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <header className="w-full  px-3 py-2 bg-blue-400 text-white flex items-center gap-7">
        <Link to="/" className="cursor-pointer">
          <FaChevronCircleLeft className="text-[42px]" />
        </Link>
        <p className="text-4xl font-semibold first-letter:capitalize">
          {recipient?.username}
        </p>
      </header>
      <div className="p-4 flex-1 flex flex-col  gap-2 w-full h-full overflow-y-auto bg-gray-300">
        {messages?.map((message, index) => {
          return (
            <span
              key={index}
              ref={ref}
              className={
                state.user._id !== message.from._id
                  ? `p-2  inline rounded-tr-2xl rounded-br-2xl rounded-bl-2xl self-start bg-white`
                  : `p-2  rounded-tl-2xl rounded-br-2xl rounded-bl-2xl self-end bg-blue-400 text-white`
              }
            >
              <p className="text-xl">{message.message}</p>
              <p className="text-xs text-right">
                {dayjs(message.createdAt).fromNow(true)}
              </p>
            </span>
          );
        })}
      </div>
      <div className=" border flex items-center gap-4 px-4 rounded-md cursor-pointer">
        <textarea
          name=""
          id=""
          rows="1"
          className="w-full resize-none text-[22px] py-2 outline-none textArea"
          placeholder="Send message..."
          ref={messageRef}
          onKeyDown={handleKey}
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
