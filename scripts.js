function cancel() {
    // activate index.html
    window.location.replace("index.html");
};

function save() {
    // read items and save it to localStorage
    localStorage.setItem("title",document.getElementById("title").value);
    localStorage.setItem("desc",document.getElementById("desc").value)
    localStorage.setItem("importance",document.getElementById("importance").value)
    localStorage.setItem("date",document.getElementById("date").value)
    // activate index.html
    window.location.replace("index.html");
}