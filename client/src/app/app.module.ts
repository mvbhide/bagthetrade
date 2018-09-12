// modules
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {RouterModule, Routes} from '@angular/router';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';

// services
import {WebSocketService} from './shared/services/websocket.service';
import {CommunicatorService} from './shared/communicator/communicator.service';
import {DataService} from './shared/services/data-service.service';
import {TickerService} from './shared/services/ticker-service.service';

//Pipes
import {KeysPipe}  from './shared/pipes/key-pipe.pipe';

// Page level components
import {DashboardComponent} from './pages/dashboard.component';
import {LoginComponent} from './pages/login.component';
import {PageNotFoundComponent} from './pages/page-not-found.component';
import { AuthComponent } from './pages/auth.component';

// components
import {AppComponent} from './app.component';
import {MarketwatchComponent} from "./marketwatch/marketwatch.component"
import {OrderFormComponent} from "./order/order-form.component";
import {FundSummaryComponent} from "./funds/fund-summary.component";
import {CurrentOrdersComponent} from "./order/current-orders/current-orders.component";

// Shared components
import {InfoTooltipComponent} from './shared/components/info-tooltip/info-tooltip.component';
import {MessagePopupComponent} from './shared/components/popup/message-popup.component';
import { HttpModule } from '@angular/http';

const appRoutes: Routes = [
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'dashboard', 	component: DashboardComponent },
	{ path: 'login',      	component: LoginComponent },
	{ path: 'auth',      	component: AuthComponent },
	{ path: '**', 			component: PageNotFoundComponent }
];

@NgModule({
	imports     : [
		RouterModule.forRoot(appRoutes),
		BrowserModule,BrowserAnimationsModule, FormsModule,HttpModule, HttpClientModule, NguiAutoCompleteModule
	],
	declarations: [
		AppComponent,
		DashboardComponent,
		LoginComponent,
		PageNotFoundComponent,
		AuthComponent,
		KeysPipe,
		MarketwatchComponent,
		OrderFormComponent,
		FundSummaryComponent,
		CurrentOrdersComponent,
		InfoTooltipComponent,
		MessagePopupComponent
	],
	providers   : [HttpClientModule, WebSocketService,CommunicatorService, DataService, TickerService],
	bootstrap   : [AppComponent]
})
export class AppModule {
}
