import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema({
     content:{
        type:String,
        required:true,
        minLength:2,
        maxLength:10000
     },
     userId:{
        type: Types.ObjectId,
        ref:"User",
        required : true
     },
     image:[String],
},{
    timestamps:true,
    statics : true
})

export const messageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)