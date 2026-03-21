const express = require('express')
const { getAllProfile, getSelfProfile, updateProfile, deleteProfile } = require('../controllers/profileController')
const { checkAuth } = require('../middlewares/auth')
const uploadProfile = require('../middlewares/fileUpload')
const routes = express.Router()

routes.get('/get', getAllProfile)
routes.get('/self/get', checkAuth, getSelfProfile)
routes.put('/update', checkAuth, uploadProfile.single('profilePhoto'),  updateProfile)
routes.delete('/delete', checkAuth, deleteProfile)

module.exports = routes
