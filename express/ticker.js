var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = {}

var tckr = new KiteTicker('2ii3pn7061sv4cmf', 'RP6292', '4d3d5784e80affaa3c15b9e37fd2f690');
tckr.connect();
tckr.on("connect", function() {
	console.log("ticker connected");
})

tckr.on("disconnect", function() {
	console.log("ticker disconnected");
})

ticker.subscribed = [];

ticker.subscribe = function(instrument_token) {
	ticker.subscribed.push(instrument_token);
	tckr.setMode(tckr.modeFull, [instrument_token]);
	console.log(instrument_token + " subscribed")
}

ticker.unsubscribe = function(instrument_token) {
	var index = ticker.subscribed.indexOf(instrument_token);
	if(index > -1) {
	    ticker.subscribed.splice(index, 1);
	}
	tckr.unsubscribe([instrument_token]);
}

module.exports = ticker;