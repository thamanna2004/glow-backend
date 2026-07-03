const User = require("../models/userModel");



// @desc get user profile
// @route GET /api/users/profile

const getUserProfile = async(req,res)=>{

    const user = await User.findById(req.user.id)
    .select("-password");


    res.json(user);

};




// update profile

const updateUserProfile = async(req,res)=>{

    const user = await User.findById(req.user.id);


    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;


    const updatedUser = await user.save();


    res.json({
        _id:updatedUser._id,
        name:updatedUser.name,
        email:updatedUser.email
    });

};



module.exports={
    getUserProfile,
    updateUserProfile
};