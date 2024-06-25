import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap, throwError } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';
import { loaderService } from '../services/loader';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const JWT_TOKEN = getJwtToken();
  const _tostr = inject(ToastrService);
  let _spinnerService = inject(SpinnerService);
  // let _loaderService = inject(loaderService)
  let _router  = inject(Router)

  _spinnerService.startSPinner();
  // console.log('inside the interceptor');
  // console.log(JWT_TOKEN);
  
  if (req.url.includes('/authenticate')) {
    console.error('Inside the uthenticate');
    return next(req);
  }

  if (JWT_TOKEN) {
    // _loaderService.startSPinner()
    // console.log('inside the if condition ');
    let tokenReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${JWT_TOKEN}`
      }
    })
    // _loaderService.startSPinner();
    return next(tokenReq)
      .pipe(
        tap((res) => {
          if (res instanceof HttpResponse) {
            // console.log("response got");
            _spinnerService.stopSpinner();
          }

        }), catchError((error) => {
          console.log('error hai bro1', error);
          if (error.status === 403) {

            if (error.status === 403 && error.error.message === 'Token has expired' || 'Invalid token') {
              _tostr.error(`${error.error.message}`, 'Error');
              _tostr.info(`Please login again`, 'info');
              _router.navigate(['login']);
              return of(error)
            }
          }
          if (error.status === 400) {
            console.log('error hai bro2', error);
            if (error.error.Message === 'No users found') {
              _tostr.error(`${error.error.Message}`, 'Error');
            } else if (error.error.Message === 'There are no Drivers') {
              _tostr.error(`${error.error.Message}`, 'Error');
            }
          }
          _spinnerService.stopSpinner();
          return throwError(error)
        })
      );
  }
  return next(req);
};

function getJwtToken(): string | null {
  return localStorage.getItem('JWT_TOKEN');
}