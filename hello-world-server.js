var app = require('http').createServer(handler), io = require('socket.io')
		.listen(app), fs = require('fs');

app.listen(12345);

var list = [];

function handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}

		res.writeHead(200);
		res.end(data);
	});
}


io.sockets.on('connection', function(socket) {
	list.push(socket);
});

io.sockets.on('disconnection', function(socket) {
	list.splice(list.indexOf(socket), 1);
});

var Stomp = require('stompjs');
var client = Stomp.overTCP('localhost', 61613);

client.connect('guest', 'guest', function() {
	console.log('Connected');
	client.subscribe('/queue/test', function(message) {
		if (message.body) {
			console.log('Received message: ' + message.body);
			
			list.forEach(function(item, index) {
				item.emit('news', {hello:message.body});
			});
			
		} else {
			console.log('Empty message');
		}
	}, function(error) {
		console.log(error);
	});
});