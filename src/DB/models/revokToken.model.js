
import mongoose from "mongoose";

const  revokeTokenSchema = new mongoose.Schema({
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
    //coverImages:[String],
    changeCredential : Date
},{
    timestamps:true,
    strictQuery:true,
})

revokeTokenSchema.index({expireAt : 1}, {expireAfterSeconds : 0})

export const revokeTokenModel = mongoose.models.revokeToken || mongoose.model("revokeToken", revokeTokenSchema)