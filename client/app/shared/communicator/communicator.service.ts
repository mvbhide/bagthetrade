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
			console.log(data)
		})
		
	}

	public sendData(payload: any) {
		this.comm.next(payload);
	}

	
} // end class ChatService