import { Component } from "@angular/core"
import { bootstrapApplication } from "@angular/platform-browser"
import {
  provideRouter,
  RouterOutlet,
  RouterLink,
  Routes,
  Router,
} from "@angular/router"
import { CommonModule } from "@angular/common"
import { StoreComponent } from "./app/components/store/store.component"
import { ItemManagementComponent } from "./app/components/admin/item-management.component"
import { LoginComponent } from "./app/components/auth/login.component"
import { CartComponent } from "./app/components/cart/cart.component"
import { ChatbotComponent } from "./app/components/chatbot/chatbot.component"
import { AuthService } from "./app/services/auth.service"
import { AdminGuard } from "./app/services/admin.guard"
import { map } from "rxjs/operators"
import { provideHttpClient } from "@angular/common/http"
import { RegisterComponent } from "./app/components/auth/register.component"
import { CheckoutComponent } from "./app/components/cart/checkout.component"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideToastr } from "ngx-toastr"

const routes: Routes = [
  { path: "store", component: StoreComponent },
  {
    path: "admin",
    component: ItemManagementComponent,
    canActivate: [AdminGuard],
  },
  { path: "", component: LoginComponent },
  { path: "cart", component: CartComponent },
  { path: "checkout", component: CheckoutComponent },
  { path: "register", component: RegisterComponent },
]

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ChatbotComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/store">{{ name }}</a>
        <div class="navbar-nav">
          <a class="nav-link" routerLink="/store">Store</a>
          <a class="nav-link" routerLink="/cart">Cart</a>
          <ng-container *ngIf="isAdmin$ | async">
            <a class="nav-link" routerLink="/admin">Admin</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn$ | async">
            <a class="nav-link" routerLink="/" (click)="onSubmit()">Logout</a>
          </ng-container>
          <ng-container *ngIf="!(isLoggedIn$ | async)">
            <a class="nav-link" routerLink="/">Login</a>
            <a class="nav-link" routerLink="/register">Register</a>
          </ng-container>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
    <app-chatbot></app-chatbot>
  `,
})
export class App {
  name = "Bluff Meats"
  isAdmin$ = this.authService.currentUser$.pipe(
    map((user) => user?.role === "admin")
  )
  isLoggedIn$ = this.authService.currentUser$.pipe(map((user) => user !== null))

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.logout()
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideToastr(),
  ],
})
