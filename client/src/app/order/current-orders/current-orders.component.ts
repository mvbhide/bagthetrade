import { Component, OnInit } from '@angular/core'
import { TickerService } from '../../shared/services/ticker-service.service'
import { CommunicatorService } from '../../shared/communicator/communicator.service';
import { DataService } from '../../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import _ from 'lodash';

@Component({
	selector: 'current-orders',
	template: `
	<div class="order-list-container">
		<div class="order-list">
			<!-- <div *ngFor="let pOrders of clubbedOrders.primaryOrders">
				<div *ngIf="pOrders.stopLossOrders.length>0" class="panel panel-primary">
					<div class="panel-heading">{{pOrders.transaction_type}} <strong>{{pOrders.quantity}}</strong> {{pOrders.tradingsymbol}} @ <strong>{{pOrders.price | currency : 'INR' : true : '1.2-2'}}</strong> | Approximate Margin Used : {{pOrders.approx_margin_used | currency : 'INR' : true : '1.0-0'}} | Approximate Brokerage & taxes {{pOrders.broTax | currency : 'INR' : true : '1.0-0'}} </div>
					<div class="panel-body">
						<div class="text-center pnl-main col-lg-12">
							<div class="pnl-block">
								<label class="pnl-label">Profit/Loss at LTP</label>
								<label class="pnl-value"  [ngClass]="{'profit' : pOrders.pnl >= 0 , 'loss' : pOrders.pnl < 0}">{{pOrders.pnl | currency : 'INR' : true : '1.2-2'}}</label>
								<label class="pnl-percent">({{(pOrders.pnl / ds.totalFunds) | percent : '1.2-2'}} of your funds)</label>
							</div>
						</div>
						<div class="col-lg-2">
							<div class="leg-order">Stoploss: {{pOrders.stopLossOrders[0]?.trigger_price}}</div>
							<div class="leg-order">Target: {{pOrders.targetOrders[0]?.price}}</div>
						</div>
						<div class="left-price col-lg-4">
							<label>Someone ready to buy @ {{pOrders.topAsk}}</label>
							<div class="pnl-block">
								<label class="pnl-label">Profit / Loss at Left price</label>
								<label class="pnl-value"  [ngClass]="{'profit' : pOrders.pnl >= 0 , 'loss' : pOrders.pnl < 0}">{{((pOrders.price - pOrders.topAsk) * pOrders.quantity | currency : 'INR' : true : '1.2-2')}} ({{((pOrders.price - pOrders.topAsk) * pOrders.quantity) / ds.totalFunds | percent}} of your funds)</label>
							</div>
							<div class="action-buttons">
								<div *ngIf="pOrders.transaction_type == 'SOLD'">
									<button (click)="moveTarget(pOrders)" class="btn btn-primary">Move target here</button>
								</div>
								<div *ngIf="pOrders.transaction_type == 'BOUGHT'">
									<button class="btn btn-primary">Move SL to breakeven</button>
									<button class="btn btn-primary">Move SL to % profit</button>
								</div>
							</div>
						</div>
						<div class="left-price col-lg-4">
							<label>Someone ready to sell @ {{pOrders.topBid}}</label>
							<div class="pnl-block">
								<label class="pnl-label">Profit/Loss at Right price</label>
								<label class="pnl-value"  [ngClass]="{'profit' : pOrders.pnl >= 0 , 'loss' : pOrders.pnl < 0}">{{((pOrders.price - pOrders.topBid) * pOrders.quantity | currency : 'INR' : true : '1.2-2')}} ({{((pOrders.price - pOrders.topBid) * pOrders.quantity) / ds.totalFunds | percent}} of your funds)</label>
							</div>
							<div class="action-buttons">
								<div *ngIf="pOrders.transaction_type == 'SOLD'">
									<button class="btn btn-primary">Move SL to breakeven</button>
									<button class="btn btn-primary">Move SL to % profit</button>
								</div>
								<div *ngIf="pOrders.transaction_type == 'BOUGHT'">
									<button class="btn btn-primary">Move target here</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="orders">
				<table class="table table-sm">
					<thead>
						<th>Instrument</th>
						<th>Last Traded Price</th>
						<th>Profit / Loss</th>
						<th>% change</th>
						<th>Brokerage</th>
						<th>Actions</th>
					</thead>
					<tbody>
						<tr *ngFor="let pOrders of clubbedOrders.primaryOrders">
							<td>{{pOrders.tradingsymbol}}</td>
							<td>{{pOrders.ltp}}</td>
							<td>{{pOrders.pnl | currency : 'INR' : true : '1.2-2'}}</td>
							<td>{{(pOrders.pnl / ds.totalFunds) | percent : '1.2-2'}} <span class="lbl-of-your-funds"> of your funds</span></td>
							<td>{{pOrders.broTax | currency : 'INR' : true : '1.2-2'}}</td>
							<td>
								<div class="btn-group dropup">
									<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Show Actions</button>
									<div class="dropdown-menu">
										<a class="dropdown-item" href="#">Exit</a>
										<a class="dropdown-item" href="#">Move Stop loss to breakeven</a>
										<a class="dropdown-item" href="#">Modify</a>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div> -->
			<div class="orders">
				<table class="table table-sm">
					<thead>
						<th>Instrument</th>
						<th>Quantity</th>
						<th>LTP</th>
						<th>Profit / Loss <input type="checkbox" (click)="toggleIncludeBroTax()" id="incbt" /><label for="incbt"> Include B&T</label></th>
						<th>% change</th>
						<th>Brokerage</th>
						<th>Action</th>
					</thead>
					<tbody>
						<tr *ngFor="let i of objectkeys(positions)">
							<td>{{i}}</td>
							<td>{{positions[i].quantity}}</td>
							<td>{{positions[i].ltp}}</td>
							<td [ngClass]="{'loss' : positions[i].projectedpnl < 0, 'profit' : positions[i].projectedpnl > 0}">{{(positions[i].projectedpnl != 0 ? positions[i].projectedpnl : positions[i].pnl) | number : '1.2-2' }}</td>
							<td>{{(positions[i].projectedpnl / ds.totalFunds) | percent : '1.2-2'}} <span class="lbl-of-your-funds"> of your funds</span></td>
							<td>{{positions[i].brotax | number : '1.2-2'}}</td>
							<td>
								<div class="btn-group dropup">
									<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Show Actions</button>
									<div class="dropdown-menu">
										<a class="dropdown-item" href="#">Exit</a>
										<a class="dropdown-item" href="#">Move Stop loss to breakeven</a>
										<a class="dropdown-item" href="#">Modify</a>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class='order-list' >
			<a data-toggle="collapse" href="#individual-orders">Show Individual Orders</a>
			<table class="table collapse" id="individual-orders">
				<tr>
					<th>Trading Symbol</th>
					<th>BUY / SELL</th>
					<th>Quantity</th>
					<th>Avg Price</th>
					<th>Price</th>
					<th>Trigger Price</th>
					<th>Status</th>
					<th>OrderId</th>
					<th>Parent OrderId</th>
					<th>Bro Tax</th>
				</tr>
				<tr *ngFor="let order of orders">		
					<td>{{order.tradingsymbol}}</td>
					<td>{{order.transaction_type}}</td>
					<td>{{order.quantity}}</td>
					<td>{{order.average_price}}</td>
					<td>{{order.price}}</td>
					<td>{{order.trigger_price}}</td>
					<td>{{order.status}}</td>
					<td>{{order.order_id}}</td>
					<td>{{order.parent_order_id}}</td>
					<td>{{order.broTax}}</td>
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
		.panel-heading {
			font-size: 16px;
		}
		.pnl-main {
			border-bottom: 1px solid #AAA; 
			padding: 15px;
		}

		.pnl-block label {
			display: inline-table;
		}
		.pnl-block .pnl-label {
			font-size: 12px;
			color: #333;
			font-weight: normal;
		}

		.pnl-block .pnl-value {
			font-size: 20px;
			width: 200px;
		}

		.lbl-of-your-funds {
			font-size: 8px;
		}
		.pnl-block .pnl-percent {
			font-size: 14px;
			opacity: 0.8;
		}
	`]
})
export class CurrentOrdersComponent implements OnInit {
	clubbedOrders: Array<object> = [];
	includeBroTax: boolean = false;
	latestTicks: any = "";

