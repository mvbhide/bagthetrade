import { TickerService } from '../shared/services/ticker-service.service'
import { Component, OnInit, trigger, state, animate, transition, style} from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Observable } from 'rxjs/Observable';
import { CommunicatorService} from '../shared/communicator/communicator.service'
import { DataService } from '../shared/services/data-service.service'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import _ from 'lodash';

@Component({
	selector: 'marketwatch',
	template: `
	<div class="marketwatch">
		<div>
			<label for="tradingsymbol">Stock </label>
			<input placeholder="Add to watchlist" ngui-auto-complete [list-formatter]="stockListFormatter" [value-formatter]="stockValueFormatter" [source]="observableSource.bind(this)" (valueChanged)="stockSelected($event)" type="text" class="input-auto-complete" />
		</div>

		<div *ngFor="let stock of stocks" class="div-watchlist">
			<div class="stock-realtime-info" (click)="showHideDepth(stock)">
				<div class="row">
					<div class='stock-name col-xs-5'>{{stock.tradingsymbol}}</div>
					<div class='ltp col-xs-5 text-right'>{{stock.ltp}}</div>
					<div class='col-xs-1'>
						<button (click)="removeFromMarketwatch(stock.instrument_token)" type="button" class="close" aria-label="Close" title="Remove from watchlist">&times;</button>
					</div>
				</div>
				<div class="row">
					<div class='segment col-xs-6' *ngIf="stock.segment=='MCX'">{{stock.expiry | date:'yyMMM' | uppercase}}FUT</div>
					<div class='segment col-xs-6' *ngIf="stock.segment!=='MCX'">{{stock.segment}}</div>
					<div class='ltp col-lg-6'>
						
					</div>
				</div>
			</div>
			<div class="stock-details" id="{{stock.instrument_token}}" [@toggleState]="stock.toggleDepth">
				<div class="row">
					<div class="col-xs-11 text-right">
						<button (click)="buyThis(stock)" class="btn buy-colored">B</button>
						<button (click)="sellThis(stock)" class="btn sell-colored">S</button>
					</div>
				</div>
				<div class="row" *ngIf="stock.Depth">
					<div class="" *ngFor="let key of depthRange">
						<div class="buy-depth col-xs-6">
							<span class="buy-text text-left">{{stock.Depth.buy[key].Price}}</span>
							<span class="text-right depth-total">{{stock.Depth.buy[key].Total}}</span>
							<span class="text-right buy-text">{{stock.Depth.buy[key].Quantity}}</span>
						</div>
						<div class="sell-depth col-xs-6">
							<span class="sell-text">{{stock.Depth.sell[key].Price}}</span>
							<span class="text-right depth-total">{{stock.Depth.sell[key].Total}}</span>
							<span class="text-right sell-text">{{stock.Depth.sell[key].Quantity}}</span>
						</div>
					</div>
				</div>

			</div>
		</div>

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

		.div-watchlist {
			margin-top: 30px;
		}
		.segment {
			font-size: 10px;
		}
		.stock-details {
			background: #F5F5F5;
			padding: 8px 0px;
			border-top: 1px solid #DDD;
		}

		.depth-total {
			opacity: 0.8;
			color: #AAA;
			font-size: 10px;
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
			padding: 2px;
		}
	`],
	animations: [
		trigger('toggleState', [
			state('true' , style({height: '100%', display: 'block'  })),
			state('false', style({ maxHeight: 0, padding: 0, display: 'none' })),
			// transition
			transition('* => *', animate('300ms')),
		])
	]
})
export class MarketwatchComponent implements OnInit{
	stocks: any = [];
	depthRange: Array<number> = _.range(4);

	constructor(private cs: CommunicatorService, private http: Http, private ds: DataService, private ticker: TickerService) {
	}

	ngOnInit(): void {
		this.ds.ticksUpdated.subscribe(ticks => {
			this.stocks.map(stock => {
				let quote = this.ds.getFullQuote(stock.instrument_token);
				stock.ltp = quote.ltp ? quote.ltp : 0;
				stock.Depth = quote.Depth;
			})
		});

		let self = this;
		this.ticker.on('connect', function() {
			self.http.get('http://localhost:8080/marketwatch/get')
			.subscribe(results => {
				let watchlist = (results.json())
				_.map(watchlist, function(item) {
					self.stockSelected(item, false);
				})
			})	
		})
		
	}
	
	showHideDepth(stock) {
		stock.toggleDepth = !stock.toggleDepth;
	}

	buyThis(stock) {
		console.log(stock)
		this.ds.orderFormOptions.transactionType = 'BUY',
		this.ds.orderFormOptions.tradingsymbol = stock.tradingsymbol
		this.ds.orderFormOptions.instrumentToken = stock.instrument_token
		this.ds.orderFormOptions.price = stock.ltp
		this.ds.orderFormOptions.lotSize = stock.lot_size
		this.ds.orderFormOptions.tickSize = stock.tick_size
		this.ds.orderFormOptions.coUpper = stock.co_upper
		this.ds.orderFormOptions.coLower = stock.co_lower
		this.ds.orderFormOptions.multiplier = stock.multiplier
		this.ds.showOverlay = true;
		this.ds.showOrderForm = true;
	}

	sellThis(stock) {
		this.ds.orderFormOptions.transactionType = 'SELL',
		this.ds.orderFormOptions.tradingsymbol = stock.tradingsymbol
		this.ds.orderFormOptions.instrumentToken = stock.instrument_token
		this.ds.orderFormOptions.price = stock.ltp
		this.ds.orderFormOptions.lotSize = stock.lot_size
		this.ds.orderFormOptions.tickSize = stock.tick_size
		this.ds.orderFormOptions.coUpper = stock.co_upper
		this.ds.orderFormOptions.coLower = stock.co_lower
		this.ds.orderFormOptions.multiplier = stock.multiplier
		this.ds.showOverlay = true;
		this.ds.showOrderForm = true;
	}

	observableSource = (keyword: any): Observable<any[]> => {
		let url: string = 'http://localhost:8080/stocks/lookup?q='+keyword
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

	stockSelected($event, persist = true) {
		if(!$event.tradingsymbol) return;

		this.ticker.subscribe([$event.instrument_token]);

		// Segment for FO comes as NFO-FU. Hence removing FU in such cases
		let exchange = $event.segment.split("-")[0];
		
		this.stocks.push($event);
		if(persist == true) {
			this.http.get('http://localhost:8080/marketwatch/add/' + $event.instrument_token)
			.subscribe(res => {
				let json = res.json();
			})
		}
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