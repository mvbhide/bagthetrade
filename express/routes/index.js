var express = require('express');
var checksum = require('checksum');
var sha = require('sha256');
var router = express.Router();
var ws = require('../ws');
var config = require('../config');
var objFactory = require('../object-factory/fp');

/* GET home page. */
router.get('/', function(req, res, next) {
	ws.send({name: 'Milind'});
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

router.get('/kiteauthred', function(req, res, next) {
	if(req.params) {
		var requestToken = req.params.request_token;

		var kc = new KiteConnect(config.API_KEY);

		/*kc.requestAccessToken(requestToken, config.API_SECRET)
			.then(function(response) {
				init();
			})
			.catch(function(err) {
				console.log(err.response);
			})*/

		function init() {
			// Fetch equity margins.
			// You can have other api calls here.

			kc.margins("equity")
				.then(function(response) {
					// You got user's margin details.
				}).catch(function(err) {
					// Something went wrong.
				});
		}
	}
})

module.exports = router;
