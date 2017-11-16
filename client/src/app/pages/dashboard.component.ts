import {Component} from '@angular/core';
import {FundSummaryComponent} from '../funds/fund-summary.component'
import {OrderFormComponent} from '../order/order-form.component'
import {DataService} from '../shared/services/data-service.service'

@Component({
	selector   : 'dashboard',
	template:`
		<div class="page-container">
			<div class="fund-summary-component">
				<fund-summary></fund-summary>
			</div>
			<div class="order-form-dialog" *ngIf="showOrderForm">
				<order-form></order-form>
			</div>
		</div>
	`,
	styles: [`
		.page-container {
			width: 80%;
			margin: 0 auto;
		}
		.order-form-dialog {
			position: fixed;
			top: 20%;
			left: 20%;
			padding: 20px;
			box-shadow: 0px 0px 2px 0px #263238;
			background: #FFF;
			z-index: 5;
		}
	`]
})
export class DashboardComponent {
	showOrderForm: boolean = true;

	constructor(private ds: DataService){
		this.ds.showOverlay = true;		
	}
}