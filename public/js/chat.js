// Add these at the top of chat.js
const socket = io()

// It's Login User
console.log("Frontend Login userId:", userId, userId.length);


// It's Login User Join Room
socket.emit('join-room', userId)

const conversation = document.getElementById('conversation');
const message = document.getElementById('messageInput')
const fileInput = document.getElementById('fileInput')
const sendBtn = document.getElementById('sendBtn')

// typing
let typingTimeout

message.addEventListener('input', () => {
    const receiverId = window.contactLoader.receiverId
    if(!receiverId) return

    // emit typing
    socket.emit('typing', { 
      senderId : userId,
      receiverId
     })

    // clear previous timout
    clearTimeout(typingTimeout)

    // stop typing evnt after 8s
    typingTimeout = setTimeout(() => {
      socket.emit('stop-typing', { 
        senderId : userId,
        receiverId
       })
    }, 1000)
})

let typingDisplayTimeout

// show typing
socket.on('displayTyping', ({ senderId }) => {

  console.log('event recieve');
  
  const currentChatUser = window.contactLoader.receiverId
  
  if(senderId !== currentChatUser) return
  
  const typingIndicator = document.getElementById('typingIndicator')

  if(!typingIndicator){ 
    console.log('typingIndicator not found' );  
    return
  }

  console.log("🚀 ~ typingIndicator After Condition:", typingIndicator)

  typingIndicator.innerHTML = '<p> typing... </p>'
// typingIndicator.style.display = 'block'

})

// hide typing
socket.on('hide_typing', ({ senderId }) => {
    const currentChatUser = window.contactLoader.receiverId

    if(senderId === currentChatUser){
        typingIndicator.innerHTML = ''
    }
}) 



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


function updateRecentChat(message) {
  const sender = message.senderId?._id || message.senderId;
  console.log("🚀 ~ updateRecentChat ~ sender:", sender)
  const receiver = message.receiverId?._id || message.receiverId;
  console.log("🚀 ~ updateRecentChat ~ receiver:", receiver)

  // only process if message belongs to me
  if (sender !== userId && receiver !== userId) return;

// If I sent → other = receiver
// If I received → other = sender
  const otherUserId = sender === userId ? receiver : sender;
  console.log("🚀 ~ updateRecentChat ~ otherUserId:", otherUserId)

  const container = document.getElementById('chatList');

  // “Find the HTML row (div) of this user in sidebar”
  let chatRow = container.querySelector(`[data-user-id="${otherUserId}"]`);
  console.log("🚀 ~ updateRecentChat ~ chatRow:", chatRow)

  // preview text
  let previewText = '';
  if (message.messageType === 'text') previewText = message.content;
  else if (message.messageType === 'image') previewText = '📷 Photo';
  else if (message.messageType === 'video') previewText = '🎥 Video';
  else if (message.messageType === 'audio') previewText = '🎵 Audio';
  else if (message.messageType === 'document') previewText = '📄 Document';

  // if exists → update + move top
  if (chatRow) {
    const msgDiv = chatRow.querySelector('.sideBar-message');
    if (msgDiv) msgDiv.innerText = previewText;

    // container.prepend(chatRow); // move to top
  }
}


// Send Messahe APi Call and DB Store Message
// Server emit message to Sender and reciver
// here receive message just show in different UI
socket.on('receive-message', (message) => {
    updateRecentChat(message);

  const loginChatUser = window.contactLoader.receiverId

  const sender = message.senderId?._id || message.senderId
  const receiver = message.receiverId?._id || message.receiverId
  
  
  // Ignore message not login user
  if (sender !== loginChatUser && receiver !== loginChatUser) return
  
  const isSender = sender === userId
  console.log("🚀 ~ isSender:", isSender)
  
  
  console.log("🚀 ~ message Before renderContent:", message)
  

  // If Message Sender is login user then senderUI Print in conversation area
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

    // conversation.insertAdjacentHTML('beforeend', messageHTML);
    conversation.innerHTML += messageHTML;

  if (isNearBottom) {
    conversation.scrollTop = conversation.scrollHeight;
  }

})
