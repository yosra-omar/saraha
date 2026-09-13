import joi from "joi"
import { userGender } from "../../enums/user.enum.js"
import { generalRules } from "../../common/utils/generalRules.js"

 export const  signUpSchema ={
    body: joi.object({
       fName:joi.string().valid("yosra","shahd").required(),
       lName : joi.string().required(),
       email : generalRules.email.required(),
       password : generalRules.password.required(),
       cPassword : joi.string().valid(joi.ref("password")).required(),
       age:joi.number().integer().positive().multiple(3).required(),
       gender : joi.string().valid(userGender.male,userGender.female).required(),
       phone : joi.string(),
       role:joi.string()
      // dob : joi.date().less("now").required(),
      //  users:joi.array().items(joi.object({
      //    name:joi.string().required()
      //  }).required()).required()
     }).required(),
    query : joi.object({
        flag:joi.boolean().truthy("yes","y","1").falsy("no","n","0").sensitive()
    }),

   //  file:generalRules.file.required(),

   files :joi.object({
     attachment :joi.array().items( generalRules.file.required()).length(1).required(),
     attachments : joi.array().items(generalRules.file.required()).max(3).required()
   }).required()
 }

export const signInSchema ={
  body : joi.object({
       email : generalRules.email.required(),
       password : generalRules.password.required()
     }).required()      
}

export const idSchema = {
  params : joi.object({
       id :generalRules.id.required()
  })
}

 export const  updateSchema ={
    body: joi.object({
       fName:joi.string().valid("yosra","shahd"),
       lName : joi.string(),
       age:joi.number().integer().positive().multiple(3),
       gender : joi.string().valid(userGender.male,userGender.female),
       phone : joi.string(),
     }).required(),

 }

 export const updatePasswordSchema ={
   body : joi.object({
      oldPassword : generalRules.password.required(),
      newPassword:generalRules.password.required(),
      cPassword : joi.string().valid(joi.ref("newPassword")).required(),

   }).required()
 }

 
 export const logoutSchema ={
   query : joi.object({
     flag : joi.string().valid("all", "same")
   }).required()
 }

 export const confirmEmailSchema ={
   body:joi.object({
     email:generalRules.email.required(),
     otp:joi.string().length(6).pattern(/^[0-9]{6}/).required()
   }).required()
 }