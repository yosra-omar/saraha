import mongoose from "mongoose"
const URL_user="mongodb://localhost:27017/saraha"


export const checkConnectionDB = async()=>{
    try {
        await mongoose.connect(URL_user)
        console.log("DB connect successfuly ");
    } catch (error) {
        console.log(error,"DB Failed connected");
    }
}