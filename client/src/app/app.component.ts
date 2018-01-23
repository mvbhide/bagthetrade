import {Component} from '@angular/core';
import {DataService} from './shared/services/data-service.service';
import {TickerService} from './shared/services/ticker-service.service';

@Component({
	moduleId   : module.id,
	selector   : 'app-root',
	templateUrl: 'app.component.html',
	styles: [`
		.header {
			position: fixed;
			top:0;
			width: 100%;
			background: #263238;
			color: #FFF;
		}
		.header nav {
			float: right;
		}
		.header nav ul {
			margin:0;
		}
		.header nav ul li {
			display: inline-block;
			cursor: pointer;
			padding: 12px 0px;
			margin: 2px 30px;
		}
		.header nav ul li.active {
			border-bottom: 3px solid #FFF
		}
		.header nav ul li a {
			font-size: 18px;
			color: #FFF;
			text-decoration: none;
			letter-spacing: 1.2px;
			opacity: 0.8;
		}
		.content {
			margin-top: 100px;
		}
		.overlay {
		    position: fixed;
		    height: 100%;
		    width: 100%;
		    background: #000;
		    top: 0;
		    opacity: 0.6;
		    z-index: 1;
		}
	`]
})
export class AppComponent {
	constructor(private ds: DataService, private ts: TickerService){}
}