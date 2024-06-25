import { Injectable, signal } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class loaderService {

  spinnerCounter = false


  startSPinner() {
    // console.warn('Inside Sthe startPinner');
    // console.log('value' , this.spinnerCounter);
    
    
    // this.spinnerCounter.set(true);
    this.spinnerCounter = true
     console.warn('Start value' , this.spinnerCounter);
  }

//   get toggle():boolean{
//     return this.spinnerCounter
//   }
  
  stopSpinner() {
    // console.warn('Inside Sthe stopSpinner');
    //  console.warn('value' , this.spinnerCounter);
    // this.spinnerCounter.set(false);
    this.spinnerCounter = false
    console.warn('stop value' , this.spinnerCounter);
  }
}
