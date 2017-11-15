import {Injectable} from '@angular/core';


@Injectable()
export class AuthService {

	isUserLoggedIn: boolean = false;

	constructor() {}

	authenticateUser(email: string, password: string) {

	}

	authentication(objResponse) {
		if(objResponse && objResponse.status == "success") {
			this.isUserLoggedIn = true;
		}
	}
}