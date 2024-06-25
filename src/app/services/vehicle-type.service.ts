import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {
  backendUrl = environment.BACKEND_URL
  private http = inject(HttpClient);

  addVechicleType(vechicleObj: FormData) {
    return this.http.post(`${this.backendUrl}vehicleType`, vechicleObj).pipe(
      tap(_ => {
        console.log('req send');
      })
    )
  }

  getAllVehicles(data:string) {
    return this.http.post(`${this.backendUrl}vehicleType/getTypes`,{countryId:data}).pipe(
      tap(data => {
        if (data)
          console.log("got data form the server");
      })
    );
  }

  getAllServices(countryid:string , cityid:string) {
    return this.http.post(`${this.backendUrl}vehicleType/allServices`,{countryId:countryid , cityId:cityid}).pipe(
      tap(data => {
        if (data)
          console.log("got data form the server");
      })
    );
  }

  // getAllVehiclesForPricing(typeId:string) {
  //   return this.http.post(`${this.backendUrl}vehicleType`,{typeId:typeId}).pipe(
  //     tap(data => {
  //       if (data)
  //         console.log("got data form the server");
  //     })
  //   );
  // }

  editVehicleType(vechicleObj: FormData) {
    // console.log(vechicleObj);
    return this.http.post(`${this.backendUrl}vehicleType/edit`, vechicleObj).pipe(
      tap(data => {
        console.log('edited');
      })
    )
  }
}
