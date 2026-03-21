const socket = io()

// It's Login User
console.log("Frontend Login userId:", userId, userId.length);


// JOIN ROOM from frontend
// It's Login User Room
socket.emit('join-room', userId)

const message = document.getElementById('messageInput')
const sendBtn = document.getElementById('sendBtn')

// send Btn Click
sendBtn.addEventListener('click', async () => {
  try{
    
    if(!message.value) return

    console.log("🚀 ~ receiverId:", window.contactLoader.receiverId)
    console.log("🚀 ~ content:", message.value)  

    const res = await fetch('/message/send', {
      method : 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receiverId: window.contactLoader.receiverId,
        content: message.value
      })
    })
    
    console.log("🚀 ~ res:", res)
    
    const data = await res.json()
    console.log("🚀 ~ data:", data)

    message.value = "";

  } catch(err){
    console.error('error send message', err)
  }
})



// Send Messahe APi Call and DB Store Message
// Server emit message to Sender and reciver
// here receive message just show in different UI
socket.on('receive-message', (message) => {

  const loginChatUser = window.contactLoader.receiverId

  // Ignore message not login user
  if( message.senderId !== loginChatUser && message.receiverId !== loginChatUser ){
    return 
  }

  // If Message Sender is login user then senderUI Print
  // else Message sender is click user then receiverUI Print
  const loginUser = message.senderId === userId

  const messageHTML = loginUser
      ?`
      <div class="row message-body">
        <div class="col-sm-12 message-main-sender">
          <div class="sender">
            <div class="message-text">${message.content}</div>
          </div>
        </div>
      </div>
      `
      : `
      <div class="row message-body">
        <div class="col-sm-12 message-main-receiver">
          <div class="receiver">
            <div class="message-text">${message.content}</div>
          </div>
        </div>
      </div>
      `
  const isNearBottom = conversation.scrollTop + conversation.clientHeight >= conversation.scrollHeight - 50;

  conversation.innerHTML += messageHTML;

  if (isNearBottom) {
    conversation.scrollTop = conversation.scrollHeight;
  }

})

// socket.on("message-sent", (message) => {
//   console.log("Message sent:", message);
// });

