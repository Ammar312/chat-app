import express from "express";
import {
  checkConversationFunction,
  myChats,
} from "../controllers/chat.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";

const router = express.Router();

router.get("/mychats", jwtMiddleware, myChats);
router.post("/checkchat", jwtMiddleware, checkConversationFunction);
export default router;
