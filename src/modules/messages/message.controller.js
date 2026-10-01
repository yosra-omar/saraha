import { Router } from "express";
import * as MS from "./message.service.js";
import * as MV from "./message.validation.js";
 import { validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";
 
const messageRouter = Router({
    mergeParams: true
})

messageRouter.post("/:receiverId",validation(MV.createMessageSchema), MS.sendMessage)
messageRouter.get("/:messageId",authentication,validation(MV.MessageIdSchema), MS.get_MessageById )
messageRouter.get("/",authentication, MS.getAllMessages )
messageRouter.delete("/:messageId",authentication,validation(MV.MessageIdSchema), MS.deleteMessage )
messageRouter.patch("/favourite/:messageId",authentication,validation(MV.MessageIdSchema), MS.toggleFavourite)
messageRouter.get("/favourite",authentication,MS.getFavouriteMessages)
messageRouter.delete("/",authentication, MS.deleteAllMessages )

export default messageRouter