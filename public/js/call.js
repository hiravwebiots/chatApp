let currentCallId = null
let isCaller = false
let peerConnection
let localStream
let currentReceiverId

const configuration = {
  iceServers : [{ urls : 'stun:stun.l.google.com:19302' }]
}

// ================= RESER UI =================
function resetCallUI() {
  currentCallId = null;
  isCaller = false;

  document.getElementById('incomingCallUI').style.display = 'none'
  const cs = document.getElementById('callScreen');
  if (cs) cs.style.display = 'none';
}

function showOutgoingCall(receiverName, receiverAvatar) {
  console.log('showOutgoingCall called');

  const ui = document.getElementById('incomingCallUI');
  if (!ui) return;

  ui.style.display = 'flex';

  document.getElementById('callStatus').innerText = 'Calling...';
  if (receiverName) {
    document.getElementById('callerName').innerText = receiverName;
  }
  if (receiverAvatar) { 
    const avatarUrl = receiverAvatar.startsWith('/') ? receiverAvatar : '/' + receiverAvatar;
    document.getElementById('callAvatar').innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
  } else {
    document.getElementById('callAvatar').innerHTML = 'DM';
  }
  document.getElementById('acceptBtn').style.display = 'none';
  document.getElementById('declineBtn').style.display = 'inline-flex';
}

// ================= WEBRTC =================
function createPeerConnection(receiverId) {
  peerConnection = new RTCPeerConnection(configuration)

  peerConnection.onicecandidate = (event) => {
    if(event.candidate) {
      socket.emit('ice-candidate', {
        candidate : event.candidate,
        receiverId
      })
    }
  }

  // for audio + video
  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remoteVideo')

    if(!remoteVideo.srcObject){
      remoteVideo.srcObject = new MediaStream()
    }

    remoteVideo.srcObject.addTrack(event.track)
  }
}

async function startMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({
      audio : true,
      video : true
  })

  const localVideo = document.getElementById('localVideo')
  localVideo.srcObject = localStream

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream)
  })
}

async function startCall(receiverId) {
  currentReceiverId = receiverId;

  createPeerConnection(receiverId);
  await startMedia();

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit('offer', {
    offer,
    receiverId
  });
}


// ================= CALL BUTTON =================
document.querySelector('.fa-phone').addEventListener('click', () => {

  const receiverId = window.contactLoader.receiverId
  console.log("🚀 ~ receiverId:", receiverId)

  if (!receiverId) {
    console.log('No Receiver Selected');
    return
  }

  isCaller = true

  const receiverNameEl = document.querySelector('.heading-name-meta');
  const receiverName = receiverNameEl ? receiverNameEl.textContent : 'Unknown';

  const receiverImgEl = document.querySelector('.conversation .heading-avatar-icon img');
  const receiverAvatar = receiverImgEl ? receiverImgEl.getAttribute('src') : '';

  console.log('befor working showOutgoingCall');
  // showOutgoingCall()
  console.log('after working showOutgoingCall');


  initiateCall(receiverId, 'video', receiverName, receiverAvatar)
});




// ================= initiateCall =================
const initiateCall = async (receiverId, callType, receiverName, receiverAvatar) => {

  showOutgoingCall(receiverName, receiverAvatar)

  const res = await fetch('/call/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ receiverId, callType })
  })
  console.log("🚀 ~ initiateCall ~ res:", res)

  const data = await res.json()

  console.log('Call started', data); 

  currentCallId = data.callId;
  currentReceiverId = receiverId

  await startCall(receiverId);

}

// ================= INCOMING =================
socket.on('call-incoming', (data) => {
  console.log("🚀 ~ data:", data)
  if (isCaller) return;

  console.log('Incoming Call : ', data);


  console.log("🚀 ~ callerName:", data.callerName)

  // Only reset if it's a completely different call
  if (currentCallId && currentCallId !== data.callId) {
    resetCallUI();
  }

  currentCallId = data.callId;
  currentReceiverId = data.callerId;

  isCaller = false;

  // Show the UI
  document.getElementById('incomingCallUI').style.display = 'flex';

  document.getElementById('callStatus').innerText = 'Incoming call...';
  document.getElementById('callerName').innerText = data.callerName || 'Unknown'


  if (data.callerAvatar) {
    const avatarUrl = data.callerAvatar.startsWith('/') ? data.callerAvatar : '/' + data.callerAvatar;
    document.getElementById('callAvatar').innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
  } else {
    document.getElementById('callAvatar').innerHTML = 'DM';
  }

  document.getElementById('acceptBtn').style.display = 'inline-flex';
  document.getElementById('declineBtn').style.display = 'inline-flex';
});

socket.on('call-timeout', (data) => {
  console.log("🚀 ~ call-timeout:")

  resetCallUI()
})

// ================= ACCEOT BUTTON =================
document.getElementById('acceptBtn').addEventListener('click', async () => {
  if (!currentCallId) return

  await answerCall(currentCallId)

  document.getElementById('incomingCallUI').style.display = 'none';
  const cs = document.getElementById('callScreen');
  if (cs) cs.style.display = 'flex';
})

// ================= DECLINE BUTTON =================
document.getElementById('declineBtn').addEventListener('click', async () => {
  const callIdToUse = currentCallId;   // capture it immediately

  console.log("Decline clicked → isCaller:", isCaller, "callId:", callIdToUse);


  if (isCaller) {
    // Caller is cancelling their outgoing call
    await endCall(callIdToUse);
  } else {
    // Receiver is declining incoming call
    await declineCall(callIdToUse);
  }
  resetCallUI()
});

// ================= ENDCALL BUTTON =================
document.getElementById('endCallBtn').addEventListener('click', async () => {
  const callIdToUse = currentCallId

  console.log('endCall Button Clicked');

  await endCall(callIdToUse)
  
  resetCallUI()
})

// ================= answerCall =================
const answerCall = async (callId) => {
  const res = await fetch('call/answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call accepted', data);
}

socket.on('call-accepted', async ({ callId }) => {
  console.log('call accepted by receiver');

  // console.log("🚀 ~ currentCallId === callId:", currentCallId === callId)
  // if (currentCallId === callId) return

  
  document.getElementById('incomingCallUI').style.display = 'none';
  document.getElementById('callScreen').style.display = 'flex';
})


// ================= OFFER =================
socket.on('offer', async({ offer, senderId }) => {
  currentReceiverId = senderId

  createPeerConnection(senderId)
  await startMedia()

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  socket.emit('answer', {
    answer,
    receiverId : senderId
  })
})

// ================= ANSWER =================
socket.on('answer', async({ answer }) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  )
})

// ================= ICE =================
socket.on('ice-candidate', async ({ candidate }) => {
  if(candidate && peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }
})

// ================= declineCall =================
const declineCall = async (callId) => {
  console.log("🚀 ~ declineCall ~ callId:", callId)
  const res = await fetch('call/decline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call declined', data);
}

socket.on('call-declined', ({ callId }) => {
  
  console.log('Call declined by receiver');

  resetCallUI();

})

// ================= endCall =================
const endCall = async (callId) => {
  console.log("🚀 ~ endCall ~ callId:", callId)
  const res = await fetch('call/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call ended', data)
}

socket.on('call-cancelled', ({ callId }) => {
  console.log('Call-cancelled');
  resetCallUI()
})

socket.on('call-ended', ({ callId }) => {
  console.log('Call ended');

  console.log("🚀 ~ currentCallId === callId:", currentCallId === callId)
  if (currentCallId === callId) {
    resetCallUI();
  }

})