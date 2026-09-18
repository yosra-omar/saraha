import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

 export const redis_client = createClient({
    url: REDIS_URL
})

export const connectRedis = async()=>{
    try {
         await redis_client.connect()
        console.log(`redis DB connect successfully `);
        
    } catch (error) {
        console.log(`fail to connect DB Redis :${error}`);
        
    }
}