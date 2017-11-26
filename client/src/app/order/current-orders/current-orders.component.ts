import { Component, OnInit } from '@angular/core'
import { CommunicatorService } from '../../shared/communicator/communicator.service';
import { DataService } from '../../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import _ from 'lodash';

@Component({
	selector: 'current-orders',
	template: `
	<div class="order-list-container">
		<div class="order-list">
			<div *ngFor="let pOrders of clubbedOrders.primaryOrders">
				<div *ngIf="pOrders.stopLossOrders.length>0" class="panel panel-primary">
					<div class="panel-heading">{{pOrders.transaction_type}} {{pOrders.quantity}} {{pOrders.tradingsymbol}} @ {{pOrders.price}} | Approximate Margin Used : {{pOrders.approx_margin_used | currency : 'INR' : true : '4.2-2'}} </div>
					<div class="panel-body">
						<div class="profit-direction"></div>
						<div class="col-lg-6">{{pOrders.stopLossOrders[0].trigger_price}}</div>
						<div class="col-lg-6">{{pOrders.targetOrders[0].price}}</div>
					</div>
				</div>
			</div>
		</div>
		<div class='order-list' >
			<a data-toggle="collapse" href="#individual-orders">Show Individual Orders</a>
			<table class="table collapse" id="individual-orders">
				<tr>
					<th>Trading Symbol</th>
					<th>BUY / SELL</th>
					<th>Quantity</th>
					<th>Status</th>
					<th>OrderId</th>
					<th>Parent OrderId</th>
				</tr>
				<tr *ngFor="let order of orders">		
					<td>{{order.tradingsymbol}}</td>
					<td>{{order.transaction_type}}</td>
					<td>{{order.quantity}}</td>
					<td>{{order.status}}</td>
					<td>{{order.order_id}}</td>
					<td>{{order.parent_order_id}}</td>
				</tr>
			</table>
		</div>
	</div>
	`,
	styles: [`
		.form-control-md {
			color: #000;
		}
		.order-form-container {
			width: 50%;
			box-shadow: 2px 2px 4px 4px #DDD;
		}
		.order-form-header {
			font-size: 16px;
			padding: 15px;
			border-radius: 2px 2px 0px 0px;
		}
		.order-form {
			padding: 15px;
			background: #FFF;
		}
		.order-form label {
			color: #333;
		}
		.order-form input {
			color: #666;
		}
		.order-form ul li {
			list-style: none;
		}
		.order-type {
			margin: 10px 0px;
		}

		.change-transaction-type {
			cursor: pointer;
		}
	`]
})
export class CurrentOrdersComponent implements OnInit {
	clubbedOrders: object;
	constructor(private cPort: CommunicatorService, private ds: DataService) {
		this.cPort = cPort;
		this.ds = ds;
	}

	ngOnInit(): void {
		let groupedOrders = _.groupBy(this.orders, function(o) { return o.tradingsymbol})
		let twoLevelGroupedOrders = _.map(groupedOrders, function(stock) { return _.groupBy(stock, function(orders) { return orders.parent_order_id })});
		
		this.clubOrders();
	}

