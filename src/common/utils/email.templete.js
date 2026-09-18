export const otpEmailTemplate = ( otp) => {
 
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial; background:#f4f4f7; padding:40px">

        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          padding:40px;
          border-radius:12px;
          text-align:center;
        ">

          <h1 style="color:#6c63ff">
            Sarahah
          </h1>

          <h2>Verify Your Email</h2>

           <p>Hello 😊👋,</p>
          <p>Your verification code is:</p>

          <div style="
            background:#f1f0ff;
            padding:20px;
            border-radius:10px;
            margin:25px 0;
          ">
            <strong style="
              font-size:36px;
              letter-spacing:8px;
              color:#6c63ff;
            ">
              ${otp}
            </strong>
          </div>

          <p style="color:#888">
            This code will expire in 10 minutes.
          </p>

        </div>

      </body>
    </html>
  `;
};