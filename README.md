# HSR-Project-1: Notes
#install
npm install

# run
run index.js

# start page in browser
http://localhost:3333

# options
localStorage or db on server change include javascript in public/html/notelist.html:
localStorage: 
    <script src="../scripts/data_ls.js"></script>
db (file or nedb: change routes in notesRoutes.js):
    <script src="../scripts/data_db.js"></script>

## to do
- sort by note title
- fix layout in other browsers! (ie, firefox, safari)
- provide better dark skin
- create better ID than just a timestamp (some kind of short hash example: hj48i)
- add form validation
- [done] ~~render notes list~~
- [done] ~~style switch~~
- [done] ~~add delete note~~
- [done] ~~finish note~~
- [done] ~~filter finished notes~~
- [done] ~~expand / collapse dates and description~~
- [done] ~~sort notes by finished date / created date / importance~~

## Ideas for additional features
- undo delete note
- settings: last skin, last filter
- header fixed

## failure
