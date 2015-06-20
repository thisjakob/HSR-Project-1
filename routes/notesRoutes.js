var express = require('express');
var router = express.Router();
var notes = require('../controller/notesCtrl.js');


router.post("/add/", notes.addNote);
router.get("/:id/", notes.getNote);
router.get("/all/", notes.getAllNotes);
router.delete("/:id/", notes.deleteNote);

module.exports = router;

