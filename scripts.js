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
                this.create();
            } else {
                this.populate();
            }

            // event handler
            $('#btn_save').on('click', function(){
                me.save.apply(me, arguments);
            });
            $('#btn_cancel').on('click', function(){
                window.location.href = 'index.html';
            });

        },

        // create new note
        // just generate a new ID and write it to the document
        create : function () {
            $('#NoteId').val( Notelist.getNewID() );
        },

        // populate the detail view of a single note with values
        populate : function( ) {
            var note = Notelist.findNote( window.location.hash.split('#')[1] );
            $("#NoteId").val( note.id );
            $("#title").val( note.title );
            $("#desc").val( note.desc );
            $("#importance").val( note.importance);
            $("#due-date").val( note['due-date'] );
        },

        // save note to localStorage
        save : function () {
            var note = {
                'id' : $("#NoteId").val(),
                'title' : $("#title").val(),
                'desc' : $("#desc").val(),
                'importance' : $("#importance").val(),
                'due-date' : $("#due-date").val(),
                'done-date' : ''
            };

            Notelist.addNote( note );

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

