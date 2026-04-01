const express = require('express')
const { initiateCall, answerCall, declineCall, endCall } = require('../controllers/callController')
const { checkAuth, checkSession } = require('../middlewares/auth')
const routes = express()

routes.post('/initiate', checkSession, initiateCall)
routes.post('/answer', checkSession, answerCall)
routes.post('/decline', checkSession, declineCall)
routes.post('/end', checkSession, endCall)

// getCall History


module.exports = routes
