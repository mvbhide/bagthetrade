import { Component, Input } from '@angular/core'

@Component({
	selector: 'info-tooltip',
	template: `
		<div class="info-tooltip-container">
			<span class="info-question-mark">?</span>
			<div class="info-tooltip">{{info}}</div>
		</div>
	`,
	styles: [`
		.info-tooltip-container {
			position: relative;
			display: inline;
		}
		.info-question-mark {
		    background: #FFF;
		    border: 1px solid #333;
		    border-radius: 50%;
		    padding: 0px 2px;
		    font-family: sans-serif;
		    font-size: 10px;
		    cursor: pointer;
		}

		.info-tooltip {
			position: absolute;
			background: #FFF;
			display: none;
			padding: 10px;
			width: 150px;
			box-shadow: 0px 0px 5px 1px #333;
			top: -20px;
			left: 25px;
			text-align: justify;
			border-radius: 5px;
		}

		.info-question-mark:hover + .info-tooltip {
			display: inline;
		    background: #333;
		    z-index: 10;
		    color: #fff;
		    font-size: 10px;
		    word-wrap: break-word;
		}
	`]
})
export class InfoTooltipComponent {
	@Input() info: string = 'Test Information';
	@Input() showfor: string = '';
}