	clubOrders() {
		let orders = this.orders;
		let clubbedOrders = [];
		
		clubbedOrders['primaryOrders'] = [];
		for(let i=0; i<orders.length; i++) {
			if(orders[i]['parent_order_id'] == null) {
				if(orders[i]['transaction_type'] == 'BUY' && orders[i]['status'] != 'REJECTED'){
					orders[i]['transaction_type'] = 'BOUGHT'
				}
				if(orders[i]['transaction_type'] == 'SELL' && orders[i]['status'] != 'REJECTED'){
					orders[i]['transaction_type'] = 'SOLD'
				}
				if(orders[i]['status'] == 'COMPLETE') {
					orders[i]['approx_margin_used'] = (orders[i]['price'] * orders[i]['quantity']) / 20.8;
				}
				clubbedOrders['primaryOrders'].push(orders[i]);
			}
		}

		for(let i=0; i<clubbedOrders['primaryOrders'].length; i++) {
			if((clubbedOrders['primaryOrders'][i]['variety'] == 'bo' || clubbedOrders['primaryOrders'][i]['variety'] == 'co') && clubbedOrders['primaryOrders'][i]['status'] != 'REJECTED') {
				clubbedOrders['primaryOrders'][i].targetOrders = [];
				clubbedOrders['primaryOrders'][i].stopLossOrders = [];
				clubbedOrders['primaryOrders'][i].completedOrders = [];
				clubbedOrders['primaryOrders'][i].cancelledOrders = [];
			}

			for(let j=0; j<orders.length; j++) {
				if(clubbedOrders['primaryOrders'][i]['order_id'] == orders[j]['parent_order_id'] && orders[j]['status'] == 'OPEN') {
					clubbedOrders['primaryOrders'][i].targetOrders.push(orders[j]);
				}

				if(clubbedOrders['primaryOrders'][i]['order_id'] == orders[j]['parent_order_id'] && orders[j]['status'] == 'TRIGGER PENDING') {
					clubbedOrders['primaryOrders'][i].stopLossOrders.push(orders[j]);
				}

				if(clubbedOrders['primaryOrders'][i]['order_id'] == orders[j]['parent_order_id'] && orders[j]['status'] == 'COMPLETE') {
					clubbedOrders['primaryOrders'][i].completedOrders.push(orders[j]);
				}

				if(clubbedOrders['primaryOrders'][i]['order_id'] == orders[j]['parent_order_id'] && orders[j]['status'] == 'CANCELLED') {
					clubbedOrders['primaryOrders'][i].cancelledOrders.push(orders[j]);
				}
			}
		}

		this.clubbedOrders = clubbedOrders;
		console.log(clubbedOrders);
	}

