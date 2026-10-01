import multer from "multer";
  
export const multerCloudFile = (
  {
   customType = []
}
={})=>{

  // const dirPath =`uploads/${customPath}`;
  // if(!fs.existsSync(dirPath)){
  //   fs.mkdirSync(dirPath,{recursive : true})
  // } ;
  
  const storage = multer.diskStorage({})

  function fileFilter (req, file, cb) {

   if(!customType.includes(file.mimetype)){
       cb(new Error('inValid file type'))
   }else{
      cb(null, true)
   }

}
  const upload = multer({storage, fileFilter})
  return upload;
}

export const multerMemoryCloudFile = ({
  customType = []
} = {}) => {

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {

    if (!customType.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter
  });
};
