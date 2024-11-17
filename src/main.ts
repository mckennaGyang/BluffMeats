import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideRouter,
  RouterOutlet,
  RouterLink,
  Routes,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { StoreComponent } from "./app/components/store/store.component";
import { ItemManagementComponent } from "./app/components/admin/item-management.component";
import { LoginComponent } from "./app/components/auth/login.component";
import { CartComponent } from "./app/components/cart/cart.component";
import { ChatbotComponent } from "./app/components/chatbot/chatbot.component";
import { AuthService } from "./app/services/auth.service";
import { AdminGuard } from "./app/services/admin.guard";
import { map } from "rxjs/operators";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthInterceptor } from "./app/interceptors/auth.interceptor";

const routes: Routes = [
  { path: "", component: StoreComponent },
  {
    path: "admin",
    component: ItemManagementComponent,
    canActivate: [AdminGuard],
  },
  { path: "login", component: LoginComponent },
  { path: "cart", component: CartComponent },
];

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ChatbotComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">{{ name }}</span>
        <div class="navbar-nav">
          <a class="nav-link" routerLink="/">Store</a>
          <a class="nav-link" routerLink="/cart">Cart</a>
          <ng-container *ngIf="isAdmin$ | async">
            <a class="nav-link" routerLink="/admin">Admin</a>
          </ng-container>
          <a class="nav-link" routerLink="/login">Login</a>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
    <app-chatbot></app-chatbot>
  `,
})
export class App {
  name = "Inventory Management System";
  isAdmin$ = this.authService.currentUser$.pipe(
    map((user) => user?.role === "admin")
  );

  constructor(private authService: AuthService) {}
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
  ],
});
