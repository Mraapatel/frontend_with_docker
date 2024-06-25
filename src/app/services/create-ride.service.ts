import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CountryForRide ,CitiesForCreateRide ,cityPricingforTypesResponse} from '../models/models.interface';

@Injectable({
  providedIn: 'root'
})
export class CreateRideService {

  private _http = inject(HttpClient);

  url = 'http://localhost:5000/pricing/fetchCountries';
  constructor() { }

  getCountryCodes() {
    return this._http.post<CountryForRide[]>(this.url, {})
  }

  getCities(data:string) {
    return this._http.post<CitiesForCreateRide>(`http://localhost:5000/pricing/getCity`, {countryId:data})
  }

  getCityPricing(cityId:string) {
    return this._http.post<cityPricingforTypesResponse>(`http://localhost:5000/pricing/getCityPricig`, {cityId:cityId})
  }

  storeRide(rideDetails:object){
    return this._http.post('http://localhost:5000/createRide/storeRide' ,rideDetails)
  }

  checkForStartingPoint(latLng:object){
    return this._http.post('http://localhost:5000/createRide/checkForStartingPoint' ,latLng)
  }


}
