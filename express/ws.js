// 1.  Very simple websocket server:
// 	1a. Echo incoming message to all connected clients
// 	1b. Generate random numbers and emit to connected clients
var ws = require('nodejs-websocket');
var oms = require('./oms');
var config = require('./config');
var mysql = require('mysql');
var sPort = {}; // Communication object used by the server
// 3. Server for emitting random data.
// Is this best practice? Starting new server on another port, or can
// the original server (on 3005) listen to different URL for example and
// emit other data?
if(!sPort.dataServer) {
	sPort.dataServer = ws.createServer(function (conn) {
		console.log('New Random number connection established, ', new Date().toLocaleTimeString());

		conn.on('close', function (code, reason) {
			console.log('Data connection closed.', new Date().toLocaleTimeString(), 'code: ', code);
		});

		// Request coming from the client.
		/* Possible requests
			1. Place order
		*/
		
		conn.on('text', function(request) {
			request = JSON.parse(request);
			var method = request['method'];
			console.log('Incoming request on server', request['method'], request.payload)

			switch(method) {
				case 'placeorder':
					oms.placeOrder(request.payload)
					.then(function(order_id) {
						console.log(order_id);
						sPort.send(order_id + "");
					})
					.catch(function(err) {
						console.log(err);
						sPort.send(err + "");
					})
				break;

				case "authenticate":
					var objUserCred = request.payload;
					var db = mysql.createConnection({
						host: config.DB.host,
						user: config.DB.username,
						password: '',
						database: config.DB.database
					})

					db.connect(function(err){
						if(err) {
							console.log(err);
							return;
						}
						var query = "SELECT * FROM `user` WHERE email='" + objUserCred.e +"' AND password='" + objUserCred.p + "'";
						db.query(query, function(err, results) {
							if(results && results.length == 1) {
								var objResults = {
									"success": true
								}

								// If the user is authenticated, start pre market data churning
							} else {
								var objResults = {
									"success": false
								}
							}
							sPort.send('user-authentication-results', objResults);
						})
					})

			}
			
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

}

// 4. Send the payload to client
sPort.send = function(method, payload) {
	// Only emit numbers if there are active connections
	if (sPort.dataServer.connections.length > 0) {
		try {
			sPort.dataServer.connections.forEach((function (conn) {
				conn.send(JSON.stringify({method: method, data: payload}));
			}));

		} catch(e) {
			console.log(e)
		}
		
	}
}


module.exports = sPort