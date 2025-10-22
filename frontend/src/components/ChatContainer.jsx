import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import api from "../../axiosConfig.js";
import { FaRegSmile } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import { AuthContext } from "../context/AuthContext";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose } from "react-icons/ai";
import {ChatContainerContext} from '../context/ChatContainerContext.jsx'
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Message from "./Messages.jsx";
import '../index.css'

// Sounds
const receiveAudio = new Audio("/notify.mp3");
const sendAudio = new Audio("/sendMessage.mp3");
const heartClickAudio = new Audio("/clickHeart.mp3");


const ChatContainer = ({ selectedUser, setSelectedUser, currentUser, socket, unreadMessages, setUnreadMessages , setsidebarIsTypingId }) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [closeTab, setCloseTab] = useState(null)
  

  const { activeMessageId,
          setActiveMessageId,
          editingMessageId,
          setEditingMessageId,
          editingText,
          setEditingText,
          showDeleteId,
          setShowDeleteId,
          isTyping,
          setIsTyping,
          setDeleteWarning,
          messagesEndRef,
          popUpRef,
          editRef,
          emojiRef
        } = useContext(ChatContainerContext)
  

  const queryClient = useQueryClient();


  //handle focus textarea
  useEffect(() => {
    if (editingMessageId && editRef.current) {
      editRef.current.focus()
    }
  }, [editingMessageId])

  //  Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close bubble popup
      if (!e.target.closest("[data-msg-id]") || e.target.closest("[data-msg-id]").dataset.msgId !== activeMessageId) {
        setActiveMessageId(null);
        setShowDeleteId(null)
        setDeleteWarning(null)
      }

      // Close emoji
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMessageId]);


  // Fetch messages with React Query
  const fetchMessages = async () => {
    if (!selectedUser) return [];
    const res = await api.post("/api/messages/get_messages",{ senderId: currentUser._id, receiverId: selectedUser._id });
    return res.data.success ? res.data.data.messages : [];
  };

  const { data: fetchedMessages = [] } = useQuery({
    queryKey: ["messages", currentUser._id, selectedUser?._id],
    queryFn: fetchMessages,
    enabled: !!selectedUser,
  });

  //check unread messages on mount
  useEffect(() => {
    if(!selectedUser || !fetchedMessages?.length) return
    const lastFetchedMessage = fetchedMessages.at(-1)
    for (let msg of fetchedMessages) {
      if (msg.userId._id.toString() === selectedUser._id && !msg.read) {
        socket.emit('send-read-message', { senderId: msg.userId._id.toString(), receiverId: currentUser._id ,message:lastFetchedMessage })
      }
    }
  }, [selectedUser, fetchedMessages])
  

  useEffect(() => {
    setCloseTab(null)
  }, [selectedUser])

  //receiver side handleincoming message
  useEffect(() => {
    const handleIncomingMessage = async ({ message }) => {
      if(message)  console.log('received message in handleincoming',message)
      const senderId = message.userId._id.toString() //nikos
      const receiverId = message.receiverId._id.toString() //stella
      
      if (!selectedUser || selectedUser?._id.toString() !== senderId) {
        setUnreadMessages(prev => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }))
      }else if (selectedUser?._id.toString() === senderId) {
        queryClient.setQueryData(
          ["messages", currentUser._id, selectedUser?._id],
          (old = []) => [...old, message]
        )
        socket.emit('send-read-message', { senderId:senderId, receiverId:receiverId, message:message })
      }
      receiveAudio.play();
    };

    socket.on("receive-message", handleIncomingMessage);

    return () => { socket.off("receive-message", handleIncomingMessage) }
  }, [socket, queryClient, selectedUser, currentUser, setUnreadMessages])


  // Socket events
  useEffect(() => {
    if (!selectedUser) return;
    //sender side receive notification for read messages
    const handleReceiveMessage = ({senderId,receiverId,message}) => {
      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser?._id],
        (old = []) => old.map(msg => msg.userId._id?.toString() === currentUser._id.toString() ? { ...msg, read: true } : msg )
      );
    };

    //socket for handle typing effect-start
    const handleTypingStart = ({ senderId }) => {
      if (selectedUser?._id === senderId){
       setIsTyping(true);
      }else{
        setsidebarIsTypingId(senderId)
      }
    };

    //socket for handle typing effect-stop
    const handleTypingStop = ({ senderId }) => {
      if (selectedUser?._id === senderId){
        setIsTyping(false);
      }else{
        setsidebarIsTypingId(null)
      }
    };

    //socket for handle edit message
    const handleEditedIncoming = ({ updatedMessage, senderId }) => {

      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser?._id],
        (old = []) => {
          return old.map(msg =>
            msg._id === updatedMessage._id
              ? { ...msg, message: updatedMessage.message, edited: updatedMessage.edited, updatedAt: updatedMessage.updatedAt }
              : msg
          )
        }
      )
    }

    //socket for clicking heart icon 
    const handleReceiverHeart = ({ message }) => {
      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser._id],
        (old = []) => old.map(msg => msg._id === message._id ? { ...msg, hearted: message.hearted } : msg)
      );
    };

    //socket for deleting message
    const handleDeleteMesssage = ({ deletedMessage }) => {
      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser?._id],
        (old = []) => old.map(msg => msg._id === deletedMessage._id ? { ...msg, deleted: deletedMessage.deleted } : msg)
      )

    }
    //socket for choosing emoji
    const handleReceiveEmoji = ({ message }) => {
      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser?._id],
        (old = []) => old.map(msg => msg._id === message._id ? { ...msg, icon: message.icon } : msg)
      )
    }


    socket.on("receive-edited-message", handleEditedIncoming);
    socket.on("receive-read-message", handleReceiveMessage);
    socket.on("receive-typing-start", handleTypingStart);
    socket.on("receive-typing-stop", handleTypingStop);
    socket.on("receive-heart", handleReceiverHeart);
    socket.on('receive-deleted-message', handleDeleteMesssage)
    socket.on('receive-emoji', handleReceiveEmoji)

    return () => {
      socket.off("receive-typing-start", handleTypingStart);
      socket.off("receive-read-message", handleReceiveMessage);
      socket.off("receive-typing-stop", handleTypingStop);
      socket.off("receive-heart", handleReceiverHeart);
      socket.off("receive-edited-message", handleEditedIncoming);
      socket.off('receive-deleted-message', handleDeleteMesssage);
      socket.off('receive-emoji', handleReceiveEmoji);

    };
  }, [selectedUser, currentUser, socket, queryClient]);

  //scroll to latest message automatically when opening conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fetchedMessages, isTyping]);


  const toggleEmojiPicker = () => setShowEmojiPicker(prev => !prev);
  const handleEmojiClick = (emojiData) => setNewMessage(prev => prev + emojiData.emoji);

  //sender message to receiver
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const formData = new FormData();
    if (newMessage.trim()) formData.append("message", newMessage.trim());
    if (selectedFile) formData.append("file", selectedFile);
    formData.append("senderId", currentUser._id);
    formData.append("receiverId", selectedUser._id);

    try {
      const res = await api.post("/api/messages/send_message",formData);

      if (res.data.success) {
        const savedMessage = { ...res.data.data };
        console.log("saved message in handlesendmessage: ",savedMessage);
        
        queryClient.setQueryData(
          ["messages", currentUser._id, selectedUser._id],
          (old = []) => [...old, savedMessage]
        );
        sendAudio.play();


        socket.emit("send-message", { message: savedMessage, receiverId: selectedUser?._id,senderId:currentUser._id });

        setNewMessage("");
        setSelectedFile(null);
        setShowEmojiPicker(false);
        setPreview(null);
        socket.emit("typing-stop", { senderId: currentUser._id, receiverId: selectedUser._id });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  //handling preview of selected file before send it
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const closePreview = () => setPreview(null);

  // Toggle heart
  const handleHeart = async (messageId) => {
    heartClickAudio.play();
    const res = await api.post('/api/messages/toggle-heart',{ senderId:currentUser._id ,messageId });

    if (res.data.success) {
      queryClient.setQueryData(
        ["messages", currentUser._id, selectedUser._id],
        (old = []) => old.map(msg => msg._id === res.data.message._id ? { ...msg, hearted: res.data.message.hearted } : msg)
      );
    }

    socket.emit('send-heart', {
      message: res.data.message,
      receiverId: selectedUser._id,
      senderId: currentUser._id
    });
  };

  const emojiContainer = [
    { id: 1, name: "heart", emoji: "❤️" },
    { id: 2, name: "smile1", emoji: "😀" },
    { id: 3, name: "smile2", emoji: "🤣" },
    { id: 4, name: "smile3", emoji: "🤣" },
    { id: 5, name: "smile4", emoji: "😋" }
  ]

  const editMessage = async (newText, messageId) => {
    try {
      const res = await api.post("/api/messages/edit-message",{ newText, messageId,senderId:currentUser._id })
      if (res.data.success) {
        const updatedMessage = res.data.updatedMessage
        queryClient.setQueryData(
          ["messages", currentUser._id, selectedUser?._id],
          (old = []) => old.map(msg => msg._id === updatedMessage._id ? { ...msg, message: updatedMessage.message, edited: updatedMessage.edited, updatedAt: updatedMessage.updatedAt } : msg)
        )

        setEditingMessageId(null)
        setEditingText("")


        socket.emit('send-editedMsg', {
          updatedMessage: updatedMessage,
          senderId: currentUser._id,
          receiverId: selectedUser?._id
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteMsgId = async (msgId) => {
    try {
      const res = await api.post('/api/messages/delete-message', { msgId,senderId:currentUser._id })
      if (res.data.success) {
        const deletedMessage = res.data.deletedMessage
        queryClient.setQueryData(
          ["messages", currentUser._id, selectedUser?._id],
          (old = []) => old.map(msg => msg._id === deletedMessage._id ? { ...msg, deleted: deletedMessage.deleted } : msg)
        )
        setShowDeleteId(null)

        socket.emit('send-deleted-message', {
          senderId: currentUser._id,
          receiverId: selectedUser?._id,
          deletedMessage
        })
      }
    }
    catch (err) {
      console.log('error happened');
    }
  }


  const handleEmojiIcon = async (msgId, emojiIcon) => {
    try {
      const res = await api.post('/api/messages/set-emoji',{ messageId: msgId, emoji: emojiIcon, senderId:currentUser._id })

      if (res.data.success) {
        const message = res.data.message
        queryClient.setQueryData(
          ["messages", currentUser._id, selectedUser?._id],
          (old = []) => old.map(msg => msg._id === message._id ? { ...msg, icon: message.icon } : msg)
        )
        socket.emit('send-emoji', { message, senderId: currentUser._id, receiverId: selectedUser?._id })
      }
    }
    catch (err) {
      console.log('failed to send the emoji,reason :', err)
    }
  }

  const renderedMessages = fetchedMessages.map((msg, idx) => {
    const isOwn = msg.userId?._id === currentUser._id
    const read = isOwn && msg.read

    return (
      <Message
        key={msg._id || idx}
        isOwn={isOwn}
        read={read}
        msg={msg}
        handleHeart={()=>handleHeart(msg._id)}
        editMessage={()=>editMessage(editingText,msg._id)}
        deleteMsgId={()=>deleteMsgId(msg._id)}
        handleEmojiIcon={handleEmojiIcon}
        AiOutlineHeart={AiOutlineHeart}
        AiOutlineClose={AiOutlineClose}
        AiFillHeart={AiFillHeart}
        FiTrash2={FiTrash2}
      />
    );
  });

  if (!selectedUser) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Select a user to start chatting
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col transition-colors duration-300`}>
      {/* Chat header */}
      <div className=" border-b flex items-center gap-3 bg-gray-900 text-white px-4 py-3 shadow-md border-b border-gray-700 transition-colors duration-200">
        <div
          className={`bg-gray-800 p-2 flex items-center justify-center gap-2 rounded-md hover: bg-gray-700 cursor-pointer shadow-lg `}
          onMouseEnter={() => setCloseTab(true)}
          onMouseLeave={() => setCloseTab(null)}
        >
          <div className="relative flex gap-2">
            <img src={selectedUser.profile} alt={selectedUser.name} className="w-6 h-7 rounded-full object-cover" />
            <span className="font-semibold">{selectedUser.name}</span>
            <span
              className={` ${closeTab ? "absolute -top-4 -right-1 text-md font-semibold" : "hidden"}`}
              onClick={() => setSelectedUser(null)}
            >x</span>
          </div>

        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto srollbar-hide bg-white text-white py-5 px-8 space-y-2  relative ">
        {renderedMessages}
        {isTyping && (<div className="p-2 text-sm text-gray-800 italic">Typing...</div>)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-gray-700 bg-gray-900 border-t flex gap-2 items-center relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (e.target.value) {
              socket.emit("typing-start", { senderId: currentUser._id, receiverId: selectedUser._id })
            } else {
              socket.emit('typing-stop', { senderId: currentUser._id, receiverId: selectedUser._id })
            }
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 bg-gray-800 text-white border border-gray-700"
        />
        <button type="button" onClick={toggleEmojiPicker}><FaRegSmile className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button>
        {showEmojiPicker && (<div ref={emojiRef} className="absolute bottom-14 left-2 z-50"><EmojiPicker onEmojiClick={handleEmojiClick} /></div>)}
        <label htmlFor="fileUpload" className="cursor-pointer px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">📎</label>
        {preview && (
          <div className="relative mb-2 p-2 bg-gray-300 border-gray">
            <img src={preview} alt="preview" className="max-w-[150px] max-h-[150px] rounded" />
            <span onClick={closePreview} className="absolute -top-2 cursor-pointer -right-1 py-0 text-xl">x</span>
          </div>
        )}
        <input type="file" id="fileUpload" className="hidden" onChange={handleFileChange} />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Send</button>
      </form>
    </div>
  );
};

export default ChatContainer;
