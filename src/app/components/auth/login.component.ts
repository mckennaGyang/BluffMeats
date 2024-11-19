import { Component } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { CommonModule } from "@angular/common"
import { CartService } from "../../services/cart.service"

@Component({
  selector: "app-login",
  template: `
    <div class="container-sm max-w-10 mt-5">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <h2 class="mb-3 text-center">Login</h2>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="email"
            formControlName="email"
            [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
          />
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['email'].errors?.['required']"
          >
            Email is required
          </div>
        </div>
        <div class="mb-4">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            formControlName="password"
            [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
          />
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['password'].errors?.['required']"
          >
            Password is required
          </div>
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          [style]="{ width: '100%' }"
          [disabled]="loading"
        >
          {{ loading ? "Loading..." : "Login" }}
        </button>
        <div *ngIf="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
        <div class="text-center mt-3">
          Don't have an account?
          <a routerLink="/register" class="text-primary">Register here</a>
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class LoginComponent {
  loginForm: FormGroup
  loading = false
  submitted = false
  error = ""

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  get f() {
    return this.loginForm.controls
  }

  ngOnInit() {
    const addToCart = this.route.snapshot.queryParams["addToCart"]
    const checkout = this.route.snapshot.queryParams["checkout"]
    const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/"

    if (this.authService.isLoggedIn()) {
      // Redirect based on original intent
      if (addToCart === "true") {
        this.router.navigateByUrl("/cart")
      } else if (checkout === "true") {
        this.router.navigateByUrl("/checkout")
      } else {
        this.router.navigateByUrl(returnUrl)
      }
    }
  }

  onSubmit() {
    this.submitted = true
    this.error = ""

    if (this.loginForm.invalid) {
      return
    }

    this.loading = true
    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: () => {
          this.router.navigate(["/store"])
        },
        error: (error) => {
          this.error = error.error?.message || "An error occurred during login"
          this.loading = false
        },
      })
  }
}
