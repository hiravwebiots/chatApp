const userModel = require("../models/userModel");

const initSocket = (io) => {

  const userSockets = new Map();
  const socketUsers = new Map();

  io.on('connection', async(socket) => {
    console.log('user connected', socket.id);

    // create connection -> join room ---- online user
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

            await userModel.findByIdAndUpdate(userId, { isOnline: true });


            // Online event
            io.emit('user-status', {
                userId,
                isOnline : true
            })
            console.log('user online');

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

    // ========= webRTC Events ==============

    // 1. Send Offer
    socket.on('offer', ({ offer, receiverId }) => {
        console.log('Offer received');

        socket.to(receiverId).emit('offer', {
            offer,
            senderId : socket.userId
        })
    })

    // 2. Send Answer
    socket.on('answer', ({ answer, receiverId }) => {
        console.log('Answer received');
        
        socket.to(receiverId).emit('answer', {
            answer,
            senderId : socket.userId
        })
    })

    // 3. ICE Candidates
    socket.on('ice-candidate', ({ candidate, receiverId }) => {
        console.log('ICE candidate');
        
        socket.to(receiverId).emit('ice-candidate', {
            candidate,
            senderId : socket.userId
        })
    })

    // Disconnect
    socket.on('disconnect', async () => {
        console.log('user disconnected', socket.id);

        const userId = socketUsers.get(socket.id)
        if(!userId) return

        const sockets = userSockets.get(userId)

        if(sockets){
            sockets.delete(socket.id)

            // offline events
            if(sockets.size === 0){
                userSockets.delete(userId)

                const lastSeen = new Date();
                await userModel.findByIdAndUpdate(userId, { 
                    isOnline: false, 
                    lastSeen 
                });

                io.emit('user-status', {
                    userId,
                    isOnline : false,
                    lastSeen
                })
                console.log('user offline');
            }
        }

        socketUsers.delete(socket.id)
    })

  })
}

module.exports = initSocket


// messageSocket 