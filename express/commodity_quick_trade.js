var KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
var config = require('./config')

var actk = 's66hur9zoarytli8uclcwba4ijpn0v2b';
var kc = new KiteConnect(config.API_KEY, {access_token: actk});

var transaction_type = 'BUY';
var stop_loss = '3680';
var price = '3686';
var target = '3700'

var order_id = '';
let payload = {
	tradingsymbol: 'CRUDEOILM17DECFUT',
	exchange: 'MCX',
	segment: 'commodity',
	transaction_type: transaction_type,
	trigger_price: stop_loss,
	quantity: '4',
	order_type: 'MARKET',
	product: 'MIS',
	validity: 'DAY'
}

var ticker = new KiteTicker('2ii3pn7061sv4cmf', 'RP6292', '4d3d5784e80affaa3c15b9e37fd2f690');
ticker.connect();

ticker.on("connect", function() {
	console.log("ticker connected");
	var order_executed = false;
	ticker.setMode(ticker.modeFull, [53480711]);
	ticker.on("tick", function(ticks) {
		console.log(ticks); return;
		let ltp = ticks[0].LastTradedPrice;
		let topAsk = ticks[0].Depth.buy[0].Price;
		let topBid = ticks[0].Depth.sell[0].Price;
		
		//console.log(topAsk + "     " + topBid);

		if(topBid == price && order_executed == false) {
			kc.orderPlace(payload, 'co')
			.then(function(res) {
				console.log('Order Executed');
				console.log(res);
				kc.orders()
				.then(function(orders) {
					var cover_order = orders.data.filter(function(order) {
						return order.parent_order_id == res.data.order_id;
					})
					if(cover_order) {
						console.log(cover_order);
						order_id = cover_order[0].order_id;
						console.log(order_id);
					}
				})

				order_executed = true;
			})	
		}
		if(topAsk >= target && order_executed == true && order_id != '') {
			console.log(order_id);
			kc.orderCancel(order_id, 'co')
			.then(function(res) {
				order_executed = false;
				console.log(res);
				console.log('Done');
				ticker.disconnect();
			})
		}
	})
})