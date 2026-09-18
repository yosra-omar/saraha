import { accessRespose } from "../../common/utils/respose.js";
import { messageModel } from "../../DB/models/message.model.js";
import { userModel } from "../../DB/models/user.model.js";
import * as dbService from "../../DB/service/db.service.js"




// ====================  create_Message =======================================
export const  create_Message = async(req , res)=>{
  
     const { content, userId} = req.body;

    const userExists = await dbService.findOne({ 
      model : userModel,
      filter: { _id : userId}
     })
   
     if(!userExists){
        throw new Error("user not exists", {cause : 404})
     }
   
     const message = await dbService.create({
       model : messageModel,
      data : {
        content,
        userId
      }
     })
   
    accessRespose({res,status:201, data :  message})
   } 

 
// ====================  get_Message =======================================
export const  get_Message = async(req , res)=>{
  
     const { id} = req.params;
 
    const  message = await dbService.findOne({ 
      model : messageModel,
      filter: { 
        _id :id,
        userId :req.user.id
      }
     })
 
     if(!message){
        throw new Error("user not exists or not authorized", {cause : 404})
     }
    accessRespose({res,status:201, data :  message})
   } 

// ====================  get_Messages =======================================
export const  get_Messages = async(req , res)=>{
  
    const  message = await dbService.find({ 
      model : messageModel,
      filter: { 
        userId :req.user.id
      }
     })
  
    accessRespose({res,status:200, data :  message})
   } 

// ====================  get_MessagesByadmin =======================================
export const  get_MessagesByadmin = async(req , res)=>{
  const {userId} = req.params
    const  message = await dbService.find({ 
      model : messageModel,
      filter: { 
        userId 
      }
     })
  
    accessRespose({res,status:200, data :  message})
   } 