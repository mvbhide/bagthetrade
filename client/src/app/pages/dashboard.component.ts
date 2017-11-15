import {Component} from '@angular/core';
import {FundSummaryComponent} from '../funds/fund-summary.component'
import {OrderFormComponent} from '../order/order-form.component'

@Component({
	selector   : 'dashboard',
	template:`
		<fund-summary></fund-summary>
		<order-form></order-form>
	`
})
export class DashboardComponent {
}