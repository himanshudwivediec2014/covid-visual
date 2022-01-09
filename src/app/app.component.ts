import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "./services/authentication.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'visualising-covid';
  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthenticationService
  ) {
  }
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      (value) => {
        if (value) {
          this.isAuthenticated = value;
        }
      }
    );
  }

  logout() {
    this.authService.logoutUser();
    this.isAuthenticated = false;
  }
}
