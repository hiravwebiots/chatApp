const mongoose = require('mongoose')

const callSchema = mongoose.Schema({
    initiatorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,  
        ref : 'User',
        required : true
    },
    callType : {
        type : String,
        enum : ['audio', 'video'],
        required : true
    },
    callMode : {
        type : String,
        enum : ['direct', 'group'],
        default : 'direct'
    },
    status : {
        type : String,
        enum : ['active', 'ended', 'cancelled'],
        default : 'active'
    },
    startedAt : {
        type  : Date,
        default : Date.now
    },
    endedAt : {
        type : Date,
        default : null
    },
    acceptedTime : {
        type : Date,
        default : null
    },
    duration : {
        type : Number,
        default : null
    }
},{
    timestamps : { 
        createdAt : 'created_at',
        // updatedAt : 'updated_at'
    }
})

const callModel = mongoose.model('Call', callSchema)
module.exports = callModel