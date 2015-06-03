(function($, document, window){

    // Application object. Handles all overall functions
    var Notelist = {

        localStorageHandle : 'notes',
        allNotes : null,
        noteTmpl : null,
        finished_btn : {
            show : "Show finished",
            hide : "Hide finished"
        },

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

                // click handler for all delete links
                list.on('click','.delete',function(){
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
                $('input.done').on('change', me.finishNote);

                // click handler for filter finished
                $('#filter-finished').on('click', me.toggleFinishedNotes);

                // change handler for style switcher
                $('.style-switch').on('change', me.switchStyle);
            }
        },

        // switch skin
        switchStyle : function () {
            // remove not selected body style classes
            $(".style-switch option:not(:selected)").each(function(i, val){
                $('body').removeClass(val.value);
            });
            // set body style class
            $('body').addClass($(".style-switch option:selected").val());
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

                $('.note-list').first().append( html );
            }
        },

        // sort notes
        sort : function () {
            this.allNotes.sort(function(a,b){
                return a.created < b.created;
            });
        },

        // finish note
        finishNote : function ( note ) {
            if ($(this).is(':checked')) {
                // todo new done date
                var date = Date();
                console.log("Finished at " + date);

                // disable edit
                $(this).closest('li').find('a.edit').addClass('disableClick');

                // show or hide note depend on filter finished
                if ($('#filter-finished').hasClass('hide')) {
                    $(this).closest('li').hide(); // todo addClass('done')
                }
            } else {
                // note is editable again
                $(this).closest('li').find('a.edit').removeClass('disableClick');
            }
        },

        // show/hide finished notes
        toggleFinishedNotes : function() {
            if ($(this).hasClass('hide'))
            {
                // show finished
                $('input.done:checked').closest('li').show(); // todo $('ul').removeClass('hideFinishedNotes')
                $(this).removeClass('hide').text(Notelist.finished_btn.hide);
            }
            else
            {
                // hide finished
                $('input.done:checked').closest('li').hide();// todo $('ul').addClass('hideFinishedNotes')
                $(this).addClass('hide').text(Notelist.finished_btn.show);
            };
        },

        // get new unused ID for a new note
        // => for now just use a timestamp
        getNewID : function () {
            return new Date().getTime().toString();
        },

        // finds a particular note by its ID
        // returns a single note object
        findNote : function ( id ) {
            return $.grep( this.allNotes, function(note, index){
                    return (note.id === id) ? true : false;
                })[0];
        },

        // remove a note from allNotes and save the new list to localStorage
        deleteNote : function ( id ) {
            var notes = this.allNotes;

            for ( var i = 0; i < notes.length; i++ ) {
                if ( notes[i].id === id ) {
                    notes.splice(i, 1)[0];
                    break;
                }
            }

            this.save();
        }
    };

    // Handles all functions for a single note
    var Note = {

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

            Notelist.addNote( note );

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

