import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AddCountryService {

  backendUrl!: string
  constructor() {
    this.backendUrl = environment.BACKEND_URL
  }

  private _http = inject(HttpClient);

  getCountry() {
    return this._http.get(`${this.backendUrl}country`).pipe(
      tap((_) => console.log('data fatched form server')
      )
    )
  }

  addCountry(formdata: object) {
    console.log('in service');
    console.log(formdata);
    return this._http.post(`${this.backendUrl}country`, formdata).pipe(
      tap((_) => {
        console.log('country added');
      })
    )
  }

  serchCountries(value: string) {
    return this._http.post(`${this.backendUrl}country/searchCountry`, { search: value }).pipe(
      tap((_) => {
        console.log('got countries');
      })
    )
  }
}
