import express from "express";
import {
  checkConversationFunction,
  myChats,
} from "../controllers/chat.controller.mjs";

const router = express.Router();

router.get("/mychats", myChats);
router.post("/checkchat", checkConversationFunction);
export default router;
