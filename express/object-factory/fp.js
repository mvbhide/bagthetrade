var factory = {};


factory .default = {
	"status": "success",
	"data": {
		"order_variety": [
			"regular",
			"amo",
			"bo",
			"co"
		],
		"segment": [
			"equity",
			"commodity"
		],
		"transaction_type": [
			"BUY",
			"SELL"
		],
		"order_type": [
			"MARKET",
			"LIMIT",
			"SL",
			"SL-M"
		],
		"position_type": [
			"day",
			"overnight"
		],
		"validity": [
			"DAY",
			"IOC",
			"AMO"
		],
		"product": [
			"NRML",
			"MIS",
			"CNC"
		],
		"exchange": [
			"NSE",
			"BSE",
			"NFO",
			"CDS",
			"MCX"
		]
	}
}

factory.get = function(strObjType) {
	return this[strObjType]
}


factory.placeOrder = {
	"exchange": "NSE",
	"tradingsymbol": ""
}

module.exports = factory;