// ======= Call Events =======

// Caller emits after API success (optional)
socket.on('call:initiate', ({ receiverId, callData }) => {
    socket.to(receiverId).emit('call:incoming', callData)
})

// Answer call
socket.on('call:accept', ({ callerId, callId }) => {
    socket.to(callerId).emit('call:accepted', { callId })
})

// Decline call
socket.on('call:decline', ({ callerId, callId }) => {
    socket.to(callerId).emit('call:declined', { callId })
})

// End call (notify both)
socket.on('call:end', ({ callId, participants }) => {
    participants.forEach(userId => {
        socket.to(userId).emit('call:ended', { callId })
    })
})






//  1. initiateCall (ADD THIS)
const { io } = require('../server')

// ...

// after call created
io.to(receiverId.toString()).emit('call:incoming', {
    callId: call._id,
    callerId: initiatorId,
    callType: callType
})



//  2. answerCall
io.to(call.initiatorId.toString()).emit('call:accepted', {
    callId: call._id,
    receiverId: receiverId
})



//  3. declineCall
io.to(call.initiatorId.toString()).emit('call:declined', {
    callId: call._id
})

// 4. endCall (IMPORTANT - BOTH USERS)
io.to(call.initiatorId.toString()).emit('call:ended', {
    callId: call._id
})

io.to(call.receiverId.toString()).emit('call:ended', {
    callId: call._id
})




// Inside your setTimeout:

io.to(initiatorId.toString()).emit('call:missed', {
    callId: call._id
})

io.to(receiverId.toString()).emit('call:missed', {
    callId: call._id
})