import express from "express";
import { checkConnectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
import * as redisService from "./DB/service/redis.service.js";
import { connectRedis } from "./DB/redis.connection.js";
const app = express();
const port = 3000;



const bootstrap= async()=>{

    app.use(cors(), express.json())
   checkConnectionDB()
 await  connectRedis()

//  redisService.setValue({key : "userName" , value:{"username" :"yosra"}, ttl : 100})
//   redisService.setValue({key : "userGender" , value:"female", ttl : 100})
//  redisService.updateValue({key : "names" , value:"omar", ttl : 70})

// console.log(await redisService.keys( "user"));
// console.log(await redisService.delate( "userName"));

// console.log(await redisService.getValue( "name"));
//console.log(await redisService.getValue( "gender"));



   app.use("/users",userRouter)

   
    app.get("/",(req,res)=>{
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