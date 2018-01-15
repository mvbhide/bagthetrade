var express = require('express');
var router = express.Router();
var db = require('../db');


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