	orders: Array<object> = [{
		"average_price": 92.15,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1300000000747342",
		"exchange_timestamp": "2017-11-20 09:38:20",
		"filled_quantity": 500,
		"instrument_token": 877057,
		"market_protection": 0,
		"order_id": "171120000196787",
		"order_timestamp": "2017-11-20 09:38:20",
		"order_type": "LIMIT",
		"parent_order_id": null,
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 92.05,
		"product": "BO",
		"quantity": 500,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "TATAPOWER",
		"transaction_type": "SELL",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 158.5,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1000000000846488",
		"exchange_timestamp": "2017-11-20 09:48:06",
		"filled_quantity": 600,
		"instrument_token": 6401,
		"market_protection": 0,
		"order_id": "171120000191913",
		"order_timestamp": "2017-11-20 09:48:06",
		"order_type": "LIMIT",
		"parent_order_id": null,
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 158.5,
		"product": "BO",
		"quantity": 600,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ADANIENT",
		"transaction_type": "SELL",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 600,
		"exchange": "NSE",
		"exchange_order_id": "1000000001135616",
		"exchange_timestamp": "2017-11-20 10:01:11",
		"filled_quantity": 0,
		"instrument_token": 6401,
		"market_protection": 0,
		"order_id": "171120000263299",
		"order_timestamp": "2017-11-20 10:01:11",
		"order_type": "SL-M",
		"parent_order_id": "171120000191913",
		"pending_quantity": 600,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 600,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ADANIENT",
		"transaction_type": "BUY",
		"trigger_price": 159.7,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 91.6,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1300000000800495",
		"exchange_timestamp": "2017-11-20 10:19:03",
		"filled_quantity": 500,
		"instrument_token": 877057,
		"market_protection": 0,
		"order_id": "171120000209583",
		"order_timestamp": "2017-11-20 10:20:32",
		"order_type": "LIMIT",
		"parent_order_id": "171120000196787",
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 91.6,
		"product": "BO",
		"quantity": 500,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "TATAPOWER",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 500,
		"disclosed_quantity": 500,
		"exchange": "NSE",
		"exchange_order_id": "1300000000800496",
		"exchange_timestamp": "2017-11-20 10:20:32",
		"filled_quantity": 0,
		"instrument_token": 877057,
		"market_protection": 0,
		"order_id": "171120000209584",
		"order_timestamp": "2017-11-20 10:20:32",
		"order_type": "SL-M",
		"parent_order_id": "171120000196787",
		"pending_quantity": 500,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 500,
		"status": "CANCELLED",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "TATAPOWER",
		"transaction_type": "BUY",
		"trigger_price": 92.65,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 600,
		"exchange": "NSE",
		"exchange_order_id": "1000000001135615",
		"exchange_timestamp": "2017-11-20 11:01:52",
		"filled_quantity": 0,
		"instrument_token": 6401,
		"market_protection": 0,
		"order_id": "171120000263298",
		"order_timestamp": "2017-11-20 11:01:52",
		"order_type": "LIMIT",
		"parent_order_id": "171120000191913",
		"pending_quantity": 600,
		"placed_by": "RP6292",
		"price": 156.8,
		"product": "BO",
		"quantity": 600,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ADANIENT",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 114.75,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1000000001844212",
		"exchange_timestamp": "2017-11-20 11:10:50",
		"filled_quantity": 1000,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000452320",
		"order_timestamp": "2017-11-20 11:10:52",
		"order_type": "LIMIT",
		"parent_order_id": null,
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 114.75,
		"product": "BO",
		"quantity": 1000,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "SELL",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 214,
		"disclosed_quantity": 214,
		"exchange": "NSE",
		"exchange_order_id": "1000000002229101",
		"exchange_timestamp": "2017-11-20 11:40:44",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000543328",
		"order_timestamp": "2017-11-20 11:40:44",
		"order_type": "LIMIT",
		"parent_order_id": "171120000452320",
		"pending_quantity": 214,
		"placed_by": "RP6292",
		"price": 113.75,
		"product": "BO",
		"quantity": 214,
		"status": "CANCELLED",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 115.3,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1000000002229100",
		"exchange_timestamp": "2017-11-20 11:40:44",
		"filled_quantity": 214,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000543329",
		"order_timestamp": "2017-11-20 11:40:44",
		"order_type": "LIMIT",
		"parent_order_id": "171120000452320",
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 214,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 115.25,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 786,
		"disclosed_quantity": 786,
		"exchange": "NSE",
		"exchange_order_id": "1000000002229370",
		"exchange_timestamp": "2017-11-20 11:40:44",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000543415",
		"order_timestamp": "2017-11-20 11:40:44",
		"order_type": "LIMIT",
		"parent_order_id": "171120000452320",
		"pending_quantity": 786,
		"placed_by": "RP6292",
		"price": 113.75,
		"product": "BO",
		"quantity": 786,
		"status": "CANCELLED",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 115.3,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1000000002229371",
		"exchange_timestamp": "2017-11-20 11:40:44",
		"filled_quantity": 786,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000543416",
		"order_timestamp": "2017-11-20 11:40:44",
		"order_type": "LIMIT",
		"parent_order_id": "171120000452320",
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 786,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 115.25,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 6,
		"exchange": "NSE",
		"exchange_order_id": "1000000003236621",
		"exchange_timestamp": "2017-11-20 12:40:19",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754507",
		"order_timestamp": "2017-11-20 12:40:19",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 6,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 6,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 6,
		"exchange": "NSE",
		"exchange_order_id": "1000000003236622",
		"exchange_timestamp": "2017-11-20 12:40:19",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754508",
		"order_timestamp": "2017-11-20 12:40:19",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 6,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 6,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 1,
		"exchange": "NSE",
		"exchange_order_id": "1000000003237874",
		"exchange_timestamp": "2017-11-20 12:40:28",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754804",
		"order_timestamp": "2017-11-20 12:40:28",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 1,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 1,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 1,
		"exchange": "NSE",
		"exchange_order_id": "1000000003237875",
		"exchange_timestamp": "2017-11-20 12:40:28",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754805",
		"order_timestamp": "2017-11-20 12:40:28",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 1,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 1,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 24,
		"exchange": "NSE",
		"exchange_order_id": "1000000003238099",
		"exchange_timestamp": "2017-11-20 12:40:30",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754905",
		"order_timestamp": "2017-11-20 12:40:30",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 24,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 24,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 24,
		"exchange": "NSE",
		"exchange_order_id": "1000000003238100",
		"exchange_timestamp": "2017-11-20 12:40:30",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000754906",
		"order_timestamp": "2017-11-20 12:40:30",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 24,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 24,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 100,
		"exchange": "NSE",
		"exchange_order_id": "1000000003238726",
		"exchange_timestamp": "2017-11-20 12:40:35",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755087",
		"order_timestamp": "2017-11-20 12:40:35",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 100,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 100,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 100,
		"exchange": "NSE",
		"exchange_order_id": "1000000003238727",
		"exchange_timestamp": "2017-11-20 12:40:35",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755088",
		"order_timestamp": "2017-11-20 12:40:35",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 100,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 100,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 10,
		"exchange": "NSE",
		"exchange_order_id": "1000000003239114",
		"exchange_timestamp": "2017-11-20 12:40:39",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755205",
		"order_timestamp": "2017-11-20 12:40:39",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 10,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 10,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 10,
		"exchange": "NSE",
		"exchange_order_id": "1000000003239115",
		"exchange_timestamp": "2017-11-20 12:40:39",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755206",
		"order_timestamp": "2017-11-20 12:40:39",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 10,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 10,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 15,
		"exchange": "NSE",
		"exchange_order_id": "1000000003239945",
		"exchange_timestamp": "2017-11-20 12:40:45",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755388",
		"order_timestamp": "2017-11-20 12:40:45",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 15,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 15,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 15,
		"exchange": "NSE",
		"exchange_order_id": "1000000003239946",
		"exchange_timestamp": "2017-11-20 12:40:45",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755389",
		"order_timestamp": "2017-11-20 12:40:45",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 15,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 15,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 10,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241162",
		"exchange_timestamp": "2017-11-20 12:40:54",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755662",
		"order_timestamp": "2017-11-20 12:40:54",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 10,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 10,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 10,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241163",
		"exchange_timestamp": "2017-11-20 12:40:54",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755663",
		"order_timestamp": "2017-11-20 12:40:54",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 10,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 10,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 500,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241536",
		"exchange_timestamp": "2017-11-20 12:40:57",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755757",
		"order_timestamp": "2017-11-20 12:40:57",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 500,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 500,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 500,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241537",
		"exchange_timestamp": "2017-11-20 12:40:57",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755758",
		"order_timestamp": "2017-11-20 12:40:57",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 500,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 500,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 264,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241836",
		"exchange_timestamp": "2017-11-20 12:40:58",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755804",
		"order_timestamp": "2017-11-20 12:40:58",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 264,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 264,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 264,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241837",
		"exchange_timestamp": "2017-11-20 12:40:58",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755805",
		"order_timestamp": "2017-11-20 12:40:58",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 264,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 264,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 115.1,
		"cancelled_quantity": 0,
		"disclosed_quantity": 0,
		"exchange": "NSE",
		"exchange_order_id": "1000000003203015",
		"exchange_timestamp": "2017-11-20 12:37:20",
		"filled_quantity": 1500,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000747484",
		"order_timestamp": "2017-11-20 12:40:59",
		"order_type": "LIMIT",
		"parent_order_id": null,
		"pending_quantity": 0,
		"placed_by": "RP6292",
		"price": 115.1,
		"product": "BO",
		"quantity": 1500,
		"status": "COMPLETE",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "SELL",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 570,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241994",
		"exchange_timestamp": "2017-11-20 12:40:59",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755825",
		"order_timestamp": "2017-11-20 12:40:59",
		"order_type": "LIMIT",
		"parent_order_id": "171120000747484",
		"pending_quantity": 570,
		"placed_by": "RP6292",
		"price": 113.1,
		"product": "BO",
		"quantity": 570,
		"status": "OPEN",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 0,
		"validity": "DAY",
		"variety": "bo"
	}, {
		"average_price": 0,
		"cancelled_quantity": 0,
		"disclosed_quantity": 570,
		"exchange": "NSE",
		"exchange_order_id": "1000000003241995",
		"exchange_timestamp": "2017-11-20 12:40:59",
		"filled_quantity": 0,
		"instrument_token": 54273,
		"market_protection": 0,
		"order_id": "171120000755826",
		"order_timestamp": "2017-11-20 12:40:59",
		"order_type": "SL-M",
		"parent_order_id": "171120000747484",
		"pending_quantity": 570,
		"placed_by": "RP6292",
		"price": 0,
		"product": "BO",
		"quantity": 570,
		"status": "TRIGGER PENDING",
		"status_message": null,
		"tag": null,
		"tradingsymbol": "ASHOKLEY",
		"transaction_type": "BUY",
		"trigger_price": 116.3,
		"validity": "DAY",
		"variety": "bo"
	}]
	
}