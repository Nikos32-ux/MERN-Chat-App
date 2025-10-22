import ConversationModel from "../models/Conversation.js";
import MessageModel from "../models/Messages.js";


export const SendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  
  if(senderId !== req.user) return res.status(400).json({success:false,message:"Not valid action"})
  const file = req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : null;

  if (!senderId || !receiverId) {
    return res.status(400).json({
      success: false,
      message: `${!senderId ? "Sender Id" : "Receiver Id"} is required.`,
    });
  }

  if (!message && !file) { 
    return res.status(400).json({
      success: false,
      message: "Message or file is required.",
    });
  }

  try {
    const newMessage = new MessageModel({
      userId: senderId,
      receiverId:receiverId,
      message: message || "",
      file: file || null,     
    });
    const savedMessage = await newMessage.save();

    let conversation = await ConversationModel.findOne({
      members: { $all: [senderId, receiverId], $size: 2 },
    });

    if (conversation) {
      conversation = await ConversationModel.findByIdAndUpdate(
        conversation._id,
        { $push: { messages: savedMessage._id } },
        { new: true }
      );
    } else {
      conversation = await ConversationModel.create({
        members: [senderId, receiverId],
        messages: [savedMessage._id],
      });
    }

    const populated = await MessageModel.findById(savedMessage._id)
      .populate("userId", "name profile")
      .populate("receiverId", "name profile");


    res.status(200).json({
      success: true,
      data: populated,
    });

  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
};



export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.body;
  if(senderId !== req.user) return res.status(400).json({success:false, message:"not valid action"})
  if (!senderId || !receiverId) {
    return res.status(400).json({
      success: false,
      message: `${!senderId ? "Sender Id" : "Receiver Id"} is required.`,
    });
  }
  try {
    const conversation = await ConversationModel.findOne({
      members: { $all: [senderId, receiverId], $size: 2 },
    }).populate({
      path: "messages",
      populate: { path: "userId", select: "name profile" },
    });
    if (!conversation) {
      const newConversation = await ConversationModel.create({
        members: [senderId, receiverId],
        messages: [],
      });
      return res.status(200).json({
        success: true,
        message: "Conversation created successfully",
        data: {
          messages: []
        },
      });
    }
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: conversation.messages
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages. Please try again.",
    });
  }
};



export const toggleHeart = async (req, res) => {
  try {
    
    const { senderId,messageId } = req.body
     if(senderId !== req.user) return res.status(400).json({success:false,message:"invalid action"})

    const msg = await MessageModel.findById(messageId)
    if (!msg) return res.status(400).json({ success: false, error: 'message not found' })
    msg.hearted = !msg.hearted

    await msg.save()

    res.status(200).json({ success: true, message: msg })
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export const editMessage = async (req, res) => {
  try {
    const { messageId, newText ,senderId } = req.body;
    if(senderId !== req.user) return res.status(400).json({success:false,message:"invalid action"})
    
      const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { message: newText, edited:true },
      { new: true } 
    );

    if (!updatedMessage) return res.status(404).json({ success: false, message: "Message not found" });

    res.json({ success: true, updatedMessage:updatedMessage });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { msgId, senderId} = req.body
     if(senderId !== req.user) return res.status(400).json({success:false,message:"invalid action"})
    const deletedMessage = await MessageModel.findById(msgId)
    
    if (!deletedMessage) {
      return res.status(500).json({ success: false, message: 'Not deleted' })
    }
    deletedMessage.deleted = !deletedMessage.deleted

    await deletedMessage.save()

    return res.status(200).json({ success: true, message: 'You deleted a message', deletedMessage })
  }
  catch (err) {
    console.error("Delete message error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message error"
    });
  }

}


export const setEmoji = async (req, res) => {
  try {
    const { messageId, emoji, senderId } = req.body
    if(senderId !== req.user) return res.status(400).json({success:false,message:"invalid action"})

    const messageEmoji = await MessageModel.findById(messageId)
    if (!messageEmoji) return res.status(500).json({ success: false, message: 'message was not found' })

    messageEmoji.icon = emoji
    await messageEmoji.save()
    res.status(200).json({ success: true, message: messageEmoji })
  }
  catch (err) {
    console.error("setEmoji error:", err);
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}


export const handleLastMessages = async (req,res) => {
  try{
    const {senderId} = req.body
    if(senderId !== req.user) return res.status(400).json({success:false,message:"invalid action"})

    let conversations = await ConversationModel.find({members:{$in:[senderId]}}).populate("messages")
    if(conversations.length === 0 ) return res.status(200).json({success:false,message:[]})
    
    res.status(200).json({success:true,conversations:conversations})
    console.log("conversations",JSON.stringify(conversations,null,2));
    
  }
  catch(err){
    console.error("error :",err)
    res.status(500).json({success:false,message:'internal server error in handlelastmessages handler'})
  }
}
