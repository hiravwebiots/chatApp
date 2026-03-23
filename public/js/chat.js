const socket = io()

// It's Login User
console.log("Frontend Login userId:", userId, userId.length);


// JOIN ROOM from frontend
// It's Login User Room
socket.emit('join-room', userId)

const message = document.getElementById('messageInput')
const fileInput = document.getElementById('fileInput')
const sendBtn = document.getElementById('sendBtn')

// send Btn Click
sendBtn.addEventListener('click', async () => {
  try{
    
    if(!message.value && !fileInput.files[0]) return

    console.log("🚀 ~ receiverId:", window.contactLoader.receiverId)
    console.log("🚀 ~ content:", message.value)  

    const formData = new FormData()
    formData.append('receiverId', window.contactLoader.receiverId)
    formData.append('content', message.value)

    if(fileInput.files[0]){
      formData.append('file', fileInput.files[0])
    }

    const res = await fetch('/message/send', {
      method : 'POST', 
      // headers: {
      //   'Content-Type': 'application/json'
      // },
      body: formData
    })
    
    console.log("🚀 ~ res:", res)
    
    const data = await res.json()
    console.log("🚀 ~ data:", data)

    message.value = "";
    fileInput.value = ''

  } catch(err){
    console.error('error send message', err)
  }
})



// Send Messahe APi Call and DB Store Message
// Server emit message to Sender and reciver
// here receive message just show in different UI
socket.on('receive-message', (message) => {
  
  const loginChatUser = window.contactLoader.receiverId

  const sender = message.senderId?._id || message.senderId
  const receiver = message.receiverId?._id || message.receiverId
  
  
  
  // Ignore message not login user
  if (sender !== loginChatUser && receiver !== loginChatUser) return
  
  const isSender = sender === userId
  console.log("🚀 ~ isSender:", isSender)
  
  
  console.log("🚀 ~ message Before renderContent:", message)
  

  // If Message Sender is login user then senderUI Print
  // else Message sender is click user then receiverUI Print
  const renderContent = () => {

    if (message.messageType === 'text') {
      return `<p>${message.content}</p>`
    }

    if (message.messageType === 'image') {
      return `<img src="${message.fileUrl}" width="200" style="border-radius:10px;" />`
    }

    if (message.messageType === 'video') {
      return `<video src="${message.fileUrl}" controls width="200"></video>`
    }

    if (message.messageType === 'audio') {
      return `<audio src="${message.fileUrl}" controls></audio>`
    }

    if (message.messageType === 'document') {
      return `<a href="${message.fileUrl}" target="_blank"> ${message.fileName}</a>`
    }

    return
  }

  const messageHTML = isSender
      ?`
      <div class="row message-body">
        <div class="col-sm-12 message-main-sender">
          <div class="sender">
            <div class="message-text">${renderContent()}</div>
          </div>
        </div>
      </div>
      `
      : `
      <div class="row message-body">
        <div class="col-sm-12 message-main-receiver">
          <div class="receiver">
            <div class="message-text">${renderContent()}</div>
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
