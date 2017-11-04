import { Component } from '@angular/core'
import { CommunicatorService } from '../../shared/communicator/communicator.service';
import { DataService } from '../../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";


@Component({
	selector: 'current-orders',
	template: `
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
				<div class="order-scrip">
					<div class="form-group row">
						<div class="col-md-4">
							<label for="exchange">exchange</label>
							<select id="exchange" class="form-control-md" id="exchange">
								<option value='NSE' selected>NSE</option>
								<option value='MCX'>MCX</option>
							</select>
						</div>
						<div class="col-md-5">
							<label for="tradingsymbol">Scrip</label>
							<input ngui-auto-complete [list-formatter]="scriptListFormatter" [value-formatter]="scriptValueFormatter" [source]="margins" (valueChanged)="scriptSelected($event)" type="text" />
						</div>
						<div class="col-md-3">
							<label>CMP : {{ltp}}</label>
							<label>Leverage: {{leverage}}</label>
						</div>
					</div>
				</div>
				<hr />
				<div class="form-group row">
					<div class="col-md-3">
						<label for="stoplossValue"> Stop Loss</label>
						<input class="form-control" type="text" [value]="stoplossValue" id="stoplossValue" />
					</div>
					<div class="col-md-3">
						<label for="price"> Order Price</label>
						<input class="form-control" type="text" id="price" [value]="price" />
					</div>

					<div class="col-md-3">
						<label for="squareoffValue"> Target</label>
						<input class="form-control" type="text" [value]="squareoffValue" id="squareoffValue"/>
					</div>
					<div class="col-md-3">
						<label for="quantity">Quantity</label>
						<input class="form-control" type="text" [value]="quantity" id="quantity" />
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
export class CurrentOrdersComponent {
	transactionType: string = 'BUY';
	tradingsymbol: string;
	squareoffValue: number = 1;
	stoplossValue: number = 1;
	price: number = 1;
	quantity: number = 1;
	cPort: CommunicatorService;
	ds: DataService;
	margins: Array<any>
	toggleTransactionType() {
		this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
	}
	constructor(cPort: CommunicatorService, ds: DataService) {
		this.cPort = cPort;
		this.ds = ds;

		this.margins = this.ds.getEquityMargins();
		console.log(this.margins)
	}

	scriptListFormatter(data: any) {
		return `${data.tradingsymbol}`;
	}

	scriptValueFormatter(data: any) {
		return `${data.tradingsymbol}`;
	}

	scriptSelected($event) {
		console.log($event)
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

		this.cPort.sendData('placeordere', payload)
	}
	
}