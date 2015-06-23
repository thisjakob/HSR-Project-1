var store = require("../services/notesStore.js");

module.exports.addNote = function(req, res)
{
   var note = store.add(req.body, function(err, note) {
        res.format({
            'application/json': function(){
                res.json(note);
            },
        });
    });
};

module.exports.saveNotesFile = function(req, res)
{
    var notes = req.body;
    store.saveFile(notes, function(err, note) {
        res.format({
            'application/json': function(){
                res.json(note);
            },
        });
    });
};

module.exports.saveNotes = function(req, res)
{
    var notes = req.body;
    store.save(notes, function(err, note) {
        res.format({
            'application/json': function(){
                res.json(note);
            },
        });
    });
};

module.exports.getNote = function(req, res) {
    store.get(req.params.id, function(err, note) {
        res.format({
            'application/json': function(){
                res.json(note);
            },
        });
    });
};

module.exports.getAllNotes = function(req, res) {
    store.all(function(err, notes) {
        res.format({
            'application/json': function () {
                var n = notes[0];
                res.json(notes);
            }
        });
    });
};

module.exports.getAllNotesFile = function(req, res) {
    store.allFile(function(err, notes) {
        res.format({
            'application/json': function () {
                if (notes !== undefined) {
                    var n = notes[0];
                    res.json(notes);
                } else {
                    res.end("");
                }
            }
        });
    });
};

module.exports.deleteNote =  function (req, res)
{
    store.delete(req.params.id, function(err, note) {
        res.format({
            'text/html': function(){
                res.render("showorder", note);
            },
            'application/json': function(){
                res.json(note);
            },
        });
    });
};
