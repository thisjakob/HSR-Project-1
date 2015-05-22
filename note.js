function cancel() {
    // activate index.html
    localStorage.setItem("cmd", "cancel");
    window.location.replace("index.html");
};

function save() {
    // read items from inputs and save it to localStorage
    localStorage.setItem("title",document.getElementById("title").value);
    localStorage.setItem("desc",document.getElementById("desc").value)
    localStorage.setItem("importance",document.getElementById("importance").value)
    localStorage.setItem("date",document.getElementById("date").value)
    // activate index.html
    localStorage.setItem("cmd", "save");
    window.location.replace("index.html");
}

// read items from localStorage and put it in inputs
document.getElementById("title").value = localStorage.getItem("title");
document.getElementById("desc").value = localStorage.getItem("desc");
document.getElementById("importance").value = localStorage.getItem("importance");
document.getElementById("date").value = localStorage.getItem("date");
