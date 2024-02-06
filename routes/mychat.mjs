import express from "express";
import { myChats } from "../controllers/chat.controller.mjs";

const router = express.Router();

router.get("/mychats", myChats);

export default router;
