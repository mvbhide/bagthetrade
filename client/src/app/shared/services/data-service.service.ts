import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class DataService {

	totalFunds: number = 50000;
	availableFunds: number = 50000;
	marginData: any;
	fundsUpdated: EventEmitter<any> = new EventEmitter()
	showOverlay: boolean = false;

	getEquityMargins() {
		return this.marginData;
	}

	setMarginData(data) {
		this.marginData = data;
	}

	setAvailableFunds(amount) {
		console.log(amount)
		this.availableFunds = amount;
		this.fundsUpdated.emit({total: this.totalFunds, available: this.availableFunds});
	}

	setTotalFunds(amount) {
		this.totalFunds = amount;
		this.fundsUpdated.emit({total: this.totalFunds, available: this.availableFunds});
	}

} // end class ChatService