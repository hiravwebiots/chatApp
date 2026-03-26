const messageModel = require('../models/messageModel');
const userModel = require('../models/userModel');

// const sendMessage = async(req, res) => {  
//     try{

//         const { senderId, receiverId, content, messageType } = req.body;

//         const existId = await userModel.findById(receiverId)
//         if(!existId){
//             return res.status(400).json({ status : 0, message : "receiver not found" })
//         }

//         if(!receiverId || !content){
//             return res.status(400).json({ status : 0, message : "recieverId or message is required" })
//         }

//         const msg = await messageModel.create({
//             senderId : req.user.id,
//             receiverId,
//             content,
//             messageType
//         })

//         res.status(201).json({ status : 1, message : "message saved", data : msg })

//     } catch(err){
//         console.log(err);
//         res.status(500).json({ status : 0, message : "error while send message" })
//     }
// }





// controllers/messageController.js

const sendMessage = async (req, res) => {
    console.log("API Called Here in messade send controller: ");
    
    try {
        const senderId = req.session.user.id;

        const existSenderId = await userModel.findById(senderId)
        if(!existSenderId){
            return res.status(400).json({ status : 0, message : 'senderId not found' })
        }
        
        const { receiverId, content } = req.body;
        const existReceiverId = await userModel.findById(receiverId)
        if(!existReceiverId){
            return res.status(400).json({ status : 0, message : "receiverId not found" })
        }

        let messageType = 'text';
        let fileUrl = undefined;
        let fileName = undefined;

        // file handling
        if(req.file){
            const file = req.file

            // let messageType = 'file'

            if(file.mimetype.startsWith('image')) messageType = 'image'
            else if(file.mimetype.startsWith('video')) messageType = 'video'
            else if(file.mimetype.startsWith('audio')) messageType = 'audio'
            else messageType = 'document'

            fileUrl = file.path
            fileName = file.originalname
        }   


        const message = await messageModel.create({
            senderId,
            receiverId,
            content : content || undefined,
            fileUrl,
            fileName,
            messageType
        });

        console.log('Message Saved in DB');
        
        // socket.io event call here
        // // GET IO INSTANCE
        const io = req.app.get('io');

        // EMIT TO BOTH USERS
        io.to(receiverId).emit('receive-message', message);
        io.to(senderId).emit('receive-message', message);

        
        res.status(200).json({ status : 1, message : "message send successfully", data : message });

    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : "error while send message" })
    }
};

