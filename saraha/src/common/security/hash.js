import bcrypt from "bcrypt"

export const Hash = (plainText)=>{
    return bcrypt.hashSync(plainText,5)
}

export const Compare = (plainText, hashing)=>{
    return bcrypt.compareSync(plainText,hashing)
}