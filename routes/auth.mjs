import express from "express";
import {
  signupController,
  loginController,
  logoutController,
  getProfile,
} from "../controllers/auth.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";
import upload from "../middlewares/multer.middleware.mjs";

const router = express.Router();

router.post("/signup", upload.single(""), signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/profile", jwtMiddleware, getProfile);

export default router;
