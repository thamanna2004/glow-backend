const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



// ============================
// REGISTER
// ============================

exports.register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      phonenumber
    } = req.body;


    // check user exists
    const exists = await User.findOne({ email });


    if (exists) {

      return res.status(400).json({
        message: "User already exists",
      });

    }



    // hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );



    // create user
    const user = await User.create({

      name,
      email,
      password: hashedPassword,
      phonenumber,

    });



    // hide password in response
    res.status(201).json({

      message: "Registered successfully",

      user:{

        _id:user._id,
        name:user.name,
        email:user.email,
        phonenumber:user.phonenumber,
        role:user.role,
        createdAt:user.createdAt

      }

    });



  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};





// ============================
// LOGIN
// ============================

exports.login = async (req,res)=>{


  try{


    const {
      email,
      password
    } = req.body;



    const user = await User.findOne({email})
    .select("+password");



    if(!user){

      return res.status(404).json({
        message:"User not found"
      });

    }




    const match = await bcrypt.compare(
      password,
      user.password
    );



    if(!match){

      return res.status(400).json({
        message:"Wrong password"
      });

    }

    if(user.isBlocked){
      return res.status(403).json({
        message:"Your account has been blocked. Contact support."
      });
    }




    // access token

    const accessToken = jwt.sign(

      {
        id:user._id,
        role:user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn:"24h"
      }

    );




    // refresh token

    const refreshToken = jwt.sign(

      {
        id:user._id
      },

      process.env.JWT_REFRESH_SECRET,

      {
        expiresIn:"7d"
      }

    );




    // save refresh token without re-validating legacy user fields
    await User.findByIdAndUpdate(user._id, { refreshToken });





    // cookie

    res.cookie(
      "refreshToken",
      refreshToken,
      {

        httpOnly:true,
        secure:false,
        sameSite:"strict"

      }
    );





    res.json({

      message:"Login success",

      accessToken,
      refreshToken,


      user:{

        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role

      }

    });



  }catch(error){


    res.status(500).json({
      error:error.message
    });


  }


};







// ============================
// REFRESH TOKEN
// ============================


exports.refresh = async(req,res)=>{


  const token = req.cookies.refreshToken || req.body.refreshToken;



  if(!token){

    return res.status(401).json({
      message:"No refresh token"
    });

  }



  try{


    const decoded = jwt.verify(

      token,

      process.env.JWT_REFRESH_SECRET

    );




    const accessToken = jwt.sign(

      {
        id:decoded.id
      },

      process.env.JWT_SECRET,

      {
        expiresIn:"24h"
      }

    );




    res.json({

      accessToken

    });



  }catch(error){


    return res.status(403).json({

      message:"Invalid refresh token"

    });


  }


};








// ============================
// LOGOUT
// ============================


exports.logout = async(req,res)=>{

  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch {
      // ignore invalid refresh token on logout
    }
  }

  res.clearCookie(
    "refreshToken"
  );


  res.json({

    message:"Logged out successfully"

  });


};