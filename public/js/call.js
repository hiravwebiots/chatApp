
document.querySelector('.fa-phone').addEventListener('click', () => {

  const receiverId = window.contactLoader.receiverId
  console.log("🚀 ~ receiverId:", receiverId)
  if(!receiverId){
    console.log('No Receiver Selected');
    return
  }

  initiateCall(receiverId, 'audio')
});


document.getElementById('declineBtn').addEventListener('click', async () => {

  if(!currentCallId) return

  declineCall(currentCallId)
    document.getElementById('incomingCallUI').style.display = 'none';

})



let currentCallId = null;

// initiateCall
const initiateCall = async (receiverId, callType) => {
  

  const res = await fetch('/call/initiate', {
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({ receiverId,  callType })
  })
  console.log("🚀 ~ initiateCall ~ res:", res)

  const data = await res.json()
  console.log('Call started', data);  
}

socket.on('call-incoming', (data) => {
    console.log('Incoming Call : ', data);

    currentCallId = data.callId
    // show UI Popup  
      document.getElementById('incomingCallUI').style.display = 'block'


})

socket.on('call-timeout', (data) => {
     console.log('Call Timeout : ', data);

    if(currentCallId === data.callId){
      document.getElementById('incomingCallUI').style.display = 'none'

      currentCallId = null
    }
})



// answerCall
const answerCall = async (callId) => {
  const res = await fetch('call/answer', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call accepted', data);
}

socket.on('call-accepted', ({ callId }) => {
  console.log('call accepted by receiver');
    // start call UI  / webRTC Here
})  


//declineCall
const declineCall = async (callId) => {
  const res = await fetch('call/decline', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call declined', data);
}

socket.on('call-declined', ({ callId }) => {

  console.log('Call declined by receiver');


})



// endCall
const endCall = async (callId) => {
  const res = await fetch('call/endCall', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({ callId })
  })

  const data = await res.json()
  console.log('Call ended', data)
}

socket.on('call-ended', ({ callId }) => {
  console.log('Call ended');
  
  // reset UI
})