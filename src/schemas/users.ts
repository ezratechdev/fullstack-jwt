import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"A username is required"],
        unique:true,
    },
    email:{
        type:String,
        required:[true,"An email is required"],
    },
    password:{
        type:String,
        required:[true,"A password is required"],
    },
},{timestamps:true});


export default mongoose.model('User',userSchema);