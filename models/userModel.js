const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    profilePhoto : {
        type : String,
    },
    username : {
        type : String,
        unique : true,
        required : true
    },
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    email_verified : {
        type : Boolean,
        default : false,
    }
},{
    timestamps : {
        createdAt : 'created_at'
    },
    toJSON : { 
        virtuals : true,
        transform : (doc, ret) => {
            delete ret._id
            return ret
        } 
    },
    toObject : { virtuals : true }
})

const userModel = mongoose.model('User', userSchema)
module.exports = userModel