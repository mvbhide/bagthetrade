var objFactory = require('./object-factory/fp');
var KiteConnect = require("kiteconnect").KiteConnect;
var _ = require('lodash/fp');
var kc = new KiteConnect("your_api_key");

/*kc.requestAccessToken("request_token", "api_secret")
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

var oms = {};

oms.placeOrder = function(objOrder) {

	var orderParams = _.extend(objFactory.get('placeOrder'), objOrder);
	kc.orderPlace(orderParams)
		.then(function(res) {

		})
		.catch(function(err) {
			console.log(err);
		})
}

module.exports = oms