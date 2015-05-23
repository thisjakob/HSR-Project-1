//localStorage.removeItem("notes");
var notes = localStorage.getItem("notes");
if( !notes )
{
    localStorage.setItem("notes", JSON.stringify([]));
    var notes = localStorage.getItem("notes");
}
notes = JSON.parse(notes);
if (notes.length > 0) {
    localStorage.setItem("cmd", "0");
    var note = JSON.parse(notes[notes.length - 1]);
    var title = note.title;
    var desc = note.desc;
    var importance = note.importance;
    var date = note.date;
    console.log("Note 0: " + title + "; " + desc + "; " + importance + "; " + date);
} else {
    localStorage.setItem("cmd", "new");
}
