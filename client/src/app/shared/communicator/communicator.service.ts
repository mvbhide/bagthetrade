import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketService} from '../services/websocket.service';
import {DataService} from '../services/data-service.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

const DATA_URL = 'ws://bookprofits.in:3006/';

export interface api_call {
	url: string,
	params: any,
	newDate?: string
}

@Injectable()
export class CommunicatorService {
	
	private comm: any;
	
	public instream: Subject<any> = new Subject<any>();
	constructor(private wsService: WebSocketService, private ds: DataService) {
		this.comm = wsService.connectData(DATA_URL)
		this.instream = this.comm.map((response: any): any => {
				return response.data;
			})

		this.instream.subscribe(message => {

			message = JSON.parse(message);
			// Client side Incoming data
			// Possible values
			/*  1. Potential trades
				2. Currently traded ltp and bid/ asks
				3. Trade confirmations along with child trade ids */
			try {
				let method = message.method;

				switch(method) {
					case "ticks":
						ds.updateTicks(message.data);
						break;
					case "setMarginData":
						ds.setMarginData(message.data);
						break;

					case "set-available-margin":
						ds.setAvailableFunds(message.data);
						break;
					case "update-orders":
						ds.setCurrentOrders(message.data);
						break;
				}
				
			} catch (e) {
				console.log(e)
			}
			

		})
		
	}

	public send(objData) {
		//this.comm.next({method: objData.method, payload:  objData.payload});
		this.comm.next(objData)
	}
	
} // end class ChatService