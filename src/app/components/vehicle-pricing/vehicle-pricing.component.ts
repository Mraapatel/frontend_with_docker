import { Component, inject } from '@angular/core';
import { AddCountryService } from '../../services/add-country.service';
import { CityService } from '../../services/city.service';
import { VehicleTypeService } from '../../services/vehicle-type.service';
import { Cities, VehicleType, Pricing } from '../../models/models.interface';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PricingserviceService } from '../../services/pricingservice.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { percentageRange } from '../../validators/driverProfit-validator';

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css'
})
export class VehiclePricingComponent {
  private _CountryService = inject(AddCountryService);
  private _cityService = inject(CityService);
  private _vehicleTypeService = inject(VehicleTypeService);
  private _pricingService = inject(PricingserviceService)
  private _fb = inject(FormBuilder);
  private _toastr = inject(ToastrService);

  countryList: any;

  PricingList!: Array<Pricing>;
  cityList!: Cities[];
  types!: Array<VehicleType>;
  countryName!: string | null;
  cityName!: string | null;
  selectedVehicleType!: string | null;
  countryId!: string | null;
  typeId!: string | null;
  cityId!: string | null;
  country!: string;
  city!: string;
  type!: string;

  Pricing = this._fb.group({
    countryId: ['', Validators.required],
    cityId: ['', Validators.required],
    typeId: ['', Validators.required],
    driverProfit: [, [Validators.required, Validators.min(0),percentageRange()]],
    minFare: [, [Validators.required, Validators.min(0)]],
    distanceForBasePrice: [, [Validators.required, Validators.min(0)]],
    basePrice: [, [Validators.required, Validators.min(0)]],
    pricePerUnitDistance: [, [Validators.required, Validators.min(0)]],
    pricePerUnitTime_Min: [, [Validators.required, Validators.min(0)]],
    maxSpace: [, [Validators.required, Validators.min(0)]],
  });

  editPrice = this._fb.group({
    PriceId: [''],
    countryId: [''],
    cityId: [''],
    typeId: [''],
    driverProfit: [0, [Validators.min(0),Validators.required]],
    minFare: [0, [Validators.min(0),Validators.required]],
    distanceForBasePrice: [0, [Validators.min(0),Validators.required]],
    basePrice: [0, [Validators.min(0),Validators.required]],
    pricePerUnitDistance: [0, [Validators.min(0),Validators.required]],
    pricePerUnitTime_Min: [0, [Validators.min(0),Validators.required]],
    maxSpace: [0, [Validators.min(0),Validators.required]],
  });


