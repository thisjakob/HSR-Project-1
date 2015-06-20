var Datastore = require('nedb');
var db = new Datastore({ filename: './db/notes.db', autoload: true });

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

function publicGetNote(id, callback) {
    db.find({ title: id }, function (err, doc) {
        callback( err, doc);
    });
}

function publicGetAllNotes () {
    db.find({}, function (err, docs) {
        callback( err, docs);
    });
}

function publicDeleteNote(id, callback) {
    db.update({ id: id }, {$set: {"state": "DELETED"}}, {}, function (err, count) {
        publicGetNote(id, callback);
    });
}

module.exports = {
    add : publicAddNote,
    get : publicGetNote,
    all : publicGetAllNotes,
    delete : publicDeleteNote
};