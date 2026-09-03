
import mongoose from "mongoose";

export const  revokeTokenModel = new mongoose.Schema({
    idToken:{
        type:String,
        required:true,
        trim:true
    }, 
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
   
    expireAt : Date,
    coverImages:[String],
    changeCredential : Date
},{
    timestamps:true,
    strictQuery:true,
})

revokeTokenModel.index({expireAt : 1}, {expireAfterSeconds : 0})

export const userModel = mongoose.models.revokeToken || mongoose.model("revokeToken", revokeTokenModel)