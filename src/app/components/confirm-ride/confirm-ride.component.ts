import { Component, inject } from '@angular/core';
import { SocketIoService } from '../../services/socket-io.service';
import { ActiveDriver, Ride, VehicleType, assignedRidesWithDriver, singleUser } from '../../models/models.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmRideService } from '../../services/confirm-ride.service';
import { catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RunningRequestService } from '../../services/running-request.service';
import { BrowserNotificationService } from '../../services/browser-notification.service';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HomeComponent } from '../home/home.component';
import { Router } from '@angular/router'


interface RideComp_Res {
  userPayment: string;
  driverPayment: string;
  status: number;
  rideStatus: number | null;
  rideId: string;
}

@Component({
  selector: 'app-confirm-ride',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './confirm-ride.component.html',
  styleUrl: './confirm-ride.component.css'
})
export class ConfirmRideComponent {
  private _socketIoService = inject(SocketIoService);
  private _fb = inject(FormBuilder);
  private _confirmRideService = inject(ConfirmRideService);
  private _toster = inject(ToastrService);
  private _runningRequestService = inject(RunningRequestService);
  private _confirmRiedService = inject(ConfirmRideService);
  private _browserNotification = inject(BrowserNotificationService);
  private _router = inject(Router)
  private _http = inject(HttpClient);

  private _home = inject(HomeComponent)


  STRIPE!: Stripe | null;
  pageNumber: number = 1;
  totalRides!: number;
  limit: number = 3;
  searchTerm: string = ''
  RidesFetched!: Array<Ride>;
  confirmRideForm!: FormGroup;
  fetchedVehicleTypes: Array<VehicleType> = [];
  selectedRide!: Ride;
  ActiveDrivers: ActiveDriver[] = [];
  RidesUser!: singleUser;
  selectedDriver!: ActiveDriver;
  returnedRideInfo!: assignedRidesWithDriver;
  rideInfoOfSelectedRide!: Ride

