const express = require('express')
const uploadProfile = require('../middlewares/fileUpload')
const { register, login } = require('../controllers/authController')
const routes = express.Router()


routes.post('/register', uploadProfile.single('profilePhoto') , register)
routes.post('/login', login)

// When user logout destroyed the session
// routes.get('/logout', (req, res) => {
//     req.session.destroy(() => {
//         res.redirect('/login')
//     })
// })


module.exports = routes