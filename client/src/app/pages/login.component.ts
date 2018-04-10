import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {FundSummaryComponent} from '../funds/fund-summary.component';
import {CommunicatorService} from '../shared/communicator/communicator.service';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

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
					<div class="form-group">
						<input type="checkbox" id="skiptokens" class="form-control" ([ngModel])="skiptokens" name="skiptokens" #skiptokens />
						<label for="skiptokens">Skip tokens</label>
					</div>
					<div class="form-group">
						<label>Kite Cookie</label>
						<input type="text" class="form-control" ([ngModel])="kitecookie" name="kitecookie" #kitecookie />
					</div>
					<div class="form-group">
						<label>CSRF Token</label>
						<input type="text" class="form-control" ([ngModel])="csrfToken" name="csrfToken" #csrfToken />
					</div>
					<div class="form-group text-right">
						<button class="btn btn-login" (click)="authenticate(email.value, password.value, kitecookie.value, csrfToken.value)">Login</button>
					</div>
					<div class="error loss" *ngIf="isError">
						<h6>{{errorMsg}}</h6>
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

	isError: boolean = false;
	errorMsg: string = "";
	skiptokens: boolean;

	constructor(private route: Router, private http: Http, private cs: CommunicatorService) {}
	authenticate(email, password, kitecookie, csrfToken) {
		this.isError = false;
		this.errorMsg = "";
		var body;
		if(this.skiptokens) {
			body = {u: email, p: password, csrfToken: '', kitecookie: ''};	
		} else {
			body = {u: email, p: password, csrfToken: csrfToken, kitecookie: kitecookie};
		}
		
		this.http.post('http://localhost:8080/login', body)
		.subscribe(data => {
			var res = data.json();
			if(res.success && res.success == true) {
				window.localStorage.pid = res.data[0].access_token;
				this.route.navigate(['/dashboard']);
			} else {
				this.isError = true;
				this.errorMsg = "Invalid credentials";
			}
		})
	}
}