  ngOnInit() {
    this._runningRequestService.listenToIncomingRides().subscribe({
      next: (res: assignedRidesWithDriver) => {
        this.returnedRideInfo = res
        let index = this.RidesFetched.findIndex((r) => r._id === this.returnedRideInfo._id)
        this.RidesFetched[index] = this.returnedRideInfo
        // console.log('this.returnedRideInfo', this.returnedRideInfo);
        console.log('this.RidesFetched[index]', this.RidesFetched[index]);
      }
    });

    this._socketIoService.listen('acceptedRideWithDriver').pipe(
      catchError((error) => {
        this._toster.error('Error getting the acceptedRideWithDriver', 'Error');
        return of(error)
      })).subscribe({
        next: (res: assignedRidesWithDriver) => {
          let index = this.RidesFetched.findIndex((r) => r._id === res._id)
          console.log(res);
          this.RidesFetched[index].rideStatus = res.rideStatus
        }
      })

    this.confirmRideForm = this._fb.group({
      searchTerm: [''],
      rideStatus: [''],
      vechicleType: [''],
      date: ['']
    });


    let details = {
      limit: this.limit,
      page: this.pageNumber,
      rideStatus: parseInt(this.confirmRideForm.get('rideStatus')?.value),
      date: this.confirmRideForm.get('date')?.value,
      searchTerm: '',
      vechicleType: this.confirmRideForm.get('vechicleType')?.value
    }
    this.fetchRides(details);
    this.fetcheTypes();
    this.listningToRejectedRide();
    this.listningToCronFormManullyAssignedRides();
    this.listningToCron();
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


  AssingBtnClicked(ride: Ride) {
    this.selectedRide = ride;
    this.RidesUser = ride.userId;
    let data = {
      cityId: this.selectedRide.cityId,
      typeId: this.selectedRide.typeId._id,
      rideStatus: 0
    }
    this._confirmRiedService.getDriverForAssignRide(data).pipe(
      catchError((error) => {
        this._toster.error('Error fetching the active drivers', 'Error');
        return of(error)
      })
    ).subscribe({
      next: (res: { message: string, driverArray: ActiveDriver[] }) => {
        this.ActiveDrivers = res.driverArray;
        console.log(res);

      }
    })
  }

  notify(val: string) {
    let data = {
      'title': 'Running Requests',
      'alertContent': `Driver Not Found! - for ${val}`
    };
    this._browserNotification.generateNotification(data);
  }

  rideInfo(ride: Ride) {
    this.rideInfoOfSelectedRide = ride
    console.log('this.rideInfoOfSelectedRide', this.rideInfoOfSelectedRide);
  }

  // ----------------------------------------------------cancleTheRide--------------------------------------------
  cancleTheRide(rideId: string, driverId: string | undefined) {
    if (!confirm('Are you sure , You want to delete this Ride ?')) {
      return;
    }
    let data
    if (driverId) {
      data = {
        rideId: rideId, driverId: driverId
      }
    } else {
      data = {
        rideId: rideId, driverId: driverId
      }
    }
    this._confirmRideService.cancleRide(data).pipe(
      catchError((e) => {
        console.log('error in catchError', e);
        this._toster.error('Some Error Occured While cancling the ride', 'Error')
        return of(e)
      }),
    ).subscribe({
      next: (res) => {
        console.log('res in next', res);
        this._toster.success('Ride Cancled Successfully', 'Success');
        console.log('r._id', this.RidesFetched[0]._id);
        console.log('res.rideId', res.rideId);
        let index = this.RidesFetched.findIndex((r) => r._id === res.rideId);
        console.log('r');

        if (index !== -1) {

          console.log('index', index);
          console.log('this.ridesfetched', this.RidesFetched[index]);

          this.RidesFetched.splice(index, 1)
        }
      }
    })
  }

  // ----------------------------------------------------rideStarted--------------------------------------------

  rideStarted(rideId: string, driverId: string) {
    this._confirmRideService.rideStarted(rideId, driverId).pipe(
      catchError((e) => {
        console.log('error in catchError', e);
        this._toster.error('Some Error Occured While starting the ride', 'Error')
        return of(e)
      }),
    ).subscribe({
      next: (res) => {
        console.log('res in next', res);
        this._toster.success('Ride started Successfully', 'Success');
        console.log('r._id', this.RidesFetched[0]._id);
        console.log('res.rideId', res.rideId);

        let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
        this.RidesFetched[index].rideStatus = res.rideStatus
        console.log('index', index);
      }
    })
  }

  // ----------------------------------------------------rideArrived--------------------------------------------

  rideArrived(rideId: string, driverId: string) {
    this._confirmRideService.rideArrived(rideId, driverId).pipe(
      catchError((e) => {
        console.log('error in catchError', e);
        this._toster.error('Some Error Occured While Changing Arrived Status of ride', 'Error')
        return of(e)
      }),
    ).subscribe({
      next: (res) => {
        console.log('res in next', res);

        this._toster.success('Driver Arrived Successfully', 'Success');
        let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
        this.RidesFetched[index].rideStatus = res.rideStatus
      }
    })

  }

  // ----------------------------------------------------ridePicked--------------------------------------------

  ridePicked(rideId: string, driverId: string) {
    this._confirmRideService.ridePicked(rideId, driverId).pipe(
      catchError((e) => {
        console.log('error in catchError', e);
        this._toster.error('Some Error Occured While Changing Pick Status of ride', 'Error')
        return of(e)
      }),
    ).subscribe({
      next: (res) => {
        console.log('res in next', res);

        this._toster.success('user Picked Successfully', 'Success');
        let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
        this.RidesFetched[index].rideStatus = res.rideStatus

      }
    })

  }

  // ----------------------------------------------------rideCompleted--------------------------------------------

  rideCompleted(rideId: string, driverId: string) {
    this._confirmRideService.rideCompleted(rideId, driverId).pipe(
      catchError((e) => {
        console.log('error in catchError', e);
        this._toster.error('Some Error Occured While seting RideCompleted the ride', 'Error')
        return of(e)
      }),
    ).subscribe({
      next: (res: RideComp_Res) => {
        console.log('res in next', res);
        if (res.status == 201) {
          this._toster.info('Please complete the Payment by clicking Complete ', 'Success');
          window.location.replace(res.userPayment);
        } else {
          this._toster.success(res.userPayment, 'Success');
          this._toster.success(res.driverPayment, 'Success');
          let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
          this.RidesFetched.splice(index, 1);
          this._router.navigate(['home/rideHistory'] )
        }
      }
    })
  }



  ActionBtn(rideStatus: number, rideId: string, driverId: string | undefined) {

    if (rideStatus === 5) {
      this.rideStarted(rideId, driverId!)
    } else if (rideStatus === 4) {
      this.rideArrived(rideId, driverId!)
    } else if (rideStatus === 2) {
      this.ridePicked(rideId, driverId!)
    } else if (rideStatus === 3) {
      this.rideCompleted(rideId, driverId!)
      // let clientKey
      // this._http.post('http://localhost:5000/test', {}).subscribe({
      //   next: (res) => {
      //     clientKey = res
      //   }
      // });
      // const items = [{ id: "xl-tshirt" }];
      // const appearance = {
      //   theme: 'stripe',
      // };

      // let   elements = this.STRIPE!.elements({ appearance, clientKey });


    }
  }

  // ----------------------------------------------------updateListFromCron /NoDriverRemaining-ByCron /PutRideOnHold-FromCron--------------------------------------------

  listningToCron() {
    this._socketIoService.listen('updateListFromCron').pipe(
      catchError((error) => {
        this._toster.error('Error getting the rides form cron', 'Error');
        return of(error)
      })).subscribe({
        next: (res: assignedRidesWithDriver) => {
          let index = this.RidesFetched.findIndex((r) => r._id === res._id)
          console.log('index', index);
          if (index !== -1) {
            this.RidesFetched[index].driverId = res.driverId;
            this.RidesFetched[index].rideStatus = res.rideStatus;
            console.log('inside the updateListFromCron ', res);
          }
        }
      })

    this._socketIoService.listen('NoDriverRemaining-ByCron').pipe(
      catchError((error) => {
        this._toster.error('Error getting the rides form cron', 'Error');
        return of(error)
      })).subscribe({
        next: (res: { rideId: string, rideStatus: number }) => {
          let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
          console.log('index', index);

          if (index !== -1) {
            console.warn('NoDriverRemaining-ByCron', res.rideId);
            this.RidesFetched[index].rideStatus = res.rideStatus;
            console.log('notify', this.RidesFetched[index].userId.userName);
            this.notify(this.RidesFetched[index].userId.userName)
            this.RidesFetched[index].driverId = null;
            this._socketIoService.emitNewEvent('updateCount', {});
          }
          console.log(res);
        }
      })

    this._socketIoService.listen('PutRideOnHold-FromCron').pipe(
      catchError((error) => {
        this._toster.error('Error getting the rides form cron', 'Error');
        return of(error)
      })).subscribe({
        next: (res: { rideId: string, rideStatus: number }) => {
          let index = this.RidesFetched.findIndex((r) => r._id == res.rideId);
          console.log('index of ride matchd ', index);
          if (index !== -1) {
            this.RidesFetched[index].rideStatus = res.rideStatus;
            this.RidesFetched[index].driverId = null;
          }
          console.log(res);
        }
      })
  }

  // ----------------------------------------------------TimesUpForAssigndRides--------------------------------------------


  listningToCronFormManullyAssignedRides() {
    this._socketIoService.listen('TimesUpForAssigndRides').pipe(
      catchError((error) => {
        this._toster.error('Error getting the rides form cron', 'Error');
        return of(error)
      })).subscribe({
        next: (res: Array<string>) => {
          this.RidesFetched.forEach((r, index) => {
            if (res.includes(r._id)) {
              this.RidesFetched[index].driverId = null
              this.RidesFetched[index].rideStatus = 9
              this.notify(this.RidesFetched[index].userId.userName )
            }
          })

          this._socketIoService.emitNewEvent('updateCount', {});
          console.log(res);
        }
      })
  }

  // ----------------------------------------------------assignAnyAvailableDriver--------------------------------------------

  assignAnyAvailableDriver(rideId: string) {
    this._confirmRideService.assignNearestDriver(rideId).pipe(
      catchError((e) => {
        this._toster.error('Error occured while Assigning drivers', 'Error');
        return of(e)
      })
    ).subscribe({
      next: (res: Ride) => {
        console.log(res);

        let index = this.RidesFetched.findIndex((r) => r._id === this.selectedRide._id)
        // if (this.RidesFetched[index].nearest) {
          this.RidesFetched[index].nearest = true;
          // this.RidesFetched[index].nearest = res.nearest;
          this.selectedRide.nearest = true;
          // this.selectedRide.nearest = res.nearest;
        // }
      }
    })
  }

  // ----------------------------------------------------AssignDriverToRide--------------------------------------------

  AssignDriverToRide(driver: ActiveDriver) {
    this.selectedDriver = driver;
    console.log('selectedDriver', this.selectedDriver.driverName);
    let data = {
      rideId: this.selectedRide._id,
      driverId: driver._id,
      rideStatus: 1
    }
    this._confirmRideService.assignDriverToRide(data).subscribe({
      error: (error) => {
        if (error.error.message === 'faild to assign driver') {
          this._toster.error('No Ride found', 'Error')
        }
        this._toster.error('Error Occured while ')
      }
    })
  }

  // ----------------------------------------------------listningToRejectedRide--------------------------------------------

  listningToRejectedRide() {
    this._socketIoService.listen('rejectedRideByDriver').pipe(
      catchError((error) => {
        this._toster.error('Error getting the acceptedRideWithDriver', 'Error');
        return of(error)
      })).subscribe({
        next: (res: Ride) => {
          let index = this.RidesFetched.findIndex((r) => r._id === res._id);
          this.RidesFetched[index].driverId = null;
          this.RidesFetched[index].rideStatus = res.rideStatus
          console.log(res);
        }
      })
  }

  // ----------------------------------------------------fetcheTypes--------------------------------------------

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


  previousBtn() {
    if (this.disablePrevBnt()) {
      this._toster.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = this.pageNumber > 1 ? --this.pageNumber : 1
    console.log(this.pageNumber);
    let details = {
      limit: this.limit,
      rideStatus: parseInt(this.confirmRideForm.get('rideStatus')?.value),
      page: this.pageNumber,
      date: this.confirmRideForm.get('date')?.value,
      searchTerm: this.confirmRideForm.get('searchTerm')?.value,
      vechicleType: this.confirmRideForm.get('vechicleType')?.value
    }
    this.fetchRides(details)
  }

  nextBtn() {
    if (this.disableNextBnt()) {
      this._toster.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = ++this.pageNumber
    console.log(this.pageNumber);
    let details = {
      limit: this.limit,
      rideStatus: parseInt(this.confirmRideForm.get('rideStatus')?.value),
      page: this.pageNumber,
      date: this.confirmRideForm.get('date')?.value,
      searchTerm: this.confirmRideForm.get('searchTerm')?.value,
      vechicleType: this.confirmRideForm.get('vechicleType')?.value
    }
    this.fetchRides(details);
  }


  fetchRides(details: object) {
    this._confirmRideService.getRides(details).pipe(
      catchError((error) => {
        this._toster.error('Error while fetching the Rides', 'Error');
        return of(error)
      })
    ).subscribe({
      next: (res: { Rides: [Ride], totalRides: number }) => {
        this.RidesFetched = res.Rides;
        this.totalRides = res.totalRides;
        console.log('totalRide', this.totalRides);
        console.log(this.RidesFetched);
        console.log(res);

        if (res.Rides.length > 0) {
          this._toster.success('Ride Fetched Successfully', 'Success');
        } else {
          this._toster.warning('No Rides Found', 'Warning');
        }
      }
    })
  }

  searchRides(val: string) {
    let formValues = this.confirmRideForm.value
    console.log('dateeeee', this.confirmRideForm.get('date')?.value);

    if (!Object.values(formValues).some(value => value !== '')) {
      this._toster.info('There is nothing to Apply', 'Info');
      return;
    }
    let details = {
      limit: this.limit,
      rideStatus: parseInt(this.confirmRideForm.get('rideStatus')?.value),
      page: this.pageNumber,
      date: this.confirmRideForm.get('date')?.value,
      searchTerm: this.confirmRideForm.get('searchTerm')?.value,
      vechicleType: this.confirmRideForm.get('vechicleType')?.value
    }
    this.fetchRides(details)
  }

  ClearFilter() {
    let formValues = this.confirmRideForm.value
    if (!Object.values(formValues).some(value => value !== '')) {
      this._toster.info('There is nothing to clear', 'Info');
      return;
    }
    this.confirmRideForm.reset();


    let details = {
      limit: this.limit,
      rideStatus: parseInt(this.confirmRideForm.get('rideStatus')?.value),
      page: this.pageNumber,
      date: this.confirmRideForm.get('date')?.value,
      searchTerm: this.confirmRideForm.get('searchTerm')?.value,
      vechicleType: this.confirmRideForm.get('vechicleType')?.value
    }
    this.fetchRides(details);
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
    if (this.totalRides == this.pageNumber * this.limit) {
      return true;
    } else if (this.totalRides < this.pageNumber * this.limit) {
      return true;
    } else if (this.RidesFetched) {
      if (this.RidesFetched.length < 0) {
        return true;
      }
    } else if (this.pageNumber == 0) {
      return true;
    }
    return false
  }
}
