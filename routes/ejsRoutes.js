const express = require('express')
const { checkSession, checkIsLoggedIn } = require('../middlewares/auth')
const routes = express.Router()

// ==== Access EJS URL

routes.get('/signup', (req, res) => {
    res.render('pages/auth/signup', { error : null, message : null })
})

routes.get('/login', checkIsLoggedIn, (req, res) => {
    res.render('pages/auth/login', { error : null, message : null })
}) 

routes.get('/dashboard', checkSession,  (req, res) => {
    res.render('pages/dashboard', {
            currentUser : req.session.user
        })
})

module.exports = routes