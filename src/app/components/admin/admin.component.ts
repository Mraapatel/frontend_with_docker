import { Component, inject } from '@angular/core';
import { AuthServiceService } from '../../services/auth-service.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  constructor(
    private _authservice: AuthServiceService,
    private _fb: FormBuilder,
    private _tostr: ToastrService
  ) { }

  // private authService = inject(AuthServiceService);
  private route = inject(Router)

  private isIdle!: boolean

  ngOnInit() {
    this.isIdle = this._authservice.IdleState
    console.log(this.isIdle);
  }

  adminDetails = this._fb.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]]
  });

  get getsUername() {
    return this.adminDetails.get('username')
  }
  get getPassword() {
    return this.adminDetails.get('password')
  }

  loginUser() {
    if (this.adminDetails.valid) {

      this._authservice.login({
        username: this.adminDetails.get('username')?.value as string,
        password: this.adminDetails.get('password')?.value as string
      }).pipe(
        tap(res => {
          if (!res.error) {
            this.adminDetails.reset()
            this._tostr.success('Logged in successfully', 'Success')
            // alert('logged In ');
            console.log('logged ');
            console.log(this._authservice.IdleState);
            this.route.navigate(['home/user'])
          }
          console.log(res);
        }),
        catchError((err) => {
          this._tostr.error('invalid credentials', 'error')
          return of(err)
        })
      ).subscribe()
    } else {
      this._tostr.warning('Please enter your credentials', 'Warning');
      return;
    }
  }

  ngOnDestroy() {

  }

}
