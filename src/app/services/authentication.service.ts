import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuthenticated$: BehaviorSubject<boolean>;
  constructor(private router: Router) {
    const isAuthenticated = !!localStorage.getItem('isAuthenticated');
    this.isAuthenticated$ = new BehaviorSubject<boolean>(isAuthenticated);
  }

  loginUser() {
    localStorage.setItem('isAuthenticated', 'true');
    this.isAuthenticated$.next(true);
  }

  logoutUser() {
    this.isAuthenticated$.next(false);
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}