	constructor(private cPort: CommunicatorService, private ds: DataService, private http: Http, private ticker: TickerService) {
		this.http.get('http://localhost:8080/orders')
		.subscribe(data => {
			var res = data.json();
			this.orders = JSON.parse(res.body).data
			this.clubOrders()
		})
		
		this.cPort = cPort;
		this.ds = ds;
	}

	ngOnInit(): void {
		let groupedOrders = _.groupBy(this.orders, function(o) { return o.tradingsymbol})
		let twoLevelGroupedOrders = _.map(groupedOrders, function(stock) { return _.groupBy(stock, function(orders) { return orders.parent_order_id })});
		
		this.clubOrders();
		this.ds.ticksUpdated.subscribe(ticks => {
			this.latestTicks = ticks;
			this.calculatePositions(ticks)	
		})

		this.ds.ordersUpdated.subscribe(orders=> {
			this.orders = orders.data;
			this.clubOrders();
		})
	}

	moveTarget(order) {
		let targetOrders = order.targetOrders;
		let price = order.topAsk;
		targetOrders.map(order => {this.placeOrder(order, price)});
	}

	placeOrder(order, price) {
		let payload = {
			order_id: order.order_id,
			parent_order_id: order.parent_order_id,
			tradingsymbol: order.tradingsymbol,
			exchange: order.exchange,
			quantity: order.quantity,
			price: price,
		}

		this.cPort.send({method : 'placeorder', payload: payload})
	}

