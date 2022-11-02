const asyncHandler = require("express-async-handler"); 
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
// const { triggerAsyncId } = require("async_hooks");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"});
};

// Registration of User
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body; 
    // there are three things we need: email, name, password 
    if (!email || !name || !password){
        res.status(400); // bad request error code 
        throw new Error("Please fill in all required input fields");
    }
    if (password.length < 8 ){
        res.status(400); // bad request error code 
        throw new Error("Minimum length of password is 8 characters");
    }
    // check for unique email address
    const emailExists = await User.findOne({email});
    if (emailExists){
        res.status(400); // bad request error code 
        throw new Error("Email already registered");
    }

    // Create new user in db 
    const user = await User.create({
        name, 
        email, 
        password, 
    });
    // generate the token for the user 
    const token = generateToken(user._id); 
    // res.header('Access-Control-Allow-Origin', req.headers.origin);
    // send HTTP-only cookie to the client
    res.cookie("auth_token", token, {
        path:"/", 
        httpOnly: false, 
        expires: new Date(Date.now() + 1000 * 86400), // keep the cookie for 1 day 
        sameSite: "none", 
        domain: 'localhost',
        // secure: true,  
    });

    if (user){
        const {_id, name, email, photo, bio, phone} = user; 
        // 201 == new data created in db 
        res.status(201).json({
            _id, 
            name,
            email, 
            photo, 
            bio, 
            phone, 
            token, 
        }); 
        
    } else {
        res.status(400);
        throw new Error("Invalid User Data");
    }
    res.send("Registering a New User");
});

// Login the User 
const loginUser = asyncHandler( async(req, res) => {
    const {email, password } = req.body; // get the user credentials from the reques
    // Validate Request 
    if (!email || !password){
        res.status(400);
        throw new Error("Please add email AND password!");
    }

    // check if user exists 
    // console.log(`User Email: ${email}`); 
    const user = await User.findOne({email}); 

    if (!user){
        res.status(400); 
        throw new Error("User not found"); 
    }

    // check user password corresponds 
    const passwordCorrect = await bcrypt.compare(password, user.password); 
    const token = generateToken(user._id); 
    // send HTTP-only cookie to the client
    res.cookie("auth_token", token, {
        path:"/", 
        httpOnly: false, 
        expires: new Date(Date.now() + 1000 * 86400), // keep the cookie for 1 day 
        sameSite: "none", 
        // secure: true,  
        domain: 'localhost',
    });
    // Successful Login
    if (user && passwordCorrect){
        // generate the token for the user if they have successfully logged in
        const {_id, name, email, photo, bio, phone} = user; // get user information
        res.status(200).json({
            _id, 
            name,
            email, 
            photo, 
            bio, 
            phone, 
            token,
        });
    } else {
        res.status(400); 
        throw new Error("Invalid Email or Password");
    }
});

// logout users 
const logoutUser = asyncHandler(async(req, res) => {
    // console.log(`Request Body: ${req.body}`); 
    // res.send("Logout User");
    res.cookie("auth_token", "", {
        path:"/", 
        httpOnly: false, 
        expires: new Date(0), // reset the token
        sameSite: "none", 
        domain: 'localhost',
        // secure: true,  
    });
    return res.status(200).json({message: "Successfully Logged Out"});

});

