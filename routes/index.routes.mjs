import express from "express";

import myChatRouter from "./mychat.mjs";
import messageRouter from "./message.mjs";
import searchRouter from "./search.mjs";

const router = express.Router();

router.use(myChatRouter);
router.use(messageRouter);
router.use(searchRouter);
export default router;
