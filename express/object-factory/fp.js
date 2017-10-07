var factory = {};


factory.get = function(strObjType) {
	return this[strObjType]
}

factory.placeOrder = {
	"exchange": "NSE",
	"tradingsymbol": ""
}

module.exports = factory;