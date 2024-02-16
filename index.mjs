import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import cookie from "cookie";

import messageRouter from "./routes/message.mjs";
import authRouter from "./routes/auth.mjs";
import myChatRouter from "./routes/mychat.mjs";
import connectMongoDB from "./connectDB.mjs";
import USER from "./models/user.mjs";
import searchRouter from "./routes/search.mjs";
import mongoose from "mongoose";
import responseFunc from "./utilis/response.mjs";
import { socketUsers } from "./core.mjs";

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
let currentUserId;
app.use("/api", (req, res, next) => {
  const token = req.cookies.token;

  try {
    const decoded = Jwt.verify(token, process.env.SECRET);

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
  currentUserId = _id;
  try {
    const result = await USER.findOne({
      _id,
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
console.log("currentUserId", currentUserId);
app.use("/api", myChatRouter);
app.use("/api", messageRouter);
app.use("/api", searchRouter);

app.use("/", (req, res) => {
  res.send("404 Not Found");
});

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["*", "http://localhost:5173"],
    methods: "*",
  },
});
// io.use((socket, next) => {
//   console.log("socket", socket.request.headers.cookie);
//   const parsedCookies = cookie.parse(socket.request.headers.cookie || "");
//   console.log("parsedCookies: ", parsedCookies.token);
//   try {
//     const decoded = Jwt.verify(parsedCookies.token, process.env.SECRET);
//     socketUsers[decoded._id] = socket;
//     next();
//   } catch (error) {
//     return next(new Error("Authentication error"));
//   }
// });
const userPresence = new Map();
io.on("connection", (socket) => {
  console.log("New Client Connected", socket.id);
  socket.on("setUserId", (userId) => {
    userPresence.set(userId, socket.id); // Set user as online when they connect
    io.emit("userPresence", {
      userId,
      status: "online",
      onlineUser: userPresence,
    });
    console.log(userPresence);
  });

  socket.on("disconnect", () => {
    const userId = [...userPresence.entries()].find(
      ([key, value]) => value === socket.id
    )?.[0];
    if (userId) {
      userPresence.delete(userId); // Remove user when they disconnect
      io.emit("userPresence", { userId, status: "offline" });
    }
  });
});
// io.on("connection", (socket) => {
//   console.log("New Client Connected", socket.id);
//   socket.emit("Topic 1", "somedata");
//   socket.on("disconnect", (message) => {
//     console.log("Client Disconncted", message);
//   });
// });
// setInterval(() => {
//   io.emit("Topic 1", "somedata");
//   console.log("emitting");
// }, 2000);

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
