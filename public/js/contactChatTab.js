function openTab(evt, tabName) {

    // hide both lists
    document.getElementById("chatList").style.display = "none";
    document.getElementById("contactList").style.display = "none";

    // remove active class
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active-tab");
    }

    // show selected list
    if (tabName === "chat") {
        document.getElementById("chatList").style.display = "block";
    } else {
        document.getElementById("contactList").style.display = "block";
    }

    // active tab style
    evt.currentTarget.classList.add("active-tab");
}          
