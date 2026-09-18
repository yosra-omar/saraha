import { Router } from "express";
import * as MS from "./message.service.js";
import * as MV from "./message.validation.js";
 import { validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";
 
const messageRouter = Router({
    mergeParams: true
})

messageRouter.post("/create",validation(MV.createMessageSchema), MS.create_Message)
// messageRouter.get("/:id",authentication, MS.get_Message )
// messageRouter.get("/",authentication, MS.get_Messages )
messageRouter.get("/:userId", MS.get_MessagesByadmin )

export default messageRouter