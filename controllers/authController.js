const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = async(req, res) => {
    try{
        const { username, name, email, phone, password, confirmPassword } = req.body

        if(!username || !name || !email || !phone || !password){
            return res.render('pages/auth/signup', { error : "All Fileds are required" })
            // return res.status(400).json({ status : 0, message : "All Fileds are required" })
        }   

        const usernameRegx = /^[a-zA-z0-9_]{4,15}$/
        if(!usernameRegx.test(username)){
            return res.render('pages/auth/signup', { error : "Username must be 4-25 Characters and content only letters, numbers and underscores" })
            // return res.status(400).json({ status : 0, message : "Username must be 4-25 Characters and content only letters, numbers and underscores" })
        }

        const existUsername = await userModel.findOne({ username })
        if(existUsername){
            return res.render('pages/auth/signup', { error : "username already exist" })
            // return res.status(400).json({ status : 0, message : "username already exist" })
        }

        const nameRegx = /^[a-zA-Z\s]{2,35}$/;
        if(!nameRegx.test(name.trim())){
            return res.render('pages/auth/signup', { error : "Name must be 2-35 Characters and contain must me latters and space" })
            // return res.status(400).json({ status : 0, message : "Name must be 2-35 Characters and contain must me latters and space" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.render('pages/auth/signup', { error : "Please enter a valid email formate" })
            // return res.status(400).json({ status : 0, message : "Please enter a valid email formate" })
        }

        const existEmaul = await userModel.findOne({ email })
        if(existEmaul){
            return res.render('pages/auth/signup', { error : "Email already registered" })
            // return res.status(400).json({ status : 0, message : "Email already registered" })
        }

        const phoneRegex = /^[6-9]\d{9}$/
        if(!phoneRegex.test(phone)){
            return res.render('pages/auth/signup', { error : "Invalid phone formate" })
            // return res.status(400).json({ status : 0, message : "phone number must be 10 digits and Start with 6-9" })
        }

        if(password.length < 6){
            return res.render('pages/auth/signup', { error : "password must be at least 6 characters long" })
            // return res.status(400).json({ status : 0, message : "password must be at least 6 characters long" })
        }

        if(password !== confirmPassword){
            return res.render('pages/auth/signup', { error : "Password and Confirm Password must be same" })
            // return res.status(401).json({ status : 0, message : "Password and Confirm Password must be same" })
        }

        // Hash Password
        const hashpassword = await bcrypt.hash(password, 11)

        const user = await userModel.create({
            username,
            name : name.trim(), 
            email,
            phone,
            password : hashpassword,
            profilePhoto : req.file ? req.file.path : undefined
        })

        res.redirect('/login')
        // res.status(201).json({ status : 1, message : "User registered successfully", data: user })

    } catch(err){
        console.log(err);
        res.render('pages/auth/signup', { error : "error while signup user" })
        // res.status(500).json({ status : 0,  message : "error while register user" })
    }
}

// const login = async(req, res) => {
//     try{
//         let { email, password } = req.body

//         if(!email || !password){
//             // return res.render('pages/auth/login', { error : "email and password required" })
//             return res.status(400).json({ status : 0, message : "email and password required"})
//         }
        
//         const user = await userModel.findOne({ email })
//         if(!user){
//             // return res.render('pages/auth/login', { error : "User not found, email invalid" });
//             return res.status(404).json({ status : 0, message: "User not found, email invalid"});
//         }
        
//         const matchPass = await bcrypt.compare(password, user.password)
//         if(!matchPass){
//             // return res.render('pages/auth/login', { error : "Invalid password" });
//             return res.status(400).json({ status : 0, message : "Invalid password" })
//         }

//         user.password = undefined

//         const tokenObj = {
//             id : user.id,
//             name : user.name,
//             email : user.email
//        }
//         const token = jwt.sign(tokenObj, process.env.SECRET, {expiresIn : '7d'})

//         req.session.user = { 
//             id : user.id,
//             name : user.name,
//             email : user.email,
//             profilePhoto : user.profilePhoto
//         }
//         console.log("🚀 ~ loginUser ~ req.session.user:", req.session.user)

//         // res.redirect('/dashboard')
//         res.status(201).json({ status : 1, message: "Login successful", token, data : user });

//     } catch(err){
//         console.log(err);
//         // res.render('pages/auth/login', { error : "error while login user" });
//         res.status(500).send({ status : 0, message : "error while login user" })
//     }
// }

const login = async(req, res) => {
    try{
        let { email, password } = req.body

        if(!email || !password){
            return res.render('pages/auth/login', { error : "email and password required" })
            // return res.status(400).json({ status : 0, message : "email and password required"})
        }
        
        const user = await userModel.findOne({ email })
        if(!user){
            return res.render('pages/auth/login', { error : "User not found, email invalid" });
            // return res.status(404).json({ status : 0, message: "User not found, email invalid"});
        }
        
        const matchPass = await bcrypt.compare(password, user.password)
        if(!matchPass){
            return res.render('pages/auth/login', { error : "Invalid password" });
            // return res.status(400).json({ status : 0, message : "Invalid password" })
        }

        user.password = undefined

        const tokenObj = {
            id : user.id,
            name : user.name,
            email : user.email
       }
        const token = jwt.sign(tokenObj, process.env.SECRET, {expiresIn : '7d'})

        req.session.user = { 
            id : user.id,
            name : user.name,
            email : user.email,
            profilePhoto : user.profilePhoto
        }
        console.log("🚀 ~ loginUser ~ req.session.user:", req.session.user)

        res.redirect('/dashboard')
        // res.status(201).json({ status : 1, message: "Login successful", token, data : user });

    } catch(err){
        console.log(err);
        res.render('pages/auth/login', { error : "error while login user" });
        // res.status(500).send({ status : 0, message : "error while login user" })
    }
}

module.exports = { register, login }

