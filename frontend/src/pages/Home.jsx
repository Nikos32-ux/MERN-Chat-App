import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";



const Home = () => {
  const { loggedInUser } = useContext(AuthContext);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({})
  const [sidebarIsTypingId, setsidebarIsTypingId] = useState(null)

  useEffect(() => {
    if (!loggedInUser) return;
    socket.emit("user-online", loggedInUser._id);
    socket.on("update-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("update-users");
    };
  }, [loggedInUser]);

  


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        onlineUsers={onlineUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        currentUser={loggedInUser}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
        sidebarIsTypingId = {sidebarIsTypingId}
      />
      <ChatContainer
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        currentUser={loggedInUser}
        socket={socket}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
        setsidebarIsTypingId = {setsidebarIsTypingId}
      />
    </div>
  );
};

export default Home;
