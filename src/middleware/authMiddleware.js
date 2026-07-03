const jwt = require("jsonwebtoken");
const User = require("../models/userModel");



/*
================================
PROTECT USER
================================
*/

const protect = async (req, res, next) => {

  let token;


  try {


    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

    }



    if (!token) {

      return res.status(401).json({
        message:"Not authorized, no token"
      });

    }



    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );



    const user = await User.findById(decoded.id)
      .select("-password");



    if (!user) {

      return res.status(401).json({
        message:"User not found"
      });

    }



    req.user = user;



    console.log("AUTH USER:");
    console.log({
      id:req.user._id,
      email:req.user.email,
      role:req.user.role
    });



    next();



  } catch(error) {


    console.log("JWT ERROR:", error.message);


    return res.status(401).json({

      message:"Not authorized, token failed"

    });


  }

};





/*
================================
ADMIN CHECK
================================
*/


const admin = (req,res,next)=>{


  console.log("ADMIN CHECK:");
  console.log(req.user);



  if(
    req.user &&
    req.user.role === "admin"
  ){

    next();

  }else{


    return res.status(403).json({

      message:"Admin access only"

    });


  }


};





const optionalProtect = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) req.user = user;
      }
    }
  } catch {
    /* guest mode */
  }
  next();
};

module.exports = {
  protect,
  admin,
  optionalProtect,
};