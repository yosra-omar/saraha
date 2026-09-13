import { redis_client } from "../redis.connection.js";


export const otpKey = async(email)=>{
   return `otp:${email}`
}

export const max_otp_Key = async(email)=>{
   return `otp::${email}::max`
}

export const block_otp_Key = async(email)=>{
   return `otp::${email}::block`
}

export const setValue =async ({
    key,
    value,
    ttl
}={})=>{

   try { 
    let data = typeof value === "string" ? value : JSON.stringify(value)

    return  ttl ?  await redis_client.set(key,  data, {EX : ttl}) : await redis_client.set(key,  data)
   } catch (error) {
      console.log(`fail in redis set operation${error} `);
      
   }
}

export const updateValue = async({
  key,
  value,
  ttl
}={})=>{
  try {
    if(! redis_client.exists(key)){
      return 0
    }
     await redis_client.set(key,value,{EX :ttl})
  } catch (error) {
          console.log(`fail in redis update set operation${error} `);
  }
}


export const getValue = async(key)=>{
  try {
     try {
       return JSON.parse(await redis_client.get(key))
     } catch (error) {
        return await redis_client.get(key)
  }
  } catch (error) {
          console.log(`fail in redis get operation${error} `);
  }
}

export const ttl = async(key)=>{
  try {
        return await redis_client.ttl(key)
  } catch (error) {
          console.log(`fail in redis ttl operation${error} `);
  }
}

export const existsKey = async(key)=>{
  try {
        return await redis_client.exists(key)
  } catch (error) {
          console.log(`fail in redis exists operation${error} `);
  }
}

export const expire = async({key , ttl}={})=>{
  try {
        return await redis_client.expire(key, {EX : ttl})
  } catch (error) {
          console.log(`fail in redis expire operation${error} `);
  }
}

export const mGet = async(keys = [ ])=>{
  try {
    if(! keys.length)  return 0
        return await redis_client.mGet(keys )
  } catch (error) {
          console.log(`fail in redis mGet operation${error} `);
  }
}

export const keys = async(prefix)=>{
  try {
        return await redis_client.keys( `${prefix}*` )
  } catch (error) {
          console.log(`fail in redis keys operation${error} `);
  }
}

export const delate = async(key)=>{
  try {
        return await redis_client.del(key )
  } catch (error) {
          console.log(`fail in redis delate operation${error} `);
  }
}

export const incr = async( email)=>{
  try {
        return await redis_client.incr(await max_otp_Key(email) )
  } catch (error) {
          console.log(`fail in redis incr operation${error} `);
  }
}