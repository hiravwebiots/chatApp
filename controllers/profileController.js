const userModel = require('../models/userModel')
const fs = require('fs')

// only admin access
const getAllProfile = async (req, res) => {
    try{

        const users = await userModel.find()
        // console.log("🚀 ~ getAllProfile ~ users:", users)


        res.status(200).json({ status : 1, message : "Get All user by admin", data : users})
    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : "error while get all user profile by admin" })
    }
}

const getSelfProfile = async (req, res) => {
    try{
        const userId = req.user.id

        const user = await userModel.findById(userId).select('-password')
        if(!user){
            return res.status(400).json({ status : 0, message : "user not found" })
        }

        res.status(200).json({ status : 1, message : "profile details fetched", data : user})
    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : "error while getting Self Profile" })
    }
}

const updateProfile = async(req, res) => {
    try{
        const userId = req.user.id

        const { name, email } = req.body
        // req.file -> profile photo

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({ status : 0, message : "user not found" })
        }

        if(email){
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)){
                return res.status(400).send({ status : 0, message : "Invalid email format" })
            }    

            const existEmail = await userModel.findOne({
                email,
                id : { $ne : userId }
            })

            if(existEmail){
                return res.status(400).json({ status : 0, message : "email already exist" })
            }
        }

        if(req.file){
            if(user.profilePhoto && fs.existsSync(user.profilePhoto)){
                fs.unlinkSync(user.profilePhoto)
            }
        }
        
        const updateData = {
            name : name || user.name,
            email : email || user.email,
            profilePhoto : req.file?.path || user.profilePhoto || null 
        }


        const updateUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new : true }
        )

        if(!updateUser){
            return res.status(404).json({ status : 0, message : "user not found" })
        }

        res.status(200).json({ status : 0, message : "update user Sucessfully", data : updateUser })

    } catch(err){
        console.log(err);
        return res.status(500).json({ status : 0, message : "error while update profile" })
    }
}

const deleteProfile = async(req, res) => {
    try{
        const userId = req.user.id;


        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 0, message: "User not found" });
        }

        if(user.profilePhoto && fs.existsSync(user.profilePhoto)){
            fs.unlinkSync(user.profilePhoto)
        }

        const deleteUser = await userModel.findByIdAndDelete(userId)

        res.status(200).json({ status : 1, message : "user deleted" })

    } catch(err){
        console.log(err);
        res.status(500).json({ status: 0, message: "Error while deleting account" });
    }
}


module.exports = { getAllProfile, getSelfProfile, updateProfile, deleteProfile}