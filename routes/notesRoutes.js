var express = require('express');
var router = express.Router();
var notes = require('../controller/notesCtrl.js');

// routes
router.post("/add/", notes.addNote);
//router.post("/save/", notes.saveNotes);
router.post("/save/", notes.saveNotesFile);
//router.get("/all/", notes.getAllNotes);
router.get("/all/", notes.getAllNotesFile);
router.get("/get/:id/", notes.getNote);
router.delete("/:id/", notes.deleteNote);

module.exports = router;

