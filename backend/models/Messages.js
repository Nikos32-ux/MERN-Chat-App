import mongoose from "mongoose";


const MessageSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:false
    },
    file:{
        type:String
    },
    hearted:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    },
    bold:{
        type:Boolean,
        default:false
    },
    icon:{
        type:String,
        default:""
    },
    read:{
        type:Boolean,
        default:false
    },
    sidebarRead:{
        type:Boolean,
        default:false
    },
    edited:{
        type:Boolean,
        default:false
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

const MessageModel=mongoose.model('Messages',MessageSchema)
export default MessageModel