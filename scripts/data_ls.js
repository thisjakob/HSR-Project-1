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
                collapsed : false
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
            var notes = JSON.parse( localStorage.getItem( localStorageHandle_Data ) ) || [];

            if ( notes ) {
                // Create a Note object for each note
                for ( var i = 0, l = notes.length; i < l; i++) {
                    notes[i] = new ns.Note( notes[i], ns.Notelist );
                }
            }

            return notes || [];
        };

        var saveNotes = function(notes){
            var allNotes = (notes) ? notes : ns.Notelist.getAllNotes();
            localStorage.setItem(localStorageHandle_Data, JSON.stringify(allNotes, savedProperties));
        };

        return {
            loadSettings : loadSettings,
            saveSettings : saveSettings,
            loadNotes : loadNotes,
            saveNotes : saveNotes
        };
    })();

})(jQuery, document, window, moment);