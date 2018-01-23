var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/lookup', function(req, res, next) {
	var q = req.query.q;
	db.lookupstocks(q)
	.then(function(response) {
		res.json(response)
	})
})

module.exports = router;
