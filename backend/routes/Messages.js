import express from 'express'
import { getMessages, SendMessage,toggleHeart,editMessage, deleteMessage, setEmoji, handleLastMessages } from '../controllers/Message.js'
import { upload } from '../middleware/Multer.js'

const MessageRoutes=express.Router()

MessageRoutes.post('/send_message',upload.single("file"),SendMessage)
MessageRoutes.post('/get_messages', getMessages)
MessageRoutes.post('/toggle-heart',toggleHeart)
MessageRoutes.post('/edit-message',editMessage)
MessageRoutes.post('/delete-message',deleteMessage)
MessageRoutes.post('/set-emoji',setEmoji)
MessageRoutes.post('/get-last-messages',handleLastMessages)

export default MessageRoutes