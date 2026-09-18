
import express from "express";
import { checkConnectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
import * as redisService from "./DB/service/redis.service.js";
import { connectRedis } from "./DB/redis.connection.js";
import messageRouter from "./modules/messages/message.controller.js";
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet";
import { PORT } from "../config/config.service.js";

const app = express();
const port = PORT;



const bootstrap= async()=>{
  
   app.set("case sensitive routing", true)

   const limiter = rateLimit({
      windowMs : 60*2*1000,
      limit :3,
      message:"Game over",
      statusCode:400,
      handler:(req,res,next)=>{
        res.status(401).json({message:"game Overrrrrrr"})
      },
       // legacyHeaders:false,
    //    skipFailedRequests:true,
    //    skipSuccessfulRequests : true
   })

   const whitelist = ["http//localhost:5000","http//localhost:3000",undefined];
   const corsOptions = {
  origin: function (origin, callback) {
      if(whitelist.includes(origin)){
          callback(null,true)
      }else{
        callback(new Error("not allow by cors"))
      }
    }
  }

    app.use(cors(corsOptions),
    helmet(),
    limiter,
    express.json()
)

   checkConnectionDB()
 await  connectRedis()

   app.use("/:userId/message",messageRouter)
   
   app.use("/users",userRouter)
   app.use("/messages",messageRouter)

   
    app.get("/all",(req,res)=>{
        res.status(200).json({message:"Welcom to saraha my app......😀"})
    })


app.use("{/demo}",(req,res)=>{
        throw new Error(`URL ${req.originalUrl} and method ${req.method} not found `,{cause:404})
})



app.use((err,req,res,next)=>{

    const statusCode = err.cause || 500

    res.status(statusCode).json({
        message:err.message,
        statusCode,
        stack : err.stack
    })
})


    app.listen(port,()=>{
        console.log(`server runing in port ${port}`)
    })
}


export default bootstrap