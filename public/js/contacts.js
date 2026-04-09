class contactLoader {
    constructor() {
        this.chatList = document.getElementById('chatList')
        this.contactList = document.getElementById('contactList')
        // console.log("🚀 ~ contactLoader ~ constructor ~ contactList:", this.contactList)
        if(!this.contactList){
            console.error('contactList not found')
        }

        this.conversation = document.getElementById('chatsection')
        this.messageContainer = document.getElementById('conversation')
        if(!this.conversation){
            console.error('conversation not found')
        }
        if(!this.messageContainer){
            console.error('messageContainer not found')
        }
    }

    async init() {
        await this.loadRecentChats()
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('searchText');
        let searchTimeout;

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.trim().toLowerCase();
                
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    const activeTab = document.querySelector('.tab.active-tab');
                    const isContactTab = activeTab && activeTab.innerText.trim().toLowerCase() === 'contact';
                    
                    if (term === '') {
                        if (isContactTab) {
                            this.loadContacts();
                        } else {
                            this.loadRecentChats();
                        }
                        return;
                    }
                    
                    try {
                        const res = await fetch(`/profile/search?name=${encodeURIComponent(term)}`);
                        const result = await res.json();
                        
                        if (result.status === 1) {
                            this.renderContacts(result.data, isContactTab ? 'contact' : 'chat');
                        }
                    } catch (err) {
                        console.error('Error searching users via API:', err);
                    }
                }, 300);
            });
        }
    }

    // chat tab
    // fetch recent chat user from api
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

    // contact tab
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

    
    async renderContacts(users, type = 'chat'){
        console.log('In renderContacts');
                
        const container = type === 'chat' ? this.chatList : this.contactList
        console.log("🚀 ~ contactLoader ~ renderContacts ~ container:", container)

        

        container.innerHTML = ""

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

        users.forEach(user => {
            const div = document.createElement("div");
            div.className = "row sideBar-body";

            // "Find user row by ID" -> found instantly 
            div.setAttribute("data-user-id", user.id);
            div.setAttribute("data-is-online", user.isOnline);
            div.setAttribute("data-last-seen", user.lastSeen || '');

            const lastMessageTime = user.lastMessage?.created_at
                ? formatSidebarTime(user.lastMessage.created_at)
                : '';

            let previewText = '';
            if (user.lastMessage) {
                const msg = user.lastMessage;
                if (msg.messageType === 'text') previewText = msg.content || '';
                else if (msg.messageType === 'image') previewText = '📷 Photo';
                else if (msg.messageType === 'video') previewText = '🎥 Video';
                else if (msg.messageType === 'audio') previewText = '🎵 Audio';
                else if (msg.messageType === 'document') previewText = '📄 Document';
                else if (msg.messageType === 'call_log') previewText = msg.content || '';
                else previewText = msg.content || '';
            }

            div.innerHTML = `
                <div class="col-sm-3 col-xs-3 sideBar-avatar">
                    <div class="avatar-icon">
                        <img src="/${user.profilePhoto}">
                    </div>
                </div>

                <div class="col-sm-9 col-xs-9 sideBar-main">
                    <div class="sideBar-name name-meta">
                        <span class="user-name">${user.name}</span>
                        <span class="time-meta">${lastMessageTime}</span>
                    </div>
                <div class="sideBar-message">
                    ${previewText}
                </div>
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

        document.getElementById('welcomeScreen').style.display = 'none'

        console.log("🚀 ~ contactLoader ~ openChat ~ user:", user)
        // Set user name and profilrPhoto
        const nameEl = document.querySelector(".heading-name-meta")
        nameEl.textContent = user.name

        const imgEl = document.querySelector(".conversation .heading-avatar-icon img")
        imgEl.src = user.profilePhoto
        
        const statusEl = document.querySelector(".heading-online")

        if (statusEl) {
            const contactNode = document.querySelector(`[data-user-id="${user.id}"]`);
            let isOnline = user.isOnline;
            let lastSeen = user.lastSeen;
            if (contactNode && contactNode.hasAttribute('data-is-online')) {
                isOnline = contactNode.getAttribute('data-is-online') === 'true';
            }
            if (contactNode && contactNode.hasAttribute('data-last-seen')) {
                const lsAttr = contactNode.getAttribute('data-last-seen');
                if (lsAttr) lastSeen = lsAttr;
            }
            
            if (isOnline) {
                statusEl.textContent = "Online";
                statusEl.style.color = "green";
            } else {
                let text = "Offline";
                if (lastSeen) {
                    const date = new Date(lastSeen);
                    text = `Last seen at ${date.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' })}`;
                }
                statusEl.textContent = text;
                statusEl.style.color = "gray";
            }
        }

        //  store current chat user
        currentChatUserId = user.id

        // const isOnline = document.

        const chatBox = document.getElementById("chatsection")

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

    // display in chatBox section
    renderChats(chats){
    const container = document.getElementById('chatsection');
    container.innerHTML = "";

    const getDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // DD/MM/YYYY
        }
    };

    let lastRenderedDate = null;

    chats.forEach(msg => {
        const msgDateVal = new Date(msg.created_at).toDateString();
        
        if (msgDateVal !== lastRenderedDate) {
            const msgDateLabel = getDateLabel(msg.created_at);
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-divider';
            dateDiv.setAttribute('data-date', msgDateVal);
            dateDiv.innerHTML = `<span>${msgDateLabel}</span>`;
            container.appendChild(dateDiv);
            lastRenderedDate = msgDateVal;
        }

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

            if (msg.messageType === 'call_log') {
                const contentLower = msg.content.toLowerCase();
                const isMissedOrDeclined = contentLower.includes('missed') || contentLower.includes('cancelled') || contentLower.includes('declined');
                const iconColor = isMissedOrDeclined ? '#d9534f' : '#5cb85c';      

                let iconClass = 'fa-phone'; // default audio

                if(msg.callType === 'video'){
                    iconClass = 'fa-video-camera'
                } else if(msg.callType === 'audio'){
                    iconClass = 'fa-phone'
                }
        
                return `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="fa ${iconClass}" style="color: ${iconColor}; font-size: 1.2em;"></i>
                        <strong style="color: #444;">${msg.content}</strong>
                    </div>
                `;
            }

            return ''

        }

        function formatTime(date){
            return new Date(date).toLocaleString('en-In', {
                hour : '2-digit',
                minute : '2-digit',
                hour12 : true
            })
        }

        // while load history that time this
        const messageTime = formatTime(msg.created_at);
        console.log("🚀 ~ contactLoader ~ renderChats ~ messageTime:", messageTime)

        chatDiv.innerHTML = `
            <div class="col-sm-12 ${isSender ? 'message-main-sender' : 'message-main-receiver'}">
                <div class="${isSender ? 'sender' : 'receiver'}">
                    <div class="message-text">
                        ${renderContent()}
                    </div>
                    <span class="message-time pull-right">
                        ${messageTime}
                    </span>
                </div>
            </div>
        `
            // For Time :
            //    <span class="message-time pull-right">
            //          ${new Date(chat.createdAt).toLocaleTimeString()}
            //    </span>

        container.appendChild(chatDiv)
    })

    // If I read chat need auto scroll 
    // start with bottom and then top

        setTimeout(() => {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight
        }, 50);

    }
}

