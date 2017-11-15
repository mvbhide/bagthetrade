import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {FundSummaryComponent} from '../funds/fund-summary.component';
import {CommunicatorService} from '../shared/communicator/communicator.service';

@Component({
	selector   : 'dashboard',
	template:`
		<div class="login-page-container">
			<div class="login-form-container">
				<form #loginForm="ngForm">
					<div class="form-group">
						<label>Email</label>
						<input type="email" class="form-control" ([ngModel])="email" name="email" #email />
					</div>
					<div class="form-group">
						<label>Password</label>
						<input type="password" class="form-control" ([ngModel])="password" name="password" #password />
					</div>
					<div class="form-group pull-right">
						<button class="btn btn-login" (click)="authenticate(email.value, password.value)">Login</button>
					</div>
				</form>
			</div>
		</div>
	`,
	styles: [`
		.login-page-container {
		    width: 30%;
		    margin: 0 auto;
		    padding: 30px;
		    background: #ECEFF1;
		    height: 275px;
		    box-shadow: 0px 0px 10px 0px #263238;
		    border-radius: 5px;
		}

		.btn-login {
			background: #263238;
			color: #FFF;
		}
	`]
})
export class LoginComponent {
	constructor(private cs: CommunicatorService) {}
	authenticate(email, password) {
		this.cs.send({method: 'authenticate',payload: {e: email, p: password}});
	}
}