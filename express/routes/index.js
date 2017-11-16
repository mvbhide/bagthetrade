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
	var actk = 'cdmcv03rz1if4fjav0jw4plsazemqf4v';
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
				console.log(response);
				req.session.kc = kc;
				db.setAccessToken(response.data.access_token);
				init();
			})
			.catch(function(err) {
				console.log("Error", err);
			})

		function init() {
			// Fetch equity margins.

			// You can have other api calls here.

			kc.margins("equity")
				.then(function(response) {
					console.log(response)
				}).catch(function(err) {
					console.log(err)
				})
				.finally(function(){
					res.status(200).end();
				});
			}
	}

})

router.get('/margins', function(req, res, next){
	var actk = 'mh1ibtvgtlxkt1qvwtyvrsq8vwtmxyxr';
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
		requestAsync('https://api.kite.trade/margins/equity'),
		requestAsync('https://api.kite.trade/margins/commodity'),
		requestAsync('https://api.kite.trade/margins/futures'),
		kc.instruments().then(function(instruments){
			return instruments;
		})
	]).then(function(alldata) {
		var margins = _.concat(alldata[0][0], alldata[1][0], alldata[2][0]);
		var mergedList = _.map(margins, function(item){
		    return _.extend(item, _.find(alldata[3], { tradingsymbol: item.tradingsymbol }));
		});
		res.send(mergedList);
	}).catch(function(err){
		res.send("Error:" + err);
	})
})

router.get('/test', function(req, res, next) {
	var actk = 'cdmcv03rz1if4fjav0jw4plsazemqf4v';
	var kc = new KiteConnect(config.API_KEY, {access_token: actk});

	kc.invalidateToken(actk);
	res.send('ok');
})

module.exports = router;
