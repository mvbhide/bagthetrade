import {Injectable} from '@angular/core';

@Injectable()
export class OrderService {
	prospectiveStock: string = "";
	tickSize: number = 0.05;

	
	setProspectiveStock(tradingsymbol: string) {
		this.prospectiveStock = tradingsymbol;
	}
}