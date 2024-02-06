import { nanoid } from "nanoid";
import Conversation from "../models/conversation.mjs";
import Message from "../models/message.mjs";
import mongoose, { ObjectId } from "mongoose";

export const postMessage = async (req, res, next) => {
  if (!req.body.to_id || !req.body.message) {
    res.status(403).send({ message: "Required parameter missing!" });
    return;
  }
  if (req.currentUser._id === req.body.to_id) {
    res.send({ message: "You can't send message to yourself" });
    return;
  }
  console.log("current user", req.currentUser);
  try {
    const senderId = new mongoose.Types.ObjectId(req.currentUser._id);
    const recieverId = new mongoose.Types.ObjectId(req.body.to_id);
    const checkConversation = await Conversation.findOne({
      participants: {
        $all: [senderId, recieverId],
      },
    });
    if (checkConversation) {
      const message = await Message.create({
        // fromName: req.currentUser.username,
        // fromEmail: req.currentUser.email,
        // from_id: req.currentUser._id,
        conversationId: checkConversation.conversationId,
        from: new mongoose.Types.ObjectId(req.currentUser._id),
        to_id: new mongoose.Types.ObjectId(req.body.to_id),
        message: req.body.message,
      });
    } else {
      const createConversation = await Conversation.create({
        conversationId: `${nanoid()}`,
        participants: [senderId, recieverId],
      });
      console.log("createconversation", createConversation);
      const message = await Message.create({
        conversationId: createConversation.conversationId,
        from: new mongoose.Types.ObjectId(req.currentUser._id),
        to_id: new mongoose.Types.ObjectId(req.body.to_id),
        message: req.body.message,
      });
    }
    console.log("checkconversaton", checkConversation);

    res.send({ message: "Message sent" });
  } catch (error) {
    console.log("postmessageerror", error);
    res.send({ message: "Error in sending message" });
  }
};

export const getChat = async (req, res) => {
  if (!req.params._id) {
    res.status(403);
    res.send(`required parameters missing`);
    return;
  }
  const senderId = new mongoose.Types.ObjectId(req.currentUser._id);
  const recieverId = new mongoose.Types.ObjectId(req.params.to_id);
  try {
    const result = await Message.find({
      // $or: [
      //   { from: senderId, to_id: recieverId },
      //   { from_id: recieverId, to_id: senderId },
      // ],
      conversationId: req.params._id,
    }).populate({ path: "from", select: "username email" });

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send({ message: "Error in getting messages" });
  }
};

export const myChats = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.currentUser._id);
    const result = await Conversation.find({
      participants: { $in: [currentUserId] },
    }).populate({ path: "participants", select: "username email" });
    res.send(result);
  } catch (error) {
    console.log("mychatsError", error);
  }
};

export const readMessage = async (req, res) => {
  const { conversationId } = req.body;
  if (!conversationId) {
    return res.status(403).send({ message: "Required Data Missing" });
  }
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.currentUser._id);
    const result = await Message.updateMany(
      {
        conversationId: conversationId,
        to_id: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    res.send({ data: result });
  } catch (error) {
    console.log("readMessageError", error);
    res.send("Error in updating");
  }
};
