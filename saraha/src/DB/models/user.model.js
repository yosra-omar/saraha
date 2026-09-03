import mongoose from "mongoose";
import { userGender, userProvider, userRoles } from "../../enums/user.enum.js";

const userSchema = new mongoose.Schema({
    fName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:10
    },
    lName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:10
    },
    email:{
        type:String,
        required : true,
        unique:true ,
        trim:true
    },
    password:{
        type:String,
        required : true,
    },
     phone:{
        type:String,
        trim : true
    },
    age:{
        type: Number,
        required:true,
        min:2,
        max:80
    },
    gender:{
        type:String,
        enum:Object.keys(userGender),
        default:userGender.female
    },
    profilePic:{
       type:String,
    },
    provider:{
        type:String,
        enum:Object.keys(userProvider),
        default:userProvider.system
    },
    role:{
        type:String,
        enum:Object.keys(userRoles),
        default:userRoles.user
    },
    isConfirmed:{
        type:Boolean
    },
    coverImages:[String],
    changeCredential : Date
},{
    timestamps:true,
    strictQuery:true,
    toJSON:{virtuals: true },
    toObject: { virtuals: true}
})

userSchema.virtual("fullName")
// .set(function(val){
//    const [fName , lName] = val.split(" ")
//    this.set({ fName , lName})
// })
.get(function( ){
    return this.fName +" " + this.lName
})

export const userModel = mongoose.models.User || mongoose.model("User",userSchema)