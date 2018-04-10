import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FundSummaryComponent} from '../funds/fund-summary.component'
import {CurrentOrdersComponent} from '../order/current-orders/current-orders.component'
import {MarketwatchComponent} from '../marketwatch/marketwatch.component'
import {OrderFormComponent} from '../order/order-form.component'
import {DataService} from '../shared/services/data-service.service'

@Component({
	selector   : 'dashboard',
	template:`
		<div class="page-container">
			
			<div class="row">
				<div class="col-sm-3 bd-sidebar">
					<div class="marketwatch-component">
						<marketwatch></marketwatch>
					</div>
				</div>
				<div class="col-sm-9">
					<div class="fund-summary-component text-right">
						<fund-summary></fund-summary>
					</div>
					<div class="current-orders-component">
						<current-orders></current-orders>
					</div>
				</div>
			</div>			
			<div class="order-form-dialog" *ngIf="ds.showOrderForm">
				<div class="close-order-form-dialog" (click)="closeOrderForm()"></div>
				<order-form></order-form>
			</div>
		</div>
	`,
	styles: [`
		.page-container {
			width: 96%;
			margin: 0 auto;
		}
		.fund-summary-component {
			margin-bottom: 30px;
		}
		.order-form-dialog {
			position: fixed;
			top: 20vh;
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

	constructor(private route: Router, private ds: DataService){
		if(!window.localStorage.pid) {
			this.route.navigate(['/login'])
		}

		this.ds.showOverlay = false;
		this.ds.showOrderForm = false;
	}

	closeOrderForm() {
		this.ds.showOrderForm = false;
		this.ds.showOverlay = false;
	}

	logout() {
		window.localStorage.clear();
		this.route.navigate(['/login']);
	}
}