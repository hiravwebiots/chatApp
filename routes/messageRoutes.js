const express = require('express')
const { sendMessage, readMessage, readMessagePersonalChat, readChatMessage } = require('../controllers/messageController')
const { checkAuth, checkSession } = require('../middlewares/auth')
const routes = express()

routes.post('/send', checkSession, sendMessage)
routes.get('/read', checkAuth, readMessage)
routes.get('/read/:id', checkAuth, readMessagePersonalChat)


module.exports = routes