import express from "express";
import { checkConnectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
const app = express();
const port = 3000;



const bootstrap= async()=>{

    app.use(cors(), express.json())
   checkConnectionDB()
   app.use("/users",userRouter)

   
    app.get("/",(req,res)=>{
        res.status(200).json({message:"Welcom to saraha my app.....😀"})
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