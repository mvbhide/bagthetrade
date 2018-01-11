import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class DataService {

	totalFunds: number = 50000;
	availableFunds: number = 50000;
	marginData: any;
	fundsUpdated: EventEmitter<any> = new EventEmitter();
	ticksUpdated: EventEmitter<any> = new EventEmitter();
	ordersUpdated: EventEmitter<any> = new EventEmitter();
	showOverlay: boolean = false;
	currentTicks: Array<object> = [];
	currentOrders: Array<object>;

	getEquityMargins() {
		return this.marginData;
	}

	setMarginData(data) {
		this.marginData = data;
	}

	setCurrentOrders(data) {
		this.currentOrders = data;
		this.ordersUpdated.emit({data});
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

	updateTicks(ticks) {
		this.currentTicks = ticks;
		// TODO: 
		// When subscribed to multiple instruments, every tick doesn't have 
		// information for all instruments. Loop through the instruments and
		// update the latest info
		this.ticksUpdated.emit({ticks: ticks});
	}

	getQuote(instrumentToken) {

	}



} // end class ChatService