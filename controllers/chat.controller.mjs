import Conversation from "../models/conversation.mjs";
import Message from "../models/message.mjs";
import mongoose from "mongoose";
import responseFunc from "../utilis/response.mjs";

export const postMessage = async (req, res, next) => {
  if (!req.body.to || !req.body.message) {
    // res.status(403).send({ message: "Required parameter missing!" });
    responseFunc(res, 403, `Required parameter missing!`);
    return;
  }
  if (req.currentUser._id === req.body.to) {
    responseFunc(res, 400, "You can't send message to yourself");
    // res.send({ message: "You can't send message to yourself" });
    return;
  }
  try {
    const senderId = new mongoose.Types.ObjectId(req.currentUser._id);
    const recieverId = new mongoose.Types.ObjectId(req.body.to);
    const checkConversation = await Conversation.findOne({
      participants: {
        $all: [senderId, recieverId],
      },
    });
    if (checkConversation) {
      const message = await Message.create({
        conversationId: new mongoose.Types.ObjectId(checkConversation._id),
        from: new mongoose.Types.ObjectId(req.currentUser._id),
        to: new mongoose.Types.ObjectId(req.body.to),
        message: req.body.message,
      });
    } else {
      const createConversation = await Conversation.create({
        // conversationId: `${nanoid()}`,
        participants: [senderId, recieverId],
      });
      console.log("createconversation", createConversation);
      const message = await Message.create({
        conversationId: new mongoose.Types.ObjectId(createConversation._id),
        from: new mongoose.Types.ObjectId(req.currentUser._id),
        to: new mongoose.Types.ObjectId(req.body.to),
        message: req.body.message,
      });
    }
    console.log("checkconversaton", checkConversation);

    // res.send({ message: "Message sent" });
    responseFunc(res, 201, "Message Sent");
  } catch (error) {
    console.log("postmessageerror", error);
    responseFunc(res, 500, "Error in sending message");
    // res.send({ message: "Error in sending message" });
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
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize)
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
