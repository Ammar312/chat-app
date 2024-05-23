import express from "express";

import authRouter from "./auth.mjs";
import myChatRouter from "./mychat.mjs";
import messageRouter from "./message.mjs";
import searchRouter from "./search.mjs";
import profileRouter from './profile.mjs';

const router = express.Router();
router.use(authRouter);
router.use(myChatRouter);
router.use(messageRouter);
router.use(searchRouter);
router.use(profileRouter);
export default router;
