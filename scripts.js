(function($, document, window){

    // Application object. Handles all overall functions
    var Notelist = {

        noteTmpl : null,
        allNotes : null,
        listNode : null,

        // attach event handlers
        init : function () {
            this.allNotes = this.getAllNotes();

            if ( window.location.href.match(/note\.html/) ){
                Note.init();
            } else {
                var me = this,
                    list = $('.note-list').first();

                me.noteTmpl = list.html();

                list.removeClass('hidden').html('');

                this.render();

            }
        },

        // switch skin
        switchStyle : function () {

        },

        // save the entire notelist to localStorage
        save : function() {
            localStorage.setItem(this.localStorageHandle, JSON.stringify(this.allNotes));
        },

        // add a new note to the notelist and save it
        addNote : function ( note ) {
            this.allNotes.push( note );
            this.save();
        },

        // get all notes from LocalStorage
        getAllNotes : function () {
            return JSON.parse( localStorage.getItem('notes') ) || [];
        },

        // render list of all notes
        render : function () {
            var notes = this.allNotes;

            // clear note list
            $('.note-list').first().html( '' );

            // (re)populate with current notes in list
            for ( var i = 0; i < notes.length; i++) {
                var note = notes[i],
                    html = this.noteTmpl;

                html = html.replace(/\{id\}/g, note.id)
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.desc)
                    .replace(/\{due-date\}/, note['due-date'])
                    .replace(/\{done-date\}/, note['done-date'])
                    .replace(/\{importance\}/, note.importance);

            }
        },

        // sort notes
        sortNotes : function () {

        },

        // show/hide finished notes
        toggleFinishedNotes : function() {

        },

        // get new unused ID for a new note
        // => for now just use a timestamp
        getNewID : function () {
            return new Date().getTime().toString();
        // finds a particular note by its ID
        // returns a single note object
        findNote : function ( id ) {
            return $.grep( this.allNotes, function(note, index){
                    return (note.id === id) ? true : false;
                })[0];
        },
        }
    };

    // Handles all functions for a single note
    var Note = {

        allNotes : Notelist.getAllNotes(),

        // attach event handlers
        init : function (){
            var me = this; // save a reference to the Note object in var me

            if ( window.location.hash.match(/new/) ) {
                this.createNote();
            } else {
                this.populateNote(
                    this.getNote( window.location.hash.split('#')[1] )
                );
            }

            // event handler
            document.getElementById('btn_save').addEventListener('click', function(){
                me.saveNote.apply(me, arguments);
            });
            document.getElementById('btn_cancel').addEventListener('click', function(){
                window.location.href = 'index.html';
            });

        },

        // create new note
        createNote : function () {
            document.getElementById('NoteId').value = Notelist.getNewID();
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

        populateNote : function( note ) {
            document.getElementById("NoteId").value = note.id;
            document.getElementById("title").value = note.title;
            document.getElementById("desc").value = note.desc;
            document.getElementById("importance").value = note.importance;
            document.getElementById("due-date").value = note['due-date'];
        },

        // save note to localStorage
        saveNote : function () {
            var allNotes = this.allNotes;
            var note = {
                'id' : document.getElementById("NoteId").value,
                'title' : document.getElementById("title").value,
                'desc' : document.getElementById("desc").value,
                'importance' : document.getElementById("importance").value,
                'due-date' : document.getElementById("due-date").value,
                'done-date' : ''
            };
            allNotes.push(note);
            localStorage.setItem("notes", JSON.stringify(allNotes));

            // navigate to notes list
            window.location.href = 'index.html';
        }
    };

            // navigate to notes list
            window.location.href = 'index.html';
        }
    };

    // init onready
    $(function(){
        Notelist.init();
    });
})(jQuery, document, window);

