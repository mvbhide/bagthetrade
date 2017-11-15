import {Component} from '@angular/core';

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
	`]
})
export class AppComponent {
}