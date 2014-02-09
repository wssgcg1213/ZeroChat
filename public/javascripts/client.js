/**
 * Created with JetBrains WebStorm.
 * User: B1ackRainFlake
 * Author: Liuchenling
 * Date: 2/9/14
 * Time: 14:06
 */

var nick = prompt("Enter Ur NickName!");
nick = nick ? nick : "*游客" + new Date().getTime().toString().substr(9,14);
var input = document.getElementById("input");
input.focus();

String.prototype.pub = function () {
    var node = document.createTextNode(this),
        div = document.createElement("div");
    div.appendChild(node);
    document.body.insertBefore(div, input);
}

var socket = io.connect(location.hostname);

socket.emit('setnickname', nick);
socket.on('public', function (msg) {
    msg.toString().pub();
});

input.onchange = function () {
    var msg =  input.value;
    socket.emit("msg", msg);
    input.value = "";
}