import express , {Request , Response} from "express";
import Router from "./routes/routes";
import http from "http";
import path from "path";
import mongoose from "mongoose";
import userRouter from "./routes/users";
require("dotenv").config();


// const 
const app = express();
const port = process.env.PORT || 5000;
const Server = http.createServer(app);

// middle wares
app.use(express.json());
app.use(express.static(path.join(__dirname + "/public")));
app.use(express.urlencoded({extended:true}));
app.use("/path",Router);
app.use("/users",userRouter);

// get requests
app.get("/", (req:Request , res:Response)=>{
    res.sendFile("index.html");
});

// post requests

// error 404
app.use((req:Request , res:Response)=>{
    res.json({
        status:404,
        error:true,
        environment:process.env.NODE_ENV,
    }).sendStatus(400);
})

// connect to database
mongoose.connect(process.env.mongo_string)
.then(result =>{
    console.log("Connected to database")
    Server.listen(port,()=> (process.env.NODE_ENV == "development") ? console.log(`connected to port ${port}`):null);
})
.catch(error => {throw new Error(error)});


//