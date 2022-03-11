import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AsyncHandler from "express-async-handler";
import UserModel from "../schemas/users";
import MailSender from "./Mail";
import { responseFunc } from "./response";

// to do 

// add fetch requests to html sent which will lead to redirect and pass token as a redirect
// ensure token is not sent as a response for reset and verify


// functions 
const generateToken = (id: any, expiresin) => {
    return jwt.sign({ id , operation:'auth' }, process.env.jwt_secret, { expiresIn: `${expiresin}` });
}

// protect route middle ware
const ProtectRoute = AsyncHandler(async (req: any, res: Response, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // get token from header
            token = req.headers.authorization.split(" ")[1];

            // verify token
            const decoded = jwt.verify(token, process.env.jwt_secret);

            // get user from token
            if(decoded.operation == "auth")
            req.user = await UserModel.findById(decoded.id).select('-password');
            next();


        } catch (error) {
            res.json({
                ...responseFunc({ error: true, message: `Un-authorized access`, status: 400 }),
            });
        }
    }
    if (!token) {
        res.json({
            ...responseFunc({ error: true, message: `No token sent`, status: 400 }),
        });
    }
});

// open auth routes

const Login = AsyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!(email && password)) res.json({
        error: true,
        message: `Invalid credentials sent`,
        status: 400,
    });
    const user = await UserModel.findOne({ email });

    // 

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            ...responseFunc({
                error: false,
                 email: user.email,
                 message: `User with email ${user.email} logged in`,
                token: generateToken(user._id, "30d"),
                status: 200,
                isEmailVerified: user.isEmailVerified,
            })
        })
    } else res.json({
        error: true,
        status: 400,
        message: `Invalid password or email.Try again`,
    })
})
const Signup = AsyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!(username && email && password)) res.json({
        ...responseFunc({
            error: true,
            status: 400,
            message: `Name , email or password not passed`,
        }),
    });

    const UserExist = await UserModel.findOne({ email });
    if (UserExist) res.json({
        ...responseFunc({
            error: true,
            message: `User with email ${email} already exists`,
        }),
    });

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        isEmailVerified: false,
    });

    // 
    if (user) res.json({
        ...responseFunc({
            error: false,
            token: generateToken(user._id, '30d'),
            status: 200,
            username: user.username,
            message: `User has been created`,
            isEmailVerified: user.isEmailVerified,
        }),
    });
    res.json({
        ...responseFunc({
            error: true,
            message: `Faced an error creating user check on your network and try again`,
            status: 400,
        }),
    });

});

const ResetPassword = AsyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    // user node mailer
    // ensure user is among user
    const user:any = await UserModel.findOne({email}).select("-password");
    // generate token from _id
    if(!user) res.json({
        ...responseFunc({
            error:true,
            message:`Cant send reset email to a none existing user ${email}`,
            status:400,
        }),
    });
    const token = jwt.sign({id:user._id , operation:'reset'}, process.env.jwt_secret_reset ,{expiresIn:'48h'});
    // add a path which when a user hits they are asked for an input
    const html = `
    <div>
    <p>Hello there</p>
    <div>
        <p>
            You requested for a password reset use the link below to do so
        </p>
        <br>
        <p>
        ${token}
        <a href="localhost:5000/auth/reset/${token}">Reset password</a>
        </p>
        <p>Thank you for using our services</p>
    </div>
    </div>
    `;
    MailSender(html, email , "Password Reset");
    res.json({
        ...responseFunc({
            error:false,
            message:`Reset link sent to ${email}`,
            status:200,
        }),
    });

});

const ResetPasswordTokenGrab = AsyncHandler(async(req:Request , res:Response)=>{
    const { password } = req.body;
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token || !password){
        res.json({
            ...responseFunc({
                error:true,
                message:`Token not passed`,
                status:400,
            }),
        })
    }

    const decoded:any = jwt.verify(token,process.env.jwt_secret_reset);
    if(decoded.operation !== 'reset'){
        res.json({
            ...responseFunc({
                error:true,
                message:`Token passed is invalid for this operation`,
                status:401,
            })
        })
    }

    const user = await UserModel.findById(decoded.id).select("-password");
    if(!user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found`,
            status:400,
        }),
        id:decoded.id,
        operation:decoded.operation,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const updatedUser = await UserModel.findByIdAndUpdate(decoded.id , {password:hashedPassword} ,{new:true}).select("-password");
    if(!updatedUser) res.json({
        ...responseFunc({
            error:true,
            message:`Could not update user.Try again later`,
        }),
    })
    res.json({
        ...responseFunc({
            error:false,
            message:`Password for ${updatedUser.email} has been updated`,
            status:200,
        })
    })
});

// protected auth routes 

const Verify = AsyncHandler(async (req: any, res: Response) => {
    if(!(req.user)) res.json({
        ...responseFunc({
            error:true,
            message:`Could not find authorized user`,
            status:400,
        })
    })
    const { email, _id } = req.user;

    // 
    const verificationToken = jwt.sign({id:_id , operation:'verify'}, process.env.jwt_secret_verify , {expiresIn:'48h'});
    const verificationTokenLink = `localhost:5000/users/${verificationToken}`;
    const verifyHtml = `<p>${verificationTokenLink}</p>`
    // introduce fetch via script
    const html = `
    <div>
    <p>Hello there</p>
    <div>
        <p>
            Kindly use the link below to verify your email
        </p>
        <br>
        <p> 
        ${verificationToken}
        <a href="localhost:data"></a>
        </p>
        <p>We will reply shortly</p>
    </div>
    <p style="color: red;">Thank you for choosing us</p>
    </div>
    `;
    MailSender(`${html}`, email , "Email verification");

    res.json({
        ...responseFunc({
            error: false,
            message: `Verification sent to ${email}`,
        })
    })

});

const VerifyTokenGrab = AsyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.jwt_secret_verify);
    const {id , operation} = decodedToken;
    if(operation !== 'verify') res.json({
        ...responseFunc({
            error:true,
            message:`Token not valid for this operation`,
            status:404,
        }),
    })
    const user: any = await UserModel.findById(id).select("-password");

    if (!user) res.json({ 
        ...responseFunc({
            error: true, message: `User not found`, status: 400,
        })
     });

    if (user.isEmailVerified) {
        res.json({
            ...responseFunc({
                error: true,
                message: `User with email ${user.email} is already verified`,
                email: user.email,
            })
        })
    }

    const verifiedUser: any = await UserModel.findByIdAndUpdate(id, { isEmailVerified: true }, { new: true });

    res.json({
        ...responseFunc({
            error: false,
            isEmailVerified: verifiedUser.isEmailVerified,
            email: verifiedUser.email,
            message: `User with email ${verifiedUser.email} is now verified`,
        })
    })
});


// to deploy multiple , use simply export

export { generateToken, ProtectRoute, Login, Signup, Verify, VerifyTokenGrab, ResetPassword , ResetPasswordTokenGrab };