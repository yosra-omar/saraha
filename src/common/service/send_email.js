import nodemailer from "nodemailer";

export const sendEmail = async({
   to,
   subject = "HELLO from yosra",
   html = `<h1>hello from yosra</h1>`,
   attachments = [ ]
}={})=>{

 const transporter = nodemailer.createTransport({
  service : "gmail",
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
  auth: {
    user: "yosra.omar.7.3.2@gmail.com",
    pass: "biekjhctbzhgnbiy",
  },
});

try {
  const info = await transporter.sendMail({
    from: '"yasoo" <yosra.omar.7.3.2@gmail.com>', 
    to, 
    subject, 
    html, 
    attachments,
  });

  console.log("Message sent: %s", info.accepted);
  return info.accepted.length > 0 ? true : false
} catch (err) {
  console.error("Error while sending mail:", err);
 return false
}
   
}

export const generate_otp = async()=>{
   return  Math.floor(Math.random() * 900000) + 100000;
}