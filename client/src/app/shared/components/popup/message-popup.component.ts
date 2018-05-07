import { Component, Input } from '@angular/core'

@Component({
	selector: 'message-popup',
	template: `
		<div class="message-popup">
			<div class="message-container">{{message}}</div>
		</div>
	`,
	styles: [`
		.message-container {
			position: relative;
			display: inline;
		}
		
		.message-popup {
			position: fixed;
			background: rgba(39, 174, 96, 0.5);
			padding: 10px;
			width: 150px;
			box-shadow: 0px 0px 5px 1px #333;
			top: 100px;
			right: 25px;
			border-radius: 5px;
			opacity: 0.6;
			z-index:100;
			color: #000;
		}
	`]
})
export class MessagePopupComponent {
	message: string = "Order was successfully placed"
}