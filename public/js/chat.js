// Add these at the top of chat.js
const socket = io()

// It's Login User
console.log("Frontend Login userId:", userId, userId.length);


// It's Login User Join Room
socket.emit('join-room', userId)

const chatsection = document.getElementById('chatsection');
const messageContainer = document.getElementById('conversation');
const message = document.getElementById('messageInput')
const fileInput = document.getElementById('fileInput')

fileInput.addEventListener('change', handleFilePreview)

function handleFilePreview() {
  const file = fileInput.files[0];
  if (!file) return;

  const preview = document.getElementById('filePreview');
  preview.innerHTML = "";

  const wrapper = document.createElement('div');
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "start";
  wrapper.style.gap = "10px";
  wrapper.style.maxWidth = "200px";

  // IMAGE
  if (file.type.startsWith("image/")) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.width = "120px";
    img.style.borderRadius = "10px";
    wrapper.appendChild(img);
  } 
  // VIDEO
  else if (file.type.startsWith("video/")) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.style.width = "150px";
    video.controls = true;
    wrapper.appendChild(video);
  } 
  // OTHER FILE
  else {
    wrapper.innerHTML = `📄 ${file.name}`;
  }

  // ❌ cancel button
  const cancel = document.createElement('span');
  cancel.innerHTML = " ❌";
  cancel.style.cursor = "pointer";
  cancel.onclick = () => {
    fileInput.value = "";
    preview.innerHTML = "";
    preview.style.display = "none";
  };

  wrapper.appendChild(cancel);
  preview.appendChild(wrapper);

  preview.style.display = "block";
}


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

  typingIndicator.innerHTML = `
    <div style="padding:5px 10px;">
      <i>Typing...</i>
    </div>
  `;

  // Auto scroll to show typing indicator
  if (messageContainer) {
    const isNearBottom = messageContainer.scrollTop + messageContainer.clientHeight >= messageContainer.scrollHeight - 60;
    if (isNearBottom) {
      setTimeout(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }, 50);
    }
  }
})

// hide typing
socket.on('hide_typing', ({ senderId }) => {
  const currentChatUser = window.contactLoader.receiverId;

  if (senderId === currentChatUser) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.innerHTML = '';
  }
});



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

    const preview = document.getElementById('filePreview');
    preview.innerHTML = "";
    preview.style.display = "none";

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

    // update time
    const timeDiv = chatRow.querySelector('.time-meta');
    if (timeDiv) {
      const formatSidebarTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          return date.toLocaleString('en-In', { hour: '2-digit', minute: '2-digit', hour12: true });
        } else if (date.toDateString() === yesterday.toDateString()) {
          return "Yesterday";
        } else {
          return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      };

      const time = message.created_at
        ? formatSidebarTime(message.created_at)
        : '';
      timeDiv.innerText = time;
    }


    container.prepend(chatRow); // move to top
  }
}


// time formate change with hours and miniti
function formatTime(date){
  return new Date(date).toLocaleString('en-In', {
    hour : '2-digit',
    minute : '2-digit',
    hour12 : true
  })
}

// Send Message APi Call and DB Store Message
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

  // live chat section print
  // chat area
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

  const messageTime = formatTime(message.created_at);

  const messageHTML = isSender
      ?`
        <div class="col-sm-12 message-main-sender">
          <div class="sender">
            <div class="message-text">${renderContent()}</div>
              <span class="message-time pull-right">
                ${messageTime}
              </span>
          </div>
        </div>
      `
      : `
        <div class="col-sm-12 message-main-receiver">
          <div class="receiver">
            <div class="message-text">${renderContent()}</div>
            <span class="message-time pull-right">
                  ${messageTime}
            </span>
          </div>
        </div>
      `
    const isNearBottom = messageContainer.scrollTop + messageContainer.clientHeight >= messageContainer.scrollHeight - 50;

    const msgDateVal = new Date(message.created_at).toDateString();
    
    // Check the last inserted date divider
    const dateDividers = chatsection.querySelectorAll('.date-divider');
    let needsDivider = true;
    if (dateDividers.length > 0) {
        const lastDividerDate = dateDividers[dateDividers.length - 1].getAttribute('data-date');
        if (lastDividerDate === msgDateVal) {
            needsDivider = false;
        }
    }

    if (needsDivider) {
        const date = new Date(message.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let msgDateLabel = "";
        if (date.toDateString() === today.toDateString()) {
            msgDateLabel = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            msgDateLabel = "Yesterday";
        } else {
            msgDateLabel = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        
        const dateDividerHTML = `<div class="date-divider" data-date="${msgDateVal}"><span>${msgDateLabel}</span></div>`;
        chatsection.insertAdjacentHTML('beforeend', dateDividerHTML);
    }

    chatsection.insertAdjacentHTML('beforeend', messageHTML);

  if (isNearBottom) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

})

