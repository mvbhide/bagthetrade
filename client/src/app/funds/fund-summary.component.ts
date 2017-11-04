import { Component } from '@angular/core'
import { CommunicatorService } from '../shared/communicator/communicator.service';
import { DataService } from '../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";


@Component({
	selector: 'fund-summary',
	template: `
		<div class='fund-summary-container'>
			<div class='total-funds'>
				<label>Total Funds: </label>
				<span [ngClass]="{'profit' : totalFunds >= 0 , 'loss' : totalFunds < 0}">{{totalFunds | currency : 'INR' : 'symbol': '4.2-2'}}</span>
			</div>
			<div class='available-funds' [ngClass]="{'profit' : availableFunds >= 0, 'loss' : availableFunds < 0}">{{availableFunds | currency : 'INR' : 'symbol': '4.2-2'}}</div>
		</div>
	`
})
export class FundSummaryComponent {
	totalFunds: number = 100000;
	availableFunds : number = 100000;
}