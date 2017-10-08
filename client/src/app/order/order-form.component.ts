import { Component } from '@angular/core'

@Component({
	selector: 'order-form',
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
							<label for="scrip">Scrip</label>
							<input type="text" id="tradingsymbol" [value]="tradingsymbol">
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
					<button class="btn"  [ngClass]="{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}">{{transactionType}}</button>
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
export class OrderFormComponent {
	transactionType: string = 'BUY';
	squareoffValue: number = 1;
	stoplossValue: number = 1;
	price: number = 1;
	quantity: number = 1;
	toggleTransactionType() {
		this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
	}
	constructor() {
		
	}

	
}