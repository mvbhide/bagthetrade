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
				<div class="close-order-form-dialog" (click)="closeOrderForm()"></div>
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
		.close-order-form-dialog::after:hover {
			opacity: 0.6;
		}
		.close-order-form-dialog::after {
			content: 'X';
			padding: 2px 6px;
			border: 1px solid #FFF;
			border-radius: 50%;
			background: #263238;
			color: #FFF;
			position: absolute;
			right: -7px;
			top: -12px;
			cursor: pointer;
		}
	`]
})
export class DashboardComponent {
	showOrderForm: boolean = true;

	constructor(private ds: DataService){
		this.ds.showOverlay = true;		
	}

	closeOrderForm() {
		this.showOrderForm = false;
		this.ds.showOverlay = false;
	}
}