import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketService} from '../services/websocket.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

const DATA_URL = 'ws://localhost:3006';

export interface api_call {
	url: string,
	params: any,
	newDate?: string
}

@Injectable()
export class CommunicatorService {
	
	private comm: any;
	
	public instream: Subject<any> = new Subject<any>();
	constructor(private wsService: WebSocketService) {
		this.comm = wsService.connectData(DATA_URL)
		this.instream = this.comm.map((response: any): any => {
				return response.data;
			})

		this.instream.subscribe(data => {
			// Client side Incoming data
			// Possible values
			/*  1. Potential trades
				2. Currently traded ltp and bid/ asks
				3. Trade confirmations along with child trade ids */
			try {
				let objData = JSON.parse(data)
				console.log("parsed data from server ", objData)
			} catch (e) {
				console.log(e)
			}
			

		})
		
	}

	public send(objData) {
		this.comm.next({method: objData.method, payload:  objData.payload});
	}
	
} // end class ChatService