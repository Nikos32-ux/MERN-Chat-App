import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import morgan from 'morgan'
import cors from "cors";
import cookieParser from "cookie-parser";
import MessageRoutes from "./routes/Messages.js";
import AuthRoutes from "./routes/Auth.js";
import { connectToDB } from "./utils/db.js";
import { config } from "dotenv";
import { deleteMessage } from "./controllers/Message.js";
import ConversationModel from "./models/Conversation.js";
import MessageModel from "./models/Messages.js";
import verifyToken from "./middleware/verify-token.js";

config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"]
  },
  transports:["websocket","polling"]
});

let onlineUsers = {};

io.on("connection", (socket) => {

  socket.on("user-online", (userId) => {
    userId = userId.toString();
    if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
    onlineUsers[userId].add(socket.id);
  
    io.emit("update-users", Object.keys(onlineUsers));
  });

  socket.on("send-message", ({receiverId,message,senderId}) => {
    console.log("server send-message message",message);
    
     const receiverSockets = onlineUsers[receiverId?.toString()]
     if(receiverSockets){
      receiverSockets.forEach((id)=> io.to(id).emit("receive-message",{message,receiverId,senderId}))
     }
  });

  socket.on('send-notify-to-sender',({message,receiverId,senderId})=>{
    const senderSockets = onlineUsers[senderId.toString()]
    if(senderSockets && message){
      senderSockets.forEach((id)=>io.to(id).emit('receive-notify-to-sender',{message,receiverId,senderId}))
    }
  })

  socket.on('send-emoji', async(data)=>{
    const {message, senderId,receiverId} = data
    const receiverSockets = onlineUsers[receiverId?.toString()]
    if(receiverSockets){
      receiverSockets.forEach((id)=>io.to(id).emit('receive-emoji',{message}))
    }
  })

  socket.on('send-deleted-message', async ({senderId,receiverId,deletedMessage})=>{
    const receiverSockets = onlineUsers[receiverId?.toString()]
    if(receiverSockets){
      receiverSockets.forEach((id)=> io.to(id).emit('receive-deleted-message',{deletedMessage}))
      
    }
  })

  socket.on("typing-start", ({ senderId, receiverId }) => {
    const receiverSockets = onlineUsers[receiverId?.toString()];
    if (receiverSockets) {
      receiverSockets.forEach((id) => io.to(id).emit("receive-typing-start", {senderId}));
    }
  });

  socket.on("typing-stop", ({ senderId, receiverId }) => {
    const receiverSockets = onlineUsers[receiverId?.toString()];
    if (receiverSockets) {
      receiverSockets.forEach((id) => io.to(id).emit("receive-typing-stop", {senderId}));
    }
  });

  socket.on('send-heart',({receiverId,senderId,message})=>{
    console.log("message",message);
    
    const receiverSockets = onlineUsers[receiverId?.toString()]
    if(receiverSockets){
      receiverSockets.forEach((id)=>io.to(id).emit("receive-heart",{message}))
    }
  })

  socket.on("send-editedMsg",(data)=>{
    const {updatedMessage,senderId,receiverId} = data
    const receiverSockets = onlineUsers[receiverId?.toString()]
    if(receiverSockets){
      receiverSockets.forEach((id)=> io.to(id).emit('receive-edited-message',{updatedMessage,senderId}))
    }
  })

  socket.on('send-read-message',async ({senderId,receiverId,message})=>{
    await MessageModel.updateMany(
      {userId:senderId, receiverId:receiverId,read:false},
      {$set:{read:true, sidebarRead:true}}
    )
    const senderSockets = onlineUsers[senderId?.toString()]
    if(senderSockets && message){
      senderSockets.forEach((id)=>io.to(id).emit('receive-read-message',{senderId,receiverId,message}))
    }
  })

  socket.on('notify-sidebar-receiver',({receiverId,senderId,message})=>{
    const receiverSockets = onlineUsers[receiverId?.toString()]
    if(receiverSockets && message){
      receiverSockets.forEach((id)=> io.to(id).emit('handle-notify-sidebar-receiver',{message,senderId,receiverId}))
    }
  })

  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      onlineUsers[userId].delete(socket.id);
      if (onlineUsers[userId].size === 0) delete onlineUsers[userId];
    }
    io.emit("update-users", Object.keys(onlineUsers));
  });
});



// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL ,
  methods:["GET","PUT","POST","DELETE"], 
  credentials: true
  }));

app.use(express.json());
app.use(morgan("dev", { stream: process.stderr }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", verifyToken , MessageRoutes);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDB();
});
