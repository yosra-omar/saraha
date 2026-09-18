import { userProvider } from "../../enums/user.enum.js";
import { userModel } from "../../DB/models/user.model.js";
import * as dbService from "../../DB/service/db.service.js"
import jwt from "jsonwebtoken"
 import { generateToken, verifyToken } from "../../common/utils/token.js";
import { accessRespose } from "../../common/utils/respose.js";
import { decrypt, encrypt } from "../../common/security/encryt.js";
import { Compare, Hash } from "../../common/security/hash.js";
 import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "crypto";
import { revokeTokenModel } from "../../DB/models/revokToken.model.js";
import * as redis_service from "../../DB/service/redis.service.js";
import { generate_otp, sendEmail } from "../../common/service/send_email.js";
import { eventEmitter,event_names } from "../../common/utils/events/send_email.event.js";
import { otpEmailTemplate } from "../../common/utils/email.templete.js";
import { AUDIENCE, REFRESH_SECRETKEY, SECRETKEY } from "../../../config/config.service.js";
 //====================== this is old way in vertion 4 ==========
// const asyncHandler = (fn)=>{
//     return(req,res,next)=>{
//       fn(req,res,next) .catch((error)=>{
//           // res.status(500).json({message:"server error ",error})
//           next(error)
//       })
//     }
// }
const sentEmailOTP = async({email , confirmed })=>{
     const isBlocked = await redis_service.ttl( await redis_service.block_otp_Key(email))
      if(isBlocked > 0){
          throw new Error (`you  blocked and you can resend OTP after ${isBlocked} seconds `,{cause:400})
      }

     const otpTTL = await redis_service.ttl(await redis_service.otpKey(email))
     if(otpTTL >0){
       throw new Error (`you can resend otp after ${otpTTL}`,{cause:400})
     }
     
     const maxOtp = await redis_service.getValue(await redis_service.max_otp_Key(email))
     
     if(maxOtp >= 3){
        await redis_service.setValue({
          key: await redis_service.block_otp_Key(email),
          value : "1",
          ttl : 60 *2
        })
          throw new Error (`you have exceeded maximum number `,{cause:400})
     }
    const user = await dbService.findOne({ 
      model : userModel,
      filter: {email , isConfirmed : {$exists:  confirmed}}
     })

    if(!user){
       throw new Error ("email already exist or already confirmed ",{cause:409})
    }

    const otp =  await generate_otp();
    const otpHash = Hash(`${otp}`)
    const sendemail = await sendEmail({
        to: email,
      subject:`verify your email`,
       html : otpEmailTemplate( otp),
    })
      if(!sendemail){
       throw new Error("failed to send verification to email", {cause : 500})
    }

    await redis_service.setValue({
      key: await redis_service.otpKey(email),
      value : otpHash,
      ttl : 60
    })

    await redis_service.incr(email)
}
// ==================== signUp =======================================
export const signUp = async(req , res)=>{
  
     const {fName,lName, email, password,age,gender, role, phone} = req.body;

    const emailExists = await dbService.findOne({ 
      model : userModel,
      filter: {email}
     })

    if(emailExists){
       throw new Error ("email already exist ",{cause:409})
    }
 let arr_path=[ ]
    if(req?.files?.attachments?.length){
       for(const file of req.files.attachments){
         arr_path.push(file.path)
       }
    }
  
    const otp = await generate_otp();
    const otpHash = Hash(`${otp}`)

     eventEmitter.emit(event_names.confirmEmail,async()=>{
      const sendemail = await sendEmail({
         to: email,
         subject:`verify your email`,
         html : otpEmailTemplate(otp),
    // attachments:[
    //     {
    //         filename:"image.jpg",
    //         path:"./uploads/users/1788120494068-715868940__img.jpg"
    //     }
    // ]
    })

    if(!sendemail){
       throw new Error("failed to send verification to email", {cause : 500})
    }
     })
     await redis_service.setValue({
      key: await redis_service.otpKey(email),
      value: otpHash,
      ttl:60 *2
     })

   await redis_service.setValue({
    key:await redis_service.max_otp_Key(email),
    value : 1,
    ttl : 60  * 6
   })

const user = await dbService.create({
      model : userModel,
      data:{
        fName,
        lName,
         email,
          age,
          role,
           gender,
          password :Hash(password) ,
          phone:phone ? encrypt(phone): null,
          profilePic: req?.files? req.files.path : null,
            //profilePic: req?.files?.attachment.length>0? req.files.attachment[0].path : null,

          coverImages: arr_path
        },
    })

   
    accessRespose({res,status:201, data : user})
   } 

