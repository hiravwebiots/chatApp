const userModel = require("../models/userModel");
const sendMessageService = require("../services/messageService");


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

        // // Send Message & Store 
        // socket.on('send-message', async (data) => {
        //     // console.log("🚀 ~ initSocket ~ data:", data)
        //     try{
        //         const { senderId,  receiverId, content} = data;

        //         const message = await sendMessageService({
        //             senderId,
        //             receiverId,
        //             content
        //         })

        //         console.log('Message Save in db');

        //         // server send to --> receiver
        //         io.to(receiverId).emit('receive-message', message)
                
        //         // send to sender|| receiver --> sernder
        //         io.to(senderId).emit('receive-message', message)
        //         console.log('Recieve by other userrrrrrrrrrr');


        //     } catch(err){
        //         console.log(err);
        //     }
        // })

        socket.on('disconnect', () => {
          
            // console.log('user disconnected');
        })

    })
}


module.exports = initSocket