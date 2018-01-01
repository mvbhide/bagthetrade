var objFactory = require('./object-factory/fp');
var KiteConnect = require("kiteconnect").KiteConnect;
var _ = require('lodash/fp');
var db = require('./db');
var config = require('./config');

var actk = 'mh1ibtvgtlxkt1qvwtyvrsq8vwtmxyxr';
var kc = new KiteConnect(config.API_KEY, {access_token: actk});

var oms = {};

oms.placeOrder = function(objOrder) {
	return new Promise(function(resolve, reject) {
		db.getAccessToken(config.API_KEY)
		.then(function(response) {
			ticker.subscribe(objOrder.instrument_token);
			var actk = response.access_token;
			var kc = new KiteConnect(config.API_KEY, {access_token: actk});

			var orderParams = _.extend(objFactory.get('placeOrder'), objOrder);
			kc.orderPlace(orderParams)
			.then(function(res) {
				if(res && res.data) {
					if(res.status === "success") {
						resolve(res.data.order_id);
					}
				}
			})
			.catch(function(err) {
				reject(err)
			})
		});
	})
}

module.exports = oms

var ticker = require('./ticker');