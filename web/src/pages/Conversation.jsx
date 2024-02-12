import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseURL } from "../core";

const Conversation = () => {
  const [messages, setMessages] = useState(null);
  const { conversationId } = useParams();

  useEffect(() => {
    getConversation();
  }, []);
  const getConversation = async () => {
    try {
      const response = await axios.post(`${baseURL}api/getmessages`, {
        conversationId,
      });
      console.log(response);
      setMessages(response);
    } catch (error) {
      console.log(error);
    }
  };
  return <div>Conversation Page</div>;
};

export default Conversation;
