var express = require('express');

var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var config = require('../config');
var KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
var objFactory = require('../object-factory/fp');
var request = require('request');
var Promise = require('promise');
var redis = require('redis').createClient('redis://kitetest:RedisTest@redis-19229.c1.ap-southeast-1-1.ec2.cloud.redislabs.com:19229');
var _ = require('lodash');

var ws;

redis.on("error", function(err) {
	console.log(err);
})


router.get('/ticker', function(req, res, next) {
	var marketData = [];
	var counter = 0;
	var tckr = new KiteTicker({
		api_key: 'kitefront',
		user_id: 'RP6292',
		access_token: 'Xchpq1gdGiJzvwOHYQ6BmT27oYLV6Fbj&uid=1516269541059',
	});

	tckr.connect();
	
	tckr.on('error', function(err) {
		console.log(err);
	})

	tckr.on('connect', function(){

	})
	

	var min = new Date().getSeconds();
	var candleData = []
	var candleAlreadyStarted = false;
	tckr.on("tick", function(ticks) {
		if(ticks.length == 0) return;
		var currentMinute = new Date().getSeconds();
		
		if(currentMinute % 10 == 0 && !candleAlreadyStarted) {
			min = currentMinute;
			candleAlreadyStarted = true;
			if(candleData.length > 0) {
				/*db.createCandleData(candleData)
				.then(function(response) {
					console.log(response);
				})*/

			}
			console.log(candleData)
			console.log("new candles");
			candleData = [];
			for(let i=0; i < ticks.length; i++) {
				candleData["'" + ticks[i].Token + "'"] = {
					o: parseFloat(ticks[i].LastTradedPrice),
					h: parseFloat(ticks[i].LastTradedPrice),
					l: parseFloat(ticks[i].LastTradedPrice),
					c: parseFloat(ticks[i].LastTradedPrice),
					volume: 0
				}
			}
		} else {
			candleAlreadyStarted = false;
			for(let i=0; i < ticks.length; i++) {
				if(!candleData["'" + ticks[i].Token + "'"]) {
					candleData["'" + ticks[i].Token + "'"] = {}
				}
				let ltp 		= parseFloat(ticks[i].LastTradedPrice);
				let prevVolume 	= parseInt(candleData["'" + ticks[i].Token + "'"].volume);
				let currVolume 	= isNaN(prevVolume) ? 0 : prevVolume;
				let prevHigh 	= isNaN(candleData["'" + ticks[i].Token + "'"].h) ? 0 : candleData["'" + ticks[i].Token + "'"].h;
				let prevLow 	= isNaN(candleData["'" + ticks[i].Token + "'"].l) ? 0 : candleData["'" + ticks[i].Token + "'"].l;
				
				candleData["'" + ticks[i].Token + "'"].h 		= ltp > prevHigh ? ltp : prevHigh,
				candleData["'" + ticks[i].Token + "'"].l 		= ltp < prevLow ? ltp : prevLow,
				candleData["'" + ticks[i].Token + "'"].c 		= ltp,
				candleData["'" + ticks[i].Token + "'"].volume 	= parseInt(currVolume) + parseInt(ticks[i].LastTradeQuantity)
			}
		}
	})

	/*tckr.on('disconnect', function(){
		console.log('ticker disconnected')
	})*/

	setTimeout(function() {
		tckr.disconnect();
	},100000)
	res.send("Done")

})

router.post('/orderhook', function(req, res, next){
	var objOrder;
	if(req.body && req.body.status == 'COMPLETE') {
		objOrder = _.extend(objFactory.get('orderhook'), req.body);
		updateOrders();
		/*
		* Lot of decisions go here. Potential further steps are
			1. Communicate the status to client
			2. Decide in case of error
		*/ 
	}
})

