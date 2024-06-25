import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  
  backendUrl:string = environment.BACKEND_URL
  constructor() {   }

  private _http = inject(HttpClient);

  saveZone(data:object) {
      return this._http.post(`${this.backendUrl}city/addZone`, data)
  }

  getCities(countryId:string){
    return this._http.post(`${this.backendUrl}city/cities`,{countryId : countryId})
  }

   saveChangedZone(data:object){
     return this._http.post(`${this.backendUrl}city/saveChangedZone`,data)
   }
}
