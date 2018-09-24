import { Component, Input } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { TickerService } from '../shared/services/ticker-service.service';
import { AppConfig } from '../config/app.config';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/observable/of';
import * as config from '../shared/services/config.service'



@Component({
	selector: 'order-form',
	template:` 
	<div class="order-form-container">
		<div class="order-form-header row"  [ngClass]="{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}">
			<div class="order-details col-lg-10">
				{{transactionType}} {{quantity}} of {{tradingsymbol}} @ {{price | currency : 'INR' : true}}
			</div>
			<div class="col-lg-2 change-transaction-type text-right" (click)="toggleTransactionType();">B <span class="oi oi-loop"></span> S</div>
		</div>
		<div class='order-form' >
			<form>
				<div class="row">
					<div class="col-lg-3 del-type-intraday">
						<input type='radio' [checked]="isBracketOrder || isCoverOrder || isIntraday" name="order-type" id="orderTypeIntraday" value="MIS" (change)="toggleOrderType()"><label for="orderTypeIntraday" class="radio-inline">Intraday</label>
						<info-tooltip showfor=".del-type-intraday" info="Buying Intraday. The position will be auto squared off at market price few mins before market close"></info-tooltip>
					</div>
					<div class="col-lg-3 del-type-delivery">
						<input class="col-lg-3 text-right" type='radio' name="order-type" id="orderTypeDelivery" value="CNC" checked (change)="toggleOrderType()"><label for="orderTypeDelivery" class="radio-inline">Delivery</label>
					</div>
					<div class="col-lg-3 del-type-stoplss" [ngClass]="{'cannot-specify' : (isBracketOrder || isCoverOrder)}">
						<input class="col-lg-3 text-right" type='checkbox' name="order-type-stoploss" id="orderTypeStoploss" [checked]="isStoplossOrder" value="CNC" (change)="toggleStoplossOrder()"><label for="orderTypeStoploss" class="radio-inline">Stoploss</label>
					</div>
					<div class="col-lg-3" *ngIf="warning">
						<i id="warning" class="glyphicon glyphicon-warning"></i>
						<info-tooltip showfor="#warning" info="{{warningMessage}}"></info-tooltip>
					</div>
				</div>
				<hr />
				<div class="div-intraday-order-type">
					<div class="row">
						<div class="order-type col-lg-6">
							<div class="div-order-variety">
								<input [checked]="!isBracketOrder && !isCoverOrder" type='radio' name="intraday-order-type" id="orderTypeRegular" checked value="Regular" (change)="setIntradayOrderType('regular')">
								<label for="orderTypeRegular" class="radio-inline">Regular</label>
							</div>
							<div class="div-order-variety" [ngClass]="{'cannot-specify' : segment=='MCX' }">
								<input type='radio' name="intraday-order-type" id="orderTypeBO" value="BO" (change)="setIntradayOrderType('bo')">
								<label for="orderTypeBO" class="radio-inline">BO </label>
								<info-tooltip info="'Bracket Order: You can place {{transactionType}} order, stoploss order and target order in a single transaction'"></info-tooltip>
							</div>
							<div class="div-order-variety">
								<input type='radio' name="intraday-order-type" id="orderTypeCO" value="CO" (change)="setIntradayOrderType('co')">
								<label for="orderTypeCO" class="radio-inline">CO</label>
								<info-tooltip info="'Cover Order: You can place {{transactionType}} order and stoploss order a single transaction. The {{transactionType}} order would be placed at available market rate'"></info-tooltip>
							</div>
						</div>
						<div class="metadata col-lg-6" *ngIf='isIntraday'>
							<label>Leverage: {{leverage | number:'2.1-1'}}x</label>
							<label>Required Margin: </label><span class="margin-required" [ngClass]="{'loss' : segment == 'MCX' ? marginRequired > ds.commodityNet : marginRequired > ds.equityNet}">{{marginRequired | currency: 'INR' : true : '2.0-2'}}</span>
						</div>
					</div>
				</div>

				<div class="form-group row">
					<div class="col-md-3" [ngClass]="{'can-specify' : isBracketOrder || isCoverOrder || isStoplossOrder, 'cannot-specify' : !isBracketOrder && !isCoverOrder && !isStoplossOrder}">
						<label for="stoplossValue">Trigger Stop Loss @</label>
						<input class="form-control" [step]="tickSize" type="number" [(ngModel)]="stoplossValue" name="stoplossValue" id="stoplossValue" (change)="calculateQuantity()" />
					</div>
					<div class="col-md-3">
						<label for="price">{{isStoplossOrder ? 'SL' : transactionType}} at 
							<input [disabled]="isBracketOrder" [checked]="!isLimitOrder" type='checkbox' name="orderLimitMarket" id="orderLimitMarket" value="LIMIT" (change)="toggleLimitMarket()"><label for="orderLimitMarket" class="radio-inline">Market</label>
						</label>
						<input class="form-control" [step]="tickSize" type="number" id="price" [(ngModel)]="price" name="price" (change)="calculateQuantity()" [ngClass]="{'can-specify' : isLimitOrder, 'cannot-specify' : !isLimitOrder}"/>
					</div>

					<div class="col-md-3" [ngClass]="{'can-specify' : isBracketOrder, 'cannot-specify' : !isBracketOrder}">
						<label for="squareoffValue"> Target</label>
						<input [disabled]="!isIntraday" [step]="tickSize" class="form-control" type="number" name="squareoffValue" [(ngModel)]="squareoffValue" id="squareoffValue"/>
					</div>
					<div class="col-md-3">
						<label for="quantity">Quantity</label>
						<input class="form-control" type="number" [step]="quantityMultiplier" name="quantity" [(ngModel)]="quantity" id="quantity" />
					</div>
				</div>
				<hr />
				<div class="text-right">
					<button class="btn" (click)="placeOrder()" [ngClass]="{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}">{{transactionType}}</button>
				</div>
			</form>
		</div>
	</div>
	`,
	styles: [`
		.form-control-md {
			color: #000;
		}
		.order-form-container {
			margin: 0 auto;
		}
		.order-form-header {
			font-size: 16px;
			padding: 15px;
			border-radius: 2px 2px 0px 0px;
			margin:0;
		}
		.metadata label {
			font-weight: normal;
			margin-left: 5%;
		}
		.order-form {
			padding: 15px;
			background: #FFF;
		}
		.order-form label {
			color: #333;
		}
		.order-type label {
			margin-right: 20px;
		}
		.order-form input {
			color: #666;
		}
		.order-form ul li {
			list-style: none;
		}
		.div-intraday-order-type {
			border-bottom: 1px solid #DEDEDE;
			margin-bottom: 15px;
			padding-bottom: 10px;
		}
		.cannot-specify {
			disabled: true;
			opacity: 0.2;
		}
		.change-transaction-type {
			cursor: pointer;
		}
		.ngui-auto-complete-wrapper {
			display: inline-block;
			border: 1px solid red;
		}

		.auto-list-item-wrapper {
			padding: 2px;
		}
		.auto-stock-name {
			font-size: 8px;
			color: #CCC;
		}

		.input-auto-complete {
			width: 100%;
			display: inline-block;
		}
	`]
})
export class OrderFormComponent {
	isIntraday			: boolean = false;
	isStoplossOrder		: boolean = false;
	isBracketOrder		: boolean = false;
	isCoverOrder		: boolean = false;
	isLimitOrder		: boolean = true;
	warning 			: boolean = false;
	warningMessage		: string  = '';
	transactionType 	: string  = 'BUY';
	orderType 			: string  = 'regular';
	tradingsymbol 		: string;
	instrumentToken 	: string;
	segment 			: string;
	exchange			: string;
	squareoffValue 		: number = 0;
	stoplossValue 		: number = 0;
	price 				: number = 0;
	lotSize 			: number = 1;
	tickSize 			: number = 0.05;
	marginRequired 		: number = 0;
	quantity 			: number = 0;
	leverage 			: number = 0;
	coUpper 			: number = 1;
	coLower 			: number = 1;
	multiplier 			: number = 1;
	quantityMultiplier 	: number = 1;
	objMargin 			: object = {};


