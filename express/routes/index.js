var express = require('express');
var checksum = require('checksum');
var db = require('../db');
var sha = require('sha256');
var router = express.Router();
var sPort = require('../ws');
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

router.get('/ticker', function(req, res, next) {
	var marketData = [];
	var counter = 0;;
	var tckr = new KiteTicker('kitefront', 'RP6292', 'Xchpq1gdGiJzvwOHYQ6BmT27oYLV6Fbj&uid=1516269541059','wss://ws.zerodha.com/');
	tckr.connect();
	
	tckr.on('connect', function(){
		console.log('ticker connected')
		//var tokens  = tckr.subscribe([53644807,53645063,53687047,53484039,53505543,53517319,53646855,53490439,53703687,53686791,53516551,53656839,53516807,53645319,53508103,53687303,53455111,53649927]);
		//var tokens  = tckr.subscribe([53484039,53505543,53517319,53646855,53490439,53703687,53686791,53516551,53656839,53516807,53645319,53508103,53687303,53455111,53649927]);
		var tokens  = tckr.subscribe([53490439]);
	})
	
	//var tokens = tckr.subscribe([11949058,11949314,11949570,11950082,11950594,11951362,11951618,11951874,11952130,11952386,11952642,11952898,11953154,11953410,11953666,11955714,11956994,11957250,11946498,11957506,11959042,11960834,11961090,11961346,11962114,11962370,11962626,11962882,11966466,11966722,11967490,11970562,11971330,11971586,11973378,11973634,11975170,11977218,11977474,11977730,11977986,11978242,11979266,11980802,11983106,11984130,11984386,11985922,11992322,11992578,11993602,11994370,11995650,11995906,11996418,11996674,11996930,11997186,11997442,11997698,11998978,11999234,11999490,12000514,12002050,12002562,12003074,12003330,12003586,12003842,12004354,12004610,12006146,12006914,12010498,12011010,12011266,12011522,12012290,12012546,12012802,12014850,12015618,12015874,12016130,12017410,12017666,12018946,12019202,12022274,12022530,12022786,12023298,12023554,12024066,12024322,12024834,12026882,12028162,12029186,12029442,12029698,12030466,12031490,12031746,12032002,12034050,12034562,12037378,12037634,12037890,12038658,12040194,12040450,12040706,12041218,12041474,12041730,12044802,12045314,12046082,12046338,12046594,12048130,12048386,12048642,12051202,12051458,12052994,12053250,12053506,12053762,12055042,12056834,12057090,12058114,12058370,12058626,12058882,12061954,12062466,12062722,12065026,12065282,12065794,12066818,12067074,12067842,12068098,12069122,12069378,12069634,12070146,12071426,12071938,12072194,12072450,12072706])

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

	setTimeout(function() {
		tckr.disconnect();
	},100000)
	res.send("Done")

})

router.get('/timetest', function(req, res, next) {
	var timer = setInterval(function() {
		var d = new Date().getTime();
		if(d%1000 == 0) {
			console.log('Minute started', d);
		}
	}, 1)

	setTimeout(function() {clearInterval(timer)}, 100000);

	res.send("Done");
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
	//if(req.params) {
		//var requestToken = req.query.request_token;
		var kc = new KiteConnect(config.API_KEY);

		/*kc.requestAccessToken(requestToken, config.API_SECRET)
		.then(function(response) {
			console.log(response)
			req.session.kc = kc;
			db.setAccessToken(config.API_KEY, response.data.access_token);
			init();
		})
		.catch(function(err) {
			console.log("Error", err);
		})*/
init();
		function init() {
			// Fetch equity margins.
			fetchMargins();

			// Fetch funds
			/*kc.margins("equity")
			.then(function(response) {
				sPort.send('set-available-margin', response.data.net);
			}).catch(function(err) {
				console.log(err)
				sPort.send('set-available-margin', 20000);
			})
			.finally(function(){
				res.status(200).end();
			});*/
		}
	//}
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
				kc.instruments('NSE').then(function(instruments){
					console.log("NSE fetched")
					return instruments;
				}),
				kc.instruments('NFO').then(function(instruments){
					console.log("NFO fetched")
					return instruments;
				}),
				kc.instruments('MCX').then(function(instruments){
					console.log("MCX fetched")
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
				console.log(db_margins[0], db_margins[1], db_margins[2], db_margins[3])
				db.insertMargins(db_margins)
					.then(function(result) {res.send("Done");})
					.catch(function(err) {res.send('Error: ' + err)})
					.finally(function(){res.send("Done. Time taken: " + new Date() - startTime )})
			}).catch(function(err){
				res.send("Error:" + err);
			})
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