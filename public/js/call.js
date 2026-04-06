let currentCallId = null
let isCaller = false
let peerConnection
let localStream
let currentReceiverId
let currentCallType = 'audio';
let currentChatUserName = '';
let currentChatUserAvatar = '';

let callTimerInterval = null;
let callSeconds = 0;

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
}

// ================= RESER UI =================
function resetCallUI() {
    stopRingtone()
 
  currentCallId = null;
  isCaller = false;
  currentCallType = 'audio';
  currentChatUserName = '';
  currentChatUserAvatar = '';

  document.getElementById('incomingCallUI').style.display = 'none'
  const errEl = document.getElementById('callErrorMessage');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.innerText = '';
  }
  const cs = document.getElementById('callScreen');
  if (cs) cs.style.display = 'none';

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  const remoteVideo = document.getElementById('remoteVideo');
  if (remoteVideo) {
    remoteVideo.srcObject = null;
  }
  stopCallTimer();
}

// ================= TIMER =================
function startCallTimer() {
  stopCallTimer(); // ensure no overlapping timers
  callSeconds = 0;
  updateTimerUI();
  callTimerInterval = setInterval(() => {
    callSeconds++;
    updateTimerUI();
  }, 1000);
}

function updateTimerUI() {
  const min = String(Math.floor(callSeconds / 60)).padStart(2, '0');
  const sec = String(callSeconds % 60).padStart(2, '0');
  const timerEl = document.getElementById('callTimer');
  if (timerEl) {
    timerEl.innerText = `${min}:${sec}`;
  }
}

function stopCallTimer() {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
  const timerEl = document.getElementById('callTimer');
  if (timerEl) {
    timerEl.innerText = "00:00";
  }
}

function showCallScreen() {
  document.getElementById('incomingCallUI').style.display = 'none';
  const cs = document.getElementById('callScreen');
  if (cs) {
    cs.style.display = 'flex';
    document.getElementById('inCallName').innerText = currentChatUserName || 'Unknown';
    if (currentChatUserAvatar) {
      const avatarUrl = currentChatUserAvatar.startsWith('/') ? currentChatUserAvatar : '/' + currentChatUserAvatar;
      document.getElementById('inCallAvatar').innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      document.getElementById('inCallAvatar').innerHTML = 'DM';
    }
  }
  startCallTimer();

  // video call ui

}
// ======================================+++++

// ================= RINGTONE =================
// without click use can't access the audio so 
let isAudioUnlocked = false;

function unlockAudio() {
  if (isAudioUnlocked) return;

  const audio = document.getElementById('myRingtone');
  if (!audio) return;

  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      isAudioUnlocked = true;
      console.log('Audio unlocked');
    })
    .catch(() => {});
}

// trigger on first user interaction
document.addEventListener('click', unlockAudio, { once: true });


function playRingtone() {
  const audio = document.getElementById('myRingtone');

  if (audio && isAudioUnlocked) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log('Play blocked:', err);
    });
  }
}

function stopRingtone(){
  const audio = document.getElementById('myRingtone')
  if(audio){
    audio.pause()
    audio.currentTime = 0
  }
}
// ======================================+++++


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
    if (event.candidate) {
      socket.emit('ice-candidate', {
        candidate: event.candidate,
        receiverId
      })
    }
  }

  // for audio + video
  peerConnection.ontrack = (event) => {
    let remoteVideo = document.getElementById('remoteVideo');
    if (!remoteVideo) {
      remoteVideo = document.createElement('video');
      remoteVideo.id = 'remoteVideo';
      remoteVideo.autoplay = true;
      remoteVideo.style.display = 'none'; // hide for now, can be updated for video call UI later
      document.body.appendChild(remoteVideo);
    }

    if (!remoteVideo.srcObject) {
      remoteVideo.srcObject = new MediaStream()
    }

    remoteVideo.srcObject.addTrack(event.track)
  }
}

