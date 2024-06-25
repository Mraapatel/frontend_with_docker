import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, catchError, of, switchMap, tap, timer } from 'rxjs';
import { BnNgIdleService } from 'bn-ng-idle'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';


interface TokenResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private http = inject(HttpClient);
  private bnIdle = inject(BnNgIdleService);
  private router = inject(Router);
  private _tostr = inject(ToastrService);
  private backendUrl = environment.BACKEND_URL

  private idleTimeout: number = 20 * 60 * 1000;
  // private idleTimeout: number = 5;
  // private idleTimeout: number = 5;


  private loggedAdmin!: string;
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  public notificationCount!: string
  private isAuthenticated = new BehaviorSubject<boolean>(false)
  private isIdle = new BehaviorSubject<boolean>(false);
  // getToken!: string;
  private getTokenbs = new BehaviorSubject<string | null>('');


  constructor() {
    this.checkTokenValidity();
    // this.watchIdle()
  }

  startWatching() {
    // alert('watching');
    this.bnIdle.startWatching(this.idleTimeout).subscribe((isTimeOut: boolean) => {
      console.log('session Expired');
      // alert('session Expired');
      this._tostr.warning('Session Expired', 'Warning');
      this._tostr.info('Logged Out', 'Info');

      localStorage.removeItem(this.JWT_TOKEN);
      this.router.navigate(['login']);
      this.isIdle.next(true);
      this.stopWatching()
    })
  }

  get IdleState(): boolean {
    return this.isIdle.value
  }

  // get fetchtoken(): string {
  //   return this.getToken
  // }

  public fetchtoken(): Observable<string | null> {
    return this.getTokenbs.asObservable();
  }

  login(user: { username: string, password: string }) {
    return this.http.post<TokenResponse>(`${this.backendUrl}authenticate`, user)
      .pipe(
        tap((response) => {
          this.doLoginAdmin(user.username, response);
          // this.getToken = response.token;
          this.getTokenbs.next(response.token)
        }),
        catchError((error) => {
          console.log(error);

          if (error.status === 401) {
            // if(error.message)
            this._tostr.error(`${error.error.message}`, 'Error');
          } else {
            this._tostr.error('Some error occured', 'Error');
          }
          // this._tostr.error('Invalid credentials', 'Error');
          return of(error)
        })
      )
  }

  private doLoginAdmin(username: string, response: TokenResponse) {
    this.loggedAdmin = username;
    // this.getToken.pipe(
    //   tap((res) => {
    //     console.log('heeeeee-----------------------------------------------------ee');
    //     console.log(res);
    //   })
    // ).subscribe();

    console.log('helo');

    this.storeJwtToken(response.token);
    this.startWatching()

    this.isAuthenticated.next(true);
    this.isIdle.next(false)
  }

  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
    localStorage.setItem('notificationCount', '1');
    sessionStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private checkTokenValidity() {
    const token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      this.isAuthenticated.next(true);
    }
  }

  logout() {
    this.router.navigate(['login']);
    localStorage.clear();
    // localStorage.removeItem(this.JWT_TOKEN);

    this.isAuthenticated.next(false);
    this.stopWatching();
    this.isIdle.next(true);
    this._tostr.info('Logged Out', 'Info');
  }

  stopWatching() {
    this.bnIdle.stopTimer();
  }




}
