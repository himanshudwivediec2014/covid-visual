import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isAuthenticated: boolean = false;
  loginForm: any;
  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      (value) => {
        if (value) {
          this.isAuthenticated = value;
        }
      }
    );
    if (this.isAuthenticated) {
      localStorage.removeItem('isAuthenticated');
    }
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  login() {
    if (this.loginForm.value) {
      this.authService.loginUser();
      this.router.navigate(['/dashboard']);
    }
  }

}
