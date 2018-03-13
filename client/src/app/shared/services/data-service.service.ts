import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class DataService {

	totalFunds: number = 5940.13;
	availableFunds: number = 50000;
	marginData: any;
	fundsUpdated: EventEmitter<any> = new EventEmitter();
	ticksUpdated: EventEmitter<any> = new EventEmitter();
	ordersUpdated: EventEmitter<any> = new EventEmitter();
	showOverlay: boolean = false;
	showOrderForm: boolean = false;
	currentTicks: Array<object> = [];
	currentOrders: Array<object>;
	marketData: Array<any> = [];


	orderFormOptions: any = {
		transactionType: 'BUY',
		tradingsymbol: '',
		instrumentToken: '',
		lotSize: 1,
		coUpper: 1,
		coLower: 1
	}

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
		for(let i=0; i < ticks.length; i++) {
			this.marketData[ticks[i].Token] = ticks[i];
		}
		this.ticksUpdated.emit({ticks: ticks});
	}

	getQuote(instrumentToken) {
		let quote:any = {};
		let insData = this.marketData[instrumentToken];
		if(insData) {
			quote.ltp = insData.LastTradedPrice;
			quote.topBid = insData.Depth.sell.length > 0 ? insData.Depth.sell[0].Price : 0;
			quote.topAsk = insData.Depth.buy.length > 0 ? insData.Depth.buy[0].Price : 0;	
			return quote;
		}
		
	}

	getFullQuote(instrumentToken) {
		let quote:any = {};
		let insData = this.marketData[instrumentToken];
		if(insData) {
			quote.ltp = insData.LastTradedPrice;
			quote.Depth = insData.Depth;
			return quote;
		}
		
	}



} // end class ChatService