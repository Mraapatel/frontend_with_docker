import { Component, inject } from '@angular/core';
import { BrowserNotificationService } from '../../services/browser-notification.service';
import { RideHistoryService } from '../../services/ride-history.service';
import { catchError, of, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Ride, VehicleType } from '../../models/models.interface';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmRideService } from '../../services/confirm-ride.service';
import { environment } from '../../../environments/environment.development';
import { Loader } from '@googlemaps/js-api-loader';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-ride-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatButtonModule, MatDatepickerModule,
    MatFormFieldModule, MatInputModule, MatNativeDateModule,
  ],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.css'
})
export class RideHistoryComponent {
  private _browserNotification = inject(BrowserNotificationService);
  private _rideHistory = inject(RideHistoryService);
  private _toster = inject(ToastrService);
  private _fb = inject(FormBuilder);
  private _confirmRideService = inject(ConfirmRideService)

  RidesFetched: Ride[] = [];
  rideHistory!: FormGroup;
  feedback!: FormGroup;
  fetchedVehicleTypes: Array<VehicleType> = [];
  selectedRide!: Ride
  API_KEY = environment.API_KEY;
  map!: google.maps.Map;
  geocoder!: google.maps.Geocoder;
  rideRoute!: google.maps.Polyline;
  markers: google.maps.Marker[] = []


  ngOnInit() {

    this.rideHistory = this._fb.group({
      searchTerm: [''],
      rideStatus: ['All Rides'],
      vechicleType: [''],
      // date: [''],
      fromdate: [''],
      todate: [''],

    });

    this.feedback = this._fb.group({
      rating: [Number],
      message: [''],
    });
    this._browserNotification.requestPermission();
    const fromdateValue = this.rideHistory.get('fromdate')?.value;
    const todateValue = this.rideHistory.get('todate')?.value;

    const formattedFromDate = fromdateValue ? this.formatDate(fromdateValue) : null;
    const formattedToDate = todateValue ? this.formatDate(todateValue) : null;
    let details = {
      // limit: this.limit,
      // page: this.pageNumber,
      // sort: 'none',
      // date: this.rideHistory.get('date')?.value,
      fromdate: formattedFromDate,
      todate: formattedToDate,
      rideStatus: null,
      searchTerm: '',
      vechicleType: this.rideHistory.get('vechicleType')?.value
    }
    this.fetchRides(details);
    this.fetcheTypes();
    this.loadDefaultMap();

  }

  loadDefaultMap() {
    const loader = new Loader({
      apiKey: this.API_KEY,
      libraries: ['places', 'drawing']
    });

    loader.load().then(() => {
      const mapEle = document.getElementById('map');
      if (mapEle) {
        // Load default map without marker
        this.map = new google.maps.Map(mapEle, {
          center: { lat: 25.4484, lng: 78.5685 },
          zoom: 6,
        });
        // this.initAutocomplete()
        this.geocoder = new google.maps.Geocoder();
      }
    }).catch(err => {
      console.error('Error loading Google Maps API:', err);
    });
  }

  fetchRides(details: object) {
    this._rideHistory.fetchRides(details).pipe(
      catchError((e) => {
        console.log('res', e.error.message);
        if (e.status === 404 && e.error.message === 'Currently No rides are available') {
          this._toster.error('No History found', 'Error');
          this.RidesFetched = []
        }
        return throwError(e)
      }),
      tap((res) => {
        console.log('res tap', res);
        if (res.message === 'Rides Fetched Successfully') {
          this._toster.success('Rides Fetched successfully')
          this.RidesFetched = res.rides
        }

      })
    ).subscribe()
  }

  selectedDateRange() {
    if (this.rideHistory.get('fromdate')?.value == '', this.rideHistory.get('todate')?.value == '') {
      this._toster.error('Please Select both dates');
      return
    }
    this.searchRides(this.rideHistory.get('searchTerm')?.value);
  }

