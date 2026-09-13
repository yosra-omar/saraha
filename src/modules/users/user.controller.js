import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authortization.js";
import { userRoles } from "../../enums/user.enum.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { fileType } from "../../enums/multer.enum.js";

const userRouter = Router()

userRouter.post("/signup",
    multerLocal({customPath : "users",
    //or  [...fileType.image , ...fileType.video]
    customType: fileType.image})
    .fields([
       {  name :"attachment" , maxCount:1   } ,
{       name:"attachments",maxCount : 3   }
    ]),
    validation(UV.signUpSchema),
    US.signUp)
userRouter.patch("/confirmEmail",validation(UV.confirmEmailSchema),US.confirmEmail)
userRouter.post("/resend-otp",US.resendOTP)
userRouter.post("/signup/gmail",US.signUpwithGmail)
userRouter.post("/signin",validation(UV.signInSchema),US.signIn)
userRouter.get("/profile",authentication,authorization(Object.values(userRoles)),US.getProfile)
userRouter.get("/profile/:id",validation(UV.idSchema),US.shareProfile)
userRouter.patch("/update/profile",validation(UV.updateSchema),authentication,US.updateProfile)
userRouter.patch("/update/password",validation(UV.updatePasswordSchema),authentication,US.updatePassword)
userRouter.patch("/logout",validation(UV.logoutSchema),authentication,US.logout)
userRouter.get("/refreshToken",US.refreshToken)

export default userRouter