import { createClient } from "redis";

const redis_URL = "rediss://default:gQAAAAAAAlEvAAIgcDJiNGM2MmU4Njk5NjA0YzExYjRiMmZmMmU3OTJiY2E4Ng@glad-squid-151855.upstash.io:6379"
export const redis_client = createClient({
    url: redis_URL
})

export const connectRedis = async()=>{
    try {
              //  console.log("Redis URL:", redis_URL);
        await redis_client.connect()
        console.log("redis DB connect successfully");
        
    } catch (error) {
        console.log(`fail to connect DB Redis :${error}`);
        
    }
}