  searchRides(val: string) {

    const fromdateValue = this.rideHistory.get('fromdate')?.value;
    const todateValue = this.rideHistory.get('todate')?.value;

    const formattedFromDate = fromdateValue ? this.formatDate(fromdateValue) : null;
    const formattedToDate = todateValue ? this.formatDate(todateValue) : null;
    let details = {
      // limit: this.limit,
      // page: this.pageNumber,
      // sort: 'none',
      // date: this.rideHistory.get('date')?.value,
      fromdate: formattedFromDate,
      todate: formattedToDate,
      rideStatus: parseInt(this.rideHistory.get('rideStatus')?.value),
      searchTerm: val,
      vechicleType: this.rideHistory.get('vechicleType')?.value
    }
    this.fetchRides(details);

  }
  ClearFilter() {
    console.log('dkjakljf', this.rideHistory.get('vechicleType')?.value);

    let formValues = this.rideHistory.value
    if (!Object.values(formValues).some(value => value !== '' || null)) {
      this._toster.info('There is nothing to clear', 'Info');
      return;
    }
    this.rideHistory.reset();
    // if (!Object.values(formValues).some(value => value !== '')) {
    //   this._toster.info('There is nothing to clear', 'Info');
    //   return;
    // }
    const fromdateValue = this.rideHistory.get('fromdate')?.value;
    const todateValue = this.rideHistory.get('todate')?.value;

    const formattedFromDate = fromdateValue ? this.formatDate(fromdateValue) : null;
    const formattedToDate = todateValue ? this.formatDate(todateValue) : null;
    let details = {
      // date: this.rideHistory.get('date')?.value,
      fromdate: formattedFromDate,
      todate: formattedToDate,
      rideStatus: parseInt(this.rideHistory.get('rideStatus')?.value),
      searchTerm: this.rideHistory.get('searchTerm')?.value,
      vechicleType: this.rideHistory.get('vechicleType')?.value
    }
    this.fetchRides(details)
  }

  fetcheTypes() {
    this._confirmRideService.getVehicleTypes().pipe(
      catchError((error) => {
        this._toster.error('Error while fetching the vehicle types', 'Error');
        return of(error)
      })
    ).subscribe({
      next: (res) => {
        this.fetchedVehicleTypes = res.TypesArray;
        console.log(this.fetchedVehicleTypes);
      }
    })
  }

  storeFeedback(rideId: string) {
    let rating = this.feedback.get('rating')?.value;
    let message = this.feedback.get('message')?.value;
    console.log('rideid in the storefeedback', rideId);
    if ((!rating || isNaN(rating)) && !message) {
      this._toster.error('Please fill any of the fields first');
      return;
    }

    let data = {
      id: rideId,
      rating: this.feedback.get('rating')?.value,
      message: this.feedback.get('message')?.value
    }
    this._rideHistory.storeFeedback(data).pipe(
      catchError((e) => {
        this._toster.error(`Error Occured ${e}`, 'Error');
        return of(e)
      }), tap((res: { message: string, status: number }) => {
        if (res.status === 200) {
          this._toster.success(res.message, 'success');
          let index = this.RidesFetched.findIndex((r) => r._id === this.selectedRide._id);
          console.log('index', index);

          console.log('inside storeFeedback ---->', this.feedback.get('message')?.value);
          console.log('inside storeFeedback ---->', this.feedback.get('rating')?.value);

          // this.RidesFetched[index].feedback.message = this.feedback.get('message')?.value;
          // this.RidesFetched[index].feedback.rating = this.feedback.get('rating')?.value;
          this.RidesFetched[index].feedback = { rating: this.feedback.get('rating')?.value, message: this.feedback.get('message')?.value }
          this.feedback.reset();
        } else {
          this._toster.error(res.message, 'error');
        }
      })
    ).subscribe()
  }

  FeedbackBtnClicked(ride: Ride) {
    this.feedback.reset()
    this.selectedRide = ride
    console.log('selectedride', this.selectedRide);
    if (this.selectedRide.feedback !== null) {
      console.log('inside the this.selectedRide.feedback condtion');

      this.feedback.patchValue({
        rating: this.selectedRide.feedback.rating,
        message: this.selectedRide.feedback.message
      })
      // this.feedback.disable()
    }
    // this.rideInfo(ride);
  }

  // downloadRideInfo( ride: Ride) {
  //   // event.stopPropagation();

  //   const csvData = this.convertToCSV(ride);
  //   const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
  //   const url = URL.createObjectURL(blob);

  //   link.setAttribute('href', url);
  //   link.setAttribute('download', 'trip_history.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);

  // }

  // convertToCSV(data: Ride) {
  //   const flatData = this.flattenObject(data);
  //   const header = Object.keys(flatData).join(',');
  //   const row = Object.values(flatData).map(value => {
  //     if (Array.isArray(value)) {
  //       return `"${value.join(',')}"`;
  //     }
  //     return `"${value}"`;
  //   }).join(',');

