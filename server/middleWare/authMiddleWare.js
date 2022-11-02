const asyncHandler = require("express-async-handler"); 
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.auth_token; 
        if (!token){
            res.status(401); 
            throw new Error("User is not authenticated, please login");
        }
        // verify the token 
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(`${verified.id}`); 

        // get user id from token 
        const user = await User.findById(verified.id).select("-password");  
        req.user = user; 
        next();
    } catch (error) {
        res.status(401); 
        throw new Error("User is not authenticated, please login");
    }
});

module.exports = protect;