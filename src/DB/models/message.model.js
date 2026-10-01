import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema({
     receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default: null
    },
   content:{
        type:String,
        required:true,
        minLength:2,
        maxLength:10000
     },
   isFavourite: {
      type: Boolean,
      default: false
},
     image:[String],
},{
    timestamps:true,
   strict:true, 
    strictQuery:true})

export const messageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)