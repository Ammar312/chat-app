import express from "express";
import {
  getMessages,
  postMessage,
  readMessage,
} from "../controllers/chat.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";
const router = express.Router();

router.post("/sendmessage", jwtMiddleware, postMessage);
router.post("/getmessages", jwtMiddleware, getMessages);
router.put("/message/readmessage", jwtMiddleware, readMessage);

export default router;
