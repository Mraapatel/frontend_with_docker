import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { Observable } from 'rxjs';
import { AuthServiceService } from './services/auth-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,AdminComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // private authService = inject(AuthServiceService)

  // private isIdle!:Observable<boolean>;

  // ngOnInit(){
  //   this.isIdle = this.authService.IdleState
  //   console.log(this.isIdle);
    
  // }
  
}
