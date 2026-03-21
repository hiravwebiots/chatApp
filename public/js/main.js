document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM Ready');

    // load contacts
    window.contactLoader = new contactLoader()
    window.contactLoader.init()

    const myImg = document.getElementById('myImageId');
    // console.log("🚀 ~ currentUser:", currentUser)
    // console.log("🚀 ~ currentUser.profilePhoto:", currentUser.profilePhoto)
    if (currentUser.profilePhoto){
        myImg.src = `/${currentUser.profilePhoto}`;
        // console.log("🚀 ~ myImg.src:", myImg.src)
    }

    // load chats
    window.chatLoader = new chatLoader()
    console.log('Chat Loader is load in dom');
    
    window.chatLoader.init()                                                  

})