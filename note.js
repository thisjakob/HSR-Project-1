function cancel() {
    // activate index.html
    localStorage.setItem("cmd", "cancel");
    window.location.replace("index.html");
};

/*var notes = '{ "notes" : ['
    + '{ "title":' + document.getElementById("title").value)
+ '{ "desc":' + document.getElementById("desc").value)
+ '{ "importance":' + document.getElementById("importance").value)
+ '{ "date":' + document.getElementById("date").value)
+ '} ]}';*/
function save() {
    if (cmd !== "new") {
        notes.splice(parseInt(cmd), 1);
    }
    var note = '{ "title":"' + document.getElementById("title").value
        + '", "desc":"' + document.getElementById("desc").value
        + '", "importance":"' + document.getElementById("importance").value
        + '", "date":"' + document.getElementById("date").value
        + '"}';
    notes.push(note);
    localStorage.setItem("notes", JSON.stringify(notes));

/*    // read items from inputs and save it to localStorage
    localStorage.setItem("title",document.getElementById("title").value);
    localStorage.setItem("desc",document.getElementById("desc").value)
    localStorage.setItem("importance",document.getElementById("importance").value)
    localStorage.setItem("date",document.getElementById("date").value)
    // activate index.html
    localStorage.setItem("cmd", "save");*/
    window.location.replace("index.html");
}

var notes = JSON.parse(localStorage.getItem("notes"));
var cmd = localStorage.getItem("cmd");
if (cmd !== "new") {
    // read items from localStorage and set inputs
    var note = JSON.parse(notes[parseInt(cmd)]);
    document.getElementById("title").value = note.title;
    document.getElementById("desc").value = note.desc;
    document.getElementById("importance").value = note.importance;
    document.getElementById("date").value = note.date;
}