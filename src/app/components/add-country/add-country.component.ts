import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AddCountryService } from '../../services/add-country.service';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap, throwError } from 'rxjs';

interface Country {
  _id: string;
  country: string;
  countryCallingCode: string;
  countryCode: string;
  currency: string;
  flagSymbol: string;
  timeZone: string;
  // __v: number;
}

@Component({
  selector: 'app-add-country',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-country.component.html',
  styleUrl: './add-country.component.css'
})
export class AddCountryComponent {

  _toaster = inject(ToastrService)
  _fb = inject(FormBuilder);
  _http = inject(HttpClient);
  _addCountry = inject(AddCountryService);

  Countries: any[] = [];
  serchedCountries: any[] = [];
  serched: boolean = false;
  timeZone!: string;
  flagSymbol!: string;
  serchInput!: string;
  countryCode2!: string;
  checkCountry!: string
  checkCurrency!: string
  checkCountryCallingCode!: string
  checkCountryCode!: string
  regEx = /^[a-zA-Z0-9\s]*$/


  ngOnInit() {
    this._addCountry.getCountry().subscribe((response) => {
      this.Countries = response as Country[]
      console.log(this.Countries);
    })
  }

  Country = this._fb.group({
    country: ['', Validators.required],
    currency: [{ value: '', disabled: true }],
    countryCode: [{ value: '', disabled: true }],
    countryCallingCode: [{ value: '', disabled: true }]
  })


  serchCountry() {
    if (this.Country.valid) {
      console.log('serchmehro');
      const countryName = this.Country.get('country')!.value;
      this._http.get(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`).pipe(
        tap((res) => {
          this.Country.get('country')?.disable();
        }),
        catchError((error) => {
          console.error('An error occurred:', error);
          this._toaster.warning('Please Try specifying full name', 'Warning');
          this.Country.reset();
          return throwError('Please Try specifying full name'); // Return a new observable or throw an error
        })
      ).subscribe((response: any) => {

        console.log(response); //Handle the response here
        let currency = Object.keys(response[0].currencies)[0];
        let country = response[0].name.common;
        let countryCode = response[0].cca3
        let countryCallingCode;
        let first = response[0].idd.root;
        if (response[0].idd.suffixes.length == 1) {
          let suffixe = response[0].idd.suffixes[0];
          countryCallingCode = `${first}${suffixe}`;
        } else {
          countryCallingCode = `${first}`;
        }

        this.timeZone = response[0].timezones[0];
        this.flagSymbol = response[0].flags.png as string;
        this.countryCode2 = response[0].cca2;
        // console.log('++++++++++++++++++++++++++++');
        // console.log(response[0].cca2);

        // console.log(this.timeZone);
        // console.log(this.flagSymbol);
        this.checkCountry = country
        this.checkCurrency = currency
        this.checkCountryCallingCode = countryCallingCode
        this.checkCountryCode = countryCode;

        this.Country.patchValue({
          country: country,
          currency: currency,
          countryCallingCode: countryCallingCode,
          countryCode: countryCode
        })
      });
    } else {
      if (this.checkCountry) {
        this._toaster.warning('Please change Country after submitting', 'Warning');
        return;
      }
      this._toaster.warning('Please enter Some value first', 'Warning');
      return;
    }
  }

  clearSerchBar() {
    this.Country.get('country')?.setValue('');
    this.Country.get('country')?.enable();
    this.checkCountry = '';
    this.Country.reset();
  }

  dissableFields() {
    Object.keys(this.Country.controls).forEach(controlName => {
      const control = this.Country.get(controlName);
      control?.disable(); // Disable each control
    });
  }

  addCountry() {
    let isexecute = false;
    let currency = this.Country.get('currency')!.value;
    let country = this.Country.get('country')!.value;
    let countryCode = this.Country.get('countryCode')!.value;
    let countryCallingCode = this.Country.get('countryCallingCode')!.value;

    if (
      this.checkCountry === country && this.checkCurrency === currency
      && this.checkCountryCallingCode === countryCallingCode &&
      this.checkCountryCode === countryCode
    ) {

      this.Countries.forEach((Country) => {
        if (Country.country === country) {
          console.log('condition true-----------------------------');
          this._toaster.warning('The Enterd Country Exist already', 'Warning');
          this.clearSerchBar()
          isexecute = true;
        }
      });
      if (isexecute) {
        this.Country.reset();
        return;
      }

      let data = {
        currency: currency,
        country: country,
        countryCode: countryCode,
        countryCallingCode: countryCallingCode,
        timeZone: this.timeZone,
        flagSymbol: this.flagSymbol,
        countryCode2: this.countryCode2,
      }

      console.log('iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
      console.log(this.countryCode2);
      this.addCountryToServer(data);

    } else {
      this._toaster.warning("Please don't modify the suggested entries", "Warning");
      this.Country.patchValue({
        country: this.checkCountry,
        currency: this.checkCurrency,
        countryCallingCode: this.checkCountryCallingCode,
        countryCode: this.checkCountryCode
      });
      this.dissableFields()
      return;
    }
    // });
  }

  addCountryToServer(data: any) {
    console.log('data going to be stored', data);

    this._addCountry.addCountry(data).subscribe((data) => {
      this.Countries.push(data)
      this.Country.reset();
      this.serched = false
      this._toaster.success('Country added successfully ', 'Sucess');
    })
  }

  serch(value: string) {
    if (value.trim() == '') {
      this._toaster.info('showing main table', 'info');
      this._toaster.error('Please enter some value', 'error');
      this.serched = false;
      return;
    }
    if (!this.regEx.test(value)) {
      this._toaster.warning('Only alphanumeric characters and spaces are allowed', 'warning');
      return;
    }


    this._addCountry.serchCountries(value.trim()).subscribe((response) => {
      this.serchedCountries = response as Country[]
      if (this.serchedCountries.length < -1 || this.serchedCountries.length == 0) {
        this.serched = false;
        this._toaster.warning('No such matching data found', 'Warning');
        return;
      }
      this.serched = true;
      console.log(this.serchedCountries);
    })

  }


}
