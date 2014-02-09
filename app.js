
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');


var app = express();

// all environments
app.set('port', process.env.PORT || 8889);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app),
    io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.on('setnickname', function (name) {
        socket.set('nickname', name, function () {
            io.sockets.emit('public', 'Welcome ' + name + ' To ZeroChat');
        })
    })
    socket.on('msg', function (data) {
        socket.get("nickname", function (err, nickname) {
            io.sockets.emit('public', nickname + ' :' + data);
        });

    });
});



server.listen(app.get('port'), function(){
  console.log('OK on port ' + app.get('port'));
});
