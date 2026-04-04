const mongoose = require('mongoose')

const CallParticipantSchema = mongoose.Schema({
    callId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Call',
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    status : {
        type : String,
        enum: ['invited', 'joined', 'declined', 'missed', 'left', 'outgoing_declined', 'cancelled'],
        default : 'invited'
    },
    joinedAt : {
        type : Date,
        default : null
    },
    leftAt : {
        type : Date,
        default : null
    },
    is_muted: { 
      type: Boolean, 
      default: false 
    },
    is_screen_sharing: { 
      type: Boolean, 
      default: false 
    },
    is_video_enabled: { 
      type: Boolean, 
      default: false 
    },
    video_status: {
      type: String,
      enum: ['enabled', 'disabled', 'unavailable'],
      default: 'disabled',
    },
},{
    timestamps : { 
        createdAt : 'created_at',
        updatedAt : 'updated_at'
    }
})

const CallParticipantModel = mongoose.model('CallParticipant', CallParticipantSchema)
module.exports = CallParticipantModel