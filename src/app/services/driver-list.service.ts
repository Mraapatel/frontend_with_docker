import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DriverData,  City } from '../models/models.interface';
import { environment } from '../../environments/environment.development';

interface DriverDataResponse {
  totalDrivers: number;
  Drivers: DriverData[];
}

interface ServiceAddedResponse {
  Driver: DriverData;
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverListService {

  backendUrl:string = environment.BACKEND_URL
  private _http = inject(HttpClient);

  storeDriver(data: FormData) {
    console.log(data);
    return this._http.post<DriverData>(`${this.backendUrl}driver/addDriver`, data)
  }

  getExistingDrivers(data: object) {
    console.log(data);

    return this._http.post<DriverDataResponse>(`${this.backendUrl}driver/getDrivers`, data);
    // console.log(`In sevice ${pageNumber}`);

  }

  updateDriver(data: FormData) {
    return this._http.post<DriverData>(`${this.backendUrl}driver/updateDriver`, data)
  }

  deleteDriver(id: string) {
    return this._http.post<DriverData>(`${this.backendUrl}driver/deleteDriver`, { id: id })
  }

  addService(data: object) {
    return this._http.post<ServiceAddedResponse>(`${this.backendUrl}driver/addService`, data)
  }

  approveOrDecline(data: object) {
    return this._http.post<ServiceAddedResponse>(`${this.backendUrl}driver/approve`, data)
  }

  getCitiesFormCID(data: string) {
    return this._http.post<City[]>(`${this.backendUrl}driver/getCities`, { countryId: data });
  }


  storeBankDetails(formdata: object) {
    return this._http.post(`${this.backendUrl}driver/storeBankDetails`, formdata)
  }

  // setDefaultCard(data:object){
  //   return this._http.post(`${this.backendUrl}User/setDefaultCard`,data);
  // }

  // deleteCard(data: object) {
  //   return this._http.post(`${this.backendUrl}User/deleteCard`, data);
  // }
}
