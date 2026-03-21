class contactLoader {
    constructor(chatLoaderInstance) {
        this.chatLoader = chatLoaderInstance

        this.contactList = document.getElementById('contactList')
        // console.log("🚀 ~ contactLoader ~ constructor ~ contactList:", this.contactList)

        if(!this.contactList){
            console.error('contactList not found')
        }
    }

    async init() {
        await this.loadContacts()
    }

    // Fetch user from API
    async loadContacts(){
        try{
            const res = await fetch('/profile/get') 
            const data = await res.json()

            // console.log("API Data :", data);
            

            // first data → whole response
            // second data → actual users array
            this.renderContacts(data.data)     // .data come from API Response
            // console.log("Render Contact in contact.js")
        } catch(err){
            console.error('Error loading contacts', err)
        }
    }   

    renderContacts(users){
        this.contactList.innerHTML = ""

        users.forEach(user => {
            const contact = document.createElement("div");
            contact.className = "row sideBar-body";

            contact.innerHTML = `
                <div class="col-sm-3 col-xs-3 sideBar-avatar">
                    <div class="avatar-icon">
                        <img src="/${user.profilePhoto}">
                    </div>
                </div>

                <div class="col-sm-9 col-xs-9 sideBar-main">
                    <div class="row">
                        <div class="col-sm-8 col-xs-8 sideBar-name">
                            <span class="name-meta">
                                ${user.name}
                            </span>
                        </div>
                    </div>
            </div>`

            
            contact.addEventListener("click", () => {
                this.openChat(user)
            })

            this.contactList.appendChild(contact);
            // console.log("this.contactList", this.contactList)
        });
    }

    async openChat(user){
        console.log("🚀 ~ contactLoader ~ openChat ~ user:", user)
        // Set user name and profilrPhoto
        const nameEl = document.querySelector(".heading-name-meta")
        nameEl.textContent = user.name

        const imgEl = document.querySelector(".conversation .heading-avatar-icon img")
        imgEl.src = user.profilePhoto    

        const chatBox = document.getElementById("conversation")

        // If chat not then this print 
        chatBox.innerHTML = `
            <div class="text-center" style="margin-top:20px;">
                <p>Start chat with ${user.name}</p>
                <p>Start chat with ${user.profilePhoto}</p>
            </div> 
        `

        console.log('Contact Load and Click Working');
        
        // // STORE receiver
        this.receiverId = user.id
        console.log("🚀 ~ contactLoader ~ openChat ~ this.receiverId:", this.receiverId)


        // It;s logic for Group

        // // CREATE UNIQUE ROOM Between current login & user  
        // const roomId = [currentUser.id, user.id].sort().join("_")

        // // when click on user --> After Click Join room login & click user 
        // console.log("Befor Click");

        // // room join event on
        // socket.on('join-room', user.id)

        // console.log("when click on user --> After Click Join room login & click user" )
        
        
        
        // this.roomId = roomId
        // console.log("🚀 ~ contactLoader ~ openChat ~ this.roomId:", this.roomId)


        try{
            const res = await fetch(`/message/read/${this.receiverId}`)
            const data = await res.json()
            console.log("🚀 ~ contactLoader ~ openChat ~ data:", data)
    
            this.renderChats(data.data)
    
        } catch(err){
            console.error('Error While recent-chat load', err)
        }

    }

    renderChats(chats){
    this.chatList.innerHTML = ""

    chats.forEach(msg => {
        const chatDiv = document.createElement('div')
        chatDiv.classList.add("row", "message-body")

        console.log("🚀 ~ chatLoader ~ renderChats ~ msg.sendeId:", msg.sendeId)
        console.log("🚀 ~ chatLoader ~ renderChats ~ currentUser.id:", currentUser.id)
        const isSender = msg.senderId === currentUser.id

        console.log("msg in loadChat:", isSender);
        
        chatDiv.innerHTML = `
            <div class="col-sm-12 ${isSender ? 'message-main-sender' : 'message-main-receiver'}">
                <div class="${isSender ? 'sender' : 'receiver'}">
                    <div class="message-text">
                        ${msg.content}
                    </div>
                </div>
            </div>
        `
            // For Time :
            //    <span class="message-time pull-right">
            //          ${new Date(chat.createdAt).toLocaleTimeString()}
            //    </span>

        this.chatList.appendChild(chatDiv)
    })

        // Auto scroll bottom
        this.chatList.scrollTop = this.chatList.scrollHeight
    }
}

