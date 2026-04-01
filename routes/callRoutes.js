const express = require('express')
const { initiateCall, answerCall, declineCall, endCall } = require('../controllers/callController')
const { checkAuth } = require('../middlewares/auth')
const routes = express()

routes.post('/initiate', checkAuth, initiateCall)
routes.post('/answer', checkAuth, answerCall)
routes.post('/decline', checkAuth, declineCall)
routes.post('/end', checkAuth, endCall)

// getCall History


module.exports = routes
