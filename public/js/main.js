document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM Ready');

    // load contacts
    window.contactLoader = new contactLoader()
    window.contactLoader.init()

    // load profilPhoto
    const myImg = document.getElementById('myImageId');
    if (currentUser.profilePhoto){
        myImg.src = `/${currentUser.profilePhoto}`;
    }
    
})
