const multer = require('multer') 
const path = require('path')

// ----- Profile Photo upload for user registration -----
const profileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'uploads/profilePhotos')
    },
    filename : (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const profileFilter = (req, file, cb) => {
    const allowTypes = ['image/jpg', 'image/jpeg', 'image/png']

    if(allowTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error('Only jpg, jpeg and png allowed'), false)
    }
}

const uploadProfile = multer({
    storage : profileStorage,
    fileFilter : profileFilter,
    limits : { fileSize : 1 * 1024 * 1024} 
})

// ----- upload pdf, image or video in chat convarsation -----
const chatFileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        let folder = 'uploads/chats/'

        if(file.mimetype.startsWith('audio')){
            folder += 'audios'
        } else if (file.mimetype.startsWith('video')){
            folder += 'videos'
        } else if (file.mimetype.startsWith('image')){
            folder += 'images'
        } else {
            folder += 'docs'
        }

        cb(null, folder)
    }, 
    filename : (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const chatFileFilter = (req, file, cb) => {
    const allowTypes = [
        "audio/mp3",
        "audio/wav",
        "video/mp4",
        "video/mkv",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    ]

    if(allowTypes.includes(file.mimetype)){
        cb(null, true)
    } else{
        cb(new Error('Only Valid file extebsion name allowed'), false)
    }
}

const uploadChatsFiles = multer({
    storage : chatFileStorage,
    fileFilter : chatFileFilter,
    limits : { fileSize : 50 * 1024 * 1024 }
})


module.exports = { uploadProfile, uploadChatsFiles }