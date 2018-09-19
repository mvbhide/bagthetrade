var express = require('express');
var router = express.Router();
var db = require('../db');

var ticker;

/* router.use(function(req, res, next) {
	if(req.app.locals['backSocket']) {
		ticker = req.app.locals['backSocket'].ticker;
	}
	next();
}) */ 

router.get('/get', function(req, res, next) {
	var userId = 1;
	db.fetchMarketwatch(userId)
	.then(function(response) {
		var idx;
		for(idx in response) {
			let token = parseInt(response[idx]['instrument_token'])
			req.app.locals['backSocket'].ticker.subscribe([token]);
			req.app.locals['backSocket'].ticker.setMode("full", [token]);
		}
		res.send(response)
	})
	.catch(function(error) {
		console.log(error)
		res.send(error);
	})
});

router.get('/add/:token', function(req, res, next) {
	var token = parseInt(req.params.token);
	db.addToMarketwatch(token)
	.then(function(response) {
		console.log(response)
		req.app.locals['backSocket'].ticker.subscribe([token]);
		req.app.locals['backSocket'].ticker.setMode("full", [token]);
		res.json(response)
	})
});

router.get('/remove/:token', function(req, res, next) {
	var token = parseInt(req.params.token);
	db.removeFromMarketwatch(token)
	.then(function(response) {
		req.app.locals['backSocket'].ticker.unsubscribe([token])
		res.json(response)
	})
});

module.exports = router;
