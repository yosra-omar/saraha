
import dotenv from "dotenv"
import { resolve } from "node:path";
const NODE_ENV= process.env.NODE_ENV
 
const envPaths ={
    development:".env.development",
    production:".env.production"
}
dotenv.config({path:resolve(`config/${envPaths[NODE_ENV]}`)})


export const PORT= process.env.PORT
export const SALT_ROUNDS= process.env.SALT_ROUNDS
export const DB_URI=process.env.DB_URI
export const DB_URI_ONLINE=process.env.DB_URI_ONLINE
export const AUDIENCE= process.env.AUDIENCE
export const SECRETKEY= process.env.SECRETKEY
export const REFRESH_SECRETKEY=process.env.REFRESH_SECRETKEY
export const REDIS_URL = process.env.REDIS_URL
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
export const USER_EMAIL = process.env.USER_EMAIL
export const PASSWORD = process.env.PASSWORD

