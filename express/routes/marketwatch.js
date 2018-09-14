var express = require('express');
var router = express.Router();
var db = require('../db');

var ticker;

/* router.use(function(req, res, next) {
	if(req.app.locals['toClient']) {
		ticker = req.app.locals['toClient'].ticker;
	}
	next();
}) */ 

router.get('/get', function(req, res, next) {
	var userId = 1;
	db.fetchMarketwatch(userId)
	.then(function(response) {
		console.log(response[1])
		var idx;
		for(idx in response) {
			
			console.log(req.app.locals.toClient)
			let tmp = req.app.locals['toClient'].ticker.subscribe(parseInt(response[idx].instrument_token))
			console.log("inside: ", idx)
		}
		console.log("outise: " + idx)
		
		res.send(response)
	})
	.catch(function(error) {
		res.json(error);
	})
});

router.get('/add/:token', function(req, res, next) {
	var token = parseInt(req.params.token);
	db.addToMarketwatch(token)
	.then(function(response) {
		res.json(response)
	})


	req.app.locals.toClient.ticker.subscribe(token)

	console.log("session : ", req.app.locals.toClient)
	console.log("Is ticker connected ? : ", req.app.locals.toClient.connected())
});

router.get('/remove/:token', function(req, res, next) {
	var token = req.params.token;
	db.removeFromMarketwatch(token)
	.then(function(response) {
		res.json(response)
	})

	req.app.locals.toClient.ticker.unsubscribe([token])

	console.log("session : ", req.app.locals.toClient)
	console.log("Is ticker connected ? : ", req.app.locals.toClient.ticker.connected())
});

module.exports = router;
