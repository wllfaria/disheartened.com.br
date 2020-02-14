import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { RegexService } from 'src/app/core/services/regex.service';
import { PersonService } from 'src/app/core/services/person.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ISenderLogin } from 'src/app/models/serverRequests/senderLogin.model';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
	constructor(
		private formBuilder: FormBuilder,
		private regexService: RegexService,
		private personService: PersonService
	) {}

	private subs: SubSink = new SubSink();
	private requestError: boolean;
	private loginData: ISenderLogin;

	public loginForm: FormGroup;
	public formLoading: boolean;

	ngOnInit() {
		this.createForm();
	}

	private createForm = (): void => {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.pattern(this.regexService.emailRegex)]],
			password: ['', [Validators.required, Validators.minLength(8)]]
		});
	}

	public get formControls() { return this.loginForm.controls; }

	public onSubmit = (): void => {
		if (this.loginForm.invalid) {
			return;
		}

		this.formLoading = true;
		this.loginData =  this.loginForm.value as ISenderLogin;

		this.subs.add(this.personService.login(this.loginData).subscribe(
			(res: HttpResponse<any>) => {
				if (!res.ok) {
					this.requestError = true;
					return;
				}
				this.personService.setLoggedUser(res.body.token);
			},
			(error: HttpErrorResponse) => {
				this.requestError = true;
			},
			() => {
				this.formLoading = false;
			}
		));
	}

	ngOnDestroy() {
		this.subs.unsubscribe();
	}

}
