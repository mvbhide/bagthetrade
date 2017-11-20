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
			ticker.subscribe([53471495]);
			ticker.on("tick", function(ticks) {
				console.log(ticks);

			})
		})

		ticker.on("disconnect", function() {
			console.log("ticker disconnected");
		})
		
		
		setTimeout(function(){
			ticker.setMode(ticker.modeFull,[53471495]);
			setTimeout(function() {
				ticker.unsubscribe([53471495]);
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

	Promise.all([
		//requestAsync('https://api.kite.trade/margins/equity'),
		//requestAsync('https://api.kite.trade/margins/commodity'),
		//requestAsync('https://api.kite.trade/margins/futures'),
		kc.instruments().then(function(instruments){
			return instruments;
		})
	]).then(function(alldata) {
		var margins = _.concat(alldata[0][0], alldata[1][0], alldata[2][0]);

		var mergedList = _.map(alldata[3], function(item){
			if(item && item.tradingsymbol) {
		    	return _.extend(item, _.find(margins, {"tradingsymbol": item.tradingsymbol.substr(item.tradingsymbol.length-8) }));
		    }
		})
		res.send(mergedList);
	}).catch(function(err){
		res.send("Error:" + err);
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
var db = require('../db');
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

module.exports = router;
