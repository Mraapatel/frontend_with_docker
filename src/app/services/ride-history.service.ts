import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Ride } from '../models/models.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RideHistoryService {

  private _http = inject(HttpClient);
  private url = `${environment.BACKEND_URL}rideHistory`;


  fetchRides(data:object) {
    return this._http.post<{ message: string, rides: Ride[] }>(`${this.url}/getRidesInHistory`, data)
  }
  
  storeFeedback(data:object){
    return this._http.post(`${this.url}/storeFeedback`, data)
  }

}
