import express , {Request , Response} from "express";
import AsyncHandler from "express-async-handler";
import MailSender from "../components/Mail";
import { Login, ProtectRoute, ResetPassword, Signup, Verify, VerifyTokenGrab } from "../components/Auth";

// constants
const UserRouter = express.Router();


// signup

UserRouter.post("/signup" , Signup);

// login
UserRouter.post("/login" , Login);

// reset password
UserRouter.post("/reset" , ResetPassword);

// verify mail
UserRouter.get("/verify" , ProtectRoute ,Verify );

// verify token via grab
UserRouter.get("/verify/:token" , VerifyTokenGrab);

// protected route test
UserRouter.get("/text" , ProtectRoute , (req:any , res)=>{
    const {username , email ,_id } = req.user;
    res.json({username , email , _id});
});


export default UserRouter;