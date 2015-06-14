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
            settings = {},
            importance = {
                1 : "High",
                2 : "Medium",
                3 : "Low"
            },
            savedProperties = ['id','title','description','dueDate','importance','doneDate','createdDate','modifiedDate'];

        // attach event handlers
        var init = function () {
            loadSettings();
            allNotes = loadNotes();
            sort( settings.sortBy, settings.sortOrder );


            if ( window.location.href.match(/note\.html/) ){
                var note;

                $('#importance option').each(function(index, element){
                    $(element).text(importance[index+1]);
                });

                if ( window.location.hash.match(/new/) ) {
                    note = new Note( {}, Notelist);
                    $('#btn_delete').remove();
                } else {
                    note = findNote( window.location.hash.split('#')[1]) ;
                }
                note.populate();

                // event handler
                $('#btn_save').on('click', function(){
                    note.title = $('#title').val();
                    note.description = $('#desc').val();
                    note.importance = $('#importance').val();
                    note.dueDate = $('#dueDate').val();
                    note.save();
                    window.location.href = 'index.html';
                });
                $('#btn_cancel').on('click', function(){
                    window.location.href = 'index.html';
                });
                $('#btn_delete').on('click', function(){
                    me.delete.apply(me, arguments);
                });

            } else {
                var me = this;

                loadNoteTmpl();
                render();

                var list = $('.note-list');
                // click handler for all delete links
                list.on('click','.delete',function(e){
                    me.findNote( $(this).parents('li').attr('id') ).delete();
                });

                // change handler for input finished
                list.on('change', 'input.done', function(e){
                    var el = $(this);
                    var note = me.findNote(
                        el.parents('li').toggleClass('done').attr('id')
                    );
                    ( el.is(':checked') ) ? note.finish() : note.finish( true );
                });

                // click handler for created date sort button
                $('a.btn.sort').on('click', function(e){
                    e.preventDefault();
                    var sortBy = this.href.split('#')[1];
                    var newSortOrder = (settings.sortOrder === 'desc') ? 'asc' : 'desc';
                    sort.call(me, sortBy, newSortOrder);
                    updateSettings({
                        sortBy : sortBy,
                        sortOrder : newSortOrder
                    });
                    saveSettings();

                    me.render();
                });

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
        var updateSettings = function ( newSettings ) {
            $.extend( settings, newSettings );
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
            localStorage.setItem(localStorageHandle_Data, JSON.stringify(allNotes, savedProperties));
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
            var notes = JSON.parse( localStorage.getItem( localStorageHandle_Data ) ) || [];

            if ( notes ) {
                // Create a Note object for each note
                for ( var i = 0, l = notes.length; i < l; i++) {
                    notes[i] = new Note( notes[i], Notelist );
                }
            }

            return notes || [];
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

        // show/hide finished notes
        var toggleFinishedNotes = function() {
            if ($(this).hasClass('hide'))
            {
                // show finished
                $('.note-list').removeClass('hideFinishedNotes');
                $(this).removeClass('hide').text(finished_btn.hide);
                updateSettings( {showFinished : true} );
            }
            else
            {
                // hide finished
                $('.note-list').addClass('hideFinishedNotes');
                $(this).addClass('hide').text(finished_btn.show);
                updateSettings( {showFinished : false} );
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

        var indexOfNote = function ( id ) {
            for ( var i = 0, l = allNotes.length; i < l; i++ ) {
                if ( allNotes[i].id === id ) {
                    return i;
                }
            }

            return -1; // not found
        };

        var getAllNotes = function () {
            return allNotes;
        };

        return {
            init : init,
            getNewID : getNewID,
            getAllNotes : getAllNotes,
            getNoteTmpl : getNoteTmpl,
            findNote : findNote,
            addNote : addNote,
            updateNote : updateNote,
            indexOfNote : indexOfNote,
            render : render,
            save : save
        };
    })();

    /*
     * Note object
     * Trying to bring an object oriented note in here :-)
     *
     * - properties: all the properties for this note
     * - list: reference to the note list containing this note
     */
    function Note ( properties, list ) {
        var now = new Date().getTime();

        this.list = list;

        // default values
        this.id = list.getNewID();
        this.title = '';
        this.description = '';
        this.dueDate = now;
        this.importance = 2;
        this.doneDate = '';
        this.createdDate = now;
        this.modifiedDate = now;

        // merge with given properties
        $.extend( this, properties );
    };

    Note.prototype.save = function() {
        var l = this.list,
            i = l.indexOfNote( this.id),
            notes = l.getAllNotes();

        ( i < 0 ) ? notes.push( this ) : notes[ i ] = this;

        l.save();
    };

    Note.prototype.populate = function() {
        var dueDate = new Date(this.dueDate);

        $("#NoteId").val( this.id );
        $("#title").val( this.title );
        $("#desc").val( this.description );
        $("#importance").val( this.importance);
        $("#due-date").val( this.dueDate );
    };

    Note.prototype.finish = function() {
        this.doneDate = new Date().getTime();
    };

    Note.prototype.delete = function() {
        var l = this.list;
        var notes = l.getAllNotes();

        for ( var i = 0, len = notes.length; i < len; i++ ) {
            if ( notes[i].id === this.id ) {
                notes.splice(i, 1)[0];
                break;
            }
        }

        l.save();
        l.render();
    };

    Note.prototype.update = function ( ) {
        var l = this.list;
        var notes = l.getAllNotes();

        for ( var i = 0, len = notes.length; i < len; i++ ) {
            if ( notes[i].id === this.id ) {
                notes[i] = this;
                break;
            }
        }

        l.save();
    };

    Note.prototype.finish = function ( reverse ) {
        this.doneDate = ( reverse ) ? '' : new Date().getTime();
        this.update();
        this.list.render();
    };

    // init onready
    $(function(){
        Notelist.init();
    });
})(jQuery, document, window);