  //   return [header, row].join('\n');
  // }

  // flattenObject(ob: any): any {
  //   const toReturn: any = {};

  //   for (const i in ob) {
  //     if (!ob.hasOwnProperty(i)) continue;

  //     if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
  //       const flatObject = this.flattenObject(ob[i]);
  //       for (const x in flatObject) {
  //         if (!flatObject.hasOwnProperty(x)) continue;
  //         toReturn[i + '.' + x] = flatObject[x];
  //       }
  //     } else {
  //       toReturn[i] = ob[i];
  //     }
  //   }
  //   return toReturn;
  // }

  // rideInfo(ride: Ride) {
  //   let latLng: [{ lat: number, lng: number }]
  //   this.selectedRide = ride;
  //   let address = [ride.startLocation, ...ride.route, ride.endLocation]
  //   console.log('addessses', address);
  //   address.forEach((a) => {
  //     let got = this.getLatLng(a);
  //     latLng.push(got)
  //   })
  //   console.log('latlng', latLng);
  // }

  // getLatLng(address: string): { lat: number, lng: number } {
  //   this.geocoder = new google.maps.Geocoder;
  //   let latlng
  //   this.geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
  //     if (status === 'OK' && results) {
  //       const location = results[0].geometry.location;
  //       latlng = {
  //         lat: location.lat(),
  //         lng: location.lng()
  //       }
  //       console.log('latlng', latlng);
  //     } else {
  //       console.error('Geocode was not successful for the following reason: ' + status);
  //     }
  //   });
  //   return latlng!
  // }



  downloadRidesInfo(rides: Ride[]) {
    const csvData = this.convertArrayToCSV(rides);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'trip_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertArrayToCSV(dataArray: Ride[]) {
    if (dataArray.length === 0) {
      return '';
    }

    const flatDataArray = dataArray.map(data => this.flattenObject(data));
    const headers = Object.keys(flatDataArray[0]);
    const headerRow = headers.join(',');

    const dataRows = flatDataArray.map(flatData => {
      return headers.map(header => {
        const value = flatData[header];
        if (Array.isArray(value)) {
          return `"${value.join(',')}"`;
        }
        return `"${value}"`;
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  flattenObject(ob: any): any {
    const toReturn: any = {};

    for (const i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
        const flatObject = this.flattenObject(ob[i]);
        for (const x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          toReturn[i + '.' + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }


  async rideInfo(ride: Ride) {
    if (this.rideRoute) {
      console.log('inside the if condtion ');
      this.rideRoute.setMap(null); // Remove the polyline from the map
      if (this.markers) {
        console.log('inside the if this.markers');

        this.markers.forEach(marker => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    }

    let latLng: { lat: number, lng: number }[] = [];
    this.selectedRide = ride;
    let address = [ride.startLocation, ...ride.route, ride.endLocation];
    console.log('addresses', address);

    for (const a of address) {
      try {
        let got = await this.getLatLng(a);
        latLng.push(got);
      } catch (error) {
        console.error(`Failed to get lat/lng for address ${a}:`, error);
      }
    }
    console.log('latlng', latLng);

    this.rideRoute = new google.maps.Polyline({
      path: latLng,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    })


    latLng.forEach((point, index) => {
      const mark = new google.maps.Marker({
        position: point,
        label: (index + 1).toString(),
        map: this.map
      });
      console.log('mark', mark);
      this.markers.push(mark)
    });



    this.fitMapToBounds(latLng);
    // const bound = new google.maps.LatLngBounds()
    // bound.extend(latLng[0])
    // bound.extend(latLng[latLng.length - 1])
    // this.map.fitBounds(bound);
    // this.map.setCenter(latLng[0])
    // this.map.setZoom(10)
    this.rideRoute.setMap(this.map)
  }

  fitMapToBounds(latLng: { lat: number, lng: number }[]) {
    const bound = new google.maps.LatLngBounds();
    latLng.forEach(point => {
      bound.extend(point);
    });
    this.map.fitBounds(bound);
  }


  getLatLng(address: string): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const location = results[0].geometry.location;
          const latlng = {
            lat: location.lat(),
            lng: location.lng()
          };
          resolve(latlng);
        } else {
          reject('Geocode was not successful for the following reason: ' + status);
        }
      });
    });
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
