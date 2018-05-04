import { Component, OnInit } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as config from '../shared/services/config.service';

@Component({
	selector: 'fund-summary',
	template: `
		<div class='fund-summary-container row'>
			<div class='total-funds col-lg-2'>
				<label>Equity : </label>
				<h3 [ngClass]="{'profit' : totalFunds >= 0 , 'loss' : totalFunds < 0}">{{ds.equityCash | currency : 'INR' : 'symbol': '1.2-2'}}</h3>
			</div>
			<div class='available-funds col-lg-2'>
				<label>Commodity : </label>
				<h3 [ngClass]="{'profit' : availableFunds >= 0, 'loss' : availableFunds < 0}">{{ds.commodityCash | currency : 'INR' : 'symbol': '1.2-2'}}</h3>
			</div>
			<div class='profit-loss col-lg-4'>
				<label>Intraday P/L</label>
				<h3 [ngClass]="{'profit' : ds.pnl >= 0, 'loss' : ds.pnl < 0}">{{ds.pnl | currency : 'INR' : 'true': '1.2-2'}}</h3> <h5>{{ds.pnl / (ds.equityCash + ds.commodityCash) | percent : '1.2-2'}}</h5><span class="small"> of your account value</span>

			</div>
		</div>
	`,
	styles: [`
		.lbl-small {
			font-size:8px;
		}
	`]
})
export class FundSummaryComponent implements OnInit {
	totalFunds: number = 0;
	availableFunds : number = 0;
	equityNet: number = 0;
	commodityNet: number = 0;
	pnl: number = 0;
	brotax: number = 0;
	constructor(private ds: DataService, private http: Http) {
		this.totalFunds = this.ds.totalFunds;
		this.availableFunds = this.ds.availableFunds;
		this.pnl = this.ds.pnl;
		this.brotax = this.ds.brotax;
	}

	ngOnInit():void {
		this.ds.fundsUpdated.subscribe(funds => {
			this.totalFunds = funds.total;
			this.availableFunds = funds.available;
			this.equityNet = funds.equityNet;
			this.commodityNet = funds.commodityNet;
			this.pnl = this.ds.pnl;
			this.brotax = this.ds.brotax;
		})

		this.http.get(config.API_ROOT + 'margins')
		.subscribe(data => {
			var funds = JSON.parse(data.json().body);
			this.ds.setFunds(funds.data);
		})
	}
}