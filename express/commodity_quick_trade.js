var KiteConnect = require("kiteconnect").KiteConnect;
var KiteTicker = require("kiteconnect").KiteTicker;
var config = require('./config')

var actk = '92nycxdt4hxdo74bv9djk8sgsorbxqyc';
var kc = new KiteConnect(config.API_KEY, {access_token: actk});

var transaction_type = 'BUY';
var stop_loss = '3715';
var price = '3732';
var target = '3335'
var tradingsymbol = 'CRUDEOIL17DECFUT'

var order_id = '';
let payload = {
	tradingsymbol: tradingsymbol,
	exchange: 'MCX',
	segment: 'commodity',
	transaction_type: transaction_type,
	trigger_price: stop_loss,
	quantity: '1',
	order_type: 'MARKET',
	product: 'MIS',
	validity: 'DAY'
}
var order_executed = false;
var ticker = new KiteTicker('2ii3pn7061sv4cmf', 'RP6292', '4d3d5784e80affaa3c15b9e37fd2f690');
ticker.connect();

ticker.on("connect", function() {
	console.log("ticker connected");
	
	ticker.setMode(ticker.modeFull, [53480455]);
	ticker.on("tick", function(ticks) {
		let ltp = ticks[0].LastTradedPrice;
		let topAsk = ticks[0].Depth.buy[0].Price;
		let topBid = ticks[0].Depth.sell[0].Price;
		
		console.log(topAsk + "     " + topBid);

		if(transaction_type == 'BUY') {
			if(topBid <= price && order_executed == false) {
				placeorder()
			}
			if(topAsk >= target && order_executed == true && order_id != '') {
				exitorder();
			}
		} else if(transaction_type == 'SELL') {
			if(topAsk >= price && order_executed == false) {
				placeorder()
			}
			if(topBid <= target && order_executed == true && order_id != '') {
				exitorder();
			}
		}

		function placeorder() {
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
						order_id = cover_order[0].order_id;
						console.log(order_id);
					}
				})

				order_executed = true;
			})	
		}

		function exitorder() {
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