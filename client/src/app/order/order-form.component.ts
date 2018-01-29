import { Component, Input } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { TickerService } from '../shared/services/ticker-service.service';
import { OrderService } from '../shared/services/orders/orders.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AppConfig } from '../config/app.config';
import { CommConfig } from '../config/comm.config';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/observable/of';



@Component({
	selector: 'order-form',
	template:` 
	<div class="order-form-container">
		<div class="order-form-header row"  [ngClass]="{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}">
			<div class="order-details col-lg-10">
				{{transactionType}} {{tradingsymbol}} {{quantity}} @ {{price}}
			</div>
			<div class="col-lg-2 change-transaction-type text-right" (click)="toggleTransactionType();">B <i class="glyphicon glyphicon-transfer"></i> S</div>
		</div>
		<div class='order-form' >
			<form>
				<div class="row">
					<input class="col-xs-3" type='radio' name="delivery-type" id="deliveryTypeIntraday" value="MIS" (change)="toggleDeliveryType()"><label for="deliveryTypeIntraday" class="radio-inline">Intraday</label><info-tooltip [info]="'Buying Intraday. The position will be auto squared off at market price few mins before market close'"></info-tooltip>
					<input class="col-xs-3" type='radio' name="delivery-type" id="deliveryTypeDelivery" value="CNC" checked (change)="toggleDeliveryType()"><label for="deliveryTypeDelivery" class="radio-inline">Delivery</label>
				</div>
				<div class="row" *ngIf="isIntraday">
					<div class="order-type col-lg-4">
						<input type='radio' name="order-type" id="orderTypeBO" value="BO" checked><label for="orderTypeBO" class="radio-inline">BO</label>
						<input type='radio' name="order-type" id="orderTypeCO" value="CO"><label for="orderTypeCO" class="radio-inline">CO</label>
						<input type='radio' name="order-type" id="orderTypeCNC" value="CNC"><label for="orderTypeCNC" class="radio-inline">CNC</label>
					</div>
					<div class="metadata col-lg-8">
						<label>Leverage: {{leverage | number:'2.1-1'}}x</label>
						<label>Required Margin: </label><span class="margin-required" [ngClass]="{'loss' : marginRequired > ds.availableFunds}">{{marginRequired | currency: 'INR' : true : '2.0-2'}}</span>
					</div>
				</div>
				<hr />
				<div class="form-group row">
					<div class="col-md-3">
						<label for="stoplossValue"> Stop Loss</label>
						<input [disabled]="!isIntraday" class="form-control" [step]="tickSize" type="number" [(ngModel)]="stoplossValue" name="stoplossValue" id="stoplossValue" (change)="calculateQuantity()" />
					</div>
					<div class="col-md-3">
						<label for="price">{{transactionType}} at 
							<input type='checkbox' name="orderLimitMarket" id="orderLimitMarket" value="LIMIT" (change)="toggleLimitMarket()"><label for="orderLimitMarket" class="radio-inline">Market</label>
						</label>
						<input class="form-control" [step]="tickSize" type="number" id="price" [(ngModel)]="price" name="price" (change)="calculateQuantity()"/>
					</div>

					<div class="col-md-3">
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
	transactionType 	: string = 'BUY';
	tradingsymbol 		: string;
	instrumentToken 	: string;
	segment 			: string;
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

	constructor(private http: Http,private cPort: CommunicatorService, private ds: DataService, private os: OrderService, private doms: DomSanitizer, private ticker: TickerService) {
		this.margins 		 = this.ds.getEquityMargins();
		this.transactionType = this.ds.orderFormOptions.transactionType;
		this.tradingsymbol 	 = this.ds.orderFormOptions.tradingsymbol;
		this.segment 		 = this.ds.orderFormOptions.segment;
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
	toggleDeliveryType() {
		this.isIntraday = !this.isIntraday;
	}

	/**
	 * Function to calculate risk as per configured by the user
	 * Risk is calculated on percentage of avaiable funds
	 * The stoploss value is determined which limits the loss to the configured risk
	 */
	calculateRisk() {
		let avblMargin  = this.ds.availableFunds;
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
		// Maximum risk the user can bear
		let maxRisk = this.ds.availableFunds * ( AppConfig.RISK_PERCENTAGE / 100 )

		// Get the optimum quantity within the max risk
		let quantityThreshold = Math.ceil( maxRisk / ( this.price - this.stoplossValue ) );
		
		// Commodities margins return the lot size as 1 which is in practice the amount of the commodity in that lot
		// We have used multipler as accompaniment to lotsize in case of commodities to calculate the quantity
		// correctly while keeping the lot size as 1 (which we need for placing order)
		let calculatedQuantity;
		
		if(this.multiplier > 1) {
			calculatedQuantity 		= quantityThreshold - ( quantityThreshold % this.multiplier );
			this.quantityMultiplier = this.multiplier;
		} else {
			calculatedQuantity 		= quantityThreshold - ( quantityThreshold % this.lotSize );
			this.quantityMultiplier = this.lotSize;
		}

		this.quantity = Math.abs( calculatedQuantity );

		let targetOffset = ( (this.ds.availableFunds * ( AppConfig.TARGET_PERCENTAGE / 100 ) ) / this.quantity );

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
		let payload = {
			tradingsymbol: this.tradingsymbol,
			instrument_token: this.instrumentToken,
			exchange: 'NSE',
			segment: 'equity',
			transaction_type: this.transactionType,
			price: this.price,
			squareoff_value: Math.abs(this.price-this.squareoffValue).toFixed(2),
			stoploss_value: Math.abs(this.price-this.stoplossValue).toFixed(2),
			quantity: this.quantity,
			order_type: 'LIMIT',
			product: 'MIS',
			validity: 'DAY'
		}

		this.cPort.send({method : 'placeorder', payload: payload})
	}
	
}