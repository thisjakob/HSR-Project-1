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
            },
            dateFormat = {
                short : 'YYYY-MM-DD',
                full : 'YYYY-MM-DD HH:mm:ss'
            };

        //####################
        // private methods
        //####################

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
            var skins = $('.style-switch option');

            // remove not selected body style classes
            skins.each(function(i, style){
                $('body').removeClass( style.value );
            });

            // set body style class
            var newSkin = skins.filter(':selected').val();
            $('body').addClass( newSkin );
            updateSettings( {skin : newSkin} );
        };

        // sort notes by the given property
        var sort = function ( sortBy, sortOrder ) {
            allNotes.sort(function(a,b){
                var aVal = a[sortBy],
                    bVal = b[sortBy];

                if ( sortBy === 'title' ) {
                    aVal = a[sortBy].toLowerCase();
                    bVal = b[sortBy].toLowerCase();
                }

                if ( sortBy === 'dueDate') {
                    // this makes sure that empty due dates show at the bottom of the list
                    // when the list is sorted by due date.
                    aVal = (a[sortBy]) ? a[sortBy] : '9999-12-12';
                    bVal = (b[sortBy]) ? b[sortBy] : '9999-12-12';
                }

                if ( sortOrder === 'desc' ) {
                    return ( aVal > bVal ) ? 1 : ( aVal < bVal ) ? -1 : 0;
                } else {
                    return ( bVal > aVal ) ? 1 : ( bVal < aVal ) ? -1 : 0;
                }
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
            var el = $(this).toggleClass('show hide');
            $('.note-list').toggleClass('showFinished hideFinished');
            updateSettings( {showFinished : el.hasClass('show')} );
        };

        // finds a particular note by its ID
        // returns a single note object
        var findNote = function ( id ) {
            var notes = publicGetAllNotes();
            return $.grep( notes, function(note, index){
                return (note.id === id);
            })[0];
        };

        var filter = function(term) {
            var filteredNotes = allNotes.filter(function(note){
                var pattern = new RegExp(term, 'i');
                return ( pattern.test( note.title ) ) ? true : pattern.test( note.description );
            });

            var noteIds = $.map( filteredNotes, function(n, i){ return n.id;} );
            $('.note-list').addClass('search');
            $.each(noteIds, function(i, id){
                $('#' + id).addClass('found');
            });
        };

        var clearFilter = function(){
            $('.note-list').removeClass('search');
            $('.note-list li').removeClass('found');
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
                    .replace(/\{expanded\}/, ( settings.expanded.filter(function(val){return val === note.id}).length ) ? 'expanded' : '' )
                    .replace(/\{note-title\}/, note.title)
                    .replace(/\{description\}/, note.description.replace(/\n/g,'<br>'))
                    .replace(/\{dueDate\}/, (note.dueDate === '') ? '' : moment(note.dueDate).fromNow() )
                    .replace(/\{dueDate-full\}/g, (note.dueDate === '') ? '' : moment(note.dueDate).format( dateFormat.short ) )
                    .replace(/\{distance\}/, note.distanceToDueDate() )
                    .replace(/\{doneDate-full\}/g, (note.doneDate === '') ? '' : moment(note.doneDate).format( dateFormat.full ) )
                    .replace(/\{doneDate\}/, (note.doneDate === '') ? '' : moment(note.doneDate).fromNow() )
                    .replace(/\{createdDate-full\}/g, moment(note.createdDate).format( dateFormat.full ) )
                    .replace(/\{createdDate\}/, moment(note.createdDate).fromNow() )
                    .replace(/\{modifiedDate-full\}/g, moment(note.modifiedDate).format( dateFormat.full ) )
                    .replace(/\{modifiedDate\}/, moment(note.modifiedDate).fromNow() )
                    .replace(/\{importance\}/g, importance[note.importance].toLowerCase() )
                    .replace(/\{done\}/, (note.doneDate) ? 'done' : '');

                list.append( html );
            }

            // initial state of show / hide finished notes
            list.find('li.done .done').prop('checked', true);

            $('#filter-finished')
                .toggleClass('show', settings.showFinished)
                .toggleClass('hide', !settings.showFinished);

            list.toggleClass( 'showFinished', settings.showFinished)
                .toggleClass( 'hideFinished', !settings.showFinished);
        };


        //####################
        // public methods
        //####################

        // attach event handlers
        var publicInit = function () {
            var me = this;
            var lastDeletedNote = {};

            // show notes in a list or if edit show one note with id
            var showNotes = function(notes) {
                // Create a Note object for each note
                for (var i = 0, l = notes.length; i < l; i++) {
                    allNotes[i] = new ns.Note(notes[i], ns.Notelist);
                }

                // show note/s
                if ( window.location.href.match(/note\.html/) ) {
                    if (!window.location.hash.match(/new/)) {
                        me.note = findNote(window.location.hash.split('#')[1]);
                        me.note.populate();
                    }
                } else {
                    sort( settings.sortBy, settings.sortOrder );
                    render();
                }
            };

            // read note attributs and save it in note object
            var setNote = function(){
                if ( window.location.hash.match(/new/) ) {
                    note.title = $('#title').val();
                    note.description = $('#desc').val();
                    note.importance = parseInt( $('#importance').val() );
                    note.dueDate = $('#dueDate').val();
                    note.save();
                } else {
                    me.note.title = $('#title').val();
                    me.note.description = $('#desc').val();
                    me.note.importance = $('#importance').val();
                    me.note.dueDate = $('#dueDate').val();
                    me.note.save();
                }
                window.location.href = '../../notelist.html';
            };

            // delete note
            var deletNote = function(){
                me.delete.apply(me, arguments);
            };

            settings = ns.Data.loadSettings();
            ns.Data.loadNotes( showNotes );

            if ( window.location.href.match(/note\.html/) ){
                var note;

                $('body').addClass(settings.skin);

                $('#title').focus();

                $('#importance option').each(function(index, el){
                    $(el).text(importance[index+1]);
                });

                if ( window.location.hash.match(/new/) ) {
                    note = new ns.Note( {}, this);
                    $('#btn_delete').remove();
                    note.populate();
                }

                // event handler
                $('#btn_save').on('click', setNote);
                $('#btn_cancel').on('click', function(){
                    window.location.href = '../../notelist.html';
                });
                $('#btn_delete').on('click', function(){
                    me.delete.apply(me, arguments);
                });

            } else {
                // select default skin
                $('.style-switch [name="' + settings.skin + '"]').prop('selected',true);
                switchStyle();

                // default sorting
                var el = $('a[href*="' + settings.sortBy + '"]');
                el.addClass('current');
                el.removeClass('desc asc')
                    .addClass(settings.sortOrder);

                // render list
                loadNoteTmpl();
                render();

                // click handler for all delete links
                var list = $('.note-list').on('click','.delete',function(e){
                    lastDeletedNote = findNote( $(this).parents('li').remove().attr('id') );
                    lastDeletedNote.delete();
                    // undo button
                    $('.btn.undo-delete').show();
                });

                // click handler for undo button
                $('.btn.undo-delete').on('click', function() {
                    $('.btn.undo-delete').hide();
                    lastDeletedNote.save();
                    render();
                });

                // change handler for input finished
                list.on('change', 'input.done', function(e){
                    var el = $(this);
                    var note = findNote(
                        el.parents('li').toggleClass('done').attr('id')
                    );
                    ( el.is(':checked') ) ? note.finish() : note.finish( true );
                });

                // click handler for sort button
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
                    el.removeClass('desc asc').addClass(settings.sortOrder);

                    render();
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

                // expand / collapse note details
                list.on('click', 'h2', function(e){
                    $(this).parents('li').toggleClass('expanded');
                    updateSettings( {expanded : $.map( $("li.expanded"), function(n, i){ return n.id;} )} );
                });

                // handle events on the search input field
                var searchField = $('#search')
                    // hide label on focus
                    .on('focus', function(e){
                        $(this).siblings('span').hide().siblings('a').show();
                    })
                    // show label if focus is gone and input field is empty
                    .on('blur',function(e){
                        if ( $(this).val() === '' ) {
                            $(this).siblings('span').show().siblings('a').hide();
                        }
                    })
                    // free text search for a note
                    .on('keyup', function(e){
                        var term = $(this).val();
                        clearFilter();
                        if ( term.length > 0 ) {
                            filter( term );
                        }
                    });

                // clear search field
                searchField.parent().find('.clear').on('click', function(e){
                        e.preventDefault();
                        clearFilter();
                        $(this)
                            .hide()
                            .siblings('input').val('').blur();
                    })
            }
        };

        // update the done date for the given note
        var publicRenderDate = function(note, date){
            $('#' + note.id + ' .' + date + ' time')
                .text(moment(note[date]).fromNow())
                .attr('datetime', moment(note[date]).format(dateFormat.full))
                .attr('title', moment(note[date]).format(dateFormat.full));
        };

        // get new unused ID for a new note
        // => for now just use a timestamp
        var publicGetNewID = function () {
            return moment().valueOf().toString();
        };

        // get an array with all notes
        var publicGetAllNotes = function () {
            return allNotes;
        };

        var publicSave = function(notes) {
            ns.Data.saveNotes(notes);
        };

        // get index of a note by its ID
        var publicIndexOfNote = function ( id ) {
            for ( var i = 0, l = allNotes.length; i < l; i++ ) {
                if ( allNotes[i].id === id ) {
                    return i;
                }
            }

            return -1; // not found
        };

        return {
            init : publicInit,
            getNewID : publicGetNewID,
            getAllNotes : publicGetAllNotes,
            indexOfNote : publicIndexOfNote,
            save : publicSave,
            renderDate : publicRenderDate
        };
    })();

    // init onready
    $(function(){
        ns.Notelist.init();
    });
})(jQuery, document, window, moment);

