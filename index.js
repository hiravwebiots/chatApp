const express = require('express')
require('dotenv').config()
const session = require('express-session')
const PORT = process.env.PORT
require('./config/db')
const MongoStore = require('connect-mongo').default

// http Server
const http = require('http')
const { Server } = require('socket.io')
const initSocket = require('./socket/messageSocket')

const app =express()
const server = http.createServer(app)
const io = new Server(server)

initSocket(io)

// --------------------------------------------
app.use(express.json())
app.use(express.urlencoded({extends : true}))

// ------------ View & Assets -----------------
app.set('view engine', 'ejs')
app.use('views', express.static('views'))

// appending static file
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))
// --------------------------------------------

// ----------------- session -----------------------
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    store : MongoStore.create({
        mongoUrl : process.env.DB_URL,
        collectionName : 'sessions',
        autoRemove : 'native'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}))
// --------------------------------------------

// IO Access in Controller
app.set('io', io);


// ROUTES
app.use('/', require('./routes/ejsRoutes'))
app.use('/user', require('./routes/authRoutes'))
app.use('/message', require('./routes/messageRoutes'))
app.use('/profile', require('./routes/profileRoutes'))


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})