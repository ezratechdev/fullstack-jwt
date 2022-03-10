import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AsyncHandler from "express-async-handler";
import UserModel from "../schemas/users";
import MailSender from "./Mail";



// functions 
const generateToken = (id: any, expiresin) => {
    return jwt.sign({ id }, process.env.jwt_secret, { expiresIn: `${expiresin}` });
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
            req.user = await UserModel.findById(decoded.id).select('-password');
            next();


        } catch (error) {
            res.json({
                error: true,
                message: `Restricted Access`,
            });
        }
    }
    if (!token) {
        res.json({
            error: true,
            message: `No token sent`,
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
            error: false,
            email: user.email,
            message: `User with email ${user.email} logged in`,
            isEmailVerified: user.isEmailVerified,
            token: generateToken(user._id, "30d"),
            status: 200,
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
        error: true,
        message: `Name , email or password not passed`,
    });

    const UserExist = await UserModel.findOne({ email });
    if (UserExist) res.json({
        error: true,
        message: `User with email ${email} already exists`,
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
        _id: user.id,
        name: user.username,
        password: user.password,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id, '30d'),
        status: 200,
    });
    res.json({
        error: true,
        message: `Faced an error creating user check on your network and try again`,
        status: 400,
    });

});

const ResetPassword = AsyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    // user node mailer
    // ensure user is among user
    MailSender("Reset", email);
    res.send(`Reset email sent`)

})

// protected auth routes 

const Verify = AsyncHandler(async (req: any, res: Response) => {
    const { email, _id } = req.user;

    const verificationToken = generateToken(_id, '48h');
    const verificationTokenLink = `localhost:5000/users/${verificationToken}`;
    const verifyHtml = `<p>${verificationTokenLink}</p>`
    MailSender(`${verifyHtml}`, email);

    res.json({
        error: false,
        message: `Verification sent to ${email}`,
        token: verificationTokenLink,
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
            error: false,
            email: user.email,
            message: `User with email ${user.email} is already verified`,
            data: "none",
        })
    }

    const verifiedUser: any = await UserModel.findByIdAndUpdate(id, { isEmailVerified: true }, { new: true });
    res.json({
        error: false,
        isEmailVerified: verifiedUser.isEmailVerified,
        email: verifiedUser.email,
        message: `User with email ${verifiedUser.email} is now verified`,
        add: user.email,
        status: user.isEmailVerified,
        data: "none v2",
    })
});


// to deploy multiple , use simply export

export { generateToken, ProtectRoute, Login, Signup, Verify, VerifyTokenGrab, ResetPassword };