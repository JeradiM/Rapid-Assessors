const mongoose = require("mongoose"); 
const bcrypt = require("bcryptjs");
// const tzSouthAfrica = moment.tz(Date.now(), "Africa/Johannesburg");

const tokenSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "user"
    }, 
    token: {
        type:String, 
        required: true
    }, 
    createdAt: {
        type:Date, 
        required: true
    },
    expiresAt: {
        type:Date, 
        required: true
    },  
});

const Token = mongoose.model("Token", tokenSchema); 

module.exports = Token; 