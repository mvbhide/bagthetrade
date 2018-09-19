import {Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../config/app.config';
import * as config from '../shared/services/config.service';

@Component({
	selector   : 'auth',
	template : ``
})
export class AuthComponent {

    public rt: string; //Request Token
    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {
        var self = this;
        this.route.queryParams.subscribe(params => {
            this.rt = params['request_token'];
            if(this.rt) {
                self.http.get(config.API_ROOT + 'kiteauthred?request_token=' + this.rt, )
                .subscribe(res => {
                    console.log(res);
                    this.router.navigate(['/dashboard'])
                })
            }
        });
    }
}