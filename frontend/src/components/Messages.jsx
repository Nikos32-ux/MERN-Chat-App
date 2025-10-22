import { ChatContainerContext } from '../context/ChatContainerContext.jsx'
import { React, useContext, useRef, useState } from 'react'


const emojiContainer = [
  { id: 1, name: "heart", emoji: "❤️" },
  { id: 2, name: "smile1", emoji: "😀" },
  { id: 3, name: "smile2", emoji: "😍" },
  { id: 4, name: "smile3", emoji: "😘" },
  { id: 5, name: "smile4", emoji: "😋" }
]


const Message = ({ msg, isOwn, read, handleHeart, editMessage, deleteMsgId, handleEmojiIcon, AiOutlineHeart, AiFillHeart, AiOutlineClose, FiTrash2 }) => {
  
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
    deleteWarning,
    setDeleteWarning,
    messagesEndRef,
    trashIconRef,
    popUpRef,
    editRef
  } = useContext(ChatContainerContext)

  return (
    <div onClick={(e) => {
      const bubble = e.target.closest("[data-msg-id]")
      if (bubble) {
        console.log("bubble",bubble);
        console.log("e.target",e.target);
        
        const msgId = bubble.dataset.msgId
        setActiveMessageId(prev => prev === msgId ? null : msgId)
      } else {
        setActiveMessageId(null)
      }
    }}
     className={`relative m-5 flex gap-5 ${isOwn ? "justify-end" : "justify-start"} items-center cursor-pointer`}
    >
      {/* For isOwn: heart on left */}
      {isOwn && (
        <span onClick={handleHeart} className={`cursor-pointer ${msg.deleted ? "hidden" : ""} transition-transform active:scale-125 duration-300 ease-in-out
                                                       ml-2 flex-shrink-0 bg-gray-100/40 rounded-[100%] shadow-[0_4px_30px_rgba(0,0,0,0.5)] border p-1 border-gray-100/40`}>
          {msg.icon ? (
            <span className="text-sm">{msg.icon}</span>
          ) : msg.hearted ? (
            <AiFillHeart className="!text-red-600 w-5 h-5" />
          ) : (
            <AiOutlineHeart className="text-gray-500 w-5 h-5" />
          )}
        </span>
      )}

      {/* Bubble */}
      {editingMessageId === msg._id ? (
        <div className={`p-2 rounded-lg ${isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
          <span className="block text-xs font-bold mb-1">{msg.userId?.name}</span>
          <textarea
            ref={editRef}
            className="p-4 w-full resize-none rounded break-words focus:outline-none focus:ring focus:ring-blue-300 bg-white text-black"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                editMessage()
              } else if (e.key === "Escape") {
                e.preventDefault();
                setEditingMessageId(null)
              }
            }}
          />
        </div>
      ) : msg.deleted ? (
        <div className="p-2 rounded-lg max-w-fit italic text-gray-400 bg-gray-200/50 border border-gray-300 text-center">
          <span className="flex items-center gap-2">
            <AiOutlineClose className="w-4 h-4 text-gray-400" />
            Message was deleted
          </span>
        </div>
      ) : (
        <div className="relative flex flex-col">       
          <div data-msg-id={msg._id} className={`p-2 ${deleteWarning && showDeleteId === msg._id ? "active:scale-125 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : ""}  flex flex-col rounded-lg ${isOwn ? "bg-[rgba(217,238,255,0.85)] text-black" : "bg-[rgba(240,240,240,0.9)] text-black"}`}>
             {showDeleteId === msg._id && (
                <span
                 ref={trashIconRef}
                 onClick={() => {
                  // deleteMsgId(msg._id)
                  console.log('it happened')
                }} className="absolute top-0 -right-4 inner text-white cursor-pointer transform -translate-y-1/2 justify-center items-center"
                >
                  <FiTrash2 className=" text-red-900 " />
                </span>
            )}
            <span className="block text-xs font-bold mb-1">{msg.userId?.name}</span>
            {msg.message && <span>{msg.message}</span>}
            {msg.file && (
              <img
                src={msg.file}
                className="mt-1 max-w-full rounded"
                alt="attachment"
                onLoad={() =>
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              />
            )}
            <div className="flex justify-end items-center">
              <span className="text-xs">{msg.edited ? ("Εγινε επεξεργασια " + new Date(msg.updatedAt).toLocaleTimeString()) : new Date(msg.createdAt).toLocaleTimeString()}</span>
              {isOwn && <span className={`ml-2 text-xs ${read ? "text-[rgba(158,10,42,0.82)]" : "text-[rgba(110,111,121,0.82)]"}`}>✓✓</span>}
            </div>
            {/* Bubble popup */}
            {activeMessageId === msg._id && (
              <div ref={popUpRef} style={{ transform: "translateY(-100%)" }} className={`absolute top-0 ${isOwn ? "right-0" : "left-0"} bottom-full z-50`}>
                <div className="rounded-lg shadow-lg min-w-[160px]">
                  <div className="flex mb-2 bg-white shadow-xlg rounded-full py-0 px-6 z-40">
                    {emojiContainer.map((emoji) => (
                      <span onClick={() => handleEmojiIcon(msg._id, emoji)} key={emoji.id} className="m-2">
                        {emoji.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="absolute right-0 bg-white z-40 w-[50%] flex px-2 justify-center flex-col gap-2 py-5 rounded-lg h-[120px]">
                    <p onClick={(e) => {
                      if (popUpRef.current && popUpRef.current.contains(e.target)) {
                        setEditingMessageId(msg._id);
                        setEditingText(msg.message);
                      }
                    }}
                      className="cursor-pointer text-gray-700 hover:bg-gray-200 w-full rounded-sm"
                    >
                      Edit
                    </p>
                    <p onClick={(e) => {
                      if (popUpRef.current && popUpRef.current.contains(e.target)) {
                        setShowDeleteId(msg._id) 
                        setDeleteWarning(true)
                      }
                    }} className="cursor-pointer text-gray-700 hover:bg-gray-200 w-full rounded-sm">
                      Delete
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* For !isOwn: heart on right */}
      {!isOwn && (
        <span onClick={handleHeart} className={`cursor-pointer ${msg.deleted ? "hidden" : ""} transition-transform active:scale-125 duration-300 ease-in-out
                                                       ml-2 flex-shrink-0 bg-gray-100/40 rounded-[100%] shadow-[0_4px_30px_rgba(0,0,0,0.5)] border p-1 border-gray-100/40`}>
          {msg.icon ? (
            <span className="w-5 h-5">{msg.icon}</span>
          ) : msg.hearted ? (
            <AiFillHeart className="!text-red-600 w-5 h-5" />
          ) : (
            <AiOutlineHeart className="text-gray-500 w-5 h-5" />
          )}
        </span>
      )}
    </div>
  )
}

export default Message
