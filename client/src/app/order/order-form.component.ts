import { Component } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { OrderService } from '../shared/services/orders/orders.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AppConfig } from '../config/app.config';
import { CommConfig } from '../config/comm.config';
import { KiteTicker } from 'kiteconnect'



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
					<div class="order-type col-lg-6">
						<input type='radio' name="order-type" id="orderTypeBO" value="BO" checked><label for="orderTypeBO" class="radio-inline">BO</label>
						<input type='radio' name="order-type" id="orderTypeCO" value="CO"><label for="orderTypeCO" class="radio-inline">CO</label>
						<input type='radio' name="order-type" id="orderTypeCNC" value="CNC"><label for="orderTypeCNC" class="radio-inline">CNC</label>
					</div>
					<div class="metadata col-lg-6">
						<label>CMP : {{ltp}}</label>
						<label>Leverage: {{leverage | number:'2.1-1'}}x</label>
						<label>Required Margin: </label><span class="margin-required" [ngClass]="{'loss' : marginRequired > ds.availableFunds}">{{marginRequired | currency: 'INR' : true : '2.0-2'}}</span>
					</div>
				</div>
				<hr />
				<div class="order-stock">
					<div class="form-group row">
						<div class="col-md-4">
							<label for="exchange">exchange</label>
							<select id="exchange" class="form-control-md" id="exchange">
								<option value='NSE' selected>NSE</option>
								<option value='MCX'>MCX</option>
							</select>
						</div>
						<div class="col-md-5">
							<label for="tradingsymbol">Stock </label>
							<input ngui-auto-complete [list-formatter]="stockListFormatter" [value-formatter]="stockValueFormatter" [source]="margins" (valueChanged)="stockSelected($event)" type="text" />
						</div>
					</div>
				</div>
				<hr />
				<div class="form-group row">
					<div class="col-md-3">
						<label for="stoplossValue"> Stop Loss</label>
						<input class="form-control" [step]="os.tickSize" type="number" [(ngModel)]="stoplossValue" name="stoplossValue" id="stoplossValue" (change)="calculateRisk()" />
					</div>
					<div class="col-md-3">
						<label for="price"> Order Price</label>
						<input class="form-control" [step]="os.tickSize" type="number" id="price" [(ngModel)]="price" name="price"  (change)="calculateRisk()"/>
					</div>

					<div class="col-md-3">
						<label for="squareoffValue"> Target</label>
						<input class="form-control" type="number" name="squareoffValue" [(ngModel)]="squareoffValue" id="squareoffValue"  (change)="calculateRisk()"/>
					</div>
					<div class="col-md-3">
						<label for="quantity">Quantity</label>
						<input class="form-control" type="number" name="quantity" [(ngModel)]="quantity" id="quantity"  (change)="calculateRisk()" />
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
			width: 70%;
			box-shadow: 2px 2px 4px 4px #DDD;
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
	`]
})
export class OrderFormComponent {
	transactionType: string = 'BUY';
	tradingsymbol: string;
	squareoffValue: number = 0;
	stoplossValue: number = 0;
	price: number = 0;
	marginRequired: number = 0;
	quantity: number = 0;
	leverage: number = 0;

	objMargin: object = {};
	margins: Array<any>

	constructor(private cPort: CommunicatorService, private ds: DataService, private os: OrderService) {
		this.margins = this.ds.getEquityMargins();
	}

	toggleTransactionType() {
		this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
		this.calculateRisk()
	}

	stockListFormatter(data: any) {
		return `${data.tradingsymbol}`;
	}

	stockValueFormatter(data: any) {
		return `${data.tradingsymbol}`;
	}
 	
	stockSelected($event) {
		if(!$event.tradingsymbol) return;
		this.os.setProspectiveStock($event.tradingsymbol);
		this.tradingsymbol = $event.tradingsymbol;
		this.cPort.send({method: CommConfig.SUBSCRIBE, payload: this.tradingsymbol});

		this.objMargin = $event;
		this.calculateRisk();
	}

	calculateRisk() {
		let avblMargin = this.ds.availableFunds;
		let price = this.price = this.objMargin['price'];
		let co_lower = this.objMargin['co_lower'] / 100;
		let co_upper = this.objMargin['co_upper'] / 100;
		let trigger;
		
		if(this.transactionType == 'BUY') {
			trigger = parseFloat((price - (co_lower * price)).toFixed(2))
			this.squareoffValue = this.price + (this.price * (AppConfig.TARGET_PERCENTAGE / 100));
		} else {
			trigger = parseFloat((price + (co_lower * price)).toFixed(2))
			this.squareoffValue = this.price - (this.price * (AppConfig.TARGET_PERCENTAGE / 100));
		}
		
		this.stoplossValue = this.stoplossValue > trigger ? this.stoplossValue : trigger;
		// Adjust the values to nearest 0.05
		this.stoplossValue  = parseFloat((Math.ceil(this.stoplossValue*20)/20).toFixed(2));
		this.squareoffValue = parseFloat((Math.ceil(this.squareoffValue*20)/20).toFixed(2));

		let maxRisk = this.ds.availableFunds * (AppConfig.RISK_PERCENTAGE/100)
		let calculatedQuantity = Math.ceil(maxRisk / (price - this.stoplossValue));
		this.quantity = Math.abs(calculatedQuantity);

		let x = Math.abs(price - trigger) * this.quantity;
		let y = co_lower * price * this.quantity;

		let margin =  x > y ? x : y
		margin = margin + (margin * 0.2);
		this.marginRequired = Math.abs(margin);

		this.leverage = (price * this.quantity) / this.marginRequired;
	}

	placeOrder() {
		let payload = {
			tradingsymbol: this.tradingsymbol,
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