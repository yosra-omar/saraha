import bcrypt from "bcrypt"

export const Hash = (plainText)=>{
    return bcrypt.hashSync(plainText, Number(process.env.SALT_ROUNDS))
}

export const Compare = (plainText, hashing)=>{
    return bcrypt.compareSync(plainText,hashing)
}