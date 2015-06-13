;(function($, document, window, undefined){

    // Application object. Handles all overall
    // Using the Revealing Module Pattern
    var Notelist = (function(){

        var localStorageHandle_Data = 'notes-data',
            localStorageHandle_Settings = 'notes-settings',
            allNotes = [],
            noteTmpl = '',
            finished_btn = {
                show : "Show finished",
                hide : "Hide finished"
            },
            defaultSettings = {
                sortBy : 'dueDate', // [dueDate, createdDate, modifiedDate, importance]
                sortOrder : 'asc', // [asc, desc]
                showFinished : false
            },
            settings = {};
            importance = {
                1 : "High",
                2 : "Medium",
                3 : "Low"
            };

        // attach event handlers
        var init = function () {
            console.log('init Notelist');
            console.log(this);

            loadSettings();
            allNotes = loadNotes();
            sort( settings.sortBy, settings.sortOrder );


            if ( window.location.href.match(/note\.html/) ){
                Note.init();
            } else {
                var me = this;

                loadNoteTmpl();
                render();

                // click handler for all delete links
                $('.note-list').first().on('click','.delete',function(){
                    me.deleteNote.call(me, $(this).parents('li').attr('id') );
                    me.render();
                });

                // click handler for created date sort button
                $('a.btn.sort').on('click', function(e){
                    e.preventDefault();
                    var sortBy = this.href.split('#')[1];
                    var newSortOrder = (settings.sortOrder === 'desc') ? 'asc' : 'desc';
                    sort.call(me, sortBy, newSortOrder);
                    updateSetting('sortBy', sortBy);
                    updateSetting('sortOrder', newSortOrder);
                    saveSettings();

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
            $.extend(
                settings,
                defaultSettings,
                JSON.parse( localStorage.getItem( localStorageHandle_Settings ) ) || {}
            );
        };

        // save settings
        var saveSettings = function() {
            localStorage.setItem( localStorageHandle_Settings, JSON.stringify(settings) );
        };

        // update one particular setting and save it
        var updateSetting = function ( setting, value ) {
            settings[ setting ] = value;
            saveSettings();
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
            localStorage.setItem(localStorageHandle_Data, JSON.stringify(allNotes));
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
            return JSON.parse( localStorage.getItem( localStorageHandle_Data ) ) || [];
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
                if (note.doneDate !== "") {
                    classdone = "done";
                }

                html = html.replace(/\{id\}/g, note.id)
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.description.replace(/\n/g,'<br>'))
                    .replace(/\{dueDate\}/, note.dueDate)
                    .replace(/\{doneDate\}/, note.doneDate)
                    .replace(/\{importance\}/, importance[note.importance])
                    .replace(/\{done\}/, classdone);

                list.append( html );

                if (classdone === "done") {
                    $("#" + note.id + " input")[0].checked = true;
                }
            }

            if ( !settings.showFinished ) {
                list.addClass( 'hideFinishedNotes' );
                $('#filter-finished').addClass('hide').text(finished_btn.show);
            } else {
                $('#filter-finished').removeClass('hide').text( finished_btn.hide );
            }
        };

        // sort notes by the given property
        var sort = function ( sortBy, sortOrder ) {
            allNotes.sort(function(a,b){
                return (sortOrder === 'desc') ? a[ sortBy ] > b[ sortBy ] : a[ sortBy ] < b[ sortBy ];
            });
        };

        // finish note
        var finishNote = function () {
            var note = findNote(this.closest('li').id);

            if ($(this).is(':checked')) {
                // set note to done
                var date = new Date();
                note.DoneDate = date.toISOString().substring(0,10);
                $(this).closest('li').addClass('done');
            } else {
                // delete done from note
                note.DoneDate = "";
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
                updateSetting('showFinished', true );
            }
            else
            {
                // hide finished
                $('.note-list').addClass('hideFinishedNotes');
                $(this).addClass('hide').text(finished_btn.show);
                updateSetting('showFinished', false);
            }

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

            // write text for options in drop down
            $("#importance option[value=1]").text(importance[1]);
            $("#importance option[value=2]").text(importance[2]);
            $("#importance option[value=3]").text(importance[3]);

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
            $("#desc").val( note.description );
            $("#importance").val( note.importance);
            $("#dueDate").val( note['dueDate'] );
        },

        // save note to localStorage
        save : function () {
            var note = {
                'id' : $("#NoteId").val(),
                'title' : $("#title").val(),
                'description' : $("#desc").val(),
                'importance' : $("#importance").val(),
                'modifiedDate' : new Date().getTime(),
                'dueDate' : $("#dueDate").val(),
                'doneDate' : ''
            };

            if ( this.isNewNote ) {
                note.createdDate = new Date().getTime();
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

