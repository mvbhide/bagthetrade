import { Component } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { OrderService } from '../shared/services/orders/orders.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AppConfig } from '../config/app.config';
import { CommConfig } from '../config/comm.config';



@Component({
	selector: 'order-form',
	template:` 
	<div class="order-form-container">
		<div class="order-form-header" [ngClass]="{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}">
			{{transactionType}} {{tradingsymbol}} {{quantity}} @ {{price}}
			<div class="change-transaction-type pull-right" (click)="toggleTransactionType();">B <i class="glyphicon glyphicon-transfer"></i> S</div>
		</div>
		<div class='order-form' >
			<form>
				<div class="order-type">
					<label for="orderTypeBO" class="radio-inline"><input type='radio' name="order-type" id="orderTypeBO" value="BO" checked>BO</label>
					<label for="orderTypeCO" class="radio-inline"><input type='radio' name="order-type" id="orderTypeCO" value="CO">CO</label>
					<label for="orderTypeCNC" class="radio-inline"><input type='radio' name="order-type" id="orderTypeCNC" value="CNC">CNC</label>
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
						<div class="col-md-3">
							<label>CMP : {{ltp}}</label>
							<label>Leverage: {{leverage | number:'2.1-1'}}x</label>
							<label>Required Margin: </label><span class="margin-required" [ngClass]="{'loss' : marginRequired > ds.availableFunds}">{{marginRequired | number : '2.0-2'}}</span>
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
						<input class="form-control" [step]="os.tickSize" type="number" id="price" [(ngModel)]="price" name="price" />
					</div>

					<div class="col-md-3">
						<label for="squareoffValue"> Target</label>
						<input class="form-control" type="number" [value]="squareoffValue" id="squareoffValue"/>
					</div>
					<div class="col-md-3">
						<label for="quantity">Quantity</label>
						<input class="form-control" type="number" [value]="quantity" id="quantity" />
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
	price: number = 1;
	marginRequired: number = 0;
	quantity: number = 100;
	leverage: number = 0;

	objMargin: object = {};
	margins: Array<any>

	toggleTransactionType() {
		this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
	}
	constructor(private cPort: CommunicatorService, private ds: DataService, private os: OrderService) {
		this.margins = this.ds.getEquityMargins();
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
		console.log(this.tradingsymbol)
		this.cPort.send({method: CommConfig.SUBSCRIBE, payload: this.tradingsymbol});
		console.log($event);

		this.objMargin = $event;
		this.calculateRisk();
	}

	calculateRisk() {
		let avblMargin = this.ds.availableFunds;
		let price = this.price = this.objMargin['price'];
		let co_lower = this.objMargin['co_lower'] / 100;
		let co_upper = this.objMargin['co_upper'] / 100;

		let trigger = parseFloat((price - (co_lower * price)).toFixed(2))
		this.stoplossValue = this.stoplossValue > trigger ? this.stoplossValue : trigger;
let maxRisk = this.ds.availableFunds * (AppConfig.RISK_PERCENTAGE/100)
let calculatedQuantity = Math.ceil(maxRisk / (price - this.stoplossValue));
this.quantity = calculatedQuantity;

		let x = Math.abs(price - trigger) * this.quantity;
		let y = co_lower * price * this.quantity;

		let margin =  x > y ? x : y
		margin = margin + (margin * 0.2);
		this.marginRequired = margin;

		this.leverage = (price * this.quantity) / this.marginRequired;
	}

	placeOrder() {
		let payload = {
			tradingsymbol: this.tradingsymbol,
			exchange: 'NSE',
			segment: 'equity',
			transaction_type: this.transactionType,
			price: this.price,
			quantity: this.quantity,
			order_type: 'LIMIT',
			product: 'MIS',
			validity: 'DAY'
		}

		//this.cPort.send({method : 'placeorder', payload: payload})
	}
	
}