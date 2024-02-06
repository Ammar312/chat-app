import express from "express";
import {
  getChat,
  postMessage,
  readMessage,
} from "../controllers/chat.controller.mjs";

const router = express.Router();

router.post("/message", postMessage);
router.get("/message/:_id", getChat);
router.put("/message/readmessage", readMessage);

export default router;
