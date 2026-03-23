const express = require('express')
const { sendMessage, readMessage, readMessagePersonalChat, getRecentChats } = require('../controllers/messageController')
const { checkAuth, checkSession } = require('../middlewares/auth')
const { uploadChatsFiles } = require('../middlewares/fileUpload')
const routes = express()

routes.post('/send', checkSession, uploadChatsFiles.single('file'), sendMessage)
routes.get('/read', checkSession, readMessage)
routes.get('/read/:id', checkSession, readMessagePersonalChat)
routes.get('/recent-chat', checkAuth, getRecentChats)


module.exports = routes