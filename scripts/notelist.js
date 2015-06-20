;(function($, document, window, moment, undefined){
    // namespacing
    var ns = window.eznotes = window.eznotes || {};

    // Application object. Handles all overall
    // Using the Revealing Module Pattern
    ns.Notelist = (function(){
        var allNotes = [],
            noteTmpl = '',
            settings = {},
            importance = {
                1 : "High",
                2 : "Medium",
                3 : "Low"
            };

        // attach event handlers
        var init = function () {
            var me = this;
            settings = ns.Data.loadSettings();
            allNotes = ns.Data.loadNotes();

            if ( window.location.href.match(/note\.html/) ){
                var note;

                $('#importance option').each(function(index, el){
                    $(el).text(importance[index+1]);
                });

                if ( window.location.hash.match(/new/) ) {
                    note = new ns.Note( {}, this);
                    $('#btn_delete').remove();
                } else {
                    note = this.findNote( window.location.hash.split('#')[1]) ;
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

                // default sorting
                sort( settings.sortBy, settings.sortOrder );
                var el = $('a[href*="' + settings.sortBy + '"]');
                el.addClass('current');
                el.find('span')
                    .removeClass('fa-sort-amount-desc fa-sort-amount-asc')
                    .addClass('fa-sort-amount-' + settings.sortOrder);

                // render list
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
                    var el = $(this);
                    var sortBy = el.attr('href').split('#')[1];
                    var newSortOrder = (settings.sortOrder === 'desc') ? 'asc' : 'desc';
                    sort.call(me, sortBy, newSortOrder);
                    updateSettings({
                        sortBy : sortBy,
                        sortOrder : newSortOrder
                    });

                    // update sort icon
                    el.siblings('a').removeClass('current');
                    el.addClass('current');
                    el.find('span')
                        .removeClass('fa-sort-amount-desc fa-sort-amount-asc')
                        .addClass('fa-sort-amount-' + settings.sortOrder);

                    me.render();
                });

                // click handler for collapse/expand all
                $('#expandAll').on('click', function(e){
                    e.preventDefault();
                    var icon = $(this).find('span').first(),
                        listItems = $('.note-list li');

                    if ( icon.prop('class').match(/plus/) ) {
                        icon.prop('class', icon.prop('class').replace(/plus/, 'minus') );
                        listItems.addClass('expanded');
                        updateSettings( {expanded : $.map( $("li.expanded"), function(n, i){ return n.id;} )} );
                    } else {
                        icon.prop('class', icon.prop('class').replace(/minus/, 'plus') );
                        listItems.removeClass('expanded');
                        updateSettings({expanded : []});
                    }
                });

                // click handler for filter finished
                $('#filter-finished').on('click', toggleFinishedNotes);

                // change handler for style switcher
                $('.style-switch').on('change', switchStyle);

                // collapse or expand all description and date
                $('#collapse-expand').on('click', toggleCollapseExpand);

                $('.note-list').on('click', 'h2', function(e){
                    $(this).parents('li').toggleClass('expanded');
                    updateSettings( {expanded : $.map( $("li.expanded"), function(n, i){ return n.id;} )} );
                });
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

        // update one or more particular setting(s) and save it
        var updateSettings = function ( newSettings ) {
            ns.Data.saveSettings( $.extend( settings, newSettings ) );
        };

        // switch skin
        var switchStyle = function () {
            // remove not selected body style classes
            $(".style-switch option:not(:selected)").each(function(i, val){
                $('body').removeClass(val.value);
            });
            // set body style class
            $('body').addClass($(".style-switch option:selected").val());
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
                    .replace(/\{expanded\}/, ( settings.expanded.filter(function(val){return val === note.id}).length ) ? 'expanded' : '' )
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.description.replace(/\n/g,'<br>'))
                    .replace(/\{dueDate\}/, (note.dueDate === '') ? '' : moment(note.dueDate).fromNow() )
                    .replace(/\{dueDate-full\}/, (note.dueDate === '') ? '' : moment(note.dueDate).format('YYYY-MM-DD') )
                    .replace(/\{distance\}/, note.distanceToDueDate() )
                    .replace(/\{doneDate\}/, (note.doneDate === '') ? '' : moment(note.doneDate).format('YYYY-MM-DD HH:mm:ss') )
                    .replace(/\{createdDate\}/, moment(note.createdDate).format('YYYY-MM-DD HH:mm:ss'))
                    .replace(/\{modifiedDate\}/, moment(note.modifiedDate).format('YYYY-MM-DD HH:mm:ss'))
                    .replace(/\{importance\}/g, importance[note.importance].toLowerCase() )
                    .replace(/\{done\}/, classdone);

                list.append( html );

                if (classdone === "done") {
                    $("#" + note.id + " input")[0].checked = true;
                }
            }

            if ( !settings.showFinished ) {
                list.addClass( 'hideFinishedNotes' );
            } else {
                $('#filter-finished span').removeClass('fa-square-o');
            }

            // todo settings for collapse/expand
        };

        // sort notes by the given property
        var sort = function ( sortBy, sortOrder ) {
            allNotes.sort(function(a,b){
                // this makes sure that empty due dates show at the bottom of the list
                // when the list is sorted by due date.
                var aVal = (sortBy === 'dueDate')? (a[sortBy]) ? a[sortBy] : '9999-12-12' : a[sortBy];
                var bVal = (sortBy === 'dueDate')? (b[sortBy]) ? b[sortBy] : '9999-12-12' : b[sortBy];

                return (sortOrder === 'desc') ? aVal < bVal : aVal > bVal;
            });

            // because importance is ordered by the numeric value (High = 1, Low = 3)
            // we need to reverse the order
            if ( sortBy === 'importance' ) {
                allNotes.reverse();
            }
        };

        // show/hide finished notes
        var toggleFinishedNotes = function(e) {
            e.preventDefault();
            var icon = $(this).find('span').toggleClass('fa-square-o');
            if ( icon.hasClass('fa-square-o') ) {
                // show finished
                $('.note-list').addClass('hideFinishedNotes');
                updateSettings( {showFinished : false} );
            } else {
                // hide finished
                $('.note-list').removeClass('hideFinishedNotes');
                updateSettings( {showFinished : true} );
            }
        };

        var toggleCollapseExpand = function (e) {
            var cmd = $(this).text();
            if ( cmd === "Collapse") {
                cmd = "Expand";
                updateSettings( { collapsed : false } );
            } else {
                cmd = "Collapse"
                updateSettings( { collapsed : true } );
            }
            $(this).contents().last()[0].textContent = cmd;
            $(this).find('span').removeClass('icon-collapse icon-expand').addClass('icon-' + cmd.toLowerCase());
            $('.note-desc').toggle();
            $('.createdDate').toggle();
        };

        // get new unused ID for a new note
        // => for now just use a timestamp
        var getNewID =function () {
            return moment().valueOf().toString();
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

        var save = function(notes) {
            ns.Data.saveNotes(notes);
        };

        return {
            init : init,
            getNewID : getNewID,
            getAllNotes : getAllNotes,
            getNoteTmpl : getNoteTmpl,
            findNote : findNote,
            indexOfNote : indexOfNote,
            render : render,
            save : save
        };
    })();

    // init onready
    $(function(){
        ns.Notelist.init();
    });
})(jQuery, document, window, moment);