	margins 			: Array<any>;

	constructor(private http: Http,private cPort: CommunicatorService,public ds: DataService, private ticker: TickerService) {
		this.margins 		 = this.ds.getEquityMargins();
		this.transactionType = this.ds.orderFormOptions.transactionType;
		this.tradingsymbol 	 = this.ds.orderFormOptions.tradingsymbol;
		this.segment 		 = this.ds.orderFormOptions.segment;
		this.exchange		 = this.ds.orderFormOptions.exchange
		this.price 			 = this.ds.orderFormOptions.price;
		this.lotSize 		 = this.ds.orderFormOptions.lotSize;
		this.tickSize 		 = this.ds.orderFormOptions.tickSize
		this.coLower 		 = this.ds.orderFormOptions.coLower;
		this.coUpper 		 = this.ds.orderFormOptions.coUpper;
		this.multiplier 	 = this.ds.orderFormOptions.multiplier;
	}

	ngOnInit() {
		this.calculateRisk();
	}

	// Toggle the transaction type between BUY <--> SELL
	toggleTransactionType() {
		this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
		this.calculateRisk()
	}

	// Toggle the delivery type between Intraday and Cash & Carry
	toggleOrderType() {
		this.isIntraday = !this.isIntraday;
		if(this.isIntraday) {
			//this.isBracketOrder = true;
			//this.isLimitOrder = true;
		} else {
			this.isBracketOrder = false;
			this.isCoverOrder = false;
			this.isLimitOrder = true;
		}
	}


