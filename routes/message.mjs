import express from "express";
import { getChat, postMessage } from "../controllers/chat.controller.mjs";

const router = express.Router();

router.post("/message", postMessage);
router.get("/message/:_id", getChat);

export default router;
