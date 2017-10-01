// 1.  Very simple websocket server:
// 	1a. Echo incoming message to all connected clients
// 	1b. Generate random numbers and emit to connected clients
var ws = require('nodejs-websocket');
var socketHandler = {};
// 3. Server for emitting random data.
// Is this best practice? Starting new server on another port, or can
// the original server (on 3005) listen to different URL for example and
// emit other data?
socketHandler.dataServer = ws.createServer(function (conn) {
	console.log('New Random number connection established, ', new Date().toLocaleTimeString());

	conn.on('close', function (code, reason) {
		console.log('Data connection closed.', new Date().toLocaleTimeString(), 'code: ', code);
	});

	conn.on('error', function (err) {
		// only throw if something else happens than Connection Reset
		if (err.code !== 'ECONNRESET') {
			console.log('Error in random number server', err);
		}
	})
}).listen(3006, function () {
	console.log('Random number server running on localhost:3006');
});

// 4. Generate a random number between 0-10,000, every second
socketHandler.send = function(payload) {
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


module.exports = socketHandler;