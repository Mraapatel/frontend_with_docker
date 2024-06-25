import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {

  constructor() { }
  private http = inject(HttpClient);
  private _toastr = inject(ToastrService)

  addVechicleType(vechicleObj: FormData) {
    return this.http.post('http://localhost:5000/vehicleType', vechicleObj).pipe(
      tap(_ => {
        console.log('req send');
      })
    )
  }

  getAllVehicles(data:string) {
    return this.http.post('http://localhost:5000/vehicleType/getTypes',{countryId:data}).pipe(
      tap(data => {
        if (data)
          console.log("got data form the server");
      })
    );
  }

  getAllServices(countryid:string , cityid:string) {
    return this.http.post('http://localhost:5000/vehicleType/allServices',{countryId:countryid , cityId:cityid}).pipe(
      tap(data => {
        if (data)
          console.log("got data form the server");
      })
    );
  }

  // getAllVehiclesForPricing(typeId:string) {
  //   return this.http.post('http://localhost:5000/vehicleType',{typeId:typeId}).pipe(
  //     tap(data => {
  //       if (data)
  //         console.log("got data form the server");
  //     })
  //   );
  // }

  editVehicleType(vechicleObj: FormData) {
    // console.log(vechicleObj);
    return this.http.post('http://localhost:5000/vehicleType/edit', vechicleObj).pipe(
      tap(data => {
        console.log('edited');
      })
    )
  }
}