	// Toggle whether the current order is a stop loss order or a Entry / Exit order
	toggleStoplossOrder() {
		this.isStoplossOrder = !this.isStoplossOrder;
	}

	toggleLimitMarket() {
		this.isLimitOrder = !this.isLimitOrder;
	}

	setIntradayOrderType(orderType) {
		this.orderType = orderType;
		switch (orderType) {
			case 'regular':
				this.isBracketOrder = false;
				this.isCoverOrder = false;
				this.isLimitOrder = true;
				break;
			case 'bo':
				this.isIntraday = true;
				this.isBracketOrder = true;
				this.isCoverOrder = false;
				this.isLimitOrder = true;
				this.isStoplossOrder = false;
				break;
			case 'co':
				this.isIntraday = true;
				this.isBracketOrder = false;
				this.isCoverOrder = true;
				this.isLimitOrder = false;
				this.isStoplossOrder = false;
				break;
		}
	}

	/**
	 * Function to calculate risk as per configured by the user
	 * Risk is calculated on percentage of avaiable funds
	 * The stoploss value is determined which limits the loss to the configured risk
	 */
	calculateRisk() {
		let avblMargin  = this.ds.equityNet;
		let price 		= this.price;
	
		// co_lower and co_upper are params defined in the 
		// margin api which help us calculate the leverage
		// max allowed stoploss within the leverage
		let co_lower = this.coLower / 100;
		let co_upper = this.coUpper / 100;
	
		let trigger;

		if( this.transactionType == 'BUY' ) {
			trigger = parseFloat( (price - ( ( co_lower / 5 ) * price ) ).toFixed( 2 ) );
		} else {
			trigger = parseFloat( (price + ( ( co_lower / 5 ) * price ) ).toFixed( 2 ) )
		}

		this.stoplossValue = this.stoplossValue > trigger ? this.stoplossValue : trigger;
		
		// Adjust the values to nearest tick size
		let tickAdjustMultiplier = ( 1 / this.tickSize )
		this.stoplossValue  	 = parseFloat( ( Math.ceil( this.stoplossValue * tickAdjustMultiplier ) / tickAdjustMultiplier ).toFixed( 2 ) );

		// Once done with calculating the risk, calculate the quantity
		this.calculateQuantity()
	}