router.get('/kiteauthred', function(req, res, next) {
	if(req.params) {
		var requestToken = req.query.request_token;
		var kc = new KiteConnect({api_key: config.API_KEY});

		kc.generateSession(requestToken, config.API_SECRET)
		.then(function(response) {
			console.log("Access Token : ", response.access_token)
			db.setAccessToken(config.API_KEY, response.access_token)
			.then(data => {
				ws = require('../ws')(response.access_token).then(function(sPort) {
					sPort.ticker.connect();
					sPort.ticker.on("connect", function() {
						sPort.ticker.on("ticks", function(ticks) {
							console.log(ticks)
							//sPort.send("ticks", ticks);
						})
					});
					
					req.app.locals.toClient = sPort;
				})
				
				res.json({success: true})	
			})
		})
		.catch(function(err) {
			console.log("Error126", err);
		})
		
		//init();
		
		function init() {
			// Fetch equity margins.
			fetchMargins(res);
		}
	}
})


router.get('/setmargins', function(req, res, next) {
	fetchMargins(res)
})

router.get('/getinstrument/:token', function(req, res, next) {
	var token = req.params.token;
	console.log(token);
	db.getInstrument(token)
	.then(function(response) {
		console.log(response);
		res.json(response);
	})
})

router.get('/margins', function(req, res, next) {
	db.getAccessToken(config.API_KEY)
	.then(function(response) {
		var actk = response.data.access_token;
		var kc = new KiteConnect({api_key: config.API_KEY, access_token: actk});
		
		kc.getMargins()
		.then(function(response) {
			res.json(response);
		})
		.catch(function(err) {
			console.log(err)
			res.json(err.response);
		})
	})
	.catch(function(e) {
		console.log(e)
	})		
})


router.post('/login', function(req, res, next) {
	if(req.body) {
		var u = req.body.u;
		var p = req.body.p;
		var kitecookie = req.body.kitecookie ? req.body.kitecookie : '';
		var csrftoken = req.body.csrfToken ? req.body.csrfToken : '';
		console.log(u,p);
		db.authenticateUser(u,p)
		.then(function(response) {
			if(kitecookie != '' && csrftoken != '') {
				redis.hset("u" + response.data[0].id, "kitecookie", kitecookie, redis.print);
				redis.hset("u" + response.data[0].id , "csrftoken", csrftoken, redis.print);
				req.session.kitecookie = kitecookie;
				req.session.csrftoken = csrftoken
				req.session.save();
			} else {
				redis.hget("u" + response.data[0].id, "kitecookie", function(err, val) {
					req.session.kitecookie = val;
					req.session.save();
					console.log(req.session)
				});

				redis.hget("u" + response.data[0].id, "csrftoken", function(err, val) {
					req.session.csrftoken = val;
					req.session.save();
				});		
			}
				
			res.json(response);
		})
	} else {
		res.json("Error");
	}
})

router.get('/getquote', function(req, res, next) {
	var q = req.query.tradingsymbol;
	var e = req.query.exchange;

	db.getAccessToken(config.API_KEY)
	.then(function(response) {
		console.log(response.data)
		var actk = response.data.access_token;
		var kc = new KiteConnect(config.API_KEY, {access_token: actk});
		kc.quote(e,q)
		.then(function(response) {
			res.send(response);
		})
		.catch(function(e) {
			res.json(e);
		})
	})
})

