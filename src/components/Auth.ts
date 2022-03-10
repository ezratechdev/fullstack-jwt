import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AsyncHandler from "express-async-handler";
import UserModel from "../schemas/users";
import MailSender from "./Mail";
import { responseFunc } from "./response";

// to do 
// generate different tokens for different uses ie add more data in object and use different keys


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
    const user:any = UserModel.findOne({email});
    // generate token from _id
    if(!user) res.json({
        ...responseFunc({
            error:true,
            message:`Cant send reset email to none existing user ${email}`,
            status:400,
        }),
    });
    const token = generateToken(user._id,'48h');
    res.send(token);
    // MailSender("Reset", email);
    // res.send(`Reset email sent`)

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

    const decoded:any = jwt.verify(token,process.env.jwt_secret);

    const user = await UserModel.findById(decoded.id).select("-password");
    if(!user) res.json({
        ...responseFunc({
            error:true,
            message:`User not found or token not passed`,
            status:400,
        }),
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
    const { email, _id } = req.user;

    const verificationToken = generateToken(_id, '48h');
    const verificationTokenLink = `localhost:5000/users/${verificationToken}`;
    const verifyHtml = `<p>${verificationTokenLink}</p>`
    MailSender(`${verifyHtml}`, email);

    res.json({
        ...responseFunc({
            error: false,
            message: `Verification sent to ${email}`,
        })
    })

});

const VerifyTokenGrab = AsyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.jwt_secret);
    const id = decodedToken.id;
    const user: any = await UserModel.findById(id).select("-password");

    if (!user) res.json({ error: true, message: `User not found`, status: 400, id, data: "ss" });

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