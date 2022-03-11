import nodemailer from "nodemailer";

const MailSender = async (message:any,email:string,title:string)=>{
    let transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "info@bitdaraja.com",
            pass: "testPawssword1235",
        },
        tls:{
            rejectUnauthorized:false,
        }
    });
    await transporter.sendMail({
        from: '"Bitdaraja Customer Care" <info@bitdaraja.com>',
        to: `${email}`,
        subject: title,
        text: `This email is intended for ${email} , if you are recieving it and you did not request for it kindly ignore it`,
        html:message,
    });
}

export default MailSender;