function fetchMargins(res) {
	db.getAccessToken(config.API_KEY)
	.then(function(response){
		var kc = new KiteConnect(config.API_KEY, {access_token: response.data});
		var allmargins = [];
		var tmpMargins = [];
		var startTime = new Date();
		console.log('Start: ',new Date().getTime())
		//clear the current table contents
		db.clearInstrumentsTable()
		.then(function(tableClearedResponse){
			console.log("Instruments table cleared");
			// Fetch the instruments
			Promise.all([
				requestAsync('https://api.kite.trade/margins/equity'),
				requestAsync('https://api.kite.trade/margins/futures'),
				requestAsync('https://api.kite.trade/margins/commodity'),
				kc.getInstruments('NSE')
				.then(function(instruments){
					console.log("NSE fetched", instruments.length)
					return instruments;
				})
				.catch(function(err) {
					console.log('NSE failed: ', err)
				}),
				kc.getInstruments('NFO')
				.then(function(instruments){
					console.log("NFO fetched", instruments.length)
					return instruments;
				})
				.catch(function(err) {
					console.log('NFO failed: ', err)
				}),
				kc.getInstruments('MCX')
				.then(function(instruments){
					console.log("MCX fetched", instruments.length)
					//console.log(_.filter(instruments, function(i) { return i.tradingsymbol.indexOf('CRUDE') > -1 }));
					console.log(instruments[0].tradingsymbol)
					return instruments;
					
				})
				.catch(function(err) {
					console.log('MCX failed: ', err)
				}),
			]).then(function(alldata) {
				console.log("Margins fetched");

				// Merge equity Margins and Instruments
				var equityMargins = alldata[0][0];
				var equityInstruments = alldata[3];

				var mergedEquity = _.map(equityInstruments, function(i){
					if(i && i.tradingsymbol) {
						return _.extend(i, _.find(equityMargins, function (m) {
			    			return _.includes(i.tradingsymbol, m.tradingsymbol)	
						}));	
				    }
				})

				console.log('Equity Margins and Instruments merged');
				
				// Merge futures Margins and Instruments
				var futuresMargins = alldata[1][0];
				var futuresInstruments = alldata[4];

				var mergedFutures = _.map(futuresInstruments, function(i){
					if(i && i.tradingsymbol) {
						if(_.endsWith(i.tradingsymbol, 'CE') || _.endsWith(i.tradingsymbol, 'PE')) {
							return _.extend({}, _.find(futuresMargins, function (m) {
								let symbol = i.tradingsymbol.replace(/(\w+)(\d{2})(\w{3})(\d+)(\w+)/, "$1$2$3FUT")
			    				return m.tradingsymbol == symbol;
						    }), i);	
						} else {
							return _.extend(i, _.find(futuresMargins, function (m) {
			    				return _.includes(i.tradingsymbol, m.tradingsymbol)	
						    }));	
						}
				    }
				})
				console.log('Futures Margins and Instruments merged');

				// Merge commodity margin data
				var commMargins = alldata[2][0];
				var commodity = alldata[5];

				console.log("fetched and segregated all margins")

				// Filter rare used commodities like quarterly expiry commodties etc
				/* var commodity = _.filter(commodity, function(c){
					return c.name != "";
				}); */
console.log(commodity[0], commMargins[0])
				var mergedCommodityMargins = _.map(commodity, function(item){
					if(item && item.tradingsymbol) {
						let ts = item.tradingsymbol;
				    	return _.extend(item, _.find(commMargins, {tradingsymbol: _.replace(ts, ts.substr(-8), "")}));
				    }
				})
console.log(mergedCommodityMargins[0])

				console.log("Merged commodity margins")

				console.log("preparing to sanitize objects")

				// merge all margin data
				var finalMargins = _.concat(mergedCommodityMargins, mergedEquity, mergedFutures);

				var db_margins = _.map(finalMargins, function(margin) {
					return _.omit(margin, ['margin', 'mis_multiplier', 'nrml_margin', 'mis_margin', 'exchange_token', 'last_price', 'exchange'])
				})

				console.log(db_margins.length + " Objects sanitized");
				
				db.insertMargins(db_margins)
					.then(function(result) {console.log("Done. Time taken: ", new Date().getTime() - startTime)})
					.catch(function(err) {console.log(err)})
					.then(function(){console.log("Done. Time taken: ")})
			}).catch(function(err){
				res.send("Error:" + err);
			})
			res.send('ok');
		})
	})
	.catch(function(err) { 
		console.log("Getting access token failed: ",err);
	})

}

function updateOrders() {
	db.getAccessToken(config.API_KEY)
	.then(function(response) {
		var actk = response.data.access_token;
		console.log(actk);
		var kc = new KiteConnect(config.API_KEY, {access_token: actk});
	
		kc.orders()
		.then(function(response) {
			console.log(response.status)
			//sPort.send('update-orders', response.data);
			res.send(response);
		})
		.catch(function(err) {
			res.send(err.response);
		})	
	})
	.catch(function(e) {
		console.log(e)
	})
}

function initWebSocket(at) {
	
	/* ws.on('message', function(request) {
		request = JSON.parse(request);
		var method = request['method'];
		console.log('Incoming request on server', request['method'], request.payload)
		switch(method) {
				

		}
	}); */
}

function requestAsync(url) {
	return new Promise(function(resolve, reject) {
        request(url, function(err, res, body) {
            if (err) { return reject(err); }
            return resolve([JSON.parse(body)]);
        });
    });
}

module.exports = router;