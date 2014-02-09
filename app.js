/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');


var app = express();

// all environments
app.set('port', process.env.PORT || 8889);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//----------------start routes ------------------
app.get('/', checkLogin);
app.get('/', function (req, res) {
    nickname = req.cookies.user;
    var title = "Welcome " + req.cookies.user + "!";
    res.render('index', { title: title });
});

app.get('/login', function (req, res) {
    if(req.query.logged){
        res.render('login', {logged: true});
    }else{
        res.render('login');
    }

});
app.post('/login', function (req, res) {
    if(onlineUsers[req.body.name]){
        res.redirect('/login?logged');
    }else{
        //用户名存入cookie,跳到主页
        var user = req.body.name ? req.body.name : "*游客" + new Date().getTime().toString().substr(9,14);
        res.cookie("user", user, {maxAge: 1000 * 60 * 60 * 24 * 30});
        res.redirect('/');
    }
})

app.use(function (req, res) {
    res.render('404');
});

function checkLogin(req, res, next){
    if(req.cookies.user == null){
        res.redirect('/login');
    }else{
        next();
    }
}
//----------------end routes ------------------
var server = http.createServer(app),
    io = require('socket.io').listen(server);
var onlineUsers = {};         //在线用户列表
var nickname;
io.sockets.on('connection', function (socket) {
   // socket.on('setnickname', function (nickname) {
        socket.set('nickname', nickname, function () {
            if(!onlineUsers[nickname]){
                onlineUsers[nickname] = nickname;
            }
            io.sockets.emit('public', 'Welcome ' + nickname + ' To ZeroChat');
        })
    //})
    socket.on('msg', function (data) {
        socket.get("nickname", function (err, nickname) {
            io.sockets.emit('public', nickname + ': ' + data);
        });

    });
});

io.sockets.on('disconnect', function () {
    socket.get("nickname", function (err, nickname){
        if(onlineUsers[nickname]){
            delete onlineUsers[nickname];
            io.sockets.emit('public', 'User ' + nickname + ' is offline!');
        }
    });
});


server.listen(app.get('port'), function(){
  console.log('OK on port ' + app.get('port'));
});
