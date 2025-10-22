import { createContext, useState, useEffect, useRef } from "react";

export const ChatContainerContext = createContext()

export const ChatProvider = ({children}) => {
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [showDeleteId, setShowDeleteId] = useState(null)
    const [isTyping, setIsTyping] = useState(false);
    const [deleteWarning, setDeleteWarning] = useState(null)
    const messagesEndRef = useRef();
    const popUpRef = useRef();
    const editRef = useRef()
    const trashIconRef = useRef();
    const emojiRef = useRef()
    
    return (
        <ChatContainerContext.Provider value = {{
            activeMessageId, 
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
            popUpRef,
            trashIconRef,
            editRef,
            emojiRef
            }}
        >
            {children}
        </ChatContainerContext.Provider>
    )
  }

