/*
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
*/


(function(document, window){

    // Application object. Handles all overall functions
    var Notes = {

        // attach event handlers
        init : function () {
            console.log('Notes init');
        },

        // switch skin
        switchStyle : function () {

        },

        // get all notes from LocalStorage
        getAllNotes : function () {
            return JSON.parse( localStorage.getItem('notes') ) || [];
        },

        // sort notes
        sortNotes : function () {

        },

        // show/hide finished notes
        toggleFinishedNotes : function() {

        },

        // get new unused ID for a new note
        // => just use a timestamp
        getNewID : function () {
            return new Date().getTime().toString();
        }
    };

    // Handles all functions for a single note
    var Note = {

        allNotes : Notes.getAllNotes(),

        // attach event handlers
        init : function (){
            var me = this;
            if ( window.location.hash.match(/new/) ) {
                this.createNote();
                document.getElementById('btn_save').addEventListener('click', function(){
                    me.saveNote.apply(me, arguments);
                });
                document.getElementById('btn_cancel').addEventListener('click', function(){
                    window.location.href = 'index.html';
                });

            } else {
                this.getNote( window.location.hash.split('#')[1] );
            }
        },

        // create new note
        createNote : function () {
            document.getElementById('NoteId').value = Notes.getNewID();
        },

        // get note from localStorage
        getNote : function (id) {
            var allNotes = this.allNotes;

            for (var i = 0; i < allNotes.length; i++) {
                if ( allNotes[i].id === id ) {
                    return allNotes.splice(i, 1)[0];
                }
            }

            return 'No note with the ID "' + id + '" found.';
        },

        // save note to localStorage
        saveNote : function () {
            var me = this;
            var allNotes = me.allNotes;
            var note = '{'
                    + '"id":"' + document.getElementById("NoteId").value +'",'
                    + '"title":"' + document.getElementById("title").value + '"'
                    + '"desc":"' + document.getElementById("desc").value + '"'
                    + '"importance":"' + document.getElementById("importance").value + '",'
                    + '"date":"' + document.getElementById("date").value + '"'
                + '}';
            allNotes.push(note);
            localStorage.setItem("notes", JSON.stringify(allNotes));
        }
    };

    window.addEventListener('load',function(){
        if ( window.location.href.match(/note\.html/) ){
            Note.init();
        } else {
            Notes.init();
        }

    },false);
})(document, window);

