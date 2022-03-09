import express , {Request , Response} from "express"
import expressAsyncHandler from "express-async-handler";
import goalModel from "../schemas/goal";
import {ProtectRoute} from "../components/Auth";

// consts
const Router = express.Router();

// get
Router.get("/" , ProtectRoute , expressAsyncHandler(async(req:any , res:Response)=>{
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
Router.get("/:id" ,ProtectRoute , expressAsyncHandler(async(req:Request , res:Response)=>{
    const { id } = req.params;
    if(!id) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    });
    res.send("This is the get "+id);
}))

// patch specific data
Router.patch("/:id" , ProtectRoute, expressAsyncHandler(async(req:Request , res:Response)=>{
    const { id } = req.params;
    const { text } = req.body;
    if(!(id.length > 0 )|| !(text.length > 0)) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    })
    const updatedGoal = await goalModel.findByIdAndUpdate(id,{text},{new :true});
    res.json(updatedGoal);
}))
// delete specific data
Router.delete("/:id" , ProtectRoute , expressAsyncHandler(async(req:Request , res:Response)=>{
    const { id } = req.params;
    if(!id) res.status(400).json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    });
    await goalModel.remove();
    res.json({
        id,
    });
}))







export default Router;