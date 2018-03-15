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
		</div>
	`,
	styles: [`
		.fund-summary-container span {
			font-size: 26px;
		}
	`]
})
export class FundSummaryComponent implements OnInit {
	totalFunds: number = 0;
	availableFunds : number = 0;

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