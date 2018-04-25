import { TickerService } from '../shared/services/ticker-service.service'
import { Component, OnInit, trigger, state, animate, transition, style} from '@angular/core';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Observable } from 'rxjs/Observable';
import { CommunicatorService} from '../shared/communicator/communicator.service'
import { DataService } from '../shared/services/data-service.service'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import _ from 'lodash';
import * as config from '../shared/services/config.service'

@Component({
	selector: 'marketwatch',
	template: `
	<div class="marketwatch">
		<div>
			<input placeholder="Add to watchlist" min-chars="2" ngui-auto-complete [list-formatter]="stockListFormatter" [value-formatter]="stockValueFormatter" [source]="observableSource.bind(this)" (valueChanged)="stockSelected($event)" type="text" class="input-auto-complete" />
		</div>

		<div *ngFor="let stock of stocks" class="div-watchlist">
			<div class="stock-realtime-info">
				<div class="row">
					<div class='stock-name col-md-6'>{{stock.tradingsymbol}}</div>
					<div class='ltp col-md-6 text-right'>{{stock.ltp}}</div>
				</div>
				<div class="row">
					<div class='segment col-md-6' *ngIf="stock.segment=='MCX'">{{stock.expiry | date:'yyMMM' | uppercase}}FUT</div>
					<div class='segment col-md-6' *ngIf="stock.segment!=='MCX'">{{stock.segment}}</div>
				</div>
				<div class="stock-details" id="{{stock.instrument_token}}">
					<div class="stock-actions">
						<button (click)="buyThis(stock)" class="btn buy-colored">B</button>
						<button (click)="sellThis(stock)" class="btn sell-colored">S</button>
						<button (click)="showHideDepth(stock)" class="btn">D</button>
						<button (click)="removeFromMarketwatch(stock.instrument_token)" type="button" class="btn close" aria-label="Close" title="Remove from watchlist">&times;</button>
					</div>
				</div>
			</div>
			
			<div class="" *ngIf="stock.Depth" [@toggleState]="stock.toggleDepth">
				<table class="table-depth">
					<tr *ngFor="let key of depthRange">
						<td width="18%" class="text-left buy-text depth-col1" text-align="left">{{stock.Depth.buy[key].Price}}</td>
						<td width="6%" class="text-left buy-text depth-col2">{{stock.Depth.buy[key].Total}}</td>
						<td width="26%" class="text-right buy-text depth-col3">{{stock.Depth.buy[key].Quantity}}</td>
						<td width="18%" class="text-left sell-text depth-col4">{{stock.Depth.sell[key].Price}}</td>
						<td width="6%" class="text-left sell-text depth-col5">{{stock.Depth.sell[key].Total}}</td>
						<td width="26%" class="text-right sell-text depth-col6">{{stock.Depth.sell[key].Quantity}}</td>
					</tr>
				</table>
				<!-- <div class="" *ngFor="let key of depthRange">
					<div class="buy-depth col-md-6">
						<span class="buy-text text-left">{{stock.Depth.buy[key].Price}}</span>
						<span class="text-right depth-total">{{stock.Depth.buy[key].Total}}</span>
						<span class="text-right buy-text">{{stock.Depth.buy[key].Quantity}}</span>
					</div>
					<div class="sell-depth col-md-6">
						<span class="sell-text">{{stock.Depth.sell[key].Price}}</span>
						<span class="text-right depth-total">{{stock.Depth.sell[key].Total}}</span>
						<span class="text-right sell-text">{{stock.Depth.sell[key].Quantity}}</span>
					</div>
				</div> -->
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
			border-bottom: 1px solid #CCC;
			padding-bottom: 5px;
		}
		.stock-realtime-info {
			position: relative;
		}
		.stock-actions button {
			margin-right: 5px;
		}
		.segment {
			font-size: 10px;
		}

		.stock-realtime-info:hover > .stock-details {
			visibility: visible;
		}

		.stock-details {
			position: absolute;
			top: 0;
			right: 40px;
			visibility: hidden;
		}
		.table-depth {
			width: 100%;
			margin-top: 10px;
		}
		table.table-depth tbody tr td.depth-col3 {
			padding-right: 5px;
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
	depthRange: Array<number> = _.range(5);

	constructor(private cs: CommunicatorService, private http: Http, private ds: DataService, private ticker: TickerService) {
	}

	ngOnInit(): void {
		this.ds.ticksUpdated.subscribe(ticks => {
			this.stocks.map(stock => {
				let quote = this.ds.getFullQuote(stock.instrument_token);
				stock.ltp = quote ? quote.ltp : 0;
				stock.Depth = quote.Depth;
			})
		});

		let self = this;
		this.ticker.on('connect', function() {
			self.http.get(config.API_ROOT + 'marketwatch/get')
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
		this.ds.orderFormOptions.segment = stock.segment;
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
		this.ds.orderFormOptions.segment = stock.segment;
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
		let url: string = config.API_ROOT + 'stocks/lookup?q=' + keyword
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
			this.http.get(config.API_ROOT + 'marketwatch/add/' + $event.instrument_token)
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

		this.http.get( config.API_ROOT + 'remove/' + instrument_token)
		.subscribe(res => {
			let json = res.json();
			console.log(json)
		})
	}
}