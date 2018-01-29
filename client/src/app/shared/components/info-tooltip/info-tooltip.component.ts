import { Component, Input } from '@angular/core'

@Component({
	selector: 'info-tooltip',
	template: `
		<span class="info-question-mark">?</span>
		<div class="info-tooltip">{{info}}</div>
	`,
	styles: [`
		.info-question-mark {
			background: #F5F5F5;
			border: 1px solid #999;
			border-radius: 50%;
			padding: 1px 4px;
		}

		.info-tooltip {
			position: absolute;
			background: #FFF;
			display: none;
			padding: 5px;
			width: 100px;
			box-shadow: 0px 1px 1px 1px #CCC;
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

}