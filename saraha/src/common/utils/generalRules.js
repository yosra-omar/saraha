import joi from "joi"
import { Types } from "mongoose"


export const generalRules = {
   id:joi.string().custom((value , helper)=>{
        const isValid = Types.ObjectId.isValid(value)
        return  isValid ? value : helper.message("InValid Id")
      }),
       email : joi.string().email({tlds:{allow:false ,deny : ["outlook"]}, minDomainSegments:2}),
       password :joi.string().regex(/^[A-Za-z0-9]{8,}$/),
        file : joi.object({
          fieldname: joi.string().required(),
          originalname: joi.string().required(),
          encoding: joi.string().required(),
          mimetype: joi.string().required(),
          destination: joi.string().required(),
          filename: joi.string().required(),
          path: joi.string().required(),
          size: joi.number().required()
        }).messages({
          "any-required": "file is required"
        })
}