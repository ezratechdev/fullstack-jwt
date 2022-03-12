import nodemailer from "nodemailer";

const MailSender = async (html:any,email:string,title:string)=>{
    let transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 587,
        secure: false,
        auth: {
            user: "info@bitdaraja.com",
            pass: "testPawssword1235",
        },
        tls:{
            rejectUnauthorized:false,
        }
    });
    await transporter.sendMail({
        from: '"Bitdaraja" <info@bitdaraja.com>',
        to: `${email}`,
        subject: title,
        text: `This email is intended for ${email} , if you are recieving it and you did not request for it kindly ignore it`,
        html,
    });
}

export default MailSender;