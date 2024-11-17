import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { User } from "../models/user.model";

interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly API_URL = "http://localhost/api/endpoints";
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login.php`, {
        email,
        password,
      }, { headers: this.headers })
      .pipe(
        tap((response) => {
          // Store the token
          localStorage.setItem("token", response.token);
          // Store the user
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          // Update the BehaviorSubject
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === "admin";
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }
}
