import { v2 as cloudinary } from "cloudinary";
import { API_KEY, API_SECRET, APPLICATION_APP, CLOUD_NAME } from "../../../../config/config.service.js";


export const cloud = ()=>{
    cloudinary.config({
    cloud_name:CLOUD_NAME,
    api_key:API_KEY,
    api_secret:API_SECRET,
  });


  return cloudinary;
}

export const uploadImage =async ({
  file ={},
  path = "general"
}={})=>{
   return await cloud().uploader.upload(file.path,{
      folder :`${APPLICATION_APP}/${path}`
    })
}

export const uploadFiles =async ({
  files =[],
  path = "general"
}={})=>{
  const attachments =[];
  for(const file of files){
      const {secure_url , public_id} = await uploadFiles(files,path)
     attachments.push({secure_url , public_id})
  }
   return  attachments
}

export const destroyImage = async({public_id = ""}={})=>{
    return await  cloud().uploader.destroy(public_id)
}


export const  deleteResurces = async({
  public_ids = [],
   options ={
     type:"upload",
     resources_type:"images"
   }
}={})=>{
    return await cloud().api.delete_resources(public_ids, options)
}
