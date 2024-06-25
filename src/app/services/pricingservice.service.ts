import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Pricing } from '../models/models.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PricingserviceService {

  private _http = inject(HttpClient);
  backendUrl = environment.BACKEND_URL

  storePricing(data:object){
    return this._http.post<Pricing>(`${this.backendUrl}pricing/add`,data)
  }
  constructor() { }

  getAllPricing(){
    return this._http.get<Pricing[]>(`${this.backendUrl}pricing/fetch`)
  }

  updatePrice(Price:object){
    return this._http.post<Pricing>(`${this.backendUrl}pricing/update`,Price)
  }


}
