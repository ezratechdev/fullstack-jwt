import express , {Request , Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import UserModel from "../schemas/users";
import MailSender from "../components/Mail";
import {generateToken , ProtectRoute } from "../components/Auth";

// constants
const UserRouter = express.Router();


// paths

// signup
UserRouter.post("/signup" , AsyncHandler( async(req:Request , res:Response)=>{
    const { username , email , password } = req.body;
    if(!(username && email && password)) res.json({
        error:true,
        message:`Name , email or password not passed`,
    });

    const UserExist = await UserModel.findOne({email});
    if(UserExist) res.json({
        error:true,
        message:`User with email ${email} already exists`,
    });

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    // create user
    const user = await UserModel.create({
        username,
        email,
        password:hashedPassword,
    });

    // 
    if(user) res.status(200).json({
        _id:user.id,
        name:user.username,
        password:user.password,
        token:generateToken(user._id),
    });
    res.status(400).json({
        error:true,
        message:`Faced an error creating user check on your network and try again`
    });

}));


// login
UserRouter.post("/login" , AsyncHandler( async (req:Request , res:Response)=>{
    const { email , password} = req.body;
    if(!(email && password)) res.status(400).json({
        error:true,
        message:`Invalid credentials sent`,
    });
    const user = await UserModel.findOne({email});
    
    // 
    if(user && (await bcrypt.compare(password ,user.password))){
        res.status(200).json({
            error:false,
            email:user.email,
            message:`User with email ${user.email} logged in`,
            token:generateToken(user._id),
        })
    } else res.status(400).json({
        error:true,
        message:`Invalid password or email.Try again`,
    })
}));


// reset password
UserRouter.post("/reset" , AsyncHandler( async (req:Request , res:Response)=>{
    const { email } = req.body;
    // user node mailer
    // ensure user is among user
    MailSender("Reset",email);
    res.send(`Reset email sent`)

}));

// verify mail
UserRouter.post("/verify" , AsyncHandler( async (req:Request , res:Response)=>{
    const { email } = req.body;

    // 
    MailSender("Verify",email);
    res.send(`Verification email sent`)
    // use node mailer 
}));

// protected route test
UserRouter.get("/text" , ProtectRoute , (req:any , res)=>{
    const {username , email ,_id } = req.user;
    res.json({username , email , _id});
})


export default UserRouter;