import { Component, OnInit} from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Observable } from 'rxjs/Observable';
import { CommunicatorService} from '../shared/communicator/communicator.service'
import { TickerService } from '../shared/services/ticker-service.service'
import { DataService } from '../shared/services/data-service.service'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import _ from 'lodash';

@Component({
	selector: 'marketwatch',
	template: `
	<div class="marketwatch">
		<div>
			<label for="tradingsymbol">Stock </label>
			<input ngui-auto-complete [list-formatter]="stockListFormatter" [value-formatter]="stockValueFormatter" [source]="observableSource.bind(this)" (valueChanged)="stockSelected($event)" type="text" class="input-auto-complete" />
		</div>
		<table class="table table-hover tbl-watchlist" [ngClass]="{'hide-watchlist' : stocks.length < 1}">
			<thead>
				<tr>
					<th>Stock</th>
					<th>LTP</th>
					<th>Top Ask</th>
					<th>Top Bid</th>
					<th>Take trade</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr *ngFor="let stock of stocks">
					<td>{{stock.name}}</td>
					<td>{{stock.ltp}}</td>
					<td>{{stock.topAsk}}</td>
					<td>{{stock.topBid}}</td>
					<td>
						<a class="btn buy-colored" (click)="buyThis(stock)">BUY</a>
						<a class="btn sell-colored" (click)="sellThis(stock)">SELL</a>
					</td>
					<td>
						<button (click)="removeFromMarketwatch(stock.instrument_token)" type="button" class="close" aria-label="Close" title="Remove from watchlist">&times;</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	
	`,

	styles: [`
		.ngui-auto-complete-wrapper {
			display: inline-block;
			border: 1px solid red;
		}

		.hide-watchlist {
			display: none;
		}

		.tbl-watchlist {
			margin-top: 30px;
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
export class MarketwatchComponent implements OnInit{
	stocks: any = []

	constructor(private cs: CommunicatorService, private http: Http, private ds: DataService, private ticker: TickerService) {
	}

	ngOnInit(): void {
		this.ds.ticksUpdated.subscribe(ticks => {
			this.stocks.map(stock => {
				let quote = this.ds.getQuote(stock.instrument_token);
				stock.ltp = quote.ltp;
				stock.topBid = quote.topBid;
				stock.topAsk = quote.topAsk;
			})
		});

		this.http.get('http://localhost:8080/marketwatch/get')
			.subscribe(results => {
				console.log(results);
			})
	}
	

	buyThis(stock) {
		console.log(stock)
		this.ds.orderFormOptions.transactionType = 'BUY',
		this.ds.orderFormOptions.tradingsymbol = stock.tradingsymbol
		this.ds.orderFormOptions.instrumentToken = stock.instrumentToken
		this.ds.orderFormOptions.price = stock.ltp
		this.ds.orderFormOptions.lotSize = stock.lotSize
		this.ds.orderFormOptions.coUpper = stock.coUpper
		this.ds.orderFormOptions.coLower = stock.coLower
		this.ds.showOverlay = true;
		this.ds.showOrderForm = true;

	}

	sellThis(stock) {

	}

	observableSource = (keyword: any): Observable<any[]> => {
		let url: string = 'http://localhost:8080/lookupstock?q='+keyword
		if (keyword) {
			return this.http.get(url)
			.map(res => {

				let json = res.json();
				return json;
			})
		} else {
			return Observable.of([]);
		}
	}

	stockListFormatter(data: any) {
		var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
		var dt = new Date(data.expiry);
		var txtExpiry = "" + (dt.getFullYear()-2000) + months[dt.getMonth()] + "FUT"
		if(data.segment == 'MCX') {
			var snippet =  `<div class="auto-list-item-wrapper">
						<div class="auto-tradingsymbol">${data.tradingsymbol}${txtExpiry}</div>
						<div class="auto-stock-name" style="font-size:5px; color: #CCC;">${data.name}</div>
					</div>`
		} else {
			var snippet =  `<div class="auto-list-item-wrapper">
						<div class="auto-tradingsymbol">${data.tradingsymbol}</div>
						<div class="auto-stock-name">${data.name}</div>
					</div>`
		}

		return snippet;
		
	}

	stockValueFormatter(data: any) {

		if(data.segment == 'MCX') {
			var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
			var dt = new Date(data.expiry);
			var txtExpiry = "" + (dt.getFullYear()-2000) + months[dt.getMonth()] + "FUT";
			return `${data.tradingsymbol}${txtExpiry}`;
		} else {
			return `${data.tradingsymbol}`;
		}
	}

	stockSelected($event) {
		if(!$event.tradingsymbol) return;
console.log($event)
		this.ticker.subscribe([$event.instrument_token]);

		// Segment for FO comes as NFO-FU. Hence removing FU in such cases
		let exchange = $event.segment.split("-")[0];
		
		this.stocks.push({
			instrument_token: $event.instrument_token,
			name: $event.tradingsymbol,
			ltp: 0,
			topAsk: 0,
			topBid: 0,
			lotSize: $event.lot_size,
			coLower: $event.co_lower,
			coUpper: $event.co_upper
		});

		this.http.get('http://localhost:8080/marketwatch/add/' + $event.instrument_token)
		.subscribe(res => {
			let json = res.json();
			console.log(json)
		})
	}

	removeFromMarketwatch(instrument_token) {
		this.ticker.unsubscribe([instrument_token]);

		_.remove(this.stocks, function(stock) {
			return stock.instrument_token == instrument_token
		})

		this.http.get('http://localhost:8080/marketwatch/remove/' + instrument_token)
		.subscribe(res => {
			let json = res.json();
			console.log(json)
		})


	}
}