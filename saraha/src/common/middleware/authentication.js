import *as dbService from "../../DB/db.service.js";
import { revokeTokenModel } from "../../DB/models/revokToken.model.js";
import { userModel } from "../../DB/models/user.model.js";
import { verifyToken } from "../utils/token.js";



export const authentication = async(req,res,next)=>{
    
     const authorization = req.headers.authorization;
  
      if(!authorization){
          throw new Error("tonken not exist",{cause : 400})
      }
  const [, token] = authorization.split(" ");
  
  const decode = verifyToken({
    token,
    secretKey: "yosra123"
  });
    
    console.log({decode});
    const user =await userModel.findOne({_id : decode.id})
  
    if(!user){
      return  res.status(409).json({message:"user not existe"})
    }

    if(user?.changeCredential?.getTime() > decode.iat *1000){
      throw new Error("you are logged out please login again")
    }

    if(await dbService.findOne({
      model : revokeTokenModel,
      filter:  {idToken : decode.jti}
    })){
          throw new Error("you are logged out please login again....")
    }
  req.user = user;
  req.decode = decode
  next()

}