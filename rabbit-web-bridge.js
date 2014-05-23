/*
 * Web Server.
 */
var server = require('http').createServer(handler), io = require('socket.io')
		.listen(server), fs = require('fs');
		
server.listen(12345);

function handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		
//		res.writeHead(200, {
//			'Access-Control-Allow-Origin':'http://jslate.com/'
//		});
		res.writeHead(200);
		res.end(data);
	});
}

/*
 * Web Client operations/
 */
io.sockets.on('connection', function(socket) {
	socket.set('subs', []);

	socket.on('subscribe', function(data, fn) {
		var subscription = stompClient.subscribe('/exchange/events/' + data.island + "." + data.actor, function(message) {
			if (message.body) {
				console.log('Received ' + message.body);
				socket.emit('update', message.body);
			}
		});
		console.log('New client subscribed: ' + subscription.id);
		fn(subscription.id);
		socket.get('subs', function(err, subs) {
			subs[subscription.id] = subscription;
		});
	});

	socket.on('unsubscribe', function(data) {
		socket.get('subs', function(err, subs) {
			console.log("Disconnecting " + data.id);
			if (subs.hasOwnProperty(data.id)) {
				subs[data.id].unsubscribe();
				delete subs[data.id];
			}
		});
	});

	socket.on('disconnect', function() {
		socket.get('subs', function(err, subs) {
			for (var subid in subs) {
				console.log("Disconnecting " + subid);
				if (subs.hasOwnProperty(subid)) {
					subs[subid].unsubscribe();
				}
			}
		});
	});
});

/*
 * STOMP.
 */
var Stomp = require('stompjs');
var stompClient = Stomp.overTCP('localhost', 61613);

stompClient.connect('guest', 'guest', function() {
	console.log("STOMP connection: OK.");
}, function(error) {
	console.log("STOMP connection: " + error);
});