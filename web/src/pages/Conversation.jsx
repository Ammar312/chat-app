import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { baseURL,socket } from "../core";
import { FaChevronCircleLeft, FaChevronRight } from "react-icons/fa";
import { GlobalContext } from "../context/context";
import { Bars } from "react-loader-spinner";
import { TiTick } from "react-icons/ti";
import { IoMdCall } from "react-icons/io";
import { BiVideo } from "react-icons/bi";
import relativeTime from "dayjs/plugin/relativeTime";
import VideoScreen from "../components/VideoScreen";

const Conversation = () => {
  const [messages, setMessages] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);


  const { state, dispatch } = useContext(GlobalContext);
  const messageRef = useRef();
  const location = useLocation();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);
  const currentUserId = state.user._id;
  const ref = useRef();
  dayjs.extend(relativeTime);

  useEffect(() => {
    setRecipient(location.state);
  }, [location.state]);

  useEffect(() => {
    if (recipient) {
      getConversationId();
    }
  }, [recipient]);

  useEffect(() => {
    if (conversationId) {
      getConversation();
      readMessage();
    }
  }, [conversationId]);

  useEffect(() => {
    // const socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected");
      console.log("subscribed:", `${currentUserId}-${recipient?._id}`);
    });
    socket.on("disconnect", (message) => {
      console.log("Socket diconnected", message);
      setIsOnline(false);
    });

    socket.on(`${currentUserId}-${recipient?._id}`, async (data) => {
      console.log(data);
      setMessages((prev) => {
        return [...prev, data];
      });
      await readMessage();
    });
    // Set user ID when connecting
    socket.emit("setUserId", currentUserId);

    socket.on("userPresence", ({ userId, status, onlineUser }) => {
      if (userId === recipient?._id) {
        console.log(`${userId} is ${status}`);
        console.log("onlineUser", onlineUser);
        setIsOnline(true);
      }
    });
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);
    return () => {
      socket.close();
    };
  }, [recipient]);
  const getConversationId = async () => {
    try {
      const response = await axios.post(`${baseURL}api/checkchat`, {
        recipientId: recipient?._id,
      });
      console.log(response);
      setConversationId(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getConversation = async () => {
    try {
      const response = await axios.post(`${baseURL}api/getmessages`, {
        conversationId: conversationId,
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
        conversationId: conversationId,
        to: recipient?._id,
        message: messageRef.current.value,
      });

      const newMessage = {
        from: {
          _id: currentUserId,
        },
        message: messageRef.current.value,
        isRead: isOnline ? true : false,
        createdAt: new Date(),
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

  const readMessage = async () => {
    try {
      await axios.put(`${baseURL}api/message/readmessage`, {
        conversationId,
      });
      console.log("Message read!");
    } catch (error) {
      console.log(error);
    }
  };

  // ++++++++++
  const startVideoCall = async () => {
    setIsVideoCalling(true)
    peerConnection.current = new RTCPeerConnection();

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    
    if (peerConnection.current) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream);
      });

      // localVideoRef.current.srcObject = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", {
            to: recipient?._id,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteVideoRef.current.srcObject = remoteStream;
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        to: recipient?._id,
        offer,
      });
      console.log("Emiting offer")
    }
  };

  const handleOffer = async (data) => {
    if (data.from !== recipient?._id) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (peerConnection.current) {
      localStream.getTracks().forEach((track) => {
        if (peerConnection.current.signalingState !== "closed") {
          peerConnection.current.addTrack(track, localStream);
        }
      });

      localVideoRef.current.srcObject = localStream;

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        to: data.from,
        answer,
      });
    }
  };

  const handleAnswer = async (data) => {
    if (data.from !== recipient?._id) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  };

  const handleCandidate = async (data) => {
    if (data.from !== recipient?._id) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    try {
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch (error) {
      console.error("Error adding received ice candidate", error);
    }
  };
  if (loading) {
    return (
      <div className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
        <Bars
          height="60"
          width="60"
          color="#48cae4"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    ); // Show loading indicator while data is being fetched
  }
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <header className="w-full  px-3 py-2 bg-gray-600 text-white flex items-center justify-between gap-7">
        <div className="flex gap-2">
        <Link to="/" className="cursor-pointer">
          <FaChevronCircleLeft className="text-[42px]" />
        </Link>
        <p className="flex flex-col items-start">
          <span className="text-4xl font-semibold first-letter:capitalize">
            {recipient?.username}
          </span>
          <span>{isOnline ? "Online" : ""}</span>
        </p>
        </div>
        <div className="flex gap-5">
          <span className="text-2xl cursor-pointer" ><IoMdCall /></span>
          <span className="text-2xl cursor-pointer"  onClick={startVideoCall
          }

          ><BiVideo /></span>
        </div>
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
              <p className="text-xs text-right flex items-center justify-end">
                {dayjs(message.createdAt).fromNow(true)}
                {state.user._id === message.from._id && (
                  <span>
                    <TiTick
                      className={
                        message.isRead === true ? "text-red-400" : "text-white"
                      }
                    />
                  </span>
                )}
              </p>
            </span>
          );
        })}
      </div>
      {isVideoCalling ? (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
       <div className="relative w-[90%] max-w-[800px] bg-white p-4 rounded-md">
         <video ref={localVideoRef} autoPlay playsInline className="w-full h-[150px]" />
         <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[150px]" />
         <button
           className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
           onClick={()=>setIsVideoCalling(false)}
             
         >
           End Call
         </button>
       </div>
       {console.log("dsjislijvikjaroiidsljcoij")}
     </div>
      ):(console.log("Nothing to show"))}
      {/* {isVideoCalling && (
        <>
        <VideoScreen
          recipientId={recipient?._id}
          currentUserId={currentUserId}
          onClose={() => setIsVideoCalling(false)}
        />
        {console.log("sdkjcbsbkjn")}
        </>
      )} */}
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
