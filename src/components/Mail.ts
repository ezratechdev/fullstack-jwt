import nodemailer from "nodemailer";

const MailSender = async (message:any,email:string)=>{
    let transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "info@bitdaraja.com", // generated ethereal user
            pass: "testPawssword1235", // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false,
        }
    });
    const html = `
    <div>
    <p>Hello there</p>
    <div>
        <p>
            We got your message
        </p>
        <br>
        <p>${message}</p>
        <p>We will reply shortly</p>
    </div>
    <p style="color: red;">Thank you for choosing us</p>
    </div>
    `;
    await transporter.sendMail({
        from: '"Bitdaraja Customer Care" <info@bitdaraja.com>', // sender address
        to: `${email}`, // list of receivers
        subject: "Automated Reply", // Subject line
        text: "Hello world?", // plain text body
        html,
    });
}

export default MailSender;