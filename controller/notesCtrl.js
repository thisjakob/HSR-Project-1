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
                res.json(notes);
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