// ======================= confirmEmail =========================
 export const  confirmEmail = async(req , res)=>{

     const { email, otp} = req.body;

     const otpValue = await redis_service.getValue( await redis_service.otpKey(email))
          if(!otpValue)   {
          throw new Error("otp is expired ",{ cause:400})
}
     if(!Compare(otp ,otpValue )){
         throw new Error("otp inValid",{ cause:400})
     }
    const user = await dbService.findOneAndUpdate({ 
      model : userModel,
      filter: {email , isConfirmed: { $exists: false }},
      update:{isConfirmed : true}
     })

    if(! user){
       throw new Error ("Invalid email or email already confirmed",{cause:409})
    }
   await redis_service.delate(await redis_service.otpKey(email))

    accessRespose({res,status:200, message:"Email confirmed successfully "})
   } 

  // =======================  resendOTP =========================
 export const   resendOTP = async(req , res)=>{

     const { email} = req.body;
      await sentEmailOTP({email , confirmed : false})
    accessRespose({res,status:200, message:"OTP Send successfully "})
   } 

 export const signUpwithGmail = async (req, res) => {
 
     const { idToken } = req.body;
 
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience:AUDIENCE
    });

    const payload = ticket.getPayload();
 
    const {email,email_verified,name,picture ,given_name} = payload;

    const emailExists = await dbService.findOne({ 
      model : userModel,
      filter: {email}
     })
     
  let user;
     if(!emailExists){
     user = await dbService.create({
      model : userModel,
      data:{
        fName:name,
       lName : given_name ,
        email: email,
        profilePic : picture,
        provider : userProvider.google,
        isConfirmed: email_verified
      }
    })  
                        
     }else{
      user = emailExists

     }

     if(emailExists && emailExists.provider !== userProvider.google){
        throw new Error("email exists in different providers", { cause : 409})
     }

      

     const access_token = jwt.generateToken({
      payload : { id : user._id},
      secretKey:SECRETKEY,
      options: {expiresIn : "1h"}
     })
 
         accessRespose({res , data : access_token})

   } 

  // =======================  signIn =========================

 export const signIn = async(req,res,next)=>{
    const {email , password} = req.body;
   const user = await userModel.findOne({
    email , 
    provider:userProvider.system,
    isConfirmed:true
  })

   if(!user){
    throw new Error("user not exist or not confirmed yet ",{cause: 409})
   }

   if(!Compare(password, user.password)){
     return  res.status(409).json({message:"password not match "})
   }
   const idToken = randomUUID()


   const access_token = generateToken({
      payload: {id : user._id,extra : 250},
      secretKey: SECRETKEY,
      options : {
        jwtid :idToken,
        expiresIn: 5* 60
      }
  })

   const refresh_token = generateToken({
      payload: {id : user._id,extra : 250},
      secretKey:REFRESH_SECRETKEY,
      options : {
        jwtid :idToken,   
        expiresIn:"1y"}
  })

    accessRespose({res , data : {access_token, refresh_token}})



}
 //============= get profile ===========================
export const getProfile = async(req , res)=>{
      const user = req.user
     accessRespose({res , data :{ user: {...user._doc ,phone: decrypt(user.phone)} } })
}

// ================= share profile ===================

