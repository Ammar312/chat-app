import Conversation from "../models/conversation.mjs";
import Message from "../models/message.mjs";
import mongoose from "mongoose";
import responseFunc from "../utilis/response.mjs";
import { io } from "../index.mjs";

export const checkConversationFunction = async (req, res) => {
  const currentUserId = req.currentUser._id;
  const { recipientId } = req.body;
  try {
    const checkConversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, recipientId],
      },
    });

    if (checkConversation) {
      responseFunc(res, 200, "Available", checkConversation._id);
    } else {
      const createConversation = await Conversation.create({
        participants: [currentUserId, recipientId],
      });
      responseFunc(res, 200, "Created", createConversation._id);
    }
  } catch (error) {
    console.log(error);
    responseFunc(res, 500, "Server Error");
  }
};

export const postMessage = async (req, res, next) => {
  if (!req.body.conversationId || !req.body.to || !req.body.message) {
    responseFunc(res, 403, `Required parameter missing!`);
    return;
  }
  if (req.currentUser._id === req.body.to) {
    responseFunc(res, 400, "You can't send message to yourself");

    return;
  }
  try {
    const senderId = new mongoose.Types.ObjectId(req.currentUser._id);
    const recieverId = new mongoose.Types.ObjectId(req.body.to);
    const conversationId = new mongoose.Types.ObjectId(req.body.conversationId);
    const message = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      from: new mongoose.Types.ObjectId(req.currentUser._id),
      to: new mongoose.Types.ObjectId(req.body.to),
      message: req.body.message,
    });
    io.emit(`${req.body.to}-${req.currentUser._id}`, message);
    const updateConversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      isNew: true,
    });
    if (updateConversation) {
      await Conversation.updateOne(
        {
          _id: new mongoose.Types.ObjectId(conversationId),
          isNew: true,
        },
        { $set: { isNew: false } }
      );
    }
    responseFunc(res, 201, "Message Sent");
  } catch (error) {
    console.log("postmessageerror", error);
    responseFunc(res, 500, "Error in sending message");
  }
};

export const getMessages = async (req, res) => {
  if (!req.body.conversationId) {
    responseFunc(res, 403, `required parameters missing`);
    return;
  }
  const page = Number(req.body.page) || 1;
  const pageSize = Number(req.body.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  try {
    const result = await Message.find({
      conversationId: new mongoose.Types.ObjectId(req.body.conversationId),
    })
      // .sort({ _id: -1 })
      // .skip(skip)
      // .limit(pageSize)
      .populate({ path: "from", select: "username email" })
      .populate({ path: "to", select: "username email" });

    res.send(result);
  } catch (error) {
    console.log(error);
    responseFunc(res, 500, "Error in getting messages");
  }
};

export const myChats = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.currentUser._id);
    // const result = await Conversation.find({
    //   participants: { $in: [currentUserId] },
    // }).populate({ path: "participants", select: "username email" });
    const result = await Conversation.aggregate([
      { $match: { participants: { $in: [currentUserId] } } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          as: "messages",
        },
      },
      {
        $project: {
          _id: 1,
          messages: 1,
          isNew: 1,
          "participants._id": 1,
          "participants.username": 1,
          "participants.email": 1,
        },
      },
    ]);
    res.send(result);
  } catch (error) {
    console.log("mychatsError", error);
    res.send("Error in getting Chats");
    responseFunc(res, 500, "Error in getting Chats");
  }
};

export const readMessage = async (req, res) => {
  const { conversationId } = req.body;
  if (!conversationId) {
    responseFunc(res, 403, `Required Data Missing!`);
    return;
  }
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.currentUser._id);
    const result = await Message.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        to: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    responseFunc(res, 200, "OK", result);
    // res.send({ data: result });
  } catch (error) {
    console.log("readMessageError", error);
    responseFunc(res, 500, "Error in updating");
  }
};
