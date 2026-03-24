class contactLoader {
    constructor() {
        this.chatList = document.getElementById('chatList')
        this.contactList = document.getElementById('contactList')
        // console.log("🚀 ~ contactLoader ~ constructor ~ contactList:", this.contactList)
        if(!this.contactList){
            console.error('contactList not found')
        }

        this.conversation = document.getElementById('conversation')
        if(!this.conversation){
            console.error('conversation not found')
        }
    }

    async init() {
        await this.loadRecentChats()
    }

    async loadRecentChats(){
        try{
            const res = await fetch('/message/recent-chat')
            const data = await res.json()
            console.log("🚀 Recent Chat User of data", data)

            console.log('Before Load Recent Contact : ');
            
            this.renderContacts(data.data, 'chat')
            console.log("🚀 ~ contactLoader ~ loadRecentChats ~ data.data:", data.data)

            console.log('After Load Recent Contact : ');


        } catch(err){
            console.error('error loading recent chats', err)
        }
    }

    // Fetch user from API
    async loadContacts(){
        try{
            const res = await fetch('/profile/get') 
            const data = await res.json()

            console.log("🚀 Profile API Data :", data);
            

            // first data → whole response
            // second data → actual users array
            this.renderContacts(data.data, 'contact')     // .data come from API Response
            // console.log("Render Contact in contact.js")
        } catch(err){
            console.error('Error loading contacts', err)
        }
    }   

    renderContacts(users, type = 'chat'){
        console.log('In renderContacts');
                
        const container = type === 'chat' ? this.chatList : this.contactList
        console.log("🚀 ~ contactLoader ~ renderContacts ~ container:", container)

        container.innerHTML = ""

        users.forEach(user => {
            const div = document.createElement("div");
            div.className = "row sideBar-body";

            // “Find user row by ID” → found instantly 
            div.setAttribute("data-user-id", user.id);

            div.innerHTML = `
                <div class="col-sm-3 col-xs-3 sideBar-avatar">
                    <div class="avatar-icon">
                        <img src="/${user.profilePhoto}">
                    </div>
                </div>

                <div class="col-sm-9 col-xs-9 sideBar-main">
                    <div class="sideBar-name name-meta">
                        ${user.name}
                    </div>
                </div>
                
    <div class=" sideBar-message">
        ${user.lastMessage?.content || ''}
    </div>
                `
                // why use typr = chat
            
            div.addEventListener("click", () => {
                this.openChat(user)
            })

            container.appendChild(div);
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
            const result = await res.json()
            console.log("🚀 ~ contactLoader ~ openChat ~ result:", result)
    
            // if here data --> undefined 

            if(result.data.length === 0){
                return chatBox.innerHTML = `
                    <div class="text-center" style="margin-top:20px;">
                        <p> “Start a conversation 👋 with ${user.name}"</p>
                    </div> 
                `
            } 
                console.log('Working else condition');  
                this.renderChats(result.data)                
            

    
        } catch(err){
            console.error('Error While recent-chat load', err)
        }

    }

    renderChats(chats){
    this.conversation.innerHTML = ""

    chats.forEach(msg => {
        const chatDiv = document.createElement('div')
        chatDiv.classList.add("row", "message-body")

        console.log("🚀 ~ chatLoader ~ renderChats ~ msg.senderId:", msg.senderId.id)
        console.log("🚀 ~ chatLoader ~ renderChats ~ currentUser.id:", currentUser.id)
        const isSender = msg.senderId.id === currentUser.id

        console.log("who id msg sender :", isSender);
        

    const renderContent = () => {

        if (msg.messageType === 'text') {
            return `<p>${msg.content}</p>`
        }

        if (msg.messageType === 'image') {
            return `<img src="${msg.fileUrl}" width="200" style="border-radius:10px;" />`
        }

        if (msg.messageType === 'video') {
            return `<video src="${msg.fileUrl}" controls width="200"></video>`
        }

        if (msg.messageType === 'audio') {
            return `<audio src="${msg.fileUrl}" controls></audio>`
        }

        if (msg.messageType === 'document') {
            return `<a href="${msg.fileUrl}" target="_blank"> ${msg.fileName}</a>`
        }

        return
    }



        chatDiv.innerHTML = `
            <div class="col-sm-12 ${isSender ? 'message-main-sender' : 'message-main-receiver'}">
                <div class="${isSender ? 'sender' : 'receiver'}">
                    <div class="message-text">
                        ${renderContent()}
                    </div>
                </div>
            </div>
        `
            // For Time :
            //    <span class="message-time pull-right">
            //          ${new Date(chat.createdAt).toLocaleTimeString()}
            //    </span>

        this.conversation.appendChild(chatDiv)
    })

    // If I read chat need auto scroll 
    // start with bottom and then top

        this.conversation.scrollTop = this.conversation.scrollHeight

    }
}

