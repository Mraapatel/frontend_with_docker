import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DriverData, Card, City } from '../models/models.interface';

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


  private _http = inject(HttpClient);

  storeDriver(data: FormData) {
    console.log(data);
    return this._http.post<DriverData>('http://localhost:5000/driver/addDriver', data)
  }

  getExistingDrivers(data: object) {
    console.log(data);

    return this._http.post<DriverDataResponse>(`http://localhost:5000/driver/getDrivers`, data);
    // console.log(`In sevice ${pageNumber}`);

  }

  updateDriver(data: FormData) {
    return this._http.post<DriverData>('http://localhost:5000/driver/updateDriver', data)
  }

  deleteDriver(id: string) {
    return this._http.post<DriverData>('http://localhost:5000/driver/deleteDriver', { id: id })
  }

  addService(data: object) {
    return this._http.post<ServiceAddedResponse>('http://localhost:5000/driver/addService', data)
  }

  approveOrDecline(data: object) {
    return this._http.post<ServiceAddedResponse>('http://localhost:5000/driver/approve', data)
  }

  getCitiesFormCID(data: string) {
    return this._http.post<City[]>('http://localhost:5000/driver/getCities', { countryId: data });
  }



  storeBankDetails(formdata: object) {
    return this._http.post('http://localhost:5000/driver/storeBankDetails', formdata)
  }

  // setDefaultCard(data:object){
  //   return this._http.post('http://localhost:5000/User/setDefaultCard',data);
  // }

  // deleteCard(data: object) {
  //   return this._http.post('http://localhost:5000/User/deleteCard', data);
  // }
}
