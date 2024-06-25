import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CountryForRide ,CitiesForCreateRide ,cityPricingforTypesResponse} from '../models/models.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CreateRideService {

  private _http = inject(HttpClient);

  url = `${environment.BACKEND_URL}pricing/fetchCountries`;
  constructor() { }

  getCountryCodes() {
    return this._http.post<CountryForRide[]>(this.url, {})
  }

  getCities(data:string) {
    return this._http.post<CitiesForCreateRide>(`${environment.BACKEND_URL}pricing/getCity`, {countryId:data})
  }

  getCityPricing(cityId:string) {
    return this._http.post<cityPricingforTypesResponse>(`${environment.BACKEND_URL}pricing/getCityPricig`, {cityId:cityId})
  }

  storeRide(rideDetails:object){
    return this._http.post(`${environment.BACKEND_URL}createRide/storeRide` ,rideDetails)
  }

  checkForStartingPoint(latLng:object){
    return this._http.post(`${environment.BACKEND_URL}createRide/checkForStartingPoint` ,latLng)
  }


}
