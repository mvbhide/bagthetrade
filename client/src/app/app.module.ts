// modules
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

// services
import {ChatService} from './shared/services/chat.service';
import {WebSocketService} from './shared/services/websocket.service';
import {CommunicatorService} from './shared/communicator/communicator.service'

// components
import {AppComponent} from './app.component';
import {CreateMessage} from './create-message/create-message.component';
import {ChatComponent} from './chat/chat.component';
import {DataComponent} from "./random-data/data.component";
import {StockListComponent} from "./stock-list/stock-list.component"
import {OrderFormComponent} from "./order/order-form.component"

@NgModule({
	imports     : [BrowserModule, FormsModule],
	declarations: [
		AppComponent,
		ChatComponent,
		CreateMessage,
		DataComponent,
		StockListComponent,
		OrderFormComponent
	],
	providers   : [ChatService, WebSocketService, CommunicatorService],
	bootstrap   : [AppComponent]
})
export class AppModule {
}