var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');

var app = express();
app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// access logger
var fs = require('fs');
var morgan = require('morgan');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}))

app.use(bodyParser.urlencoded());
app.use(bodyParser.json())
app.use(require("method-override")(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/html/notelist.html")
});

// notes routes
app.use("/notes", require('./routes/notesRoutes.js'));

// get public docs
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use('/', express.static(__dirname + '/public/html'));
app.use('/styles', express.static(__dirname + '/public/styles'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));

http.createServer(app).listen(3333);
