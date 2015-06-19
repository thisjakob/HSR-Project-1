;(function($, window, document, moment, undefined){
    // namespacing
    var ns = window.eznotes = window.eznotes || {};

    /*
     * Note object
     * Trying to bring an object oriented note in here :-)
     *
     * - properties: all the properties for this note
     * - list: reference to the note list containing this note
     */
    ns.Note = function ( properties, list ) {
        var now = moment().valueOf();

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

    ns.Note.prototype.save = function() {
        var l = this.list,
            i = l.indexOfNote( this.id),
            notes = l.getAllNotes();

        ( i < 0 ) ? notes.push( this ) : notes[ i ] = this;

        l.save(notes);
    };

    ns.Note.prototype.populate = function() {
        $("#NoteId").val( this.id );
        $("#title").val( this.title );
        $("#desc").val( this.description );
        $("#importance").val( this.importance);
        $("#dueDate").val( this.dueDate );
    };

    ns.Note.prototype.finish = function() {
        this.doneDate = moment().valueOf();
    };

    ns.Note.prototype.delete = function() {
        var l = this.list;
        var notes = l.getAllNotes();

        for ( var i = 0, len = notes.length; i < len; i++ ) {
            if ( notes[i].id === this.id ) {
                notes.splice(i, 1)[0];
                break;
            }
        }

        l.save(notes);
        l.render();
    };

    ns.Note.prototype.update = function ( ) {
        var l = this.list;
        var notes = l.getAllNotes();

        for ( var i = 0, len = notes.length; i < len; i++ ) {
            if ( notes[i].id === this.id ) {
                notes[i] = this;
                break;
            }
        }

        l.save(notes);
    };

    ns.Note.prototype.finish = function ( reverse ) {
        this.doneDate = ( reverse ) ? '' : moment().valueOf();
        this.update();
        this.list.render();
    };
})(jQuery, window, document, moment);

