const multer = require('multer') 
const path = require('path')

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

module.exports = uploadProfile