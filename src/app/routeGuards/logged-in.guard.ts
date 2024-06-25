import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { catchError, of, tap } from 'rxjs';
import { __values } from 'tslib';
import { ToastrService } from 'ngx-toastr';

export const loggedInGuard: CanActivateFn = (route, state) => {
  // let authService = inject(AuthServiceService);
  let _router = inject(Router);
  let _authService = inject(AuthServiceService);
  let _tostr = inject(ToastrService)

  let serviceToken
  // = _authService.fetchtoken;
  // console.log(serviceToken);

  _authService.fetchtoken().pipe(
    tap((res: string | null) => {
      serviceToken = res
    }),
    catchError(err => {
      _tostr.error(`cannot get the token`, 'error');
      return of(err)
    })
  ).subscribe()
  // console.log(serviceToken);
  


  // Assuming _authService is an instance of YourClass
  // _authService.getToken.pipe(
  //   tap((res) => {
  //     console.log('heeeeee-----------------------------------------------------ee');
  //     console.log(res);
  //   })
  // ).subscribe();



  let token = localStorage.getItem('JWT_TOKEN');
  // console.log(token);
  // if (!token || !(token === serviceToken)) {
  if (!token) {

    console.log(`token in ls ${token}  and tooken in service ${serviceToken}`);

    // alert('please login first , redirecting to the login page ')
    _router.navigate(['login']);
    return false
  }

  return true;
};
