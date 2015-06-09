;(function($, document, window, undefined){

    // Application object. Handles all overall
    // Using the Revealing Module Pattern
    var Notelist = (function(){

        var localStorageHandle = 'notes',
            allNotes = [],
            noteTmpl = '',
            finished_btn = {
                show : "Show finished",
                hide : "Hide finished"
            };

        // attach event handlers
        var init = function () {
            console.log('init Notelist');
            console.log(this);

            allNotes = loadNotes();

            if ( window.location.href.match(/note\.html/) ){
                Note.init();
            } else {
                var me = this;

                loadSettings();
                loadNoteTmpl();
                render();

                // click handler for all delete links
                $('.note-list').first().on('click','.delete',function(){
                    me.deleteNote.call(me, $(this).parents('li').attr('id') );
                    me.render();
                });

                // click handler for created date sort button
                $('#sort-create-date').on('click', function(e){
                    e.preventDefault();
                    me.sort.call(me);
                    me.render();
                });

                // change handler for input finished
                $('input.done').on('change', finishNote);

                // click handler for filter finished
                $('#filter-finished').on('click', toggleFinishedNotes);

                // change handler for style switcher
                $('.style-switch').on('change', switchStyle);
            }
        };

        // the template for each not is part of index.html
        // find the template in the html code, save it and remove the template
        // code from the html markup.
        var loadNoteTmpl = function(){
            var list = $('.note-list').first();
            noteTmpl = list.html();
            list.removeClass('hidden').html('');
        };

        // Getter for the private propery "noteTmpl"
        var getNoteTmpl = function(){
            return noteTmpl;
        };

        // load settings
        var loadSettings = function() {
            // todo load settings
            console.log("todo load settings");
        };

        // save settings
        var saveSettings = function() {
            // todo save settings
            console.log("todo save settings");
        };

        // switch skin
        var switchStyle = function () {
            // remove not selected body style classes
            $(".style-switch option:not(:selected)").each(function(i, val){
                $('body').removeClass(val.value);
            });
            // set body style class
            $('body').addClass($(".style-switch option:selected").val());
            saveSettings();
        };

        // save the entire notelist to localStorage
        var save = function() {
            localStorage.setItem(localStorageHandle, JSON.stringify(allNotes));
        };

        // add a new note to the notelist and save it
        var addNote = function ( note ) {
            allNotes.push( note );
            save();
        };

        var updateNote = function ( note ) {
            var notes = allNotes;

            for ( var i = 0; i < notes.length; i++ ) {
                if ( notes[i].id === note.id ) {
                    notes[i] = note;
                    break;
                }
            }

            save();
        };

        // get all notes from LocalStorage
        var loadNotes = function () {
            return JSON.parse( localStorage.getItem('notes') ) || [];
        };

        // render list of all notes
        var render = function () {
            var notes = allNotes,
                list = $('.note-list').first();

            // clear note list
            list.html( '' );

            // (re)populate with current notes in list
            for ( var i = 0; i < notes.length; i++) {
                var note = notes[i],
                    html = getNoteTmpl();

                var classdone = "";
                if (note['done-date'] !== "") {
                    classdone = "done";
                }

                html = html.replace(/\{id\}/g, note.id)
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.desc)
                    .replace(/\{due-date\}/, note['due-date'])
                    .replace(/\{done-date\}/, note['done-date'])
                    .replace(/\{importance\}/, note.importance)
                    .replace(/\{done\}/, classdone);

                list.append( html );
                if (classdone === "done") {
                    $("#" + note.id + " input")[0].checked = true;
                }
            }
        };

        // sort notes
        var sort = function () {
            allNotes.sort(function(a,b){
                return a.created < b.created;
            });
        };

        // finish note
        var finishNote = function () {
            var note = findNote(this.closest('li').id);

            if ($(this).is(':checked')) {
                // set note to done
                var date = new Date();
                note['done-date'] = date.toISOString().substring(0,10);
                $(this).closest('li').addClass('done');
            } else {
                // delete done from note
                note['done-date'] = "";
                $(this).parent().find('span').innerHTMLs = "";
                $(this).closest('li').removeClass('done');
            }
            updateNote(note);
            render();
        };

        // show/hide finished notes
        var toggleFinishedNotes = function() {
            if ($(this).hasClass('hide'))
            {
                // show finished
                $('.note-list').removeClass('hideFinishedNotes');
                $(this).removeClass('hide').text(finished_btn.hide);
            }
            else
            {
                // hide finished
                $('.note-list').addClass('hideFinishedNotes');
                $(this).addClass('hide').text(finished_btn.show);
            }
            saveSettings();
        };

        // get new unused ID for a new note
        // => for now just use a timestamp
        var getNewID =function () {
            return new Date().getTime().toString();
        };

        // finds a particular note by its ID
        // returns a single note object
        var findNote = function ( id ) {
            return $.grep( allNotes, function(note, index){
                    return (note.id === id);
                })[0];
        };

        // remove a note from allNotes and save the new list to localStorage
        var deleteNote = function ( id ) {
            var notes = allNotes;

            for ( var i = 0; i < notes.length; i++ ) {
                if ( notes[i].id === id ) {
                    notes.splice(i, 1)[0];
                    break;
                }
            }

            save();
        };

        return {
            getNoteTmpl : getNoteTmpl,
            init : init,
            getNewId : getNewID,
            findNote : findNote,
            addNote : addNote,
            updateNote : updateNote,
            deleteNote : deleteNote,
            render : render,
            loadSettings : loadSettings,
            getNewID : getNewID
        };
    })();

    // Handles all functions for a single note
    var Note = {

        isNewNote : true,

        // attach event handlers
        init : function (){
            var me = this; // save a reference to the Note object in var me

            if ( window.location.hash.match(/new/) ) {
                this.create();
            } else {
                this.isNewNote = false;
                this.populate();
            }

            // event handler
            $('#btn_save').on('click', function(){
                me.save.apply(me, arguments);
            });
            $('#btn_cancel').on('click', function(){
                window.location.href = 'index.html';
            });
            $('#btn_delete').on('click', function(){
                me.delete.apply(me, arguments);
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
                'created' : new Date().getTime(),
                'due-date' : $("#due-date").val(),
                'done-date' : ''
            };

            if ( this.isNewNote ) {
                Notelist.addNote( note );
            } else {
                Notelist.updateNote( note );
            }

            // navigate to notes list
            window.location.href = 'index.html';
        },

        // delete note from localStorage
        delete : function ( ) {
            Notelist.deleteNote( $("#NoteId").val() );

            // navigate to notes list
            window.location.href = 'index.html';
        }
    };

    // init onready
    $(function(){
        Notelist.init();
    });
})(jQuery, document, window);

