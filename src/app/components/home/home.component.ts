import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SpinnerService } from '../../services/spinner.service';
import { loaderService } from '../../services/loader';
import { CommonModule } from '@angular/common';
import { BrowserNotificationService } from '../../services/browser-notification.service';
import { SocketIoService } from '../../services/socket-io.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, MatProgressSpinnerModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private _socketIoService = inject(SocketIoService);
  _spinnerService = inject(SpinnerService);
  // _loaderService = inject(loaderService);
  // spinner:boolean = false

  private _browserNotification = inject(BrowserNotificationService)
  public count!: number

  private title = 'Browser Push Notifications!';

  updateCount(count: number) {
    // this.count = parseInt(localStorage.getItem('notificationCount')!)
    this.count = count
  }


  constructor(private _authService: AuthServiceService, public _loaderService: loaderService) {
    this._browserNotification.requestPermission();
    // this.updateCount()
    // console.log(this._loaderService.spinnerCounter)

  }
  ngOnInit() {
    console.log('home component');
    this.getCount();
  }
  getCount() {
    this._socketIoService.emitNewEvent('getCount', {});

    this._socketIoService.listen('updatedCount').pipe(
      tap((res) => {
        console.log('updated count', res);
        this.updateCount(res);
      })
    ).subscribe()
  }

  logOut() {
    this._authService.logout();
  }
}
