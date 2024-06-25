import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { imageValidator } from '../../validators/file-Size-validators';
import { VehicleTypeService } from '../../services/vehicle-type.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateImageObj } from '../../models/models.interface';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
// import { ValidateImageObj } from "../models/models.interface";


interface Vehicle {
  vehicleType: string;
  vehicleIcon: string;
  _id: string;
}

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css'
})
export class VehicleTypeComponent {
  @ViewChild('vehicleTable') table!: ElementRef;

  // injections
  backendUrl = environment.BACKEND_URL
  private _fb = inject(FormBuilder);
  private _vehicleTypeService = inject(VehicleTypeService);
  private _tostrService = inject(ToastrService);


  // valiable
  vehicles: Vehicle[] = []
  message!: string
  isSizeOk: boolean = true;
  isSizeOk2: boolean = true;
  maxFileSize = 2 * 1024 * 1024;
  fileSize!: number
  selectedVehicle!: Vehicle;
  selectedFile!: string;
  ValidateImage!: boolean;
  extensions: Array<string> = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'avif']


  validateImgeObj = {
    extentions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg'],
    ValidateImage: this.ValidateImage
  }

  formData = new FormData();
  formData2 = new FormData();

  vehicleType = this._fb.group({
    vehicleName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
    vehicleIcon: ['', [Validators.required,]]
  });

  editVType = this._fb.group({
    vehicleName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
    vehicleIcon: ['']
  })

  get vehicleName() {
    return this.vehicleType.get('vehicleName')
  }
  get vehicleIcon() {
    return this.vehicleType.get('vehicleIcon')
  }

  get editVehicleType() {
    return this.editVType.get('vehicleName')
  }
  get editVehicleIcon() {
    return this.editVType.get('vehicleIcon')
  }

  ngOnInit() {
    this.loadAllVehicles()
  }

  onFileSelected(event: any) {
    this.formData.delete('vehicleIcon');
    this.formData = new FormData()
    const file = event.target.files[0];
    if (file) {
      const mimeType = file.type.split('/').pop();
      console.log(mimeType);
      if (!mimeType || this.extensions.indexOf(mimeType) === -1) {
        this._tostrService.warning(`${mimeType} type is not allowd`, 'Warning');
        this.vehicleType.get('vehicleIcon')?.reset();
        return;
      }
      this.formData.delete('vehicleIcon');
      this.formData.append('vehicleIcon', event.target.files[0]);

      this.fileSize = file.size
    }
    if (this.fileSize > this.maxFileSize) {
      this.isSizeOk = false
    } else {
      this.isSizeOk = true
    }


    // if (file) {
    //   const mimeType = file.type.split('/').pop();
    //   console.log(mimeType);
    //   if(!mimeType || this.extensions.indexOf(mimeType) === -1){
    //     this._tostrService.warning(`${mimeType} type is not allowd`,'Warning');
    //     // this.userForm.get('userProfile')?.reset();
    //     return;
    //   }

    //   if (this.formData) { this.formData = new FormData() }
    //   this.formData.append('userProfile', file)
    //   // console.log(file);
    // }
  }

  onFileSelected2(event: any) {
    this.formData2.delete('vehicleIcon');
    // console.log(filenew);
    // console.log("her ");
    // console.log(event.target.files[0]);
    const file = event.target.files[0];
    if (file) {
      this.fileSize = file.size
      const mimeType = file.type.split('/').pop();
      console.log(mimeType);
      if (!mimeType || this.extensions.indexOf(mimeType) === -1) {
        this._tostrService.warning(`${mimeType} type is not allowd`, 'Warning');
        this.editVType.get('vehicleIcon')?.reset();
        return;
      }
      this.formData2.append('vehicleIcon', event.target.files[0]);
    }
    if (this.fileSize > this.maxFileSize) {
      this.isSizeOk2 = false
    } else {
      this.isSizeOk2 = true
    }
  }

  addVehicleType() {
    if (this.vehicleType.invalid) {
      this._tostrService.warning('Please fill the details first', 'Warning');
      Object.values(this.vehicleType.controls).forEach(control => {
        control.markAsTouched();
      });
      // console.log(this.vehicleType.controls);      
      return;
    } else if (!/\D/.test(this.vehicleType.get('vehicleName')!.value as string)) {
      this._tostrService.warning('Only numbers are not allowed', 'Warning');
      return;
    }

    if (this.fileSize < this.maxFileSize && this.isSizeOk) {
      // this.isSizeOk = true
      const vehicleType = this.vehicleType.get('vehicleName')!.value
      
      // const vehicleIcon = this.vehicleType.get('vehicleIcon')!.value

      if (vehicleType !== null) {
        this.formData.delete('vehicleType')
        this.formData.append('vehicleType', vehicleType)
      }
      this._vehicleTypeService.addVechicleType(this.formData).pipe(
        tap((res) => {
          // console.log(res);
          this.addNewRow(res)
          this.vehicleType.reset();
          // console.log('here 2');
          this.formData = new FormData()
          this._tostrService.success('data added ', 'sucess')
        }),
        catchError((error) => {
          if (error.status === 409) {
            this._tostrService.error('dublicate vehicle', 'Error');
            this.formData.delete('vehicleType');
            this.vehicleType.get('vehicleType')?.reset()
          } else {
            this._tostrService.error('Some Error Occured', 'Error');
            this.vehicleName?.reset();
            this.formData = new FormData()
          }
          console.log(error);
          // console.log(error.status);
          return of(error)
        })
      ).subscribe();

    } else {
      this.isSizeOk = false
      this._tostrService.warning('Please enter validate entries', 'warning')
    }
  }

  loadAllVehicles() {
    let data = 'none'
    this._vehicleTypeService.getAllVehicles(data).subscribe((response) => {
      if (Array.isArray(response) && response.length === 0) {
        this.message = 'There are no current vehicles';
      } else {
        this.vehicles = response as Vehicle[];
        console.log(this.vehicles);
      }
    })
  }

  editClicked(vehicle: Vehicle) {
    // console.log(vehicle);
    this.selectedVehicle = vehicle;
    this.selectedFile = vehicle.vehicleIcon.slice(14);
    this.editVType.patchValue({
      vehicleName: vehicle.vehicleType,
      // vehicleIcon:vehicle.vehicleIcon
    });
    let id = vehicle._id;
    this.formData2.delete('_id')
    this.formData2.append('_id', id)
    // console.log(id);

  }

  editVehicle() {
    this.formData2.delete('vehicleName');

    let vType = this.editVType.get('vehicleName')!.value;
    let vIcon = this.editVType.get('vehicleIcon')!.value;
    if (vType == this.selectedVehicle.vehicleType && vIcon == undefined) {
      this._tostrService.warning('No changes detected', 'warning');
      return;
    }
    if (vType !== null) {
      this.formData2.append('vehicleName', vType)
    }

    this._vehicleTypeService.editVehicleType(this.formData2).pipe(
      tap((res) => {
        // console.log(res);
        let editedVehicle = res as Vehicle;
        let id = editedVehicle._id;
        const index = this.vehicles.findIndex(vehicle => vehicle._id === id)
        if (index !== -1) {
          this.vehicles[index].vehicleIcon = editedVehicle.vehicleIcon
          this.vehicles[index].vehicleType = editedVehicle.vehicleType
        }
        this.formData2 = new FormData()
        this.editVType.reset();
        this._tostrService.success('Type Updated', 'Sucess')

      }),
      catchError((error) => {
        if (error.status === 409) {
          this._tostrService.error('dublicate vehicle', 'Error');
          this.formData2 = new FormData();


        } else {
          this._tostrService.error('Some Error Occured', 'Error');
        }
        console.log(error);
        // console.log(error.status);
        return of(error)
      })
    ).subscribe();


  }
  addNewRow(res: any) {
    this.vehicles.push(res);
  }
}
