import {Component} from '@angular/core';
import {ChatService} from '../shared/services/chat.service';
import {CommunicatorService} from '../shared/communicator/communicator.service'

@Component({
	selector: 'stock-list',
	template: `
	<div class="stock-list">
		<ul class="list-group">
			<li *ngFor="let stock of stocks" class="list-group-item">
				<div class="stock-list-item">
					<ul>
						<li>{{stock.name}}</li>
						<li>{{stock.ltp}}</li>
						<li><a class="btn btn-default" (click)="takethistrade(stock)">Take this trade</a></li>
					</ul>
				</div>
			</li>
		</ul>
	</div>
	
	`,
})
export class StockListComponent {
	stocks: any = [{name: 'TCS', ltp: 2200}, {name: 'INFY', ltp: 951}]

	constructor(private cs: CommunicatorService) {
		cs.instream.subscribe(data => {
			console.log(data)
		})
	}

	takethistrade(stock: any) {
		console.log(stock)
		this.cs.sendData(stock)
	}
}