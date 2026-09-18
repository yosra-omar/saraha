import mongoose from "mongoose"
import { DB_URI_ONLINE } from "../../config/config.service.js";
 
export const checkConnectionDB = async()=>{
    try {
        await mongoose.connect(DB_URI_ONLINE)
        console.log(` DB connect successfuly ${DB_URI_ONLINE} `);
    } catch (error) {
        console.log(error,"DB Failed connected");
    }
}