export const shareProfile = async(req,res)=>{
  const {id} = req.params;

  const user = await dbService.findById({
    model : userModel, id,
    option : {select : "-password"}
  })

  if(!user){
    throw new Error ("user not exist", { cause : 404})
  }
   let phone = decrypt(user.phone)
  accessRespose({res,data : {...user._doc, phone}})
}
 // ====================== update Profile ===============
export const updateProfile = async(req,res)=>{
      const {fName,lName,age,gender, phone} = req.body;
       
      const updateQuery = { };

      if(fName !== undefined) updateQuery.fName = fName
      if(lName !== undefined) updateQuery.lName = lName
      if(age !== undefined) updateQuery.age = age
      if(gender !== undefined) updateQuery.gender = gender
      if(phone !== undefined) updateQuery.phone = encrypt(phone)

      const user = await dbService.findOneAndUpdate({
        model : userModel,
        filter: {_id : req.user.id},
        update: updateQuery
      })

     accessRespose({res,data : user})

}

// ================== update Password ===========

export const updatePassword = async(req,res)=>{
    const { oldPassword ,newPassword ,cPassword} = req.body;

    if(!Compare(oldPassword , req.user.password)){
       throw new Error("InValid old Password",{ cause : 400})
    }
    const user = await dbService.findOneAndUpdate({
      model : userModel,
      filter: {_id : req.user.id},
      update : {password : Hash(newPassword)}
    })

         accessRespose({res,data : user})

}

// ================== forget Password ===========

export const forget_Password = async(req,res)=>{
    const { email} = req.body;

    await sentEmailOTP({email , confirmed : true})

         accessRespose({res,data : "OTP Send successfully "})

}

// ================== reset Password ===========

export const reset_Password = async(req,res)=>{
    const { email, code , password} = req.body;

    const otpValue = await redis_service.getValue(await redis_service.otpKey(email))
      if(!otpValue)   {
          throw new Error("otp is expired ",{ cause:400})
   }
     if(!Compare(code , otpValue  )){
         throw new Error("otp inValid",{ cause:400})
     }

     const user= await dbService.findOneAndUpdate({
      model : userModel,
      filter : {email , isConfirmed : {$exists : true}},
      update : {
         password : Hash(password)
      }
     })

    if(!user){
       throw new Error("user not exists  or  not confirmed")
    }
      await redis_service.delate(await redis_service.otpKey(email))
         accessRespose({res,data : "OTP Send successfully "})

}

// ================== logout ===========

export const logout = async(req,res)=>{
  const {flag} = req.query
  if(flag == "all"){
      req.user.changeCredential = new Date()
     await req.user.save()
     await redis_service.delate(await redis_service.keys(`revoke_token:${req.user._id}`))
  }else{

   await redis_service.setValue({
      key:`revoke_token:${req.user._id}:${req.decode.jti}`,
      value:`${req.decode.jti}`,
      ttl: req.decode.exp - Math.floor(Date.now() / 1000)
   })
    // await dbService.create({
    //   model : revokeTokenModel,
    //   date : {
    //      userId : req.user.id,
    //      tokenId : req.decode.jti,
    //      expireAt : new Date( req.decode.exp * 1000)
    //   }
    // })
  }
  
         accessRespose({res, message:flag == "all" ?
           "you are logout from all devices successfully" :
            "you are logout for this device "
          })

}
//======================= refresh_Token =================
export const refreshToken = async(req , res)=>{

    const {token} = req.body;
     
         if(!token){
             throw new Error("tonken not exist",{cause : 400})
         }
     
     const decode = verifyToken({
       token,
       secretKey: REFRESH_SECRETKEY
     });
       if(!decode?.id){
           throw new Error("invalid payload token",{cause : 400})
       }
        const user =await userModel.findOne({_id : decode.id})
     
       if(!user){
         return  res.status(409).json({message:"user not existe"})
       }

         const access_token = generateToken({
   payload: {id : user._id,extra : 250},
   secretKey:SECRETKEY,
   options : {expiresIn:"1h"}
  })

  
     accessRespose({res , data : access_token})
}