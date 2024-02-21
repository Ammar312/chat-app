import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { createServer } from "http";

import connectMongoDB from "./connectDB.mjs";
import apiRoutes from "./routes/index.routes.mjs";

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

app.use(express.urlencoded({ extended: false }));
connectMongoDB(process.env.MONGO_URI);

// Express File Upload
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// app.use(fileUpload({ useTempFiles: true, tempFileDir: "/uploads/" }));
// app.post("/api/upload", (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send("No files were uploaded.");
//   }
//   const sampleFile = req.files.sampleFile;
//   console.log(req.files);
//   const uploadPath = __dirname + `/uploads/${Date.now()}` + sampleFile.name;

//   sampleFile.mv(
//     __dirname + `/uploads/${Date.now()}` + sampleFile.name,
//     (err) => {
//       if (err) return res.status(500).send(err);

//       res.send("File uploaded!");
//     }
//   );
// });

// Routes
app.use("/api", apiRoutes);

// Socket Server
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["*", "http://localhost:5173"],
    methods: "*",
  },
});

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

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
