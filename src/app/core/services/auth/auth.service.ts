import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ForgotPassword } from '../../models/auth/forgot-password.model';
import { LoginPayload } from '../../models/auth/login-payload.model';
import { ResetPassword } from '../../models/auth/reset-password.model';
import { ReturnLogin } from '../../models/auth/return-login.model';
import { ReturnUser } from '../../models/user/return-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<ReturnUser | null>;
  public currentUser$: Observable<ReturnUser | null>;

  private tokenSubject: BehaviorSubject<string | null>;
  public token$: Observable<string | null>;

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    const storedUser = this.isBrowser ? localStorage.getItem('user') : null;
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<ReturnUser | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();

    const storedToken = this.isBrowser ? localStorage.getItem('token') : null;

    if (storedToken && !this.isTokenValid(storedToken)) {
      this.tokenSubject = new BehaviorSubject<string | null>(null);
      this.logout();
    } else {
      this.tokenSubject = new BehaviorSubject<string | null>(storedToken);
    }

    this.token$ = this.tokenSubject.asObservable();
  }

  login(loginPayload: LoginPayload): Observable<ReturnLogin> {
    return this.http.post<ReturnLogin>(this.apiUrl, loginPayload).pipe(
      tap((response: ReturnLogin) => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        this.currentUserSubject.next(response.user);
        this.tokenSubject.next(response.accessToken);
      })
    );
  }

  forgotPassword(forgotPassword: ForgotPassword) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, forgotPassword);
  }

  resetPassword(resetPassword: ResetPassword) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, resetPassword);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getCurrentUser(): ReturnUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (!this.isTokenValid(token)) {
      this.logout();
      return false;
    }

    const user = this.getCurrentUser();
    if (!user) {
      this.logout();
      return false;
    }

    return true;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp && payload.exp > currentTime;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  updateCurrentUser(user: ReturnUser) {
    this.currentUserSubject.next(user);

    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}