async function startMedia() {
  const isVideo = currentCallType === 'video';
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: isVideo
  })

  let localVideo = document.getElementById('localVideo')
  if (!localVideo) {
    localVideo = document.createElement('video');
    localVideo.id = 'localVideo';
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.style.display = 'none';
    document.body.appendChild(localVideo);
  }
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
function handleOutgoingCallClick(callType) {
  const receiverId = window.contactLoader.receiverId
  console.log("🚀 ~ receiverId:", receiverId)

  if (!receiverId) {
    console.log('No Receiver Selected');
    return
  }

  isCaller = true

  const receiverNameEl = document.querySelector('.heading-name-meta');
  currentChatUserName = receiverNameEl ? receiverNameEl.textContent : 'Unknown';

  const receiverImgEl = document.querySelector('.conversation .heading-avatar-icon img');
  currentChatUserAvatar = receiverImgEl ? receiverImgEl.getAttribute('src') : '';

  currentCallType = callType;

  console.log('befor working showOutgoingCall');
  // showOutgoingCall()
  console.log('after working showOutgoingCall');


  initiateCall(receiverId, callType, currentChatUserName, currentChatUserAvatar)
}

const faPhone = document.querySelector('.fa-phone');
if (faPhone) {
  faPhone.addEventListener('click', () => handleOutgoingCallClick('audio'));
}

const faVideo = document.querySelector('.fa-video-camera');
if (faVideo) {
  faVideo.addEventListener('click', () => handleOutgoingCallClick('video'));
}




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

  if (!res.ok) {
    const errEl = document.getElementById('callErrorMessage');
    if (errEl) {
      errEl.innerText = data.message || 'Could not initiate call';
      errEl.style.display = 'block';
    }
    document.getElementById('acceptBtn').style.display = 'none';
    document.getElementById('declineBtn').style.display = 'none';
    document.getElementById('callStatus').innerText = 'Call Failed';
    
    setTimeout(() => {
      resetCallUI();
    }, 5000);
    return;
  }

  console.log('Call started', data);

  currentCallId = data.data._id;
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

  // ringtone
  playRingtone()

  // just for Knowledge data.callId store not a call.id direct
  currentCallId = data.callId;
  currentReceiverId = data.callerId;

  isCaller = false;

  // Show the UI
  document.getElementById('incomingCallUI').style.display = 'flex';

  currentCallType = data.callType || 'audio';
  currentChatUserName = data.callerName || 'Unknown';
  currentChatUserAvatar = data.callerAvatar || '';

  document.getElementById('callStatus').innerText = 'Incoming call...';
  document.getElementById('callerName').innerText = currentChatUserName;


  if (currentChatUserAvatar) {
    const avatarUrl = currentChatUserAvatar.startsWith('/') ? currentChatUserAvatar : '/' + currentChatUserAvatar;
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

  stopRingtone()
  await answerCall(currentCallId)

  showCallScreen();
})

// ================= DECLINE BUTTON =================
document.getElementById('declineBtn').addEventListener('click', async () => {
  const callIdToUse = currentCallId;   // capture it immediately

  console.log("Decline clicked → isCaller:", isCaller, "callId:", callIdToUse);

  stopRingtone()

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
  
  stopRingtone()

  await endCall(callIdToUse)

  resetCallUI()
})

// ================= answerCall =================
const answerCall = async (callId) => {
  const res = await fetch('/call/answer', {
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


  showCallScreen();
})


// ================= OFFER =================
socket.on('offer', async ({ offer, senderId }) => {
  currentReceiverId = senderId

  createPeerConnection(senderId)
  await startMedia()

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  socket.emit('answer', {
    answer,
    receiverId: senderId
  })
})

// ================= ANSWER =================
socket.on('answer', async ({ answer }) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  )
})

// ================= ICE =================
socket.on('ice-candidate', async ({ candidate }) => {
  if (candidate && peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }
})

// ================= declineCall =================
const declineCall = async (callId) => {
  console.log("🚀 ~ declineCall ~ callId:", callId)
  const res = await fetch('/call/decline', {
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

const endCall = async (callId) => {
  console.log("🚀 ~ endCall ~ callId:", callId)
  const res = await fetch('/call/end', {
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