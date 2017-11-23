var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var sPort = require('../ws')
var config = require('../config');
var KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
var objFactory = require('../object-factory/fp');
var request = require('request');
var Promise = require('promise');
var _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('index', { title: 'Express' });
});

router.post('/orderhook', function(req, res, next){
	var objOrder;
	if(req.body && req.body.status == 'COMPLETE') {
		objOrder = _.extend(objFactory.get('orderhook'), req.body);
		/*
		* Lot of decisions go here. Potential further steps are
			1. Communicate the status to client
			2. Decide in case of error
		*/ 
	}
})

router.get('/orders', function(req, res, next) {
	var actk = 'd8v2ma1ei2ic0hqlks5wgemxxe7b8zu0';
	var kc = new KiteConnect(config.API_KEY, {access_token: actk});
	
	kc.orders()
		.then(function(response) {
			res.send(response);
		})
		.catch(function(err) {
			res.send(err.response);
		})
})

router.get('/ticker', function(req, res, next) {
		var ticker = new KiteTicker('2ii3pn7061sv4cmf', 'RP6292', '4d3d5784e80affaa3c15b9e37fd2f690');
		ticker.connect();
		ticker.on("connect", function() {
			console.log("ticker connected");
			ticker.setMode(ticker.modeFull, [53480711]);
			let sold = false;
			ticker.on("tick", function(ticks) {
				let ltp = ticks[0].LastTradedPrice;
				console.log(ltp);
				if(ltp == 3678 && sold == false) {
					console.log("Sold here");
					sold = true;
				}

				if(ltp == 3670 && sold == true) {
					console.log('Bought here');
				}

			})
		})

		ticker.on("disconnect", function() {
			console.log("ticker disconnected");
		})
		
		
		setTimeout(function(){
			setTimeout(function() {
				res.send('OK')
			}, 2000)
		}, 3000)
})

router.get('/kiteauthred', function(req, res, next) {
	if(req.params) {
		var requestToken = req.query.request_token;
		var kc = new KiteConnect(config.API_KEY);

		kc.requestAccessToken(requestToken, config.API_SECRET)
			.then(function(response) {
				console.log(response)
				req.session.kc = kc;
				db.setAccessToken(config.API_KEY, response.data.access_token);
				init();
			})
			.catch(function(err) {
				console.log("Error", err);
			})

		function init() {
			// Fetch equity margins.

			// You can have other api calls here.

			// Set a repeat function to poll orders every 15 seconds
			/*var pollOrders = setInterval(function() {
				kc.orders()
				.then(function(response) {
					sPort('refresh-orders', response.data)
				})
			}, 15000);*/

			kc.margins("equity")
				.then(function(response) {
					sPort.send('set-available-margin', response.data.net);
				}).catch(function(err) {
					console.log(err)
					sPort.send('set-available-margin', 20000);
				})
				.finally(function(){
					res.status(200).end();
				});
			}
	}

})

router.get('/margins', function(req, res, next){
	var actk = '947qxd2i8q8rw0cr3qiwm1423hxoovrr';
	var kc = new KiteConnect(config.API_KEY, {access_token: actk});
	var allmargins = [];
	var tmpMargins = [];
	function requestAsync(url) {
    	return new Promise(function(resolve, reject) {
	        request(url, function(err, res, body) {
	            if (err) { return reject(err); }
	            return resolve([JSON.parse(body)]);
	        });
	    });
	}
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
			kc.instruments('NSE').then(function(instruments){
				return instruments;
			}),
			kc.instruments('NFO').then(function(instruments){
				return instruments;
			}),
			kc.instruments('MCX').then(function(instruments){
				return instruments;
			})
		]).then(function(alldata) {
			console.log("Margins fetched");

			// Merge equity and futures margin data
			var margins = _.concat(alldata[0][0], alldata[1][0])
			var instruments = _.concat(alldata[3], alldata[4]);
			var mergedList = _.map(margins, function(item){
				if(item && item.tradingsymbol) {
			    	return _.extend(item, _.find(instruments, {tradingsymbol: item.tradingsymbol}));
			    }
			})

			// Merge commodity margin data
			var commMargins = alldata[2][0];
			var commodity = alldata[5];

			var mergedCommodityMargins = _.map(commodity, function(item){
				if(item && item.tradingsymbol) {
					let ts = item.tradingsymbol;
			    	return _.extend(item, _.find(commMargins, {tradingsymbol: _.replace(ts, ts.substr(-8), "")}));
			    }
			})
			
			var filteredCommodityMargins = _.filter(mergedCommodityMargins, 'co_lower');

			// merge both margin data
			var finalMargins = _.concat(mergedList, filteredCommodityMargins);
			var db_margins = _.map(finalMargins, function(margin) {
				return _.omit(margin, ['margin', 'mis_multiplier', 'nrml_margin', 'mis_margin', 'exchange_token', 'last_price', 'exchange'])
			})
			console.log(db_margins.length + " Objects sanitized");
			
			db.testMargins(db_margins)
				.then(function(result) {res.send("Done");})
				.catch(function(err) {res.send('Error: ' + err)})
				.finally(function(){res.send("Done. Time taken: " + new Date() - startTime )})
		}).catch(function(err){
			res.send("Error:" + err);
		})
	})
})

