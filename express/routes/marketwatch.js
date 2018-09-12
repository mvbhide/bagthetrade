var express = require('express');
var router = express.Router();
var db = require('../db');

var ticker;

router.get('/get', function(req, res, next) {
	var userId = 1;
	db.fetchMarketwatch(userId)
	.then(function(response) {
		res.send(response)
	})
	.catch(function(error) {
		res.json(error);
	})
});

router.get('/add/:token', function(req, res, next) {
	var token = req.params.token;
	db.addToMarketwatch(token)
	.then(function(response) {
		res.json(response)
	})

	ticker = req.app.locals.toClient.ticker;
console.log(ticker.connected())
	ticker.subscribe([token])
	ticker.on("ticks", function(ticks) {
		console.log(ticks);
	})

	console.log("session : ", req.app.locals.toClient)
});

router.get('/remove/:token', function(req, res, next) {
	var token = req.params.token;
	db.removeFromMarketwatch(token)
	.then(function(response) {
		res.json(response)
	})

	req.app.locals.toClient.ticker.unsubscribe([token])

	console.log("session : ", req.app.locals.toClient)
});

module.exports = router;
