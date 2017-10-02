// 1.  Very simple websocket server:
// 	1a. Echo incoming message to all connected clients
// 	1b. Generate random numbers and emit to connected clients
var ws = require('nodejs-websocket');
var oms = require('./oms');
var sPort = {}; // Communication object used by the server
// 3. Server for emitting random data.
// Is this best practice? Starting new server on another port, or can
// the original server (on 3005) listen to different URL for example and
// emit other data?
sPort.dataServer = ws.createServer(function (conn) {
	console.log('New Random number connection established, ', new Date().toLocaleTimeString());

	conn.on('close', function (code, reason) {
		console.log('Data connection closed.', new Date().toLocaleTimeString(), 'code: ', code);
	});

	// Request coming from the client.
	/* Possible requests
		1. Place order*/
	conn.on('text', function(request) {
		console.log('Incoming request on server', request)
		oms.placeOrder(JSON.parse(request));
	})

	conn.on('error', function (err) {
		// only throw if something else happens than Connection Reset
		if (err.code !== 'ECONNRESET') {
			console.log('Error in random number server', err);
		}
	})
}).listen(3006, function () {
	console.log('Random number server running on localhost:3006');
});

// 4. Send the payload to client
sPort.send = function(payload) {
	// Only emit numbers if there are active connections
	if (socketHandler.dataServer.connections.length > 0) {
		try {
			socketHandler.dataServer.connections.forEach((function (conn) {
				conn.send(JSON.stringify(payload))
			}));

		} catch(e) {
			console.log(e)
		}
		
	}
}


module.exports = sPort;