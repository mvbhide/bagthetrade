import {Injectable} from '@angular/core';

@Injectable()
export class OrderService {
	prospectiveStock: string = "";
	
	setProspectiveStock(tradingsymbol: string) {
		this.prospectiveStock = tradingsymbol;
	}
}