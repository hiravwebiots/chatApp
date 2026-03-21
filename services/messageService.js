const messageModel = require("../models/messageModel");

const sendMessageService = async ({ senderId, receiverId, content }) => {
console.log("🚀 ~ sendMessageService ~ senderId, receiverId, content:", senderId, receiverId, content)

    const newMessage = await messageModel.create({
        senderId,
        receiverId,
        content 
    });

    console.log("🚀 ~ sendMessageService ~ newMessage:", newMessage)

    return newMessage;
};

module.exports = sendMessageService