import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCountryService } from '../../services/add-country.service';
import { catchError, of, tap, throwError } from 'rxjs';
import { DriverData, City, VehicleTypeByCountryId } from '../../models/models.interface';
import { ToastrService } from 'ngx-toastr';
import { DriverListService } from '../../services/driver-list.service';
import { VehicleTypeService } from '../../services/vehicle-type.service';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe } from '@stripe/stripe-js';


interface CountryInfo {
  country: string;
  countryCallingCode: string;
  countryCode: string;
  countryCode2: string;
  currency: string;
  flagSymbol: string;
  timeZone: string;
  _id: string;
}



@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.css'
})
export class DriverListComponent {

  @ViewChild('inputValue') searchTag!: ElementRef;
  private _fb = inject(FormBuilder);
  private _addCountryService = inject(AddCountryService);
  private _driverListService = inject(DriverListService);
  private _tostr = inject(ToastrService);
  private _vehicleTypeService = inject(VehicleTypeService);


  STRIPE!: Stripe | null;
  driverForm!: FormGroup;
  driverFatched: Array<DriverData> = [];
  driverFatchedlength!: number;
  CountryCodes: Array<CountryInfo> = [];
  formData = new FormData();
  update: boolean = false;
  selectedDriver!: DriverData;
  vehicleTypeList!: Array<VehicleTypeByCountryId>;
  defaultServiceId!: string;
  APPROVE: boolean = false;
  selectedCountryC!: CountryInfo;
  cityList!: Array<City>;
  citySelected: boolean = false;
  servicePresent!: boolean | null;
  getCitiesOrNot: boolean = true;
  bankDetailsForm!: FormGroup
  // tokenId!: string;
  // customerCards!: Card[];
  // selectedCardUser!: DriverData;
  extensions: Array<string> = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'avif']

  pageNumber: number = 1;
  totalDrivers!: number;
  sortValue = 'none';
  searchTerm: string | null = null;

  ngOnInit(): void {
    this.driverForm = this._fb.group({
      driverProfile: [null, Validators.required],
      driverName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      driverEmail: ['', [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(64)]],
      countryId: [''],
      countryCallingCode: ['', Validators.required],
      driverCity: ['', Validators.required],
      driverPhone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });

    this.bankDetailsForm = this._fb.group({
      AccountHolderName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      RoutingNumber: ['110000000', [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(64)]],
      AccountNumber: ['000123456789', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
    });


    this.getCountryCodes();
    this.getDriver();
    this.loadStripe()
  }

  async loadStripe() {
    if (!this.STRIPE) {
      try {
        this.STRIPE = await loadStripe('pk_test_51PKFbURvggPBSsNZHM7EzVRAd0C41qQyAhsHDMyp8XxUdjXkZhjsLrkQN0YREobqcQfQOyQmuuIBHO94EHd2TGpc00kWQ3qOBF');
      } catch (error) {
        console.error('Error loading Stripe SDK:', error);
      }
    }
    return this.STRIPE;
  }

  // async createToken(event: Event) {
  //   event.preventDefault();
  //   const stripe = await this.loadStripe();
  //   if (stripe) {
  //     // const cardDetails = {
  //     const card = {
  //       number: '4000000000000077',
  //       exp_month: 12,
  //       exp_year: 2025,
  //       cvc: '123',
  //     }
  //     // };

  //     const { token, error } = await stripe.createToken('card', {
  //       number: card.number,
  //       exp_month: card.exp_month,
  //       exp_year: card.exp_year,
  //       cvc: card.cvc
  //     }).then()

  //     if (error) {
  //       console.error('Error creating token:', error);
  //     } else {
  //       console.log('Token created:', token);

  //     }
  //   }
  // }


  async storeAccountDetails() {
    // this.STRIPE = await this.loadStripe();
    if (this.STRIPE) {
      const { token, error } = await this.STRIPE.createToken('bank_account', {
        account_holder_name: this.bankDetailsForm.get('AccountHolderName')?.value,
        account_holder_type: "individual",
        account_number: this.bankDetailsForm.get('AccountNumber')?.value,
        country: "US",
        currency: "usd",
        routing_number: this.bankDetailsForm.get('RoutingNumber')?.value
      });

      if (error) {
        console.error('Error creating token:', error);
      } else {
        console.log('Token created:', token);
        // Send the token to your server to store the driver's bank account details
        // this.storeAccountDetails(token!.id);
      }
      let data = {
        driverId: this.selectedDriver._id,
        token: token!.id
        // AccountHolderName: this.bankDetailsForm.get('AccountHolderName')?.value,
        // AccountNumber: this.bankDetailsForm.get('AccountNumber')?.value,
        // RoutingNumber: this.bankDetailsForm.get('RoutingNumber')?.value,
      }


      console.log(this.bankDetailsForm.get('AccountHolderName')?.value);
      console.log(this.bankDetailsForm.get('AccountNumber')?.value);
      console.log(this.bankDetailsForm.get('RoutingNumber')?.value);

      this._driverListService.storeBankDetails(data).pipe(
        catchError((e) => {
          console.log('Error while storing the bank account', e);
          this._tostr.error(e.error.message, 'Error')
          return throwError(e)
        })
      ).subscribe({
        complete: () => {
          this.bankDetailsForm.reset();
          let index = this.driverFatched.findIndex((d) => d._id === this.selectedDriver._id)
          this.driverFatched[index].bankDetailsAdded = true
          this._tostr.success('The Bank Account is Added', 'Success');
        }
      });
    } else {
      this._tostr.error('Not enable to create token', 'error')
    }
  }

  getDriverId(driver: DriverData) {
    this.selectedDriver = driver
  }

  getCountryCodes() {
    this._addCountryService.getCountry().pipe(
      tap((res) => {
        console.log(res);
        this.CountryCodes = res as CountryInfo[];

        // if ((res as Country[]).length > -1) {
        //   (res as Country[]).forEach(country => {
        //     this.CountryCodes.push(country.countryCallingCode)
        //   });
        //   console.log(this.CountryCodes);
        // }
      }),
      catchError((error) => {
        this._tostr.error("Enable to fatch country code", "Error");
        console.log('some error occured');
        return of(error)
      })
    ).subscribe()
  }

  getDriver() {
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchDriver(details);
  }

  onFileSelected(event: Event) {
    // this.formData.delete('driverProfile');
    const file = (event.target as HTMLInputElement).files?.[0]; // Access files property directly
    // if (file) {
    //   if (this.formData) { this.formData = new FormData() }
    //   this.formData.append('driverProfile', file)
    //   console.log(file);
    // }

    if (file) {
      const mimeType = file.type.split('/').pop();
      console.log(mimeType);
      if (!mimeType || this.extensions.indexOf(mimeType) === -1) {
        this._tostr.warning(`.${mimeType} type is not allowd`, 'Warning');
        this.driverForm.get('driverProfile')?.reset();
        return;
      }
      // if (this.formData) { this.formData = new FormData() }
      this.formData.delete('driverProfile');
      this.formData.append('driverProfile', file);
      // console.log(file);
    }
  }

  SelectedSortValue(value: string) {
    console.log(value);
    this.sortValue = value;
    if (this.totalDrivers > 1) {
      let details = {
        page: this.pageNumber,
        sort: this.sortValue,
        searchTerm: this.searchTerm
      }
      this.fatchDriver(details);
    }

  }

  onSubmit(): void {
    if (this.driverForm.invalid) {
      this._tostr.error('Please fill the Required/Valid data', 'Error');
      this.driverForm.markAllAsTouched();
      return;
    }
    let dname = this.driverForm.get('driverName')?.value
    this.driverForm.get('driverName')?.setValue(dname.trim())

    // console.log(this.driverForm.invalid);
    // if (this.driverForm.invalid) {
    //   this._tostr.warning('Please enter form/valid fields');
    //   return;
    // }

    // if (this.driverForm.get('driverName')?.value.trim() === '' || this.driverForm.get('driverEmail')?.value.trim() === '' || this.driverForm.get('driverPhone')?.value.trim() === '' || this.driverForm.get('driverProfile')?.value === null) {
    //   this._tostr.error('Please fill in all required fields.', 'Error');
    //   return;
    // }

    if (!this.validateEmail() || !this.validatePhone()) {
      return;
    }

    this.formData.append('driverName', this.driverForm.get('driverName')?.value.trim());
    this.formData.append('driverEmail', this.driverForm.get('driverEmail')?.value.trim());
    this.formData.append('driverPhone', this.driverForm.get('driverPhone')?.value);

    let cId = this.driverForm.get('countryCallingCode')?.value;
    console.log(cId);
    // console.log(cCode[2]);
    let index = this.CountryCodes.findIndex((c) => c._id === cId);
    console.log('counrtyr id ---', this.CountryCodes[index]._id);
    // this.formData.append('countryCallingCode', this.CountryCodes[index].countryCallingCode);

    this.formData.append('countryId', this.driverForm.get('countryCallingCode')?.value);
    if (index > -1) {
      this.selectedCountryC = this.CountryCodes[index];
    } else {
      this._tostr.error('Sorry some Error Occured form ourside', 'Error');
      this._tostr.info('Please refresh the page and retry', 'Info');
      return;
    }


    console.log('yooooooooooo');
    console.log(this.driverForm.value);

    this._driverListService.storeDriver(this.formData).pipe(
      tap((res) => {
        console.log(res);
        // if (this.driverFatched) {
        if (this.driverFatched.length > 0) {
          if (this.driverFatched.length <= 1) {
            this.driverFatched.push(res);
          } else {
            let details = {
              page: this.pageNumber,
              sort: this.sortValue,
              searchTerm: this.searchTerm
            }
            this.fatchDriver(details);
          }
        }
        // }
        // if (this.driverFatched) {
        //   if (this.driverFatched.length <= 1) {
        //     this.driverFatched.push(res);
        //   }
        // }
        // else {
        //   let details = {
        //     page: this.pageNumber,
        //     sort: this.sortValue,
        //     searchTerm: this.searchTerm
        //   }
        //   this.fatchDriver(details);
        // }
        this._tostr.success('Driver Added Successfully', 'Success');
        this.driverForm.reset();
        this.formData = new FormData();
        // this.cityList = [];
      }),
      catchError((error) => {
        if (error.status === 400) {
          if (error.error.error === 'Email already exists!') {
            this._tostr.warning('Email already exists', 'Warning');
            // this.driverForm.reset();
          } else if (error.error.error === 'Phone number already exists!') {
            this._tostr.warning('Phone number already exists', 'Warning');
            // this.driverForm.reset();
          } else {
            console.log('Unknown validation error:', error.error.error);
            // this.driverForm.reset();
          }
        } else {
          console.log('Unexpected error:', error);
          this._tostr.error('Some error Occured', 'Error');
          // this.driverForm.reset();
        }
        this.clearFormData()
        return of(error);
      })
    ).subscribe()
  }


  getTheCities() {
    // if(!this.getCitiesOrNot) return ;
    let cCode = this.driverForm.get('countryCallingCode')?.value;
    console.log(cCode);

    let index = this.CountryCodes.findIndex((c) => c._id === `${cCode}`);
    if (index > -1) {
      this.selectedCountryC = this.CountryCodes[index];
      console.log(this.selectedCountryC);
    }

    console.log(this.selectedCountryC._id);

    // this._driverListService.getCitiesFormCID(this.selectedCountryC._id).subscribe((res) => {
    //   this.cityList = res
    //   console.log(this.cityList);
    // });
    // if (!this.getCitiesOrNot) {
    //   return
    // } else {
    this.getCities(this.selectedCountryC._id)
    // }
  }

  editClicked(driver: DriverData) {
    this.getCitiesOrNot = true;
    this.driverForm.reset();
    this.driverForm.get('driverProfile')?.clearValidators();
    this.driverForm.get('driverProfile')?.updateValueAndValidity();
    this.selectedDriver = driver
    console.log(this.selectedDriver);
    if (this.getCitiesOrNot) this.getCities(this.selectedDriver.countryId._id);
    this.getCitiesOrNot = false;
    this.update = true;
    this.driverForm.get('countryCallingCode')?.disable();
    this.driverForm.patchValue({
      driverName: driver.driverName,
      driverPhone: driver.driverPhone,
      driverEmail: driver.driverEmail,
      countryCallingCode: this.selectedDriver.countryId._id,
      driverCity: driver.cityId?._id
    });
    console.log(this.selectedDriver.cityId?._id);
    console.log(driver.cityId?._id);
    this.formData.delete('driverCity');
    let cityId = this.selectedDriver.cityId?._id.trim();

    this.formData.append('driverCity', cityId as string);
  }

  getCities(countryId: string) {
    this._driverListService.getCitiesFormCID(countryId).subscribe((res) => {
      this.cityList = res
      console.log(this.cityList);
    });
  }

  selectedCity() {
    // if(!this.getCitiesOrNot) return ;/
    this.formData.delete('driverCity');
    console.log(this.driverForm.get('driverCity')?.value);
    this.formData.append('driverCity', this.driverForm.get('driverCity')?.value.trim());
    this.citySelected = true
  }

  clearFormData() {
    this.formData.delete('driverName');
    this.formData.delete('driverEmail');
    this.formData.delete('countryId');
    // this.formData.delete('countryCallingCode');
    this.formData.delete('driverPhone');
    this.formData.delete('driverCity');
    this.formData.delete('id');
    this.getCitiesOrNot = true;
  }

  updateDriver() {
    if (this.driverForm.invalid) {
      this._tostr.error('Please fill the Required/Valid data', 'Error');
      this.driverForm.markAllAsTouched();
      return;
    }
    if (this.driverForm.get('driverName')?.value.trim() === '' || this.driverForm.get('driverEmail')?.value.trim() === '' || this.driverForm.get('driverPhone')?.value.trim() === '') {
      let dname = this.driverForm.get('driverName')?.value
      this.driverForm.get('driverName')?.setValue(dname.trim());
      this._tostr.error('Please fill in all required fields.', 'Error');
      return;
    }
    if (!this.validateEmail() || !this.validatePhone()) {
      return;
    }

    console.log(this.selectedDriver);

    this.clearFormData();
    this.formData.append('driverName', this.driverForm.get('driverName')?.value.trim());
    this.formData.append('driverEmail', this.driverForm.get('driverEmail')?.value.trim());
    this.formData.append('countryId', this.selectedDriver.countryId._id);
    this.formData.append('driverPhone', this.driverForm.get('driverPhone')?.value);
    this.formData.append('driverCity', this.driverForm.get('driverCity')?.value);
    this.formData.append('id', this.selectedDriver._id);
    console.log(this.selectedDriver);

    // if (!this.citySelected) {
    //   this.formData.delete('driverCity');
    //   // this.formData.append('driverCity', cityId as string);
    //   this.citySelected = false;
    // }
    this._driverListService.updateDriver(this.formData).pipe(
      tap((res) => {
        console.log(res);
        let index = this.driverFatched.findIndex((driver) => driver._id === res._id);
        this.driverFatched[index] = res;
        console.log(this.driverFatched[index]);

        this._tostr.success('Driver Updated Successfully', 'Success');
        this.update = false;
        this.driverForm.reset();
        this.formData = new FormData();
        this.driverForm.get('countryCallingCode')?.enable();
        this.driverForm.get('driverProfile')?.setValidators([Validators.required]);
        this.driverForm.get('driverProfile')?.updateValueAndValidity();
        this.getCitiesOrNot = true;
        this.cityList = []

      }),
      catchError((error) => {
        console.log(error);
        // this.driverForm.get('countryCallingCode')?.enable();

        if (error.status === 400) {
          if (error.error.error === 'Email already exists!') {
            this._tostr.warning('Email already exists', 'Warning');
            this.clearFormData()
            // this.driverForm.reset(); this.update = false;
          } else if (error.error.error === 'Phone number already exists!') {
            this._tostr.warning('Phone number already exists', 'Warning');
            this.clearFormData()
            // this.driverForm.reset(); this.update = false;
          } else {
            console.log('Unknown validation error:', error.error.error);
            this.clearFormData()
            // this.update = false;
          }
        } else {
          console.log('Unexpected error:', error);
          this.clearFormData()
          // this.update = false;
        }
        return of(error);
      })
    ).subscribe()
  }

  deleteClicked(id: string) {
    console.log(id);
    let response = confirm('Do you really want to delete driver');
    if (response) {
      this._driverListService.deleteDriver(id).subscribe((res) => {
        console.log(res);
        this.driverForm.reset();
        if (this.driverFatched.length === 1) {
          this.driverFatched = [];
          this.pageNumber--;
        }
        // let updatedPageNumber = --this.pageNumber;
        // if (this.driverFatched.length == 0) {
        //   let details = {
        //     page: updatedPageNumber,
        //     sort: this.sortValue,
        //     searchTerm: this.searchTerm
        //   }
        //   this._driverListService.getExistingDrivers(details).subscribe((res) => {
        //     this.driverFatched = res.Drivers;
        //     this.pageNumber = res.totalDrivers;
        //   })
        // }
        // if (this.driverFatched.length == 1) this.pageNumber--;
        // this.pageNumber--;

        let data = {
          page: this.pageNumber,
          sort: this.sortValue,
          searchTerm: this.searchTerm,
        }
        this.fatchDriver(data)
        // let index = this.driverFatched.findIndex((driver) => driver._id === res._id);
        // this.driverFatched.splice(index, 1);
        this._tostr.warning('Driver deleted successfully', 'Success');
      })
    }
  }

  clearAll() {
    this.formData = new FormData()
    this.driverForm.reset();
    this.driverForm.get('countryCallingCode')?.enable();

    this.update = this.update ? false : true
  }

  previousBtn() {
    if (this.disablePrevBnt()) {
      this._tostr.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = this.pageNumber > 1 ? --this.pageNumber : 1
    console.log(this.pageNumber);
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchDriver(details)
  }

  nextBtn() {
    if (this.disableNextBnt()) {
      this._tostr.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = ++this.pageNumber
    console.log(this.pageNumber);
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchDriver(details);
  }

  get driverProfile() {
    return this.driverForm.get('driverProfile');
  }

  get driverName() {
    return this.driverForm.get('driverName');
  }

  get driverEmail() {
    return this.driverForm.get('driverEmail');
  }

  get countryCallingCode() {
    return this.driverForm.get('countryCode');
  }

  get driverPhone() {
    return this.driverForm.get('driverPhone');
  }

  get driverCity() {
    return this.driverForm.get('driverCity');
  }


  fatchDriver(data: object) {

    this._driverListService.getExistingDrivers(data).subscribe((res) => {
      console.log(res);
      this.driverFatched = res.Drivers;
      this.totalDrivers = res.totalDrivers;
      if (this.driverFatched) {
        if (this.driverFatched.length > -1) {
          this.driverFatchedlength = this.driverFatched.length
        } else { this.driverFatchedlength = -1 }
      }

    },
      (error) => {
        console.log('borrrrrrrrrrrrrrr', error);

        this._tostr.info('Showing main tabel  ', 'info');
        this._tostr.error('No Driver Found', 'Error');

        console.log(error.error.Message);
        this.searchTag.nativeElement.value = '';
        this.searchTerm = ''
        this.pageNumber = 1;
        this.disablePrevBnt();
        console.log(error.error.Message);
        this.disableNextBnt();
      });
  }


  getServices(driver: DriverData) {

    console.log(this.selectedDriver);

    this.servicePresent = null;
    this.servicePresent = driver.serviceType ? true : false;
    this.selectedDriver = driver
    // let countryId:string = this.selectedDriver.countryId._id
    this.vehicleTypeList = []
    console.log(this.selectedDriver);
    console.log('getServices');
    this._vehicleTypeService.getAllServices(this.selectedDriver.countryId._id , this.selectedDriver.cityId!._id).pipe(
      tap((res) => {
        console.log(res);

        this.vehicleTypeList = res as VehicleTypeByCountryId[];
        console.log(this.vehicleTypeList);

        // this._tostr.success('Fetched Vehicle Type', 'Success');
      })
    ).subscribe()

  }

  onServiceSelected(serviceId: string) {
    console.log(serviceId);
    let details = {
      driverId: this.selectedDriver._id,
      serviceId: serviceId
    }
    // this._driverListService.addService(details).pipe(
    //   tap((res) => {
    //     console.log(res.Driver);
    //     // this.selectedDriver = res.Driver
    //     if (res.Message === 'Service Added Successfully') {
    //       this.selectedDriver.serviceType = res.Driver.serviceType;
    //       let index = this.driverFatched.findIndex((d) => d._id == res.Driver._id);
    //       console.log(res);
    //       // console.log(this.selectedDriver);

    //       this.driverFatched[index] = res.Driver;
    //       this._tostr.success('Service Added', 'Success');
    //     } 
    //   }),
    //   catchError((err) => {
    //     console.log(err);

    //     this._tostr.error('Some  Occured', 'Error');
    //     return of(err)
    //   })
    // ).subscribe()
    this.addRemoveService(details);


  }

  onServiceNullSelected(data: null) {
    console.log('inside onServiceNullSelected');
    let details = {
      driverId: this.selectedDriver._id,
      serviceId: null
    }
    // this._driverListService.addService(details).pipe(
    //   tap((res) => {
    //     console.log(res.Driver);
    //     // this.selectedDriver = res.Driver
    //     if (res.Message === 'Service removed Successfully') {
    //       this.selectedDriver.serviceType = res.Driver.serviceType;
    //       let index = this.driverFatched.findIndex((d) => d._id == res.Driver._id);
    //       console.log(res);
    //       // console.log(this.selectedDriver);

    //       this.driverFatched[index] = res.Driver;
    //       this._tostr.success('Service removed', 'Success');
    //     } else {
    //       this._tostr.warning('Service removed', 'Warning');
    //       this.selectedDriver.serviceType = null;
    //     }
    //   }),
    //   catchError((err) => {
    //     console.log(err);

    //     this._tostr.error('Some  Occured', 'Error');
    //     return of(err)
    //   })
    // ).subscribe()
    this.addRemoveService(details);

  }

  addRemoveService(data: object) {
    console.log(this.selectedDriver);
    this._driverListService.addService(data).pipe(
      tap((res) => {
        // this.selectedDriver = res.Driver
        if (res.Message === 'Service Added Successfully') {
          this.selectedDriver.serviceType = res.Driver.serviceType;
          this.servicePresent = true;
          let index = this.driverFatched.findIndex((d) => d._id == res.Driver._id);
          console.log(res);
          // console.log(this.selectedDriver);
          console.log(this.driverFatched[index]);
          // console.log(res.Driver);

          this.driverFatched[index].serviceType = res.Driver.serviceType;
          // console.log(this.driverFatched[index]);
          // this.selectedDriver = res.Driver
          this._tostr.success('Service added', 'Success');
        } else {
          this.selectedDriver.serviceType = res.Driver.serviceType;
          this.servicePresent = false;
          let index = this.driverFatched.findIndex((d) => d._id == res.Driver._id);
          console.log(res);

          this.driverFatched[index].serviceType = res.Driver.serviceType;
          this._tostr.warning('Service removed', 'Warning');
          this.selectedDriver.serviceType = null;
        }
      }),
      catchError((err) => {
        console.log(err);

        this._tostr.error('Some  Occured', 'Error');
        return of(err)
      })
    ).subscribe()
  }

  searchDriver(text: string) {
    if (text == '') {
      this._tostr.warning('Please Enter Some Values', 'Warning');
      // this.searchTerm = 
      this._tostr.info('Showing main tabel  ', 'info');
      this.searchTerm = ''
      return;
      // return;
    }
    this.pageNumber = 1;
    console.log(text);
    this.searchTerm = text;
    this.sortValue = 'none';
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchDriver(details);
  }

  approveOrDecline(driver: DriverData) {

    let details = {
      driverId: driver._id,
      approveStatus: !driver.approveStatus
    }
    // console.log(details);

    this._driverListService.approveOrDecline(details).pipe(
      tap((res) => {
        console.log(res);

        let index = this.driverFatched.findIndex((dri) => dri._id === res.Driver._id);
        this.driverFatched[index].approveStatus = res.Driver.approveStatus;
        this._tostr.success('Status Changed', 'Success');
      }),
      catchError((error) => {
        console.log(error);
        this._tostr.error('Error Occured while updating', 'Error');
        return of(error)
      })
    ).subscribe();

  }

  disablePrevBnt(): boolean {
    if (this.pageNumber == 1) {
      return true
    } else if (this.pageNumber == 0) {
      return true;
    }
    return false
  }

  disableNextBnt(): boolean {
    if (this.totalDrivers == this.pageNumber * 2) {
      return true;
    } else if (this.totalDrivers < this.pageNumber * 2) {
      return true;
    } else if (this.driverFatched) {
      if (this.driverFatched.length < 0) {
        return true;
      }
    } else if (this.pageNumber == 0) {
      return true;
    }
    return false
  }

  validateEmail(): boolean {
    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,}$/;
    const userEmailValue = this.driverForm.get('driverEmail')?.value;
    if (!this.driverForm.invalid && userEmailValue) {
      if (!emailRegex.test(userEmailValue)) {
        this._tostr.error('Invalid email address', 'Error');
        return false
      }
    }
    return true
  }

  validatePhone(): boolean {
    const phoneRegex = /^[1-9]\d{9}$/;
    const phoneValue = this.driverForm.get('driverPhone')?.value;
    if (!this.driverForm.invalid && phoneValue) {
      if (!phoneRegex.test(phoneValue)) {
        this._tostr.error('Invalid phone number', 'Error');
        return false;
      }
    }
    return true
  }
}
