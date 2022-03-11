import express , { Response} from "express"
import expressAsyncHandler from "express-async-handler";
import goalModel from "../schemas/goal";
import UserModel from "../schemas/users";
import {ProtectRoute} from "../components/Auth";
import { responseFunc } from "../components/response"

// consts
const Router = express.Router();

// get
Router.get("/" , ProtectRoute , expressAsyncHandler(async(req:any , res:Response)=>{
    if(!req.user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found.Authorization to route is not valid`,
            status:400,
        })
    })
    await goalModel.find({ user : req.user.id})
    .then(result=>{
        res.send(result);
    })
    .catch(error=>{
        res.send(error);
    })
}))

// post


Router.post("/" ,ProtectRoute , expressAsyncHandler(async(req:any , res:Response)=>{
    if(!req.user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found.Authorization to route is not valid`,
            status:400,
        })
    })
    const { text } = req.body;
    if(!text) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    })
    const goal = await goalModel.create({
        text,
        user:req.user.id,
    });
    res.json(goal);
}))
// get specific data
Router.get("/:id" ,ProtectRoute , expressAsyncHandler(async(req:any , res:Response)=>{
    if(!req.user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found.Authorization to route is not valid`,
            status:400,
        })
    })
    const { id } = req.params;
    if(!id) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    });
    res.send("This is the get "+id);
}))

// patch specific data
Router.patch("/:id" , ProtectRoute, expressAsyncHandler(async(req:any , res:Response)=>{
    if(!req.user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found.Authorization to route is not valid`,
            status:400,
        })
    })
    const { id } = req.params;
    const { text } = req.body;
    if(!(id.length > 0 )|| !(text.length > 0)) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    });
    const goal:any = goalModel.findById(id);
    // check for user
    const user = await UserModel.findById(req.user.id);
    if(!user){
        res.status(401);
        throw new Error("User not found");
    }

    if(user.id !== goal.user.id){
        res.status(401);
        throw new Error("Delete not allowed");
    }
    const updatedGoal = await goalModel.findByIdAndUpdate(id,{text},{new :true});
    res.json(updatedGoal);
}))
// delete specific data
Router.delete("/:id" , ProtectRoute , expressAsyncHandler(async(req:any , res:Response)=>{
    if(!req.user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found.Authorization to route is not valid`,
            status:400,
        })
    })
    const { id } = req.params;
    if(!id) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    });
    const goal:any = goalModel.findById(id);
    // check for user
    const user = await UserModel.findById(req.user.id);
    if(!user || !goal){
        res.status(401).json("error");
        // throw new Error("User not found");
    }

    if(user.id !== goal.user.id){
        res.status(401);
        throw new Error("Delete not allowed");
    }
    await goal.remove();
    res.json({
        id,
    });
}))







export default Router;