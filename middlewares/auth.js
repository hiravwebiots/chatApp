const jwt = require('jsonwebtoken')

const checkAuth = (req, res, next) => {
    try{
        const token = req.headers['authorization']

        if(!token){
            return res.status(401).send({ status : 0, message : "No token Provided, Login & Enter the Token!" })
        }
        
        const verify = jwt.verify(token, process.env.SECRET)
        req.user = verify
        console.log("🚀 ~ checkAuth ~ req.user:", req.user)
        
        next()

    } catch(err){
        console.log(err);
        res.status(400).json({ status : 0, message : "Invalid Token or Token Expired!" })
    }
}

// session authentication

const checkSession = (req, res, next) => {
    try{    
        console.log("🚀 ~ checkSession ~ req.session.user:", req.session.user)
        if(req.session && req.session.user){
            return next()
        } else{
            return res.redirect('/login')
        }
    } catch(err){
        console.log(err);
        res.status(400).json({ status : 0, message : "error while Session" })
    }
}

const checkIsLoggedIn = (req, res, next) => {
    try {
        console.log("🚀 ~ isLoggedIn ~ req.session.user:", req.session.user)
        if(req.session.user) {
            // Already logged in → go to dashboard
            return res.redirect('/dashboard')
        }
        next()
    } catch (err) {
        console.log(err)
        res.status(500).send("Server error")
    }
}

module.exports = { checkAuth, checkSession, checkIsLoggedIn}