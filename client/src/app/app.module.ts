// modules
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {RouterModule, Routes} from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// services
import {ChatService} from './shared/services/chat.service';
import {WebSocketService} from './shared/services/websocket.service';
import {CommunicatorService} from './shared/communicator/communicator.service';
import {DataService} from './shared/services/data-service.service';
import {OrderService} from './shared/services/orders/orders.service';
import {AuthService} from './shared/services/auth-service.service';
import {TickerService} from './shared/services/ticker-service.service';

//Pipes
import {KeysPipe}  from './shared/pipes/key-pipe.pipe';

// Page level components
import {DashboardComponent} from './pages/dashboard.component';
import {LoginComponent} from './pages/login.component';
import {PageNotFoundComponent} from './pages/page-not-found.component';

// components
import {AppComponent} from './app.component';
import {CreateMessage} from './create-message/create-message.component';
import {ChatComponent} from './chat/chat.component';
import {DataComponent} from "./random-data/data.component";
import {StockListComponent} from "./stock-list/stock-list.component"
import {MarketwatchComponent} from "./marketwatch/marketwatch.component"
import {OrderFormComponent} from "./order/order-form.component";
import {FundSummaryComponent} from "./funds/fund-summary.component";
import {CurrentOrdersComponent} from "./order/current-orders/current-orders.component";

// Shared components
import {InfoTooltipComponent} from './shared/components/info-tooltip/info-tooltip.component';
import {MessagePopupComponent} from './shared/components/popup/message-popup.component';

const appRoutes: Routes = [
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'dashboard', 	component: DashboardComponent },
	{ path: 'login',      	component: LoginComponent },
	{ path: '**', 			component: PageNotFoundComponent }
];

@NgModule({
	imports     : [
		RouterModule.forRoot(appRoutes),
		BrowserModule,BrowserAnimationsModule, FormsModule, HttpModule, NguiAutoCompleteModule
	],
	declarations: [
		AppComponent,
		DashboardComponent,
		LoginComponent,
		PageNotFoundComponent,
		ChatComponent,
		CreateMessage,
		KeysPipe,
		DataComponent,
		StockListComponent,
		MarketwatchComponent,
		OrderFormComponent,
		FundSummaryComponent,
		CurrentOrdersComponent,
		InfoTooltipComponent,
		MessagePopupComponent
	],
	providers   : [ChatService, WebSocketService,AuthService, CommunicatorService, DataService, OrderService, AuthService, TickerService],
	bootstrap   : [AppComponent]
})
export class AppModule {
}
