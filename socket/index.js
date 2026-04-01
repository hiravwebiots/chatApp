const userModel = require("../models/userModel");

const initSocket = (io) => {

  const userSockets = new Map();
  const socketUsers = new Map();

  io.on('connection', async(socket) => {
    console.log('user connected', socket.id);
        
    // create connection -> join room
    // user login then create this room
    socket.on('join-room', async (userId) => {
        console.log('Sender Join room');
        
        // console.log("🚀 ~ initSocket ~ userId:", userId)
        if(!userId){
            return console.log('No userid provide for join room')
        }

        try{
            // console.log('Code Here Nothing');
            // console.log("Printtttttttt :", userId);
            
            userId = userId.replace('_', '')
            // console.log("Nowwwwwwwwwwwwwww :", userId);


            const user = await userModel.findById(userId)
            // console.log("🚀 ~ initSocket ~ user:", user)    
            if(!user){
                return console.error(`Invalid userId : ${userId}`)
            }
            
            // console.log("🚀 ~ initSocket ~ userSockets:", userSockets)
            if(!userSockets.has(userId)){
                userSockets.set(userId, new Set())
            }

            userSockets.get(userId).add(socket.id)
            // console.log("🚀 ~ initSocket ~ userSockets:", userSockets)
            socketUsers.set(socket.id, userId)
            // console.log("🚀 ~ initSocket ~ socketUsers:", socketUsers)
            socket.userId = userId

            // join personal room
            socket.join(userId)
            console.log(`user ${userId} joined Personal room`); 


        } catch(err){
            console.error('Error While join room', err)
        }
    })

    // typing event
    socket.on('typing', async({senderId, receiverId}) => {
        console.log('typing event started from server');

        // send typing event to receiver
        socket.to(receiverId).emit('displayTyping', {
            senderId
        })
    })

    socket.on('stop-typing', ({ senderId, receiverId }) => {
        socket.to(receiverId).emit('hide_typing', {
            senderId
        });
    });

    // ======= Call Events =======

    // 1. Initiate Call 
//     socket.on('call-initiate', ({ receiverId, callData }) => {
//         console.log('call-initiate');
        
//         socket.to(receiverId).emit('call-incoming', callData)     
//     })

//     // 2. Answer Call
//     socket.on('call-accept', ({ callerId, callId }) => {
//         console.log('call-accept');
        
//         socket.to(callerId).emit('call-accepted', {callId})       
//     })

//     // 3. Decline Call
//     socket.on('call-decline', ({ callerId, callId }) => {
//         console.log('call-decline');
        
//         socket.to(callerId).emit('call-declined', {callId})          
//     })

//     // 4. End Call
//     socket.on('call-end', ({ callId, participant }) => {
//         console.log('call-end');
        
//         participant.forEach(userId => {
//             socket.to(userId).emit('call-ended', { callId })
//         });
//   })

  })
}

module.exports = initSocket


// messageSocket