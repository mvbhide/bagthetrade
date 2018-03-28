import { Component, OnInit } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";


@Component({
	selector: 'fund-summary',
	template: `
		<div class='fund-summary-container row'>
			<div class='total-funds col-lg-2'>
				<label>Total Fund: </label>
				<h3 [ngClass]="{'profit' : totalFunds >= 0 , 'loss' : totalFunds < 0}">{{totalFunds | currency : 'INR' : 'symbol': '4.2-2'}}</h3>
			</div>
			<div class='available-funds col-lg-2'>
				<label>Available Fund: </label>
				<h3 [ngClass]="{'profit' : availableFunds >= 0, 'loss' : availableFunds < 0}">{{availableFunds | currency : 'INR' : 'symbol': '4.2-2'}}</h3>
			</div>
			<div class='profit-loss col-lg-4'>
				<label>Intraday P/L</label><span class="lbl-small"> (including brokerage & Taxes) </span>
				<h3 [ngClass]="{'profit' : pnl >= 0, 'loss' : pnl < 0}">{{pnl - brotax | currency : 'INR' : 'true': '1.2-2'}}</h3>
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
	pnl: number = 375;
	brotax: number = 15.29;
	constructor(private ds: DataService) {
		this.totalFunds = this.ds.totalFunds;
		this.availableFunds = this.ds.availableFunds;
	}

	ngOnInit():void {
		this.ds.fundsUpdated.subscribe(funds => {
			this.totalFunds = funds.total;
			this.availableFunds = funds.available;
		})
	}
}