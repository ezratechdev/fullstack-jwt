import express from "express";
import { Login, ProtectRoute, ResetPassword, ResetPasswordTokenGrab, Signup, Verify, VerifyTokenGrab } from "../components/Auth";

// constants
const UserRouter = express.Router();


// signup

UserRouter.post("/signup" , Signup);

// login
UserRouter.post("/login" , Login);

// reset password
UserRouter.post("/reset" , ResetPassword);

// reset token via grab
UserRouter.post("/reset/:id" , ResetPasswordTokenGrab);


// verify mail
UserRouter.get("/verify" , ProtectRoute ,Verify );

// verify token via grab
UserRouter.get("/verify/:token" , VerifyTokenGrab);

// protected route test
UserRouter.get("/text" , ProtectRoute , (req:any , res)=>{
    if(!req.user) res.json({error:true , message:"user not found" , status:404});
    const {username , email ,_id } = req.user;
    res.json({username , email , _id});
});


export default UserRouter;