router.get('/test', function(req, res, next) {
	var actk = '947qxd2i8q8rw0cr3qiwm1423hxoovrr';
	var kc = new KiteConnect(config.API_KEY, {access_token: actk});

	function requestAsync(url) {
    	return new Promise(function(resolve, reject) {
	        request(url, function(err, res, body) {
	            if (err) { return reject(err); }
	            return resolve([JSON.parse(body)]);
	        });
	    });
	}

	//clear the current table contents
	db.clearInstrumentsTable()
	.then(function(res){
		// Fetch the instruments
		kc.instruments('MCX')
		.then(function(instruments) {
			console.log("Fetched the instruments. Count: ", instruments.length);
			var db = require('../db');
			db.setInstruments(instruments)
			.then(function(res) {
				console.log("Written the instruments to database");
				Promise.all([
					//requestAsync('https://api.kite.trade/margins/equity'),
					requestAsync('https://api.kite.trade/margins/commodity'),
					//requestAsync('https://api.kite.trade/margins/futures'),
				]).then(function(alldata) {
					var margins = alldata[0][0];
					console.log("fetched all the margins. Count: ", margins.length);

					db.updateInstrumentsWithMargins(margins)
					.then(function(res) {
						console.log("Marings updated")
						res.send("DONE");
					})
					
				}).catch(function(err){
					res.send("Error:" + err);
				})
			})
		})
	})
})

router.get('/tickertest', function(req, res, next) {
	var actk = '947qxd2i8q8rw0cr3qiwm1423hxoovrr';
	var kc = new KiteConnect(config.API_KEY, {access_token: actk});

	function requestAsync(url) {
    	return new Promise(function(resolve, reject) {
	        request(url, function(err, res, body) {
	            if (err) { return reject(err); }
	            return resolve([JSON.parse(body)]);
	        });
	    });
	}

	Promise.all([
		requestAsync('https://api.kite.trade/margins/commodity'),
		kc.instruments('MCX').then(function(instruments){
			return instruments;
		})
	]).then(function(alldata) {
		var margins = alldata[0][0];
		var commodity = alldata[1];

		var merged = _.map(commodity, function(item){
			if(item && item.tradingsymbol) {
				let ts = item.tradingsymbol;
		    	return _.extend(item, _.find(margins, {tradingsymbol: _.replace(ts, ts.substr(-8), "")}));
		    }
		})

		var filteredCommodityMargins = _.filter(merged, 'co_lower');

		res.send(filteredCommodityMargins)
	})
})

router.get('/dbtest', function(req, res, next){
var margins = [{
	margin: 0,
	co_lower: 4,
	mis_multiplier: 11,
	tradingsymbol: "ZEEL",
	co_upper: 4.5,
	nrml_margin: 0,
	mis_margin: 9,
	instrument_token: "975873",
	exchange_token: "3812",
	name: "ZEE ENTERTAINMENT ENT",
	last_price: "0.0",
	expiry: "",
	strike: "0.0",
	tick_size: "0.05",
	lot_size: "1",
	instrument_type: "EQ",
	segment: "NSE",
	exchange: "NSE"
	},
	{
	margin: 12.51,
	co_lower: 1.5,
	mis_multiplier: 0,
	tradingsymbol: "ACC17NOVFUT",
	co_upper: 3.76,
	nrml_margin: 85414,
	mis_margin: 34165.6,
	instrument_token: "13725954",
	exchange_token: "53617",
	name: "",
	last_price: "1707.1",
	expiry: "2017-11-30",
	strike: "-0.01",
	tick_size: "0.05",
	lot_size: "400",
	instrument_type: "FUT",
	segment: "NFO-FUT",
	exchange: "NFO"
}]

var db_margins = _.map(margins, function(margin) {
	return _.omit(margin, ['margin', 'mis_multiplier', 'nrml_margin', 'mis_margin', 'exchange_token', 'last_price', 'exchange'])
})
console.log(db_margins);
db.testMargins(db_margins).then(function(result) {res.send('Response: ' + result);}).catch(function(err) {console.log(err);res.send('Error: ' + err)})

})

module.exports = router;