	/**
	 * Function to calculate quantity as per the calculated stoploss
	 * Quantity is calculated based on difference between stoploss and limit value
	 * With that further we calculate the target as a percentage of avaiable funds
	 */
	calculateQuantity() {

		// Select the margin from equity or commodity based on the selected item
		let segMargin = this.segment == 'MCX' ? 'commodityNet' : 'equityNet';

		// Maximum risk the user can bear
		let maxRisk = this.ds[segMargin] * ( AppConfig.RISK_PERCENTAGE / 100 )

		// Get the optimum quantity within the max risk
		let quantityThreshold = Math.ceil( maxRisk / ( this.price - this.stoplossValue ) );
		
		// Commodities margins return the lot size as 1 which is in practice the amount of the commodity in that lot
		// We have used multipler as accompaniment to lotsize in case of commodities to calculate the quantity
		// correctly while keeping the lot size as 1 (which we need for placing order)
		let calculatedQuantity;
		
		// Calcuating Quantity multiplier to be used on the form to increase / decrease as per lot size
		if(this.multiplier > 1) {
			calculatedQuantity 		= quantityThreshold - ( quantityThreshold % this.multiplier );
			this.quantityMultiplier = this.multiplier;
		} else {
			calculatedQuantity 		= quantityThreshold - ( quantityThreshold % this.lotSize );
			this.quantityMultiplier = this.lotSize;
		}

		this.quantity = Math.abs( calculatedQuantity );

		if( this.quantity == 0 ) {
			this.warning = true;
			this.warningMessage = "The margin required for 1 lot seems insufficient. Please add funds or look for a smaller lot size";
		}
		let targetOffset = ( (this.ds[segMargin] * ( AppConfig.TARGET_PERCENTAGE / 100 ) ) / this.quantity );

		if(this.transactionType == 'BUY') {
			this.squareoffValue = this.price + targetOffset;
		} else {
			this.squareoffValue = this.price - targetOffset;
		}

		// Adjust the values to nearest tick size
		let tickAdjustMultiplier = (1/this.tickSize)
		this.squareoffValue = parseFloat( ( Math.round( this.squareoffValue * tickAdjustMultiplier ) / tickAdjustMultiplier ).toFixed( 2 ) );

		// Calculating the required margin and the leverage
		// The pseudocode for this can be found at
		// https://kite.trade/forum/discussion/2183/margin-calculation-for-bracket-and-cover-order?new=1
		let co_lower = this.coLower / 100;
		let x = Math.abs( this.price - this.stoplossValue ) * this.quantity;
		let y = co_lower * this.price * this.quantity;
		let marginMultipler = this.segment == 'MCX' ? 0.4 : 0.2;

		let margin =  x > y ? x : y
		margin = margin + (margin * marginMultipler);

		this.marginRequired = Math.abs(margin);

		this.leverage = (this.price * this.quantity) / this.marginRequired;
	}

	placeOrder() {
		let squareoff = 0;
		let stoploss = 0;

		if((this.isBracketOrder || this.isCoverOrder) && this.segment != 'MCX' ) {
			squareoff = parseFloat(Math.abs(this.price - this.squareoffValue).toFixed(2));
			stoploss  = parseFloat(Math.abs(this.price - this.stoplossValue).toFixed(2));	
		}
		
		let product = '';
		if(this.segment == 'MCX' && !this.isIntraday) {
			product = 'NRML'
		}

		if(this.isIntraday) {
			product = 'MIS'
		}

		if(this.segment != 'MCX' && !this.isIntraday) {
			product = 'CNC'
		}

		let order_type = 'LIMIT';
		if(!this.isLimitOrder) {
			order_type = 'MARKET'
		}
		if(this.isStoplossOrder && this.isLimitOrder) {
			order_type = 'SL'
		}

		if(this.isStoplossOrder && !this.isLimitOrder) {
			order_type = 'SL-M'
		}



		let payload = {
			exchange: this.segment,
			tradingsymbol: this.tradingsymbol,
			transaction_type: this.transactionType,
			order_type: order_type,
			quantity: this.quantity / this.multiplier,
			price: this.isLimitOrder ? this.price : 0,
			product: product,
			validity: 'DAY',
			disclosed_quantity: 0,
			trigger_price: this.isStoplossOrder || this.isCoverOrder ? this.stoplossValue : 0,
			squareoff: squareoff,
			stoploss: stoploss,
			trailing_stoploss: 0,
			variety: this.orderType,
		}

		console.log(payload);

		var headers = new Headers();
		headers.append("content-type", "application/x-www-form-urlencoded")

		var self = this;

		this.http.post(config.API_ROOT + 'orders/placeorder', payload, {withCredentials: true})
		.subscribe(data => {
			console.log(JSON.parse(data.text()));
			console.log(data.status);
			
			if(data.status == 200 && data.statusText == 'OK') {
				self.ds.showOverlay = false;
				self.ds.showOrderForm = false;

				self.http.get(config.API_ROOT + 'orders', {withCredentials: true})
				.subscribe(data => {
					var result = JSON.parse(data.text());
					self.ds.setCurrentOrders(result.data);
				})
			}
		})
	}
	
}