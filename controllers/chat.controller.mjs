import Message from "../models/message.mjs";
import { ObjectId } from "mongoose";

export const postMessage = async (req, res) => {
  if (!req.body.to_id || !req.body.message) {
    res.status(403).send({ message: "Required parameter missing!" });
    return;
  }
  console.log("current user", req.currentUser);
  try {
    await Message.create({
      fromName: req.currentUser.username,
      fromEmail: req.currentUser.email,
      from_id: req.currentUser._id,
      to_id: req.body.to_id,
      message: req.body.message,
    });
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
  try {
    const result = await Message.find({
      $or: [
        { from_id: req.currentUser._id, to_id: req.params._id },
        { from_id: req.params._id, to_id: req.currentUser._id },
      ],
    });

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send({ message: "Error in getting messages" });
  }
};
