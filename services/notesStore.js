var Datastore = require('nedb');
var db = new Datastore({ filename: './db/notes.db', autoload: true });
db.loadDatabase();

var fs = require('fs');
var filename = "db/notesFile.txt";

// note
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

// save one note in db
function publicAddNote(par, callback) {
    var note = new Note(par);
    db.insert(note, function (err, note) {
        callback(err, note);
    });
}

// save all notes as one element in empty db
function publicSaveNotes(notes, callback) {
    // delete all
    db.remove({}, {}, function (err, numRemoved) {
        // save notes
        var notesStr = JSON.stringify(notes);
        db.insert({notelist:notesStr}, function (err, note) {
            callback(err, note);
        });
    });
}

// save all notes in file
function publicSaveNotesFile(notes, callback) {
    // save notes in file
    fs.writeFile(filename, JSON.stringify(notes), "utf8", function(err) {
        if (err) return privateHandleError(err, callback);
        if (callback) callback(err, notes);
    });
}

// get one note with id from db
function publicGetNote(id, callback) {
    db.find({ title: id }, function (err, doc) {
        callback( err, doc);
    });
}

// get all notes from db
function publicGetAllNotes (callback) {
    db.find({}, function (err, docs) {
        callback( err, docs);
    });
}

// get notes from file
function publicGetAllNotesFile (callback) {
    fs.readFile(filename, {encoding: 'utf8'}, function (err, content) {
        if (err) return privateHandleError(err, callback);
        if (callback) callback(err, content);
    });
}

// delete one note in db with id
function publicDeleteNote(id, callback) {
    db.update({ _id: id }, {$set: {"state": "DELETED"}}, {}, function (err, count) {
        publicGetNote(id, callback);
    });
}

// error handler
function privateHandleError(err, callback) {
    if (callback) callback(err);
}

// public interface
module.exports = {
    add : publicAddNote,
    save : publicSaveNotes,
    saveFile : publicSaveNotesFile,
    get : publicGetNote,
    all : publicGetAllNotes,
    allFile : publicGetAllNotesFile,
    delete : publicDeleteNote
};