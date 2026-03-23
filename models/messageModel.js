const mongoose = require('mongoose')

const messageSchama = mongoose.Schema({

    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    content : {
        type : String,
        // required : true
    },
    fileUrl : {
        type : String
    },
    fileName : {
        type : String
    },
    messageType : {
        type : String,
        enum : ['text', 'image','sticker', 'file', 'video', 'poll', 'document', 'audio'],
        default : 'text'
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
    // files, url send


const messageModel = mongoose.model('Message', messageSchama)
module.exports = messageModel