import {Injectable} from '@angular/core';

@Injectable()
export class DataService {

	totalFunds: number = 50000;
	availableFunds: number = 50000;
	marginData: any;

	getEquityMargins() {
		return this.marginData;
	}

	setMarginData(data) {
		this.marginData = data;
	}


} // end class ChatService