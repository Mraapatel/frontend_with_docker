import { Injectable, inject, signal } from '@angular/core';
import { loaderService } from './loader';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(
    public _loaderService:loaderService
  ) { }
  // spinnerCounter =signal(false)
  // _loaderService = inject(loaderService)


  startSPinner() {
    this._loaderService.startSPinner()
    // console.warn('Inside Sthe startPinner');
    // console.log('value' , this.spinnerCounter());
    
    // this.spinnerCounter.set(true);
    // console.log('value' , this.spinnerCounter());
  }
  
  stopSpinner() {
    this._loaderService.stopSpinner()
    // console.warn('Inside Sthe stopSpinner');
    // console.log('value' , this.spinnerCounter());
    // this.spinnerCounter.set(false);
    // console.log('value' , this.spinnerCounter());
  }
}
