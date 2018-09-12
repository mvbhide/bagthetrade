// 1.  Very simple websocket server:
// 	1a. Echo incoming message to all connected clients
// 	1b. Generate random numbers and emit to connected clients
var ws = require('nodejs-websocket');
var oms = require('./oms');
var db = require('./db');
var config = require('./config')
var sPort = {}; // Communication object used by the server

// 3. Server for emitting random data.
// Is this best practice? Starting new server on another port, or can
// the original server (on 3005) listen to different URL for example and
// emit other data?
var tckr;


module.exports = function(at) {
	return new Promise(function(resolve, reject) {
	return db.getAccessToken(config.API_KEY)
	.then(function(res) {
		var KiteTicker = require("kiteconnect").KiteTicker;
		tckr = new KiteTicker({api_key: config.API_KEY, access_token: at});
		tckr.connect();
		tckr.on("connect", function() {
			tckr.on("tick", function(ticks) {
				console.log(ticks)
				sPort.send("ticks", ticks);
			})
		});
		
		sPort.ticker = tckr;
		
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

		resolve(sPort);
	})

	// 4. Send the payload to client
	
})
}


