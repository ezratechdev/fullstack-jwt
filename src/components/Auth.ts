import express , {Request , Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AsyncHandler from "express-async-handler";
import UserModel from "../schemas/users";;



// functions 
const generateToken = (id:any)=>{
    return jwt.sign({id} ,process.env.jwt_secret , {expiresIn:'30d'});
}

const ProtectRoute = AsyncHandler(async (req:any , res:Response , next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            // get token from header
            token = req.headers.authorization.split(" ")[1];

            // verify token
            const decoded = jwt.verify(token , process.env.jwt_secret);

            // get user from token
            req.user = await UserModel.findById(decoded.id).select('-password');
            next();


        }catch(error){
            res.status(401);
            throw new Error(`Not authorized`);
        }
    }
    if(!token){
        res.send(401);
        throw new Error('Not authorized.No token');
    }
});


// to deploy multiple , use simply export

export {generateToken , ProtectRoute};