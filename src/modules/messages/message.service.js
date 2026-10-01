import { accessResponse } from "../../common/utils/respose.js";
import { messageModel } from "../../DB/models/message.model.js";
import { userModel } from "../../DB/models/user.model.js";
import * as dbService from "../../DB/service/db.service.js"




// ====================  sendMessage =======================================
export const  sendMessage = async(req , res)=>{
  
        const { receiverId } = req.params;
     const { content} = req.body;

    const userExists = await dbService.findOne({ 
      model : userModel,
      filter: { _id : receiverId}
     })
   
     if(!userExists){
        throw new Error("user not exists", {cause : 404})
     }
   
     const message = await dbService.create({
       model : messageModel,
      data : {
        content,
        receiverId,
        senderId : req.user?._id || null
      }
     })
   
    accessResponse({res,status:201, data :  message})
   } 

 
// ====================  get_MessageById =======================================
export const  get_MessageById = async(req , res)=>{
  
     const { messageId} = req.params;
 
    const  message = await dbService.findOne({ 
      model : messageModel,
      filter: { 
        _id :messageId,
        $or :[
          {senderId : req.user.id},
          {receiverId :req.user.id}
        ]
      },
      select: "-senderId"
     })
 
     if(!message){
        throw new Error("Message not found or unauthorized", {cause : 404})
     }
    accessResponse({res,status:201, data :  message})
   } 

// ====================  getAllMessages =======================================
export const  getAllMessages = async(req , res)=>{
  
    const  message = await dbService.find({ 
      model : messageModel,
      filter: { 
        userId :req.user.id
      }
     })
  
    accessResponse({res,status:200, data :  message})
   } 

// =================== Delete Message ====================
export const deleteMessage = async(req,res)=>{
         const { messageId} = req.params;

      const messageExist = await dbService.findById({
        model : messageModel,
        _id : messageId
      })

      if(!messageExist){
            throw new Error("Message not found or unauthorized", {cause : 404})
      }
      const message = await dbService.deleteOne({
        model : messageModel,
        filter : {
            _id :messageId ,
            $or:[
                { senderId:req.user._id},
                { receiverId:req.user._id},
        ]
        },

      })

      accessRespose({
        res,
        status: 200,
        data: message
    });
}
//=========================== toggleFavourite ==============
export const toggleFavourite = async (req, res) => {
   const {messageId} = req.params;
   
     const message = await dbService.findOne({
        model : messageModel,
        filter:{
          _id :messageId,
          receiverId:req.user._id
        }
      })

      if(!message){
            throw new Error("Message not found or unauthorized", {cause : 404})
      }
    
    message.isFavourite = !message.isFavourite
        await message.save();

         accessRespose({
        res,
        status: 200,
        data: message
    });

}

// ======================= getFavouriteMessages ===================
export const getFavouriteMessages = async (req, res) => {
    const message = await dbService.find({
      model : messageModel,
      filter:{
        receiverId: req.user._id,
        isFavourite :true
      }
    })
       accessRespose({
        res,
        status: 200,
        data: messages
    });
}

// ======================= deleteAllMessages ===================
export const deleteAllMessages = async (req, res) => {

    const messages = await dbService.deleteMany({
        model: messageModel,
        filter: {
            receiverId: req.user._id
        }
    });

    accessRespose({
        res,
        status: 200,
        data: messages
    });
};