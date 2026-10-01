import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authortization.js";
import { userRoles } from "../../enums/user.enum.js";
import { multerLocal } from "../../common/utils/multer/local.multer.js";
import { fileType } from "../../enums/multer.enum.js";
import messageRouter from "../messages/message.controller.js";
import { multerCloudFile } from "../../common/utils/multer/cloud.multer.js";

const userRouter = Router({
    caseSensitive : true ,
    //strict : true // to handel final / in URL
})

   userRouter.use("/:userId/message",messageRouter)

userRouter.post("/signup",multerCloudFile({
    customPath:"Users", customType:fileType.image
}).single("images")
  //  multerLocal({customPath : "users",
    //or  [...fileType.image , ...fileType.video]
    // customType: fileType.image})
    // .single("attachment")
//     .fields([
//        {  name :"attachment" , maxCount:1   } ,
// {       name:"attachments",maxCount : 3   }
//     ])
    ,validation(UV.signUpSchema),
    US.signUp)

userRouter.patch("/confirmEmail",validation(UV.confirmEmailSchema),US.confirmEmail)
userRouter.post("/resend-otp",US.resendOTP)
userRouter.post("/signup/gmail",US.signUpwithGmail)
userRouter.post("/signin",validation(UV.signInSchema),US.signIn)

userRouter.get("/profile",authentication,authorization(Object.values(userRoles)),US.getProfile)
userRouter.get("/profile/:id",validation(UV.idSchema),US.shareProfile)

userRouter.patch("/update/profile",validation(UV.updateSchema),authentication,US.updateProfile)
userRouter.patch("/update/profile-image",authentication,multerCloudFile({
    customPath:"Users", customType:fileType.image
}).single("images"),US.updateProfileImage)
userRouter.patch("/update/profile-cover-image",authentication,multerCloudFile({
    customPath:"Users", customType:fileType.image
}).array("images",3),US.profileCoverImage)
userRouter.patch("/update/password",validation(UV.updatePasswordSchema),authentication,US.updatePassword)
userRouter.patch("/forget_Password",US.forget_Password)
userRouter.patch("/reset_Password",validation(UV.resetPasswordSchema),US.reset_Password)

userRouter.patch("/logout",validation(UV.logoutSchema),authentication,US.logout)
userRouter.get("/refreshToken",US.refreshToken)

export default userRouter