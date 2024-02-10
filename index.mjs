import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import cors from "cors";

import messageRouter from "./routes/message.mjs";
import authRouter from "./routes/auth.mjs";
import myChatRouter from "./routes/mychat.mjs";
import connectMongoDB from "./connectDB.mjs";
import USER from "./models/user.mjs";
import mongoose from "mongoose";
import responseFunc from "./utilis/response.mjs";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
connectMongoDB(process.env.MONGO_URI);

app.use("/api", authRouter);

app.use("/api", (req, res, next) => {
  const token = req.cookies.token;
  console.log("token", token);
  try {
    const decoded = Jwt.verify(token, process.env.SECRET);
    console.log("decoded", decoded);
    req.body.decoded = {
      username: decoded.username,
      email: decoded.email,
      _id: decoded._id,
    };

    req.currentUser = {
      username: decoded.username,
      email: decoded.email,
      _id: decoded._id,
    };
    next();
  } catch (error) {
    console.log("errorabc", error);
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
});
app.get("/api/profile", async (req, res) => {
  const { _id } = req.currentUser;
  try {
    const result = await USER.findOne({
      _id: new mongoose.Types.ObjectId(_id),
    });
    responseFunc(res, 200, "Profile Fetched", {
      username: result.username,
      email: result.email,
      _id: result._id,
    });
  } catch (error) {
    console.log("profileFetchedError", error);
  }
});
app.get("/api/allusers", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 2;
  const skip = (page - 1) * pageSize;
  try {
    const allusers = await USER.find({}, { _id: 1, username: 1, email: 1 })
      .skip(skip)
      .limit(pageSize);
    res.send(allusers);
  } catch (error) {
    console.log(error);
    res.send({ message: "Error in getting users" });
  }
});

app.use("/api", myChatRouter);
app.use("/api", messageRouter);

app.use("/", (req, res) => {
  res.send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
