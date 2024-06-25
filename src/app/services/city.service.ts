import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor() { }
  private _http = inject(HttpClient);

  saveZone(data:object) {
      return this._http.post('http://localhost:5000/city/addZone', data)
  }

  getCities(countryId:string){
    return this._http.post('http://localhost:5000/city/cities',{countryId : countryId})
  }

   saveChangedZone(data:object){
     return this._http.post('http://localhost:5000/city/saveChangedZone',data)
   }
}
