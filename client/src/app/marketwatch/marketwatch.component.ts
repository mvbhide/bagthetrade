import {Component} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import {CommunicatorService} from '../shared/communicator/communicator.service'
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
	selector: 'marketwatch',
	template: `
	<div class="marketwatch">
		<div>
			<label for="tradingsymbol">Stock </label>
			<input ngui-auto-complete [list-formatter]="stockListFormatter" [value-formatter]="stockValueFormatter" [source]="observableSource.bind(this)" (valueChanged)="stockSelected($event)" type="text" class="input-auto-complete" />
		</div>
		<ul class="list-group">
			<li *ngFor="let stock of stocks" class="list-group-item">
				<div class="stock-list-item">
					<ul>
						<li>{{stock.name}}</li>
						<li><a class="btn btn-default" (click)="takethistrade(stock)">Take this trade</a></li>
					</ul>
				</div>
			</li>
		</ul>
	</div>
	
	`,
})
export class MarketwatchComponent {
	stocks: any = []

	constructor(private cs: CommunicatorService, private http: Http) {
		
	}

	takethistrade(stock: any) {
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

		
		// Segment for FO comes as NFO-FU. Hence removing FU in such cases
		let exchange = $event.segment.split("-")[0];
		this.stocks.push({
			name: $event.tradingsymbol,
			ltp: 500
		})

		this.cs.send({a:'mode', v:['quote', [$event.instrument_token]]});
	}
}