var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = new KiteTicker(api_key, user_id, public_token);

ticker.connect();
ticker.on("tick", setTick);
ticker.on("connect", subscribe);

function setTick(ticks) {
    console.log("Ticks", ticks);
}

function subscribe() {
    var items = [738561];
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
}

var scanner = {};

scanner.start = function() {
	
}

exports.module = scanner;