	clubOrders() {
		let orders = this.orders;

		// Calculate positions
		for(let i=0; i<orders.length; i++) {
			if(orders[i]['exchange'] == 'MCX') {
				let symbol = orders[i].tradingsymbol.substring(0, orders[i].tradingsymbol.length - 8);
				switch(symbol) {
					case 'CRUDEOILM':
						orders[i].multiplier = 10;
						break;
					case 'CRUDEOIL':
						orders[i].multiplier = 100;
						break;
					case 'COPPERM':
					case 'NICKEL' :
						orders[i].multiplier = 250;
						break;
				}
			} else {
				orders[i].multiplier = 1;
			}
			if(!this.positions[orders[i].tradingsymbol] && orders[i].status !== 'REJECTED') {
				this.positions[orders[i].tradingsymbol] = {};
				this.positions[orders[i].tradingsymbol]['tradingsymbol'] = orders[i].tradingsymbol;
				this.positions[orders[i].tradingsymbol]['instrument_token'] = orders[i].instrument_token;
				this.positions[orders[i].tradingsymbol]['multiplier'] = orders[i].multiplier;
				this.positions[orders[i].tradingsymbol]['quantity'] = 0;
				this.positions[orders[i].tradingsymbol]['total_quantity'] = 0;
				this.positions[orders[i].tradingsymbol]['average_price'] = orders[i].average_price;
				this.positions[orders[i].tradingsymbol]['pnl'] = 0;
				this.positions[orders[i].tradingsymbol]['brotax'] = 0;
			}

			if(orders[i].broTax) {
				this.positions[orders[i].tradingsymbol].brotax += orders[i].broTax;
			}
			
			if(orders[i]['status'] != 'REJECTED' && orders[i]['status'] != 'CANCELLED' && orders[i].status !== 'OPEN' && orders[i].status !== 'TRIGGER PENDING'){
			
				if(orders[i].transaction_type == 'SELL') {
					try {
						this.positions[orders[i].tradingsymbol].quantity += orders[i].quantity;
						this.positions[orders[i].tradingsymbol]['pnl'] += (orders[i].quantity * orders[i].average_price * orders[i].multiplier);
					} catch (e) {
						console.log(orders[i]);
					}
					
				}
				if(orders[i].transaction_type == 'BUY') {
					this.positions[orders[i].tradingsymbol].quantity -= orders[i].quantity;
					this.positions[orders[i].tradingsymbol]['pnl'] -= (orders[i].quantity * orders[i].average_price * orders[i].multiplier);
				}	
			}

			if( orders[i].status != 'REJECTED'){
				let o = orders[i];
				
				o.quantity = o.quantity * o.multiplier;

				let turnover = o.price * o.quantity;
				let brokerage = parseFloat(Math.min(turnover*0.0001, 20).toFixed(2));

				let transactionCharges = parseFloat((turnover * 0.0000325).toFixed(2));

				// Transaction tax is levied on the sell side of the order
				let transactionTax = 0;
				if( o.transaction_type == 'SELL') {
					transactionTax = Math.round(parseFloat(((o.price * o.quantity) * 0.00025).toFixed(2)));
				}
			
				let gst = parseFloat(((brokerage + transactionCharges) * 0.18).toFixed(2));
				let stampDuty = parseFloat((turnover * 0.00002).toFixed(2));
				let sebiCharges = parseFloat((turnover * 0.0000015).toFixed(2));

				o.broTax = brokerage + transactionCharges + transactionTax + gst + stampDuty + sebiCharges;	
			}
			
			
			//o['pnl'] = (o['price'] - o.ltp)*o['quantity']*o['multiplier'];
		}
		console.log(this.orders)

		if(orders.length == 0) return;
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
					let divider = orders[i]['exchange'] == 'MCX' ? 7.14 : 20.8;
					orders[i]['approx_margin_used'] = Math.ceil((orders[i]['price'] * orders[i]['quantity']) / divider);
				}
				clubbedOrders['primaryOrders'].push(orders[i]);
			}
		}

		for(let i=0; i<clubbedOrders['primaryOrders'].length; i++) {
			if((clubbedOrders['primaryOrders'][i]['variety'] == 'bo' || clubbedOrders['primaryOrders'][i]['variety'] == 'co' || clubbedOrders['primaryOrders'][i]['product'] == 'MIS') && clubbedOrders['primaryOrders'][i]['status'] != 'REJECTED') {
				let o = clubbedOrders['primaryOrders'][i];
				
				/*o.quantity = o.quantity * o.multiplier;

				let turnover = o.price * o.quantity;
				let brokerage = Math.min(turnover*0.0001, 20);

				let transactionCharges = turnover * 0.0000325;

				// Transaction tax is levied on the sell side of the order
				let transactionTax = 0;
				if( o.trasaction_type == 'SOLD') {
					transactionTax = (o.price * o.quantity) * 0.00025;
				}
			
				let gst = (brokerage + transactionCharges) * 0.18;
				let stampDuty = turnover * 0.00002;
				let sebiCharges = turnover * 0.0000015;

				o.broTax = brokerage + transactionCharges + transactionTax + gst + stampDuty + sebiCharges;*/
				o.targetOrders = [];
				o.stopLossOrders = [];
				o.completedOrders = [];
				o.cancelledOrders = [];
				o.ltp = 1;
				o.topAsk = 1;
				o.topBid = 1;
				o['pnl'] = (o['price'] - o.ltp)*o['quantity']*o['multiplier'];
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

		// Subscribe ticker for the orders
		for(let i=0; i<clubbedOrders['primaryOrders'].length; i++) {
			this.ticker.subscribe([clubbedOrders['primaryOrders'][i].instrument_token])
		}

		this.clubbedOrders = clubbedOrders;
		console.log(clubbedOrders);
	}


	toggleIncludeBroTax() {
		console.log(this.latestTicks);
		this.includeBroTax = !this.includeBroTax;
		this.calculatePositions(this.latestTicks)
	}


	calculatePositions(ticks) {
		if(ticks == "" || ticks == null) return;
		this.ds.pnl = 0;
		this.ds.brotax = 0;
		for (var i=0; i<Object.keys(this.positions).length; i++) {
			let o = this.positions[Object.keys(this.positions)[i]];
			o.brotax = 0;
			let tickdata = ticks.ticks;

			// Add Brokerage to positions
			
				for(let ord_count=0; ord_count<this.orders.length; ord_count++) {
					if(this.orders[ord_count].instrument_token == o.instrument_token) {
						if(this.orders[ord_count].broTax && this.orders[ord_count].status != 'REJECTED') {
							o.brotax += this.orders[ord_count].broTax;
							this.ds.brotax += o.brotax;
						}
					}
				}	
			
			
			
				for(let j=0; j<tickdata.length;j++) {
					if(tickdata[j].Token == o.instrument_token){
						o.ltp = tickdata[j].LastTradedPrice;
						o.projectedpnl = o.pnl - (tickdata[j].LastTradedPrice * Math.abs(o.quantity) * o.multiplier)

						if(this.includeBroTax == true) {
							o.projectedpnl -= o.brotax
						}

						this.ds.pnl += o.projectedpnl
					}
				}
			
		}


		/*if(typeof this.clubbedOrders["primaryOrders"] == 'undefined') return;
		for(let i=0; i<this.clubbedOrders['primaryOrders'].length; i++) {
			let tickdata = ticks.ticks;
			for(let j=0; j<tickdata.length;j++) {
				if(this.clubbedOrders['primaryOrders'][i]['instrument_token'] == tickdata[j]['Token']) {
					this.clubbedOrders['primaryOrders'][i]['ltp'] = tickdata[j]['LastTradedPrice'];
					if(this.clubbedOrders['primaryOrders'][i]['transaction_type'] == 'BOUGHT') {
						this.clubbedOrders['primaryOrders'][i]['pnl'] = (tickdata[j]['LastTradedPrice'] - this.clubbedOrders['primaryOrders'][i]['price']) * (this.clubbedOrders['primaryOrders'][i]['quantity']);
					} else {
						this.clubbedOrders['primaryOrders'][i]['pnl'] = (this.clubbedOrders['primaryOrders'][i]['price'] - tickdata[j]['LastTradedPrice']) * (this.clubbedOrders['primaryOrders'][i]['quantity']);	
					}
					
					if(tickdata[j]['mode'] == 'full') {
						this.clubbedOrders['primaryOrders'][i]['topAsk'] = tickdata[j]['Depth'].buy[0].Price;
						this.clubbedOrders['primaryOrders'][i]['topBid'] = tickdata[j]['Depth'].sell[0].Price;
					}
				}	
			}
			
		}*/
	}

	//orders: Array<object> = [];

	orders: Array<any> = 	[];//[{"placed_by":"RP6292","order_id":"180313001825995","exchange_order_id":"231807200151718","parent_order_id":"180313001825994","status":"TRIGGER PENDING","status_message":null,"order_timestamp":"2018-03-13 16:55:25","exchange_update_timestamp":null,"exchange_timestamp":"2018-03-13 16:55:25","variety":"co","exchange":"MCX","tradingsymbol":"NATURALGAS18MARFUT","instrument_token":53705991,"order_type":"SL-M","transaction_type":"BUY","validity":"DAY","product":"CO","quantity":1,"disclosed_quantity":0,"price":0,"trigger_price":183.1,"average_price":0,"filled_quantity":0,"pending_quantity":1,"cancelled_quantity":0,"market_protection":0,"tag":null,"guid":null},{"placed_by":"RP6292","order_id":"180313001825994","exchange_order_id":"211807200129118","parent_order_id":null,"status":"COMPLETE","status_message":null,"order_timestamp":"2018-03-13 17:01:07","exchange_update_timestamp":null,"exchange_timestamp":"2018-03-13 16:55:25","variety":"co","exchange":"MCX","tradingsymbol":"NATURALGAS18MARFUT","instrument_token":53705991,"order_type":"LIMIT","transaction_type":"SELL","validity":"DAY","product":"CO","quantity":1,"disclosed_quantity":0,"price":182.4,"trigger_price":0,"average_price":182.4,"filled_quantity":1,"pending_quantity":0,"cancelled_quantity":0,"market_protection":0,"tag":null,"guid":"HZuqrO6cqc0lo56n"}];
	positions: Array<any> = [];

	// Using Object.keys as a variable to use in the template to loop through positions
	objectkeys = Object.keys;
}