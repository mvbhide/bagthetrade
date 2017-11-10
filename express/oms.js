var objFactory = require('./object-factory/fp');
var KiteConnect = require("kiteconnect").KiteConnect;
var _ = require('lodash/fp');
var kc = new KiteConnect("your_api_key");

var oms = {};

oms.placeOrder = function(objOrder) {

	var orderParams = _.extend(objFactory.get('placeOrder'), objOrder);
	return kc.orderPlace(orderParams)
	.then(function(res) {
		if(res && res.data) {
			if(res.status === "success") {
				return res.data.order_id;
			}
		}
	})
	.catch(function(err) {
		console.log(err)
		var res = {
			"status": "success",
			"data": {
				"order_id": "151220000000000"
			}
		}
		return res.data.order_id;
	})
}

module.exports = oms