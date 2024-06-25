import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Ride, VehicleType } from '../models/models.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfirmRideService {

  url = 'http://localhost:5000/confirmRide';
  url2 = 'http://localhost:5000/runningRequest';


  private _http = inject(HttpClient);
  constructor() { }

  getRides(data: object) {
    return this._http.post<{ totalRides: number, Rides: Ride[] }>(`${this.url}/getRides`, data)
  }

  getVehicleTypes() {
    return this._http.post<{ message: string, TypesArray: VehicleType[] }>(`${this.url}/getVehicleTypes`, {})
  }

  getDriverForAssignRide(data: object) {
    return this._http.post<{ message: string, TypesArray: VehicleType[] }>(`${this.url}/getDriverForAssignRide`, data)
  }

  assignDriverToRide(data: object) {
    return this._http.post<{ message: string, TypesArray: VehicleType[] }>(`${this.url2}/assingDriverToRide`, data)
  }

  assignNearestDriver(rideId: string) {
    return this._http.post<{ message: string, TypesArray: VehicleType[] }>(`${this.url}/assignNearestDriver`, { rideId: rideId })
  }

  cancleRide(data:object) {
    return this._http.post<{ message: string, rideStatus: number, rideId: string }>(`${this.url}/cancleRide`, data)
  }

  rideStarted(rideId: string, driverId: string) {
    return this._http.post<{ message: string, rideStatus: number, rideId: string }>(`${this.url}/rideStarted`, { rideId: rideId, driverId: driverId })
  }

  rideArrived(rideId: string, driverId: string) {
    return this._http.post<{ message: string, rideStatus: number, rideId: string }>(`${this.url}/rideArrived`, { rideId: rideId, driverId: driverId })
  }

  ridePicked(rideId: string, driverId: string) {
    return this._http.post<{ message: string, rideStatus: number, rideId: string }>(`${this.url}/ridePicked`, { rideId: rideId, driverId: driverId })
  }

  rideCompleted(rideId: string, driverId: string) {
    return this._http.post<{ message: string, rideStatus: number, rideId: string }>(`${this.url}/rideCompleted`, { rideId: rideId, driverId: driverId })
  }
}
