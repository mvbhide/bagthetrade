import {Component} from '@angular/core';
import {Router} from '@angular/router';
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
			z-index:100;
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
			padding: 10px 0px 0px 0px;
			margin: 1px 30px;
		}
		.header nav ul li.active {
			border-bottom: 3px solid #FFF
		}
		.header nav ul li a {
			color: #FFF;
			text-decoration: none;
			letter-spacing: 1.2px;
			opacity: 0.8;
		}
		.content {
			margin-top: 70px;
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
	constructor(private ds: DataService, private ts: TickerService, private route: Router){}

	logout() {
		window.localStorage.clear();
		this.route.navigate(['/login']);
	}
}