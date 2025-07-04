import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginPayload } from '../../models/auth/login-payload.model';
import { ReturnLogin } from '../../models/auth/return-login.model';
import { environment } from '../../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ReturnUser } from '../../models/user/return-user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private jwtHelper = new JwtHelperService();

  private currentUserSubject!: BehaviorSubject<ReturnUser | null> ;
  public currentUser$!: Observable<ReturnUser | null> ;

  token$ = new BehaviorSubject<string | null>(this.getToken());

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

      this.currentUserSubject = new BehaviorSubject<ReturnUser | null>(user);
      this.currentUser$ = this.currentUserSubject.asObservable();
    }
  }

  login(loginPayload: LoginPayload): Observable<ReturnLogin> {
    return this.http.post<ReturnLogin>(this.apiUrl, loginPayload).pipe(
      tap((response: ReturnLogin) => {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        this.currentUserSubject.next(response.user);

        this.token$.next(response.accessToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.token$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
