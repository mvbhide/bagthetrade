var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/get', function(req, res, next) {
	console.log("reached here")
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
});

router.get('/remove/:token', function(req, res, next) {
	var token = req.params.token;
	db.removeFromMarketwatch(token)
	.then(function(response) {
		res.json(response)
	})
});

module.exports = router;
