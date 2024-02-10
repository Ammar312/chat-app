import express from "express";
import {
  getMessages,
  postMessage,
  readMessage,
} from "../controllers/chat.controller.mjs";

const router = express.Router();

router.post("/sendmessage", postMessage);
router.post("/getmessages", getMessages);
router.put("/message/readmessage", readMessage);

export default router;
