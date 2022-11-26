const mongoose = require("mongoose");
const moment = require("moment-timezone");
const bcrypt = require("bcryptjs");
const tzSouthAfrica = moment.tz(Date.now(), "Africa/Johannesburg"); 

// there is a main form schema that will be saved on the database
const formSchema = new mongoose.Schema({
    policy_name: {
        type: String, 
        required: [true, "Please add a Policy Type"], 
    }, 
    email: {
        type: String, 
        required: [true, "Please add an email"],
        unique: true, 
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
            "Please enter a valid email"
        ]
    }, 
    password: {
        type: String, 
        required: [true, "Please add a password"], 
        minLength: [8, "Password must have minimum length of 8 characters"], 
        // maxLength: [31, "Password must have maximum length of 31 characters"],
    }, 
    photo: {
        type:String, 
        required: [true, "Please add a photo of yourself"], 
        default: "https://i.ibb.co/4pDNDk1/avatar.png",  
    }, 
    phone: {
        type:String, 
        required: [true, "Please add a contact number"], 
        default: "+27",  
    },
    bio: {
        type:String, 
        maxLength: [255, "Password must have maximum length of 31 characters"],
        default: "Your Bio is mentioned here."
    },
    created_date: {
        type: Date, 
        default: tzSouthAfrica, 
    }, 
    updated_date: {
        type: Date, 
        default: tzSouthAfrica, 
    }
});

const ClaimForm = mongoose.model("ClaimForms", formSchema); 

module.exports = formSchema; 