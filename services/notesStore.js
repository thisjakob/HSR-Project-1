var Datastore = require('nedb');
var db = new Datastore({ filename: './db/notes.db', autoload: true });
var fs = require('fs');
var filename = "db/notesFile.txt";

function Note(note)
{
    this.id = note.id;
    this.title = note.title;
    this.description = note.description;
    this.dueDate = note.dueDate;
    this.importance = note.importance;
    this.doneDate = note.doneDate;
    this.modifiedDate = note.modifiedDate;
    this.createDate = JSON.stringify(new Date());
}

function publicAddNote(par, callback) {
    var note = new Note(par);
    db.insert(note, function (err, note) {
        callback(err, note);
    });
}

function publicSaveNotes(notes, callback) {
    // delete all
    db.remove({}, {}, function (err, numRemoved) {
        // save notes
        var notesStr = JSON.stringify(notes);
        db.insert(notesStr, function (err, note) {
            callback(err, note);
        });
    });
}

function publicSaveNotesFile(notes, callback) {
    // save notes in file
    var notesStr = JSON.stringify(notes);
    fs.writeFile(filename, notesStr, function(err) {
        if (err) return privateHandleError(err, callback);

        fs.readFile(filename, {encoding: 'utf8'}, function(err, content) {
            if (err) return privateHandleError(err, callback);

            fs.unlink(filename, function(err) {
                if (err) return privateHandleError(err, callback);
                if (callback) callback(err, content);
            });
        });
    });
}

function publicGetNote(id, callback) {
    db.find({ title: id }, function (err, doc) {
        callback( err, doc);
    });
}

function publicGetAllNotes (callback) {
    db.find({}, function (err, docs) {
        callback( err, docs);
    });
}

function publicGetAllNotesFile (callback) {
    fs.readFile(filename, {encoding: 'utf8'}, function (err, content) {
        if (err) return privateHandleError(err, callback);

        fs.unlink(filename, function(err) {
            callback( err, content);
        });
    });
}


function publicDeleteNote(id, callback) {
    db.update({ id: id }, {$set: {"state": "DELETED"}}, {}, function (err, count) {
        publicGetNote(id, callback);
    });
}

function privateHandleError(err, callback) {
    if (callback) callback(err);
}

module.exports = {
    add : publicAddNote,
    save : publicSaveNotes,
    saveFile : publicSaveNotesFile,
    get : publicGetNote,
    all : publicGetAllNotes,
    allFile : publicGetAllNotesFile,
    delete : publicDeleteNote
};