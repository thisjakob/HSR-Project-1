;(function($, document, window, undefined){

    /*
     * App module
     * Handles all view related stuff like initialization, event handler, etc.
     * Private properties and functions are prefixed with an underscore
     * Public functions are not prefixed
     */
    var App = (function(){

        /*
         * private properties
         */
        var _localStorageHandlePrefix = 'notes_',
            _localStorageHandle_Settings = 'settings',
            _localStorageHandle_Data = 'data',
            _defaultSettings = {
                sortBy : 'dueDate',
                sortOrder : 'asce',
                showFinished : false
            },
            _settings = {};

        /*
         * initialization
         */
        var init = function(){
            if ( window.location.href.match(/note\.html/) ) {
                var note;
                if ( window.location.hash.match(/new/) ) {
                    note = new Note();
                } else {
                    var n = _loadNote( window.location.hash.split('#')[1] );
                    note = new Note(n.id, n.title, n.description, n.dueDate, n.importance, n.doneDate, n.created, n.lastModified );
                }
                note.populate();

                console.log(note);
            } else {
                _loadSettings();
                _saveSettings();
                console.log(_settings);
                Notelist.init();
            }
        };

        var _loadSettings = function(){
            var key = _localStorageHandlePrefix + _localStorageHandle_Settings;
            _settings = $.extend(
                {},
                _defaultSettings,
                _load( key )
            );
        };

        var _saveSettings = function(){
            var key = _localStorageHandlePrefix + _localStorageHandle_Settings;
            _save( key, _settings );
        };

        var _load = function ( key ) {
            return JSON.parse( localStorage.getItem( key ) );
        };

        var _save = function ( key, data ) {
            localStorage.setItem( key, JSON.stringify( data ) );
        };

        var createNoteId = function () {
            return new Date().getTime().toString();
        };

        var leftpad = function ( num ) {
            return ('0' + num).slice(-2);
        };

        /*
         * return public methods
         */
        return {
            init : init,
            createNoteId : createNoteId,
            leftpad : leftpad
        };

    })();

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

        // Getter for the private property "noteTmpl"
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

                html = html.replace(/\{id\}/g, note.id)
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.desc)
                    .replace(/\{due-date\}/, note['due-date'])
                    .replace(/\{done-date\}/, note['done-date'])
                    .replace(/\{importance\}/, note.importance);

                list.append( html );
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
            if ($(this).is(':checked')) {
                // todo new done date
                var date = new Date();
                var id = this.closest('li').id;
                console.log("Finished note with id " + id + " at " + date);
                //Notelist.findNote(this.closest('li').id)['done-date'] = new Date();
                //Notelist.save();

                // set note to done
                $(this).closest('li').addClass('done');
            } else {
                //Notelist.findNote(this.closest('li').id)['done-date'] = "";
                //Notelist.save();
                // delete done from note
                $(this).closest('li').removeClass('done');
            }
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


    function Note ( id, title, desc, dueDate, importance, doneDate, created, modified) {
        var now = new Date().getTime();

        this.id = id || App.createNoteId();
        this.title = title || '';
        this.description = desc || '';
        this.dueDate = dueDate || now;
        this.importance = importance || 'normal';
        this.doneDate = doneDate || null;
        this.created = created || now;
        this.lastModified = modified || now;
    };

    Note.prototype.finish = function() {
        this.doneDate = new Date().getTime();
    };

    Note.prototype.populate = function() {
        var dueDate = new Date(this.dueDate);

        $("#NoteId").val( this.id );
        $("#title").val( this.title );
        $("#desc").val( this.description );
        $("#importance").val( this.importance);
        $("#due-date").val( dueDate.getFullYear() + '-' + App.leftpad( dueDate.getMonth()+1 ) + '-' + App.leftpad( dueDate.getDate() ) );
    };


    /*
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
    */

    // init onready
    $(function(){
        App.init();
    });
})(jQuery, document, window);

