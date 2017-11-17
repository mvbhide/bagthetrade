import { Component } from '@angular/core'
import { CommunicatorService } from '../../shared/communicator/communicator.service';
import { DataService } from '../../shared/services/data-service.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";


@Component({
	selector: 'current-orders',
	template: `
	<div class="order-list-container">
		<div class="order-list-header"></div>
		<div class='order-list' >
			<ul>
				<li *ngFor="let order of objOrders">
					
				</li>
			</ul>
		</div>
	</div>
	`,
	styles: [`
		.form-control-md {
			color: #000;
		}
		.order-form-container {
			width: 50%;
			box-shadow: 2px 2px 4px 4px #DDD;
		}
		.order-form-header {
			font-size: 16px;
			padding: 15px;
			border-radius: 2px 2px 0px 0px;
		}
		.order-form {
			padding: 15px;
			background: #FFF;
		}
		.order-form label {
			color: #333;
		}
		.order-form input {
			color: #666;
		}
		.order-form ul li {
			list-style: none;
		}
		.order-type {
			margin: 10px 0px;
		}

		.change-transaction-type {
			cursor: pointer;
		}
	`]
})
export class CurrentOrdersComponent {
	orders: Array<object>;
	constructor(cPort: CommunicatorService, ds: DataService) {
		this.cPort = cPort;
		this.ds = ds;
	}

	refreshOrders(objOrders) {

	}
	
}