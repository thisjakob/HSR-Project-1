;(function($, document, window, moment, undefined){
    // namespacing
    var ns = window.eznotes = window.eznotes || {};

    ns.Data = (function(){
        var localStorageHandle_Settings = 'notes-settings',
            defaultSettings = {
                sortBy : 'createdDate', // [dueDate, createdDate, modifiedDate, importance]
                sortOrder : 'desc', // [asc, desc]
                showFinished : false,
                expanded : [],
                skin : 'skin-light'
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

        //load notes from server
        var loadNotes = function(callback){
            var notes = [];
            // push notelist to server
            $.ajax({
                dataType:  "json",
                method: "GET",
                url: "/notes/all",
                async: true
            }).done(function( msg ) {
                if (msg.length > 0) {
                    notes = JSON.parse(msg);
                    if (notes != []) {
                        callback(notes);
                    }
                } else {
                    console.log("no notes in db");
                }
            }).fail(function( msg ) {
                console.error (JSON.stringify(msg));
            });
        };

        // save notes on server
        var saveNotes = function(notes){
            var allNotes = JSON.stringify(notes, ["id", "createdDate", "description", "doneDate", "dueDate", "importance", "modifiedDate", "title"]);

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
                console.error (JSON.stringify(msg));
            });

        };

        // public interface
        return {
            loadSettings : loadSettings,
            saveSettings : saveSettings,
            loadNotes : loadNotes,
            saveNotes : saveNotes
        };
    })();

})(jQuery, document, window, moment);