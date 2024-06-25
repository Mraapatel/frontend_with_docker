import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Pricing } from '../models/models.interface';

@Injectable({
  providedIn: 'root'
})
export class PricingserviceService {

  private _http = inject(HttpClient);

  storePricing(data:object){
    return this._http.post<Pricing>('http://localhost:5000/pricing/add',data)
  }
  constructor() { }

  getAllPricing(){
    return this._http.get<Pricing[]>('http://localhost:5000/pricing/fetch')
  }

  updatePrice(Price:object){
    return this._http.post<Pricing>('http://localhost:5000/pricing/update',Price)
  }


}
