var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var sPort = require('../ws');
var config = require('../config');
var KiteConnect = require("kiteconnect").KiteConnect;
var ticker = require('../ticker');
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
			fetchMargins();

			// Fetch funds
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

router.get('/lookupstock', function(req, res, next) {
	var q = req.query.q;
	db.lookupstocks(q)
	.then(function(response) {
		res.json(response)
	})
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

function fetchMargins() {
	db.getAccessToken(config.API_KEY)
	.then(function(response){
		var kc = new KiteConnect(config.API_KEY, {access_token: actk});
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
			sPort.send('update-orders', response.data);
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

router.get('/tickertest', function(req, res, next) {
	startTicker();
	next();
})

function startTicker() {
	ticker.subscribe(325121);
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