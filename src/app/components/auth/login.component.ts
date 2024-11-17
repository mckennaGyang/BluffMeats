import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  template: `
    <div class="container mt-5">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
        <div class="mb-3">
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
        <button type="submit" class="btn btn-primary" [disabled]="loading">
          {{ loading ? "Loading..." : "Login" }}
        </button>
        <div *ngIf="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = "";

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: () => {
          this.router.navigate(["/"]);
        },
        error: (error) => {
          this.error = error.error?.message || "An error occurred during login";
          this.loading = false;
        },
      });
  }
}
