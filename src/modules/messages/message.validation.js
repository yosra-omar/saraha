import joi from "joi"
import { generalRules } from "../../common/utils/generalRules.js"
   
 export const  createMessageSchema ={
    body: joi.object({
        content : joi.string().min(2).max(10000).required(),
        userId :generalRules.id.required()
    }),
  }