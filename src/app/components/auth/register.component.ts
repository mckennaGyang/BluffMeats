import { Component } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { Router, RouterLink, RouterOutlet } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-register",
  template: `
    <div class="container-sm max-w-10 mt-5">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <h2 class="mb-3 text-center">Register</h2>
        <div class="mb-3">
          <label for="name" class="form-label">Full Name</label>
          <input
            type="text"
            class="form-control"
            id="name"
            formControlName="name"
            [ngClass]="{ 'is-invalid': submitted && f['name'].errors }"
          />
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['name'].errors?.['required']"
          >
            Full name is required
          </div>
        </div>

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
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['email'].errors?.['email']"
          >
            Please enter a valid email address
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
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['password'].errors?.['minlength']"
          >
            Password must be at least 6 characters
          </div>
        </div>

        <div class="mb-4">
          <label for="confirmPassword" class="form-label"
            >Confirm Password</label
          >
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            formControlName="confirmPassword"
            [ngClass]="{
              'is-invalid': submitted && f['confirmPassword'].errors
            }"
          />
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['confirmPassword'].errors?.['required']"
          >
            Please confirm your password
          </div>
          <div
            class="invalid-feedback"
            *ngIf="submitted && f['confirmPassword'].errors?.['matching']"
          >
            Passwords do not match
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          [style]="{ width: '100%' }"
          [disabled]="loading"
        >
          {{ loading ? "Loading..." : "Register" }}
        </button>

        <div *ngIf="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>

        <div class="text-center mt-3">
          Already have an account?
          <a routerLink="/login" class="text-primary">Login here</a>
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterOutlet],
})
export class RegisterComponent {
  registerForm: FormGroup
  loading = false
  submitted = false
  error = ""

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validator: this.passwordMatchingValidator,
      }
    )
  }

  get f() {
    return this.registerForm.controls
  }

  passwordMatchingValidator(fg: FormGroup) {
    const password = fg.get("password")?.value
    const confirmPassword = fg.get("confirmPassword")?.value

    if (password !== confirmPassword) {
      fg.get("confirmPassword")?.setErrors({ matching: true })
    } else {
      fg.get("confirmPassword")?.setErrors(null)
    }
  }

  onSubmit() {
    this.submitted = true
    this.error = ""

    if (this.registerForm.invalid) {
      return
    }

    this.loading = true

    const { name, email, password } = this.registerForm.value

    this.authService.register(name, email, password).subscribe({
      next: () => {
        // Optionally show success message
        this.router.navigate(["/login"])
      },
      error: (error) => {
        this.error =
          error.error?.message || "An error occurred during registration"
        this.loading = false
      },
    })
  }
}
