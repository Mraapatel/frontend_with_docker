import { Component, ElementRef, ViewChild, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { CountryForRide, Settings } from '../../models/models.interface';
import { UserService } from '../../services/user.service';
import { singleUser, cityPricingforTypes, cardForCreateRide } from '../../models/models.interface';
import { CreateRideService } from '../../services/create-ride.service';
import { SettingService } from '../../services/setting.service';
import { DateValidator } from '../../validators/date-validator';
import { TimeValidator } from '../../validators/time-validator';
import { SocketIoService } from '../../services/socket-io.service';
import { HttpErrorResponse } from '@angular/common/http';


interface createRideRes {
  message: string,
  rideInfo: {},
  status: number
}

interface CityZone {
  _id: string;
  coordinates: google.maps.Polygon;
}

interface Cities {
  _id: string,
  coordinates: [{ lat: number, lng: number }],
}

@Component({
  selector: 'app-create-ride',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-ride.component.html',
  styleUrl: './create-ride.component.css'
})
export class CreateRideComponent {
  @ViewChild('Stops') StopsField!: ElementRef;
  @ViewChild('StartPoint') StartField!: ElementRef;
  @ViewChild('EndPoint') EndField!: ElementRef;

  private _createRideService = inject(CreateRideService);
  private _toastr = inject(ToastrService);
  private _fb = inject(FormBuilder);
  private _userService = inject(UserService);
  private _setting = inject(SettingService);
  private _socketIO = inject(SocketIoService);

  API_KEY = environment.API_KEY;
  map!: google.maps.Map;
  geocoder!: google.maps.Geocoder;
  autocomplete!: google.maps.places.Autocomplete;
  place!: google.maps.places.PlaceResult | null;
  locationMarker: google.maps.Marker | null = null;
  DirectionService!: google.maps.DirectionsService;
  DirectionsRenderer!: google.maps.DirectionsRenderer
  FormStop: string | null = null;
  ToStop: string | null = null;
  IntermediateStop: string | null = null;
  StartPoint!: google.maps.LatLng | undefined;
  EndPoint!: google.maps.LatLng | undefined;


  userForm!: FormGroup;
  locationForm!: FormGroup;
  bookRideForm!: FormGroup;
  CountryCodes: Array<CountryForRide> = [];
  gotUser!: singleUser | null;
  showDetails: boolean = false;
  showOverView: boolean = false;
  addPlaces: boolean = false;
  selectedCountryC2: string = '';
  CountryId: string = '';
  setting!: Settings;
  autocompleteInput3!: HTMLInputElement
  cities: Array<Cities> = []
  CityZones: Array<CityZone> = []
  isInsideTheZone: boolean = false;
  STOPS: Array<string> = [];
  CityId!: string;
  cityPricingOfTypes: Array<cityPricingforTypes> = [];
  PriceListWithVehicleTypes: Array<{ totalPrice: number, type: string, typeId: string }> = [];
  totalDistance: number | undefined = 0;
  totalTime: { hours: number, minutes: number } = { hours: 0, minutes: 0 };
  UserCards: Array<cardForCreateRide> = [];


  ngOnInit() {
    // this.pageload();
    this.loadDefaultMap();
    this.getCountryCodes();
    this.getSettings();

    this.userForm = this._fb.group({
      userPhone: ['1111111111', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      countryCC: ['', Validators.required],
      userName: [{ value: '', disabled: true }],
      userEmail: [{ value: '', disabled: true }],
    })

    this.locationForm = this._fb.group({
      form: ['', Validators.required],
      to: ['', Validators.required],
      stops: ['']
    });

    this.bookRideForm = this._fb.group({
      serviceType: ['', Validators.required],
      paymentMethod: ['cash', Validators.required],
      bookStatus: ['now', Validators.required],
      bookingDate: [, [Validators.required, DateValidator()]],
      booktime: [, [Validators.required, TimeValidator()]],
    })
  }

  
  /*
 pageload() {
   if (navigator.geolocation) {
     // Get the user's current location
     navigator.geolocation.getCurrentPosition(position => {
       const userPosition = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };

       const loader = new Loader({
         apiKey: this.API_KEY,
         libraries: ['places', 'drawing']
       });

       loader.load().then(() => {
         const mapEle = document.getElementById('map');
         if (mapEle) {
           // Use user's current location as the center
           this.map = new google.maps.Map(mapEle, {
             center: userPosition,
             zoom: 10,
             styles: []
           });

           // Initialize the geocoder
           this.geocoder = new google.maps.Geocoder();
         }
       }).catch(err => {
         console.error('Error loading Google Maps API:', err);
       });
     }, error => {
       console.warn('Error getting user location:', error);
       // Load default map without marker
       this.loadDefaultMap();
     });
   } else {
     console.error('Geolocation is not supported by this browser.');
     // Load default map without marker
     this.loadDefaultMap();
    }
  }
  */

  // /*
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
  // */
  getCountryCodes() {
    this._createRideService.getCountryCodes().pipe(
      tap((res) => {
        if ((res as CountryForRide[]).length > -1) {
          this.CountryCodes = res as CountryForRide[]
          console.log(res);
          console.log(this.CountryCodes);
        }
      }),
      catchError((error) => {
        this._toastr.error("Enable to fatch country code", "Error");
        console.log('some error occured');
        return of(error)
      })
    ).subscribe()
  }

  getSettings() {
    this._setting.getSettings().pipe(
      catchError(error => {
        this._toastr.error('Error Occured while fatching the settings', 'Error');
        return of(error)
      })
    ).subscribe({
      next: (res) => {
        this.setting = res;
        console.log(this.setting);
      }
    })
  }

  searchUser() {
    if (this.userForm.get('userPhone')?.value.trim() === '' || this.userForm.get('countryCC')?.value.trim() === '') {
      this._toastr.warning('Please enter Phone no and Country code', 'warning');
      return;
    }
    if (!this.validatePhone()) return;
    console.log(this.userForm.get('countryCC')?.value.trim());
    let varr = this.userForm.get('countryCC')?.value.split('+');
    this.CountryId = varr[0]
    this.selectedCountryC2 = varr[1]

    let details = {
      countryCC: this.CountryId,
      userPhone: this.userForm.get('userPhone')?.value
    }
    this._userService.getSinglUser(details).pipe(
      catchError((error) => {
        if (error.error.status === 'No user found') {
          this._toastr.warning('No user found', "warning");
          return of(error);
        }
        this._toastr.info('No user found', "warning");
        return of(error);
      })
    ).subscribe({
      next: (res) => {
        console.log(res);
        if (res.status == 'success') {
          this.userForm.get('userPhone')?.disable();
          this.userForm.get('countryCC')?.disable();
          this.gotUser = res.user
          this.showDetails = true;
          this.UserCards = res.cardArray
          console.log('this.usercards', this.UserCards);

          this._toastr.info('user found', "info");
        }
      },
      complete: () => { }
    })
  }

  addNewStop() {
    console.log(this.StopsField.nativeElement.value);
    let fieldInput = this.StopsField.nativeElement.value
    if (this.locationForm.invalid) {
      this._toastr.warning(`First add form and to location `, 'Warning');
      return;
    } else if (
      this.autocompleteInput3.value.trim() == '' ||
      this.IntermediateStop !== this.StopsField.nativeElement.value
    ) {
      this._toastr.warning(`Please select form autosuggetion `);
      return;
    }
    this.bookRideForm.reset();
    for (let i = 0; i < this.STOPS.length; i++) {
      if (this.STOPS[i] === fieldInput) {
        this._toastr.error(`Place already added`, 'error');
        return;
      }
    }
    if (this.STOPS.length + 1 > this.setting.Stops) {
      this._toastr.warning(`Max no. of stops exceeded `, 'Warning');
      return;
    }
    this.STOPS.push(fieldInput);
    this.IntermediateStop = null;
    this.autocompleteInput3.value = '';
    this.calculateRide()

    console.log(this.STOPS);
    console.log('this.STOPS.length ', this.STOPS.length);
    console.log('this.setting.Stops ', this.setting.Stops);

  }

  calculateTotalFare(obj: cityPricingforTypes): { totalPrice: number, type: string, typeId: string } {
    //  console.log(`==========================${obj.typeId.vehicleType}===========================`);
    //  console.log(obj);
    let reducedDistance = 0
    if (this.totalDistance! > obj.distanceForBasePrice) {
      //  console.log('this.totalDistance--->', this.totalDistance);
      //  console.log('obj.distanceForBasePrice----->', obj.distanceForBasePrice);
      reducedDistance = this.totalDistance! - obj.distanceForBasePrice;
      //  console.log('reduced distance---->', reducedDistance);
    }
    let totalPrice: number = 0
    if (reducedDistance) {
      // console.log('Priceperunitdistance', obj.pricePerUnitDistance);
      // console.log('((this.totalTime.hours / 60) + this.totalTime.minutes)', ((this.totalTime.hours / 60) + this.totalTime.minutes));
      // console.log('obj.pricePerUnitTime_Min', obj.pricePerUnitTime_Min);
      // console.log('(((this.totalTime.hours / 60) + this.totalTime.minutes) * obj.pricePerUnitTime_Min)', (((this.totalTime.hours / 60) + this.totalTime.minutes) * obj.pricePerUnitTime_Min));
      totalPrice = (reducedDistance! * obj.pricePerUnitDistance) + (((this.totalTime.hours / 60) + this.totalTime.minutes) * obj.pricePerUnitTime_Min);
      // console.log('totalprice ', totalPrice);
    }
    if (totalPrice < obj.basePrice) {
      return { totalPrice: obj.basePrice, type: obj.typeId.vehicleType, typeId: obj.typeId._id }
    }

    return { totalPrice: totalPrice + obj.basePrice, type: obj.typeId.vehicleType, typeId: obj.typeId._id }
  }

  removeStop(placeId: string | undefined) {
    console.log(placeId);
    let index = this.STOPS.findIndex((s) => { return s === placeId });
    this.STOPS.splice(index, 1);
    if (this.DirectionsRenderer) this.calculateRide();
  }

  TurnAutocomplete() {
    const autocompleteInput1 = document.getElementById('form-location') as HTMLInputElement;
    this.initAutocomplete(autocompleteInput1, this.locationMarker, 'form');
    const autocompleteInput2 = document.getElementById('to-location') as HTMLInputElement;
    this.initAutocomplete(autocompleteInput2, this.locationMarker, 'to');
    this.autocompleteInput3 = document.getElementById('stops') as HTMLInputElement;
    this.initAutocomplete(this.autocompleteInput3, this.locationMarker, 'stops');
  }

  initAutocomplete(autocompleteInput: HTMLInputElement, Marker: google.maps.Marker | null, inputfield: string): void {
    // const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, { types: ['(cities)'] });
    const autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
    autocomplete.setComponentRestrictions({ 'country': this.selectedCountryC2 })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (inputfield === 'form') {
        console.log('inside the autocomplete (stops)');
        this.checkForPlace(place);
      } else if (inputfield === 'stops') {
        this.IntermediateStop = this.StopsField.nativeElement.value;
        console.log('inside the autocomplete (stops)');
        console.log(place.place_id);
      } else if (inputfield === 'to') {
        this.ToStop = this.EndField.nativeElement.value;
        if (this.DirectionsRenderer) this.calculateRide();
        console.log('inside the autocomplete to');
      }

      if (this.locationMarker) this.locationMarker?.setMap(null);

      this.locationMarker = new google.maps.Marker({
        map: this.map,
        position: place.geometry?.location!,
        title: place.name,
      });
      this.focusMarker('from');
      if (!place || !place.geometry || !place.geometry.location) {
        this._toastr.warning('Please enter a valid location.', 'warning');
      }
    });
  }

  checkForPlace(place: google.maps.places.PlaceResult) {
    // let cordinates = {
    this.isInsideTheZone = false;
    console.log('checkForPlace called ------>');

    if (place && place.geometry && place.geometry.location) {
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      // Now you can use the latitude and longitude to check if they are inside a polygon
      const latLng = new google.maps.LatLng(latitude, longitude);
      this._createRideService.checkForStartingPoint(latLng).pipe(
        catchError((e) => {
          console.log('not in zone ', e);
          return of(e)
        }),
        tap((res: { cityId: string, message: string } | HttpErrorResponse) => {
          if ('cityId' in res && res.message === 'Point is Inside of the zone') {
            this.CityId = res.cityId
            this.getPricing(this.CityId);
            console.log('inside the zone', res);
            this.isInsideTheZone = true;
            console.log('isisidethezone', this.isInsideTheZone);

            this._toastr.success('Service is available', 'success');
            this.FormStop = this.StartField.nativeElement.value
          }

        })
      ).subscribe({
        next: () => {

          if (!this.isInsideTheZone) {
            console.log('isisidethezone', this.isInsideTheZone);

            this._toastr.error('Service is not Available Here', 'error');
            if (this.DirectionsRenderer) this.DirectionsRenderer.setMap(null);
            console.log('checkForPlace finished------>');
            return;
          }
        }
      })


      // for (let i = 0; i < this.CityZones.length; i++) {

      //   if (google.maps.geometry.poly.containsLocation(latLng, this.CityZones[i].coordinates)) {
      //     this.CityId = this.CityZones[i]._id;
      //     this.getPricing(this.CityId);

      //     console.log('inside the if condition cityId', this.CityId);

      //     console.log('checkForPlace inside if()------>');
      //     console.log('yes location is inside the zonee');
      //     this.FormStop = this.StartField.nativeElement.value
      //     this.isInsideTheZone = true;
      //     this._toastr.success('Service is available', 'success');
      //     break;
      //   }
      // }
      console.log('isisidethezone', this.isInsideTheZone);

      // if (!this.isInsideTheZone) {
      //   console.log('isisidethezone',this.isInsideTheZone);

      //   this._toastr.error('Service is not Available Herejsjjjjjjjjj', 'error');
      //   if (this.DirectionsRenderer) this.DirectionsRenderer.setMap(null);
      //   console.log('checkForPlace finished------>');
      //   return;
      // }
    }
    // console.log('checkForPlace finished------>');
  }


  getTheLocations() {
    this.addPlaces = true;
    this._createRideService.getCities(this.CountryId).pipe(
      catchError(error => {
        if (error.status === 400) {
          this._toastr.error('Cities Not found', 'Error');
        }
        return of(error)
      })
    ).subscribe({
      next: (res) => {
        if (res.status === 'Cties Found') {
          console.log(res);
          this.cities = res.cities
          console.log(this.cities);
          this.TurnAutocomplete();

          // this.createZonesOfCities()
        } else {
          this._toastr.warning('No Cities found', 'Warning');
        }
      }
    })

  }

  calculateRide() {
    if (this.locationForm.get('form')?.value.trim() === '' || this.locationForm.get('to')?.value.trim() === '') {
      this.locationForm.markAllAsTouched()
      this._toastr.warning(`First add form and to location `, 'Warning');
      return;
    }
    if (this.FormStop === this.ToStop && !(this.STOPS.length > 0)) {
      this._toastr.warning(`Please Add Way Point because Both locations can't be same`, );
      this.showOverView = false;

      if (this.DirectionsRenderer) this.DirectionsRenderer.setMap(null);
      return;
    }
    if (
      this.FormStop !== this.StartField.nativeElement.value ||
      this.ToStop !== this.EndField.nativeElement.value
    ) {
      this._toastr.warning(`Please select location form suggetions `, 'Warning');
      return;
    }

    if (!this.isInsideTheZone) {
      this._toastr.error(`from location is outside the zone`, 'error');
      return;
    }
    console.log('calulateRide');
    this.drawingFunction();
  }

  calulateAllServicePrices() {
    console.log('inside the calulateAllServicePrices ');
    console.log(this.cityPricingOfTypes);

    if (this.cityPricingOfTypes) {
      this.PriceListWithVehicleTypes = this.cityPricingOfTypes.map((price) => {
        let tF = this.calculateTotalFare(price)
        console.log(`total fare for${price.typeId.vehicleType} : ${tF}`, tF);
        return tF
      })
    }

    console.log('Last line of calculateAllServicePrices ', this.PriceListWithVehicleTypes);

  }

  drawingFunction() {
    if (this.locationMarker) this.locationMarker.setMap(null);
    if (this.DirectionsRenderer) this.DirectionsRenderer.setMap(null);

    this.DirectionService = new google.maps.DirectionsService();
    this.DirectionsRenderer = new google.maps.DirectionsRenderer();
    this.DirectionsRenderer.setMap(this.map);

    const request = {
      origin: this.StartField.nativeElement.value,
      destination: this.EndField.nativeElement.value,
      waypoints: this.STOPS.map((stop) => { return { location: stop }; }),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    }

    this.DirectionService.route(request, (result, status) => {
      if (status == 'OK') {
        console.log(result);
        this.totalDistance = result?.routes.reduce((outerAccumulator, currenValues) => {
          return outerAccumulator + currenValues.legs.reduce((innerAccumulator, innerCurrentValue) => {
            return innerAccumulator + (innerCurrentValue.distance?.value || 0);
          }, 0)
        }, 0)

        let time = result?.routes.reduce((outerAccumulator, currenValues) => {
          return outerAccumulator + currenValues.legs.reduce((innerAccumulator, innerCurrentValue) => {
            return innerAccumulator + (innerCurrentValue.duration?.value || 0);
          }, 0)
        }, 0)
        let hours;
        let minutes;
        if (time) {
          hours = Math.floor(time / 3600);
          minutes = Math.floor((time % 3600) / 60);
          this.totalTime.hours = hours
          this.totalTime.minutes = minutes
        }
        if (this.totalDistance) this.totalDistance /= 1000;

        this.calulateAllServicePrices();

        console.log('Total distance in km', this.totalDistance);
        console.log(`total Time:${hours} hours and ${minutes} minutes`);
        this.DirectionsRenderer.setDirections(result);
        this.showOverView = true;
      } else {
        this._toastr.error('Service not available', 'Error');
        return;
      }
    })
  }

  validationForBookNow(): boolean {
    this.bookRideForm.get('serviceType')?.markAsTouched();
    this.bookRideForm.get('paymentMethod')?.markAsTouched();

    if (this.bookRideForm.get('serviceType')?.valid && this.bookRideForm.get('paymentMethod')?.valid) {
      return true;
    }
    return false
  }


  BookRide() {
    console.log(this.bookRideForm.get('bookStatus')?.value);
    if (this.bookRideForm.invalid) {
      this.bookRideForm.markAllAsTouched();
    }

    let flagForBookNow;
    if (this.bookRideForm.get('bookStatus')?.value.trim() === '') {
      this.bookRideForm.markAllAsTouched();
      return;
    }
    if (this.bookRideForm.get('bookStatus')?.value === 'schedule') {
      if (this.bookRideForm.invalid) {
        this.bookRideForm.markAllAsTouched();
        this._toastr.error('Please fill the all required/valid fields', 'Error');
        return;
      }
      this.storeRideInfo()

    } else {
      // if (this.bookRideForm.get('bookStatus')?.value === "now") {
      console.log('inside the now conditoion ');

      flagForBookNow = this.validationForBookNow()
      console.log('flagForBookNow', flagForBookNow);
      if (!flagForBookNow) {
        console.log('inside the now conditoion flaforbooknow');
        this._toastr.error('Please fill all required fields', 'error');
        return;
      } else if (!this.isInsideTheZone) {
        console.log('inside the now conditoion  not insidethezone ');
        this._toastr.error('Please select the proper locations first', 'error');
        return;
      }
      console.log('storing theh data ');
      this.storeRideInfo()
    }
  }

  storeRideInfo() {
    let todaysDate = new Date();
    let d = `${todaysDate.getDate()}`;
    let m = `${todaysDate.getMonth() + 1}`;
    console.log('todaysDate', todaysDate);
    if (todaysDate.getMonth() + 1 < 10) {
      m = `0${todaysDate.getMonth() + 1}`
    }
    if (todaysDate.getDate() < 10) {
      d = `0${todaysDate.getDate()}`
    }
    let time = `${todaysDate.getHours()}:${todaysDate.getMinutes() + 1}`
    let index = this.PriceListWithVehicleTypes.findIndex((p) => p.typeId === this.bookRideForm.get('serviceType')?.value)
    let details = {
      userId: this.gotUser?._id,
      typeId: this.bookRideForm.get('serviceType')?.value,
      cityId: this.CityId,
      date: `${todaysDate.getFullYear()}-${m}-${d}`,
      // date: this.bookRideForm.get('bookingDate')?.value,
      time: todaysDate.getTime(),
      timeInString: time,
      paymentMethod: this.bookRideForm.get('paymentMethod')?.value,
      totalDistance: parseFloat(this.totalDistance!.toFixed(2)),
      totalTime: (this.totalTime.hours * 60) + this.totalTime.minutes,
      totalFare: parseFloat(this.PriceListWithVehicleTypes[index].totalPrice.toFixed(2)),
      endLocation: this.ToStop,
      startLocation: this.FormStop,
      route: this.STOPS,
    }
    console.log('totaltime.hours/', (this.totalTime.hours / 60));
    console.log('details', details);
    // return

    // return


    if (this.bookRideForm.get('bookStatus')?.value === 'schedule') {
      let bookedDate = new Date(`${this.bookRideForm.get('bookingDate')?.value}T${this.bookRideForm.get('booktime')?.value}`);
      details.date = this.bookRideForm.get('bookingDate')?.value;
      // details.time = this.bookRideForm.get('booktime')?.value
      details.time = bookedDate.getTime();
    }

    this._socketIO.emitNewEvent('newRideCame', {});

    this._createRideService.storeRide(details).pipe(
      catchError((error) => {
        this._toastr.error('error');
        return of(error)
      })
    ).subscribe({
      next: (res: createRideRes) => {
        console.log(res);
        if (res.status === 200) {
          this._toastr.success(res.message, 'Success');
          this.bookRideForm.reset();
          this.locationForm.reset();
          this.userForm.reset();
          this.showOverView = false;
          this.addPlaces = false
          this.showDetails = false;
          this.userForm.get('userPhone')?.enable();
          this.userForm.get('countryCC')?.enable();
          this.DirectionsRenderer.setMap(null);
          this.STOPS = [];
          this.map.setCenter({ lat: 25.4484, lng: 78.5685 })
          this.map.setZoom(6)
        } else if (res.status === 300) {
          this._toastr.error(res.message, 'error');
        }
      }
    })
    console.log(details);
  }

  getPricing(cityId: string) {
    this._createRideService.getCityPricing(cityId).pipe(
      catchError((error) => {
        console.log(error);
        return of(error)
      })
    ).subscribe({
      next: (res) => {
        this.cityPricingOfTypes = res.pricings;
        console.log(res);
        console.log('this.cityPricingOfTypes----->', this.cityPricingOfTypes);
      }
    })
  }

  dateSelected() {
    this.bookRideForm.get('booktime')?.setValue('');
  }


  // createZonesOfCities() {
  //   this.TurnAutocomplete();
  //   if (this.cities.length >= 1) {
  //     this.CityZones = this.cities.map((co) => (
  //       {
  //         _id: co._id,
  //         coordinates: new google.maps.Polygon({
  //           paths: co.coordinates,
  //         })
  //       }));
  //     console.log(this.CityZones);
  //   } else {
  //     this._toastr.warning("There are nocities are availabele in the country ", 'warning');
  //     return;
  //   }
  // }

  get userPhone() {
    return this.userForm.get('userPhone');
  }

  validatePhone(): boolean {
    const phoneRegex = /^[1-9]\d{9}$/;
    const phoneValue = this.userForm.get('userPhone')?.value;
    if (!this.userForm.invalid && phoneValue) {
      if (!phoneRegex.test(phoneValue)) {
        this._toastr.error('Invalid phone number', 'Error');
        return false;
      }
    }
    return true
  }

  focusMarker(type: string) {
    if (this.locationMarker && this.map) {
      this.map.setCenter(this.locationMarker.getPosition()!);
      this.map.setZoom(10); // Adjust the zoom level as needed
    }
  }

  Clear() {
    this.showDetails = false;
    this.gotUser = null
    this.userForm.reset();
    this.userForm.get('userPhone')?.setValue('')
    this.userForm.get('countryCC')?.setValue('')
    this.userForm.get('userPhone')?.enable();
    this.userForm.get('countryCC')?.enable();
  }

}
