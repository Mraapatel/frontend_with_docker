import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { SettingService } from '../../services/setting.service';


interface settingInterface {
  Stops: number,
  TimeOut: number,
  _id: string
}
interface KeyValues {
  secreateKey?: string;
  publicKey?: string;
  sid?: string;
  authToken?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

interface ObjectType {
  objectType: string;
  keyValues: KeyValues;
}

interface keyData {
  message: string;
  status: number;
  data: ObjectType[];
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent {

  private _fb = inject(FormBuilder);
  private _http = inject(HttpClient);
  private _toastr = inject(ToastrService);
  private _settingService = inject(SettingService);

  private _id!: string | undefined;
  private TimeOut!: number;
  private Stops!: number;
  Setting!: any;
  Stripe!: FormGroup;
  Twilio!: FormGroup;
  Email!: FormGroup;

  cuttentSetting!: settingInterface

  ngOnInit() {
    this.Setting = this._fb.group({
      timeOut: [this.TimeOut, Validators.required],
      stops: [this.Stops, Validators.required]
    });

    this.Stripe = this._fb.group({
      secreateKey: ['', [Validators.required, Validators.maxLength(107), Validators.minLength(107)]],
      publicKey: ['', [Validators.required, Validators.maxLength(107), Validators.minLength(107)]]
    })

    this.Twilio = this._fb.group({
      sid: ['', [Validators.required, Validators.maxLength(34), Validators.minLength(34)]],
      authToken: ['', [Validators.required, Validators.maxLength(32), Validators.minLength(32)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]]
    })

    this.Email = this._fb.group({
      email: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(50)]],
    })

    this.pageLoad();
    this.getAllKeys()

  }

  pageLoad() {
    let data = {
      id: 'getId'
    }
    this._http.post<settingInterface>('http://localhost:5000/setting', data).subscribe((res) => {
      console.log(res);
      if (res) {
        this.cuttentSetting = res;
        console.log(this.cuttentSetting);
        this.Setting.get('timeOut').setValue(res.TimeOut);
        this.Setting.get('stops').setValue(res.Stops);
      }

      if (res && res._id) {
        let a = res as settingInterface
        this._id = a._id;
        this.TimeOut = a.TimeOut;
        this.Stops = a.Stops
      } else {
        this._id = undefined;
        console.log(this._id);
      }
    })
  }

  storeDetails(type: string) {
    let details: any
    if (type === 'stripe') {
      if (!this.Stripe.get('secreateKey')?.value || !this.Stripe.get('publicKey')?.value || this.Stripe.invalid) {
        this._toastr.warning('Please fill the details/valid first', 'warning');
        return;
      }
      details = {
        objectType: "stripe",
        values: {
          secreateKey: this.Stripe.get('secreateKey')?.value,
          publicKey: this.Stripe.get('publicKey')?.value,
        }
      }

    } else if (type === 'twilio') {
      if (!this.Twilio.get('phoneNumber')?.value || !this.Twilio.get('authToken')?.value || !this.Twilio.get('sid')?.value || this.Twilio.invalid) {
        this._toastr.warning('Please fill the details/valid first bro', 'warning');
        return;
      }

      if (!this.validatePhone(this.Twilio.get('phoneNumber')?.value)) {
        return;
      }

      details = {
        objectType: "twilio",
        values: {
          sid: this.Twilio.get('sid')?.value,
          authToken: this.Twilio.get('authToken')?.value,
          phoneNumber: this.Twilio.get('phoneNumber')?.value,
        }
      }

    } else if (type === 'email') {
      if (!this.Email.get('email')?.value || !this.Email.get('password')?.value) {
        this._toastr.warning('Please fill the details first', 'warning');
        return;
      }

      if (!this.validateEmail(this.Email.get('email')?.value)) {
        return
      }
      console.log('broooooo');
      details = {
        objectType: "email",
        values: {
          email: this.Email.get('email')?.value,
          password: this.Email.get('password')?.value,
        }
      }
    }
    this._settingService.storeKeys(details).pipe(
      catchError((e) => {
        this._toastr.error(e, 'error');
        return of(e)
      })
    ).subscribe({
      next: (res) => {
        if (res.status == 200) {
          this._toastr.success('Data Stored successfully', 'success');
        }
      }
    });
  }

  storeSetting() {

    if (!this.Setting.get('stops')?.value || !this.Setting.get('timeOut')?.value) {
      this._toastr.warning('Please select the settings first', 'warning');
      return;
    }
    if (this.cuttentSetting) {
      if (this.cuttentSetting.Stops == this.Setting.get('stops')?.value && this.cuttentSetting.TimeOut == this.Setting.get('timeOut')?.value) {
        this._toastr.info('No chages Detected', 'Info');
        return;
      }
    }
    console.log(this.Setting.value);
    console.log(this.Setting.get('timeOut')?.value);
    let data = {
      _id: this._id,
      timeOut: this.Setting.get('timeOut')?.value,
      stops: this.Setting.get('stops')?.value
    }
    this._http.post<settingInterface>('http://localhost:5000/setting', data).pipe(
      tap((res) => {
        this._id = res._id;
        this._toastr.success('Setting updated successfully', 'Success');
        console.log(res);
        if (res) {
          this.Setting.get('timeOut').setValue(res.TimeOut);
          this.Setting.get('stops').setValue(res.Stops);
          if (this.cuttentSetting) {
            console.log('inside here--->');

            this.cuttentSetting.TimeOut = res.TimeOut;
            this.cuttentSetting.Stops = res.Stops;
          }
        }
      })).subscribe()
  }


  getAllKeys() {

    this._settingService.getAllKeys().pipe(
      catchError((e) => {
        this._toastr.error(e, 'error');
        return of(e)
      })
    ).subscribe({
      next: (res: keyData) => {
        if (res.status == 200) {
          this._toastr.success('Data fetched successfully', 'success');
          console.log('get all keys', res);
          res.data.forEach((d) => {
            if (d.objectType === 'email') {
              this.Email.patchValue({
                email: d.keyValues.email,
                password: d.keyValues.password
              })
            } else if (d.objectType === 'twilio') {
              this.Twilio.patchValue({
                sid: d.keyValues.sid,
                phoneNumber: d.keyValues.phoneNumber,
                authToken: d.keyValues.authToken
              })
            } else if (d.objectType === 'stripe') {
              this.Stripe.patchValue({
                publicKey: d.keyValues.publicKey,
                secreateKey: d.keyValues.secreateKey
              })
            }
          })
        }
      }
    });
  }

  get timeOut() {
    return this.Setting.get('timeOut')
  }
  get stops() {
    return this.Setting.get('stops')
  }


  validateEmail(email: string): boolean {
    console.log('inside the validateemail', email);

    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,}$/;
    const userEmailValue = email;
    console.log('email invalid', this.Email.invalid);

    if (!emailRegex.test(userEmailValue)) {
      this._toastr.error('Invalid email address', 'Error');
      return false
    }
    return true
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[1-9]\d{9}$/;
    const phoneValue = phone;
    if (!phoneRegex.test(phoneValue)) {
      this._toastr.error('Invalid phone number', 'Error');
      return false;
    }
    return true
  }

}
