;(function($, document, window, moment, undefined){
    // namespacing
    var ns = window.eznotes = window.eznotes || {};

    ns.Data = (function(){
        var localStorageHandle_Data = 'notes-data',
            localStorageHandle_Settings = 'notes-settings',
            defaultSettings = {
                sortBy : 'createdDate', // [dueDate, createdDate, modifiedDate, importance]
                sortOrder : 'desc', // [asc, desc]
                showFinished : false,
                expanded : []
            },
            savedProperties = ['id','title','description','dueDate','importance','doneDate','createdDate','modifiedDate'];

        // load settings
        var loadSettings = function() {
            return $.extend(
                {},
                defaultSettings,
                JSON.parse( localStorage.getItem( localStorageHandle_Settings ) ) || {}
            );
        };

        // save settings
        var saveSettings = function(settings) {
            localStorage.setItem( localStorageHandle_Settings, JSON.stringify(settings) );
        };

        var loadNotes = function(){
            var notes = [];
            // push notelist to server
/*            $.ajax({
                dataType:  "json",
                method: "GET",
                url: "/notes/all"
            }).done(function( msg ) {
                if (msg.length > 0) {
                    notes = JSON.parse(msg);
                    if (notes != []) {
                        console.log(JSON.stringify(msg));
                        // Create a Note object for each note
                        for (var i = 0, l = notes.length; i < l; i++) {
                            notes[i] = new ns.Note(notes[i], ns.Notelist);
                        }
                    }
                } else {
                    console.log("no notes in db");
                }
            }).fail(function( msg ) {
                console.log (JSON.stringify(msg));
            });
*/
            // todo callback function
            return notes || [];
        };

        var saveNotes = function(notes){
            //var allNotes = (notes) ? JSON.stringify(notes) : ns.Notelist.getAllNotes();
            // todo ev. each
            var allNotes = JSON.stringify(notes, ["id", "createdDate", "description", "doneDate", "dueDate", "importance", "modifiedDate", "title"]);
            console.log("notes: "+ notes);
            console.log("allNotes: " + allNotes);
            // push notelist to server
            $.ajax({
                dataType:  "json",
                method: "POST",
                url: "/notes/save",
                data: allNotes,
                contentType: "application/json"
            }).done(function( msg ) {
                console.log (JSON.stringify(msg));
            }).fail(function( msg ) {
                console.log (JSON.stringify(msg));
            });

        };

        return {
            loadSettings : loadSettings,
            saveSettings : saveSettings,
            loadNotes : loadNotes,
            saveNotes : saveNotes
        };
    })();

})(jQuery, document, window, moment);