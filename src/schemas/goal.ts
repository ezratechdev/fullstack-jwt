import mongoose from "mongoose";
// import user

const goalSchema = new mongoose.Schema({
    text:{
        type:String,
        required:[true , "Add a text value"],
    },
    user:{
        type:mongoose.Types.ObjectId,
        required:[true,"A user object was not passed"],
        ref:'User',
        
    }
},{ timestamps : true});

const goalModel = mongoose.model('goals' , goalSchema);

export default goalModel;