// get user data 
const getUser = asyncHandler(async (req, res) => {
    // res.status(200).json({message: "Getting User Data"}); 
    const user = await User.findById(req.user._id);

    if (user){
        const {_id, name, email, photo, bio, phone} = user; 
        // 201 == new data created in db 
        res.status(200).json({
            _id, 
            name,
            email, 
            photo, 
            bio, 
            phone, 
            // auth_token, 
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

// Get Authenticated Status 
const loginStatus = asyncHandler(async (req, res) => {
    const {auth_token} = req.cookies; // get the authentication token from the cookies
    // console.log(`The Authentication Token: ${auth_token}`);
    if (!auth_token) {
        return res.json(false); 
    }

    // verify the viewed token 
    // console.log(`The Authentication Token: ${auth_token}`);
    const verified = jwt.verify(auth_token, process.env.JWT_SECRET); 
    if (verified){
        return res.json(true); 
    }
    return res.json(false);
});  

const updateUser = asyncHandler(async (req, res)=>{
    // res.send("Updating User Credentials");
    // we'll receive the user information from the cookies and get the user id
    const user = await User.findById(req.user._id);
    // now we perform updating on the db
    if (user){
        const { name, email, photo, bio, phone} = user;
        user.email = email; 
        user.name = req.body.name || name;
        user.photo = req.body.photo || photo; 
        user.phone = req.body.phone || phone; 
        user.bio =  req.body.bio || bio;

        const updatedUser = await user.save(); 
        res.status(201).json({
            _id:  updatedUser._id, 
            name:updatedUser.name, 
            email:updatedUser.email, 
            photo:updatedUser.photo, 
            bio: updatedUser.bio,
            phone:updatedUser.phone,
        });
    } else {
        res.status(404); 
        throw new Error("User not found");
    }
});

// function to update password 
const updatePassword = asyncHandler(async (req, res) => {
    // res.send("Updated user password");
    const user = await User.findById(req.user._id);
    // now we perform updating on the db
    const {oldPassword, newPassword, repeatPassword} = req.body;
    if (user){
        // validate input 
        if (!oldPassword || !newPassword || !repeatPassword){
            res.status(400); 
            throw new Error("Please enter all input fields");
        }
        // compare oldPassword against the user's password from the db
        const passwordCorrect = await bcrypt.compare(oldPassword, user.password);
        
        if (!passwordCorrect){
            res.status(400); 
            throw new Error("User's Old Password is Incorrect")
        }

        // if the new password and the repeated password is correct then we change it on the db
        if (newPassword === repeatPassword){
            user.password = newPassword;
            const updatedUser = await user.save();
            // res.status(201).send("User updated successfully");
            res.status(201).json({
                _id:  updatedUser._id, 
                name: updatedUser.name,
            });
        } else{
            res.status(400); 
            throw new Error("The updated passwords do not match!");
        }
    } else {
        res.status(404); 
        throw new Error("User not found");
    }
});

//Forgot password function 
const forgotPassword = asyncHandler( async (req, res) => {
    // res.send("Forgotten Password"); 
    // check for unique email address
    const  {email}  = req.body;
    // if (!email){
    //     res.status(400); 
    //     throw new Error("Please provide a valid email address");
    // }
    const user = await User.findOne({email});
    if (!user){
        // then we take in the 
        res.status(404); 
        throw new Error("User not found");
    } 

    // delete token if one exists in db 
    let token = await Token.findOne({userID: user._id});
    if (token){
        await token.deleteOne();
    }
    // create reset token 
    let resetPasswordToken = crypto.randomBytes(32).toString("hex") + user._id;
    console.log("Reset Token: ");
    console.log(resetPasswordToken);
    // res.send("forgot password"); 

    // hash token prior to saving to db 
    const hashedToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex"); 
    console.log("Hashed Token: ");
    console.log(hashedToken);

    // save token to db 
    await new Token({
        userID: user._id, 
        token:hashedToken, 
        createdAt: Date.now(), 
        expiresAt: Date.now() + 15 * (60* 1000), 
    }).save();

    // create reset url 
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetPasswordToken}`;

    // reset email 
    const message = `
        <h2> Hello ${user.name}</h2>
        <p>Please use tis url below to reset your password</p>
        <p>This reset link is valid for only 15 minutes</p>
        
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        
        <p>Regards...</p>
        <p>Your Friendly Team<p/>
    `;
    const subject = "Password Reset Request"; 
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({success:true, message: "Reset Email Sent"});
    } catch (error) {
        res.status(500);
        throw new Error("Email Not Sent. Please Try Again");
    }

    
});

const resetPassword = asyncHandler(async (req, res) => {
    // res.send("Reset Password");
    const {newPassword} = req.body; 
    const {resetToken} = req.params;

    // hash token prior to db comparison 
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // find the token in the db 
    const userToken = await Token.findOne({
        token: hashedToken, 
        expiresAt: {$gt: Date.now()}
    });

    if (!userToken){
        res.status(404); 
        throw new Error("Invalid Reset Link");
    }
    const user = await User.findOne({_id: userToken.userID}); 
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        message: "Password reset sucessfully"
    });


});
module.exports = {
    registerUser,
    loginUser, 
    logoutUser, 
    getUser, 
    loginStatus, 
    updateUser, 
    updatePassword, 
    forgotPassword, 
    resetPassword
}