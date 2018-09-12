/* var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = {}

var tckr = new KiteTicker('2ii3pn7061sv4cmf', 'RP6292', '4d3d5784e80affaa3c15b9e37fd2f690');

tckr.connect();
tckr.on("connect", function() {
	console.log("ticker connected");
	console.log("ticker connection: ",tckr.connected())
	var tokens  = tckr.subscribe([53644807,53645063,53687047,53484039,53505543,53517319,53646855,53490439,53703687,53686791,53516551,53656839,53516807,53645319,53508103,53687303,53455111,53649927]);
})

tckr.on("disconnect", function() {
	console.log("ticker disconnected");
})

tckr.on("tick", function(ticks) {
	console.log(ticks.length)
})

setTimeout(function() {
	tckr.disconnect();
},10000)

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

module.exports = ticker; */