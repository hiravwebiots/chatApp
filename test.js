// ================= GLOBAL =================
let currentCallId = null;
let isCaller = false;
let peerConnection;
let localStream;
let currentReceiverId = null;

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// ================= UI =================
function resetCallUI() {
  currentCallId = null;
  isCaller = false;

  document.getElementById('incomingCallUI').style.display = 'none';
  const cs = document.getElementById('callScreen');
  if (cs) cs.style.display = 'none';
}

function showOutgoingCall(receiverName, receiverAvatar) {
  const ui = document.getElementById('incomingCallUI');
  if (!ui) return;

  ui.style.display = 'flex';
  document.getElementById('callStatus').innerText = 'Calling...';
  document.getElementById('callerName').innerText = receiverName || 'Unknown';

  document.getElementById('acceptBtn').style.display = 'none';
  document.getElementById('declineBtn').style.display = 'inline-flex';
}

// ================= WEBRTC =================
function createPeerConnection(receiverId) {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        candidate: event.candidate,
        receiverId
      });
    }
  };

  peerConnection.ontrack = (event) => {
    document.getElementById('remoteVideo').srcObject = event.streams[0];
  };
}

async function startMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById('localVideo').srcObject = localStream;

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
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
  const receiverId = window.contactLoader.receiverId;
  if (!receiverId) return;

  isCaller = true;

  const receiverName = document.querySelector('.heading-name-meta')?.textContent || 'Unknown';

  initiateCall(receiverId, 'audio', receiverName);
});

// ================= INITIATE =================
async function initiateCall(receiverId, callType, receiverName) {
  showOutgoingCall(receiverName);

  const res = await fetch('/call/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId, callType })
  });

  const data = await res.json();
  currentCallId = data.callId;
  currentReceiverId = receiverId;
}

// ================= INCOMING =================
socket.on('call-incoming', (data) => {
  if (isCaller) return;

  currentCallId = data.callId;
  currentReceiverId = data.callerId;

  document.getElementById('incomingCallUI').style.display = 'flex';
  document.getElementById('callStatus').innerText = 'Incoming call...';
  document.getElementById('callerName').innerText = data.callerName || 'Unknown';

  document.getElementById('acceptBtn').style.display = 'inline-flex';
  document.getElementById('declineBtn').style.display = 'inline-flex';
});

// ================= ACCEPT =================
document.getElementById('acceptBtn').addEventListener('click', async () => {
  if (!currentCallId) return;

  await fetch('/call/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId: currentCallId })
  });

  document.getElementById('incomingCallUI').style.display = 'none';
  document.getElementById('callScreen').style.display = 'block';
});

// ================= CALL ACCEPTED =================
socket.on('call-accepted', async ({ callId, receiverId }) => {
  if (currentCallId !== callId) return;

  resetCallUI();

  document.getElementById('callScreen').style.display = 'block';

  // START WEBRTC (CALLER)
  await startCall(receiverId);
});

// ================= OFFER =================
socket.on('offer', async ({ offer, senderId }) => {
  currentReceiverId = senderId;

  createPeerConnection(senderId);
  await startMedia();

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit('answer', {
    answer,
    receiverId: senderId
  });
});

// ================= ANSWER =================
socket.on('answer', async ({ answer }) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
});

// ================= ICE =================
socket.on('ice-candidate', async ({ candidate }) => {
  if (candidate && peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

// ================= DECLINE =================
document.getElementById('declineBtn').addEventListener('click', async () => {
  if (!currentCallId) return;

  await fetch('/call/decline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId: currentCallId })
  });

  resetCallUI();
});

// ================= END =================
socket.on('call-ended', () => {
  resetCallUI();

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
});

// ================= REQUIRED HTML =================
// <video id="localVideo" autoplay muted></video>
// <video id="remoteVideo" autoplay></video>
