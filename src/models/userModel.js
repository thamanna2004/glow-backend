const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },


    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },


    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
    },


    phonenumber:{
        type:String,
        trim:true,
        default:""
    },


    // user or admin
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },

    isBlocked:{
        type:Boolean,
        default:false
    },


    // JWT refresh token
    refreshToken:{
        type:String,
        default:null
    }


},
{
    timestamps:true
});



module.exports = mongoose.model(
    "User",
    userSchema
);