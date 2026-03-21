// class chatLoader {
//     constructor(){
//         this.chatList = document.getElementById('chatList')
//         this.currentChatUserId = null;

//         if(!this.chatList){
//             console.error('chatList not found')
//         }
//     }

//     async init() {
//         await 
//     }
// }


    // renderChats(chats){
    //     this.chatList.innerHTML = ""

    //     chats.forEach(msg => {
    //         const chatDiv = document.createElement('div')
    //         chatDiv.classList.add("row", "message-body")

    //         const isSender = msg.senderId === currentUser.id

    //         chatDiv.innerHTML = `
    //             <div class="col-sm-12 ${isSender ? 'message-main-sender' : 'message-main-receiver'}">
    //                 <div class="${isSender ? 'sender' : 'receiver'}">
    //                     <div class="message-text">
    //                         ${msg.content}
    //                     </div>
    //                 </div>
    //             </div>
    //         `

    //         this.chatList.appendChild(chatDiv)
    //     })

    //     this.chatList.scrollTop = this.chatList.scrollHeight
    // }



    // Call this when user clicks contact
    // async openChat(user) {
    //     this.currentChatUserId = user.id
    //     console.log("🚀 ~ chatLoader ~ openChat ~ this.currentChatUserId:", this.currentChatUserId)
    //     this.roomId = roomId
    //     console.log("🚀 ~ chatLoader ~ openChat ~ this.roomId:", this.roomId)

    //     await this.loadChats()
    // }


    // // Fetch chat from API
    // async loadChats(){
    //     try {
    //         const res = await fetch(`/message/read/${this.currentChatUserId}`)
    //         const data = await res.json()

    //         this.renderChats(data.data)

    //     } catch(err){
    //         console.error('Error loading chats', err)
    //     }
    // }

    // renderChats(chats){
    //     this.chatList.innerHTML = ""

    //     chats.forEach(msg => {
    //         const chatDiv = document.createElement('div')
    //         chatDiv.classList.add("row", "message-body")

    //         console.log("🚀 ~ chatLoader ~ renderChats ~ msg.sendeId:", msg.sendeId)
    //         console.log("🚀 ~ chatLoader ~ renderChats ~ currentUser.id:", currentUser.id)
    //         const isSender = msg.senderId === currentUser.id

    //         console.log("msg in loadChat:", isSender);
            
    //         chatDiv.innerHTML = `
    //             <div class="col-sm-12 ${isSender ? 'message-main-sender' : 'message-main-receiver'}">
    //                 <div class="${isSender ? 'sender' : 'receiver'}">
    //                     <div class="message-text">
    //                         ${msg.content}
    //                     </div>
    //                 </div>
    //             </div>
    //         `
    //             // For Time :
    //             //    <span class="message-time pull-right">
    //             //          ${new Date(chat.createdAt).toLocaleTimeString()}
    //             //    </span>

    //         this.chatList.appendChild(chatDiv)
    //     })

    //     // Auto scroll bottom
    //     this.chatList.scrollTop = this.chatList.scrollHeight
    // }

// }
// window.chatLoader = new chatLoader()

