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
 //====================== this is old way in vertion 4 ==========
// const asyncHandler = (fn)=>{
//     return(req,res,next)=>{
//       fn(req,res,next) .catch((error)=>{
//           // res.status(500).json({message:"server error ",error})
//           next(error)
//       })
//     }
// }


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
    const otpHash = await Hash(`${otp}`)
    const sendemail = await sendEmail({
      to: email,
      subject:`verify your email`,
       html :`<h1>verify your email</h1><p>YOUR OTP is ${otp}<p>`,
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

     await redis_service.setValue({
      key: await redis_service.otpKey(email),
      value: otpHash,
      ttl:60
     })

   await redis_service.setValue({
    key:await redis_service.max_otp_Key(email),
    value : 1,
    ttl : 60 
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

//  res.status(201).json({message:"done",user})
  
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
      filter: {email , isConfirmed : false},
      update:{isConfirmed : true}
     })

    if(! user){
       throw new Error ("email already exists or already confirmed ",{cause:409})
    }
   await redis_service.delate(await redis_service.otpKey(email))

    accessRespose({res,status:200, message:"Email confirmed successfully "})
   } 

  // =======================  resendOTP =========================
 export const   resendOTP = async(req , res)=>{

     const { email} = req.body;
    
      const isBlocked = await redis_service.ttl( await redis_service.block_otp_Key(email))
      if(isBlocked > 0){
          throw new Error (`you  blocked and you can resend OTP after ${isBlocked} seconds `,{cause:400})
      }

     const otpTTL = await redis_service.ttl(await redis_service.otpKey(email))
     if(otpTTL >0){
       throw new Error (`you can resend otp after ${otpTTL}`,{cause:400})
     }

    console.log({otpTTL});
     
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
      filter: {email , isConfirmed : false},
     })

    if(! user){
       throw new Error ("email already exist or already confirmed ",{cause:409})
    }

    const otp =  await generate_otp();
    const otpHash = Hash(`${otp}`)
    const sendemail = await sendEmail({
        to: email,
      subject:`verify your email`,
       html :`<h1>verify your email</h1><p>YOUR OTP is ${otp}<p>`,
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

    accessRespose({res,status:200, message:"Email confirmed successfully "})
   } 

 export const signUpwithGmail = async (req, res) => {
 
  console.log("kkkkkkk")
    const { idToken } = req.body;
    console.log("ID TOKEN:", idToken);

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "856044153472-hka0icclcrjrb8lnvsirr8fcjgeut6mo.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    console.log("PAYLOAD:", payload);

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

     console.log({  user });
     

     const access_token = jwt.generateToken({
      payload : { id : user._id},
      secretKey:"yosra123",
      options: {expiresIn : "1h"}
     })
 
         accessRespose({res , data : access_token})

   } 


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
      secretKey:"yosra123",
      options : {
        jwtid :idToken,
        expiresIn: 2* 60
      }
  })

   const refresh_token = generateToken({
      payload: {id : user._id,extra : 250},
      secretKey:"yosra@123",
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
       secretKey: "yosra@123"
     });
       if(!decode?.id){
           throw new Error("invalid payload token",{cause : 400})
       }
       console.log({decode});
       const user =await userModel.findOne({_id : decode.id})
     
       if(!user){
         return  res.status(409).json({message:"user not existe"})
       }

         const access_token = generateToken({
   payload: {id : user._id,extra : 250},
   secretKey:"yosra123",
   options : {expiresIn:"1h"}
  })

  
     accessRespose({res , data : access_token})
}