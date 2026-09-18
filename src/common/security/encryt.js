import crypto from "crypto"
import { ENCRYPTION_KEY } from "../../../config/config.service.js";

// 🔑 Use 32 bytes (256 bits) for AES-256
const encryptionKey = Buffer.from(ENCRYPTION_KEY,"utf8"); 
const IV_LENGTH = 16; 

export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);  

    let encrypted = cipher.update(text, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}


// Decrypt function
export function decrypt(text) {

    const [ivHex, encryptedText] = text.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');    

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey , iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}