const readMessage = async(req, res) => {
    try{
        const userId = req.user.id
        console.log("🚀 ~ readMessage ~ senderId:", userId)

        const user = await userModel.findById(userId)
        console.log("🚀 ~ readMessage ~ existSenderId:", user)
        if(!user){
            return res.status(401).json({ status : 0, message : "user not exist" })
        }

        // const messages = await messageModel.aggregate([
        //     {
        //         $match : {
        //             $or : [
        //                 { senderId : user._id },    // login user send message
        //                 { receiverId : user._id }   // login user received message
        //             ]
        //         }
        //     },
        //     {
        //         $addFields: {
        //             chatUser: {
        //                 $cond: [
        //                     { $eq: ["$senderId", user._id] },
        //                     "$receiverId",
        //                     "$senderId"
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $group : {
        //             _id: "$chatUser",         
        //             messages : {
        //                 $push : {
        //                     senderId: "$senderId",
        //                     receiverId: "$receiverId",
        //                     content : "$content",
        //                     createdAt : "$createdAt"
        //                 }
        //             }
        //         }
        //     },
        //     // lookup use for the join two  collection
            
        //     {
        //         $lookup : {
        //             from : 'users',
        //             localField : "_id",
        //             foreignField : "_id",
        //             as : "userInfo"
        //         }
        //     },
        //     {
        //         $unwind : "$userInfo"
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             userId: "$_id",
        //             userName: "$userInfo.name",
        //             messages: 1
        //         }
        //     }
        // ])

        const messages = await messageModel.find()
                        .populate('senderId', ['profilePhoto', 'name', 'email', 'phone'])
                        .populate('receiverId', ['profilePhoto', 'name', 'email', 'phone'])


        const formatData = messages.map((msg) => {
            return {
                id : msg._id,
                content : msg.content,
                messageType : msg.messageType,
                created_at : msg.created_at,
                senderId : msg.senderId,
                receiverId : msg.receiverId
            }
        })

        res.status(200).json({ status : 1, data : formatData })

    } catch(err){ 
        console.log('git test');
        
        console.log(err);
        res.status(500).json({ status : 0, message : "error while read all message" })
    } 
}

const readMessagePersonalChat = async (req, res) => {
    console.log('call');
    
    try{
        const loginUserId = req.session.user.id
        const loginUser = await userModel.findById(loginUserId)
        if(!loginUser){
            return res.status(400).json({ status : 0, message : "you aren't found" })
        }

        const userId = req.params.id
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(400).json({ status : 0, message : "user not found" })
        }

        // const messages = await messageModel.aggregate([
        //     {
        //         $match : {
        //             $or : [
        //                 { senderId : Im._id, receiverId : user._id  },    // login user send message
        //                 { senderId : user._id, receiverId : Im._id }   // login user received message
        //             ]
        //         }
        //     },
        //     {
        //         $addFields: {
        //             chatUser: {
        //                 $cond: [
        //                     { $eq: ["$senderId", myId] },
        //                     "$receiverId",
        //                     "$senderId"
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $group : {
        //             _id: "$chatUser",   // group by receiver      
        //             messages : {
        //                 $push : {
        //                     senderId: "$senderId",
        //                     receiverId: "$receiverId",
        //                     content : "$content",
        //                     createdAt : "$createdAt"
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup : {
        //             from : 'users',
        //             localField : "_id",
        //             foreignField : "_id",
        //             as : "userInfo"
        //         }
        //     },
        //     {
        //         $unwind : "$userInfo"
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             userId: "$_id",
        //             userName: "$userInfo.name",
        //             messages: 1
        //         }
        //     }
        // ])

        const messages = await messageModel.find({
            $or : [
                { senderId : loginUserId, receiverId : userId },
                { senderId : userId, receiverId : loginUserId }
            ]
        })
        .populate('senderId', ['profilePhoto', 'name', 'email', 'phone'])
        .populate('receiverId', ['profilePhoto', 'name', 'email', 'phone'])
        .sort({ created_at : 1 }) // 1 old → new  || -1 new → old
                
        const formatData = messages.map((msg) => {
            return {
                id : msg._id,
                content : msg.content,
                fileUrl : msg.fileUrl,
                fileName : msg.fileName,
                messageType : msg.messageType,
                created_at : msg.created_at,
                senderId : msg.senderId,
                receiverId : msg.receiverId,
                lastMessage : undefined  
                // {
                //     content: msg.content ,
                //     messageType: msg.messageType,
                //     created_at: msg.created_at,
                //     fileUrl: msg.fileUrl || null,
                //     fileName: msg.fileName || null
                // }

            }
        })
        console.log("🚀 ~ readMessagePersonalChat ~ formatData:", formatData)

        return res.status(200).json({ status : 1, message : "Read All Messages With me", data : formatData })

    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : "error while read meassges single user"})
    }
}

const getRecentChats = async (req, res) => {
    try {
        const loginUserId = req.session.user.id;

        const loginUser = await userModel.findById(loginUserId);
        if (!loginUser) {
            return res.status(500).json({ status: 0, message: "User not found" });
        }

        const messages = await messageModel.find({
            $or: [
                { senderId: loginUserId },
                { receiverId: loginUserId }
            ]
        })
        .populate('senderId', ['profilePhoto', 'name', 'email'])
        .populate('receiverId', ['profilePhoto', 'name', 'email'])
        .sort({ created_at: -1 }); // latest first

        if (!messages.length) {
            return res.status(200).json({ status: 1, message: "No chats yet", data: [] });
        }

        const uniqueUsers = new Map();

        messages.forEach(msg => {
            const isSender = msg.senderId._id.toString() === loginUserId;
            const otherUser = isSender ? msg.receiverId : msg.senderId;

            const userId = otherUser._id.toString();
            // console.log("🚀 ~ getRecentChats ~ userId:", userId)

            // only take FIRST message (latest due to sorting)
            // only get latest first if second it's not store
            if (!uniqueUsers.has(userId)) {
                uniqueUsers.set(userId, {
                        id: otherUser.id,
                        name: otherUser.name,
                        email: otherUser.email,
                        profilePhoto: otherUser.profilePhoto,
                        lastMessage: {
                            content: msg.content,
                            messageType: msg.messageType,
                            created_at: msg.created_at,
                            fileUrl: msg.fileUrl || null,
                            fileName: msg.fileName || null
                        }
                });
            }
        });

        // convert Map → Array
        const result = Array.from(uniqueUsers.values());
        console.log("🚀 ~ getRecentChats ~ result:", result)

        res.status(200).json({ status: 1, message: "Recent chats fetched", data: result });

    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 0, message: 'error while recent-messages' });
    }
};

module.exports = { sendMessage, readMessage, readMessagePersonalChat, getRecentChats }

