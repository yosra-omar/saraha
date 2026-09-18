import multer from "multer";
import fs from "node:fs";
// path from "node:path";

export const multerLocal = (
  {
  customPath = "general",
  customType = []
}
={})=>{

  const dirPath =`uploads/${customPath}`;
  if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath,{recursive : true})
  } ;

  const storage = multer.diskStorage({
    destination:function(req,file,cb){
         cb(null,dirPath)
    },
    filename: function(req,file,cb){
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,uniqueSuffix + "__" + file.originalname)
    }
  })
  
  function fileFilter (req, file, cb) {

   if(!customType.includes(file.mimetype)){
       cb(new Error('inValid file type'))
   }else{
      cb(null, true)
   }

}
  const upload = multer({storage , fileFilter})
  return upload;
}

