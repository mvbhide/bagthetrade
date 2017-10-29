// modules
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';

// services
import {ChatService} from './shared/services/chat.service';
import {WebSocketService} from './shared/services/websocket.service';
import {CommunicatorService} from './shared/communicator/communicator.service';
import {DataService} from './shared/services/data-service.service';

// components
import {AppComponent} from './app.component';
import {CreateMessage} from './create-message/create-message.component';
import {ChatComponent} from './chat/chat.component';
import {DataComponent} from "./random-data/data.component";
import {StockListComponent} from "./stock-list/stock-list.component"
import {OrderFormComponent} from "./order/order-form.component";
import {FundSummaryComponent} from "./funds/fund-summary.component";
import {CurrentOrdersComponent} from "./order/current-orders/current-orders.component";

@NgModule({
	imports     : [BrowserModule, FormsModule, NguiAutoCompleteModule],
	declarations: [
		AppComponent,
		ChatComponent,
		CreateMessage,
		DataComponent,
		StockListComponent,
		OrderFormComponent,
		FundSummaryComponent,
		CurrentOrdersComponent
	],
	providers   : [ChatService, WebSocketService, CommunicatorService, DataService],
	bootstrap   : [AppComponent]
})
export class AppModule {
}
