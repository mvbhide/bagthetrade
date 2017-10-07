import { Component } from '@angular/core'

@Component({
	selector: 'order-form',
	template: `
	<div class="order-form">
		<form>
			<ul class="order-category">
				<li><input type='radio' name="order-type" id="orderTypeBO" value="BO" checked><label for="orderTypeBO">BO</label></li>
				<li><input type='radio' name="order-type" id="orderTypeCO" value="CO"><label for="orderTypeCO">CO</label></li>
				<li><input type='radio' name="order-type" id="orderTypeCNC" value="CNC"><label for="orderTypeCNC">CNC</label></li>
			</ul>
			<div class="form-control-group">
				<input type="text" value="" id="triggerPrice" />
				<label for="triggerPrice"> Stop Loss</label>
			</div>
			<div class="form-control-group">
				<input type="text" value="" />
				<label for="orderPrice"> Order Price</label>
			</div>
			<div class="form-control-group">
				<input type="text" value="" id="targetPrice"/>
				<label for="targetPrice"> Target</label>
			</div>

		</form>
	</div>
	
	`,
})
export class OrderFormComponent {
	
	constructor() {
		
	}

	
}