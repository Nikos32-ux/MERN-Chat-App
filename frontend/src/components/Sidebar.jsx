import React, { useEffect, useState, useContext, useMemo, useReducer } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";
import User from "./User.jsx";
import api from '../../axiosConfig.js'



const Sidebar = ({ onlineUsers, selectedUser, setSelectedUser, currentUser, unreadMessages, setUnreadMessages, sidebarIsTypingId }) => {

  const { logout } = useContext(AuthContext);
  const [lastMessages, setLastMessages] = useState({});


  const initialState = {
    users : [],
    search : ""
  };


  const sidebarReducer = (state, action) => {
    switch (action.type) {
      case "SET_USERS":
        return { ...state, users: action.payload };
      case "SET_SEARCH":
        return { ...state, search: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(sidebarReducer, initialState);


  useEffect(() => {
    const handleSidebarRead = ({ senderId, receiverId, message }) => {
      setLastMessages(prev => ({ ...prev, [receiverId]: { ...prev[receiverId],sidebarRead:true, message: message ? message.message : "" } }))
    }

    
    //update receiver sidebar
    const handleSidebarReceiveMessage = ({message,receiverId,senderId}) => {
      const msgUserId = message.userId._id.toString()
      setLastMessages(prev=> ({...prev, [senderId]:{...prev[senderId],userId:msgUserId,message:message ? message.message : ""}}))
      socket.emit('send-notify-to-sender',{message,receiverId,senderId})
    }

    //update sender sidebar
    const handleNotifySender = ({message,receiverId,senderId}) => {
      const msgUserId = message.userId._id.toString() 
      setLastMessages(prev=> ({...prev, [receiverId]:{...prev[receiverId],userId:msgUserId,sidebarRead:false ,message:message ? message.message : ""}}))
    }


    socket.on('receive-read-message', handleSidebarRead)
    socket.on('receive-message',handleSidebarReceiveMessage)
    socket.on('receive-notify-to-sender',handleNotifySender)
    return () => {
    socket.off('receive-read-message', handleSidebarRead)
    socket.off('receive-message',handleSidebarReceiveMessage)
    socket.off('receive-notify-to-sender',handleNotifySender)
    }
  }, [currentUser])


   const getLastMessages = async () => {
      try {
        const res = await api.post(
          "/api/messages/get-last-messages",
          { senderId: currentUser._id },
          { withCredentials: true }
        );
        if (res.data.success) {
          const conversationContainer = {};
          const conversations = res.data.conversations;
          for (let con of conversations) {
            const receiverId = con.members.find((id) => id !== currentUser._id);
            const lastMessage = con.messages?.length > 0 ? con.messages.at(-1).message : "";
            const userId = con.messages?.length > 0 ? con.messages.at(-1).userId.toString() : "";
            conversationContainer[receiverId] = {
              message: lastMessage,
              bold: false,
              userId: userId
            };
          }
          setLastMessages(conversationContainer);
        }
      } catch (err) {
        console.error(err.response?.data.message);
      }
    };


  // Fetch last messages
  useEffect(() => {
    getLastMessages();
  }, [currentUser]);

  const fetchUsers = async () => {
      try {
        const res = await api.get("/api/auth/all_users", {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch({
            type: "SET_USERS",
            payload: res.data.users.filter((u) => u._id !== currentUser._id),
          });
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

  //fetch Users
  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    return state.users.filter((u) =>
      u.name.toLowerCase().includes(state.search.toLowerCase())
    );

  }, [state.users, state.search]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setUnreadMessages((prev) => ({ ...prev, [u._id.toString()]: 0 }));
  };


  return (
    <div
      className="min-w-[200px] sm:min-w-[300px] px-2 xl:w-1/6 transition-all duration-300
            bg-gray-800 border-r border-yellow-400 backdrop-blur-sm
            shadow-[4px_0_10px_0_rgba(255,215,0,0.3)] flex gap-4 flex-col"
    >
      <div className="w-full break-words p-4 text-normal text-white ml-1 mt-2">
        <h1>
          Καλωσήρθες{" "}
          <span className="cursor-pointer text-red-400">{currentUser.name}</span>
        </h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search users..."
          value={state.search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
          className="w-full p-2 rounded-lg border border-gray-500 bg-gray-700 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 hover:border-gray-400 transition-colors duration-200"
        />
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto mt-3">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id.toString());
          const unread = unreadMessages[user._id.toString()] || 0;

          return (
            <User
              key = {user._id}
              user = {user}
              isOnline={isOnline}
              unread = {unread}
              selectedUser = {selectedUser}
              currentUser = {currentUser}
              handleSelectUser = {() => handleSelectUser(user)}
              lastMessages = {lastMessages[user._id]}
              sidebarIsTypingId = {sidebarIsTypingId}
            />
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 mb-5">
        <button
          onClick={logout}
          className="w-full tracking-normal m-auto py-2 bg-red-600 hover:bg-red-800 hover:cursor-pointer text-white font-bold rounded-lg shadow-md"
        >
          Logout
        </button>
      </div>
    </div>

  );
};

export default Sidebar;