  isFieldInvalid(field: string) {
    const formControl = this.Pricing.get(field);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched);
  }

  ngOnInit() {

    this._pricingService.getAllPricing().subscribe((res) => {
      this.PricingList = res as Pricing[];
      console.log(this.PricingList);
    })

    this._CountryService.getCountry().subscribe((res) => {
      if (Array.isArray(res)) {
        this.countryList = res;
      }
      console.log(this.countryList);
    })
  }

  seletedC(country: string) {
    this.Pricing.patchValue({
      cityId: null,
      typeId: null
    })
    let fo = country.split('+');
    console.log(fo[0]);
    console.log(fo[1]);
    if (this.countryName || this.countryId) { 
      this.countryName = null
      this.countryId = null
    }
    this.countryName = fo[1];
    this.countryId = fo[0];
    console.log(this.countryName);

    this._cityService.getCities(fo[0]).subscribe((res) => {
      console.log(res);
      this.cityList = res as Cities[]
    })
  }

  seletedCities(city: string) {
    let foo = city.split('+');
    let res = foo[1].split(',');
    if (this.cityName || this.cityId) {
      this.cityName = null
      this.cityId = null;
    }
    this.cityName = res[0];
    this.cityId = foo[0];

    this._vehicleTypeService.getAllVehicles('none').subscribe((res) => {
      this.types = res as VehicleType[];
      console.log(this.types);
    })
  }

  selectedType(type: string) {
    let foo = type.split('+');
    if (this.selectedVehicleType || this.typeId) {
      this.selectedVehicleType = null;
      this.typeId = null;
    }
    this.typeId = foo[0];
    this.selectedVehicleType = foo[1];
    console.log(this.selectedVehicleType);
  }

  formSubmit() {
    console.log(this.Pricing);
    if (this.Pricing.valid) {

      let data = {
        vehicleType: this.selectedVehicleType,
        countryName: this.countryName,
        cityName: this.cityName,
        countryId: this.countryId,
        cityId: this.cityId,
        typeId: this.typeId,
        driverProfit: this.Pricing.get('driverProfit')?.value,
        minFare: this.Pricing.get('minFare')?.value,
        distanceForBasePrice: this.Pricing.get('distanceForBasePrice')?.value,
        basePrice: this.Pricing.get('basePrice')?.value,
        pricePerUnitDistance: this.Pricing.get('pricePerUnitDistance')?.value,
        pricePerUnitTime_Min: this.Pricing.get('pricePerUnitTime_Min')?.value,
        maxSpace: this.Pricing.get('maxSpace')?.value,
      }

      this._pricingService.storePricing(data).subscribe((res) => {
        console.log(res);
        this.Pricing.reset();
        this.PricingList.push(res);
        this._toastr.success('The Pricing data stored', 'Success');
      }, (error) => {
        console.log('some error occured', error);
        this._toastr.error('Dublicate entries not allowed', 'Error');
      })
    } else {

      Object.values(this.Pricing.controls).forEach(control => {
        control.markAsTouched();
      });

      this._toastr.warning('Please enter Valid/Your credentials', 'Warning');
      return;
    }
  }

  editBtnClicked(price: Pricing) {
    console.log(price._id);
    this.editPrice.patchValue({
      PriceId: price._id,
      driverProfit: price.driverProfit,
      minFare: price.minFare,
      distanceForBasePrice: price.distanceForBasePrice,
      basePrice: price.basePrice,
      pricePerUnitDistance: price.pricePerUnitDistance,
      pricePerUnitTime_Min: price.pricePerUnitTime_Min,
      maxSpace: price.maxSpace,
      countryId: price.countryId._id,
      cityId: price.cityId._id,
      typeId: price.typeId._id,
    });
    this.country = price.countryId.country;
    this.city = price.cityId.formatted_address;
    this.type = price.typeId.vehicleType;
    console.log(price.maxSpace);
  }

  updateEditedPrice() {
    if (this.editPrice.invalid) {
      this._toastr.warning('Please enter/valid credentials', 'warning');
      return;
    }
    console.log('yoe');
    // console.log(this.editPrice.value);
    let price = this.editPrice.value;
    this._pricingService.updatePrice(price).pipe(
      tap((res) => {
        console.log(res);
        let price = res as Pricing
        let index = this.PricingList.findIndex((obj) => obj._id == price._id);
        this.PricingList[index] = res;
        this._toastr.success('Price Updated Successfully', 'Success');
        this.editPrice.reset();
      }),
      catchError((error) => {
        this._toastr.error('The Zone already exists', 'Error');
        return of(error); // Return observable to handle the error
      })
    ).subscribe()

  }
  get countryID() {
    return this.Pricing.get('countryId');
  }

  get cityID() {
    return this.Pricing.get('cityId');
  }

  get typeID() {
    return this.Pricing.get('typeId');
  }

  get driverProfit() {
    return this.Pricing.get('driverProfit');
  }

  get minFare() {
    return this.Pricing.get('minFare');
  }

  get distanceForBasePrice() {
    return this.Pricing.get('distanceForBasePrice');
  }

  get basePrice() {
    return this.Pricing.get('basePrice');
  }

  get pricePerUnitDistance() {
    return this.Pricing.get('pricePerUnitDistance');
  }

  get pricePerUnitTime_Min() {
    return this.Pricing.get('pricePerUnitTime_Min');
  }
  get maxSpace() {
    return this.Pricing.get('maxSpace');
  }


  get driverProfit2() {
    return this.editPrice.get('driverProfit');
  }

  get distanceForBasePrice2() {
    return this.editPrice.get('distanceForBasePrice');
  }

  get minFare2() {
    return this.editPrice.get('minFare');
  }

  get basePrice2() {
    return this.editPrice.get('basePrice');
  }

  get pricePerUnitDistance2() {
    return this.editPrice.get('pricePerUnitDistance');
  }
  get pricePerUnitTime_Min2() {
    return this.editPrice.get('pricePerUnitTime_Min');
  }

  get maxSpace2() {
    return this.editPrice.get('maxSpace');
  }

}
