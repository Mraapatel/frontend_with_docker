import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { loggedInGuard } from './routeGuards/logged-in.guard';
import { RunningRequestComponent } from './components/running-request/running-request.component';
// import { HomeComponent } from './components/home/home.component';
// import { VehicleTypeComponent } from './components/vehicle-type/vehicle-type.component';
// import { AddCountryComponent } from './components/add-country/add-country.component';
// import { CityComponent } from './components/city/city.component';
// import { VehiclePricingComponent } from './components/vehicle-pricing/vehicle-pricing.component';
// import { SettingComponent } from './components/setting/setting.component';
// import { UserComponent } from './components/user/user.component';
// import { DriverListComponent } from './components/driver-list/driver-list.component';

export const routes: Routes = [
    {
        path: '', redirectTo: '/login', pathMatch: "full"
    },
    {
        path: 'login', component: AdminComponent, title: 'login'
        //  loadChildren:()=> import('./components/admin/admin.component').then((c) => c.AdminComponent)
    },
    {
        path: 'home', loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent), title: 'Home', canActivate: [loggedInGuard],
        children: [
            {
                path: 'vehicle_type', loadComponent: () => import('./components/vehicle-type/vehicle-type.component').then(c => c.VehicleTypeComponent), canActivate: [loggedInGuard], title: 'Vehicle-type'
            },
            {
                path: 'add_country', loadComponent: () => import('./components/add-country/add-country.component').then(c => c.AddCountryComponent), canActivate: [loggedInGuard], title: 'Country'

            },
            {
                path: 'city', loadComponent: () => import('./components/city/city.component').then(c => c.CityComponent), canActivate: [loggedInGuard], title: 'city'
            }
            ,
            {
                path: 'Vehicle_Pricing', loadComponent: () => import('./components/vehicle-pricing/vehicle-pricing.component').then(c => c.VehiclePricingComponent), canActivate: [loggedInGuard], title: 'Vehicle-Pricing'
            },
            {
                path: 'setting', loadComponent: () => import('./components/setting/setting.component').then(c => c.SettingComponent), canActivate: [loggedInGuard], title: 'Setting'
            },
            {
                path: 'user', loadComponent: () => import('./components/user/user.component').then(c => c.UserComponent), canActivate: [loggedInGuard], title: 'User'
            },
            {
                path: 'driverList', loadComponent: () => import('./components/driver-list/driver-list.component').then(c => c.DriverListComponent), canActivate: [loggedInGuard], title: 'Driver-List'
            },
            {
                path: 'createRide', loadComponent: () => import('./components/create-ride/create-ride.component').then(c => c.CreateRideComponent), canActivate: [loggedInGuard], title: 'Create-Ride'
            },
            {
                path: 'confirmRide', loadComponent: () => import('./components/confirm-ride/confirm-ride.component').then(c => c.ConfirmRideComponent), canActivate: [loggedInGuard], title: 'Confirm-Ride'
            },
            {
                path: 'runningRequest', loadComponent: () => import('./components/running-request/running-request.component').then(c => c.RunningRequestComponent), canActivate: [loggedInGuard], title: 'Running-Request'
                // path: 'runningRequest', component: RunningRequestComponent, canActivate: [loggedInGuard], title: 'running-Request'
            },
            {
                path: 'rideHistory', loadComponent: () => import('./components/ride-history/ride-history.component').then(c => c.RideHistoryComponent), canActivate: [loggedInGuard], title: 'Ride-History'
                // path: 'runningRequest', component: RunningRequestComponent, canActivate: [loggedInGuard], title: 'running-Request'
            },
        ]
    },


];




// export const routes: Routes = [
//     {
//         path: '', redirectTo: '/login', pathMatch: "full"
//     },
//     {
//         path: 'login', component: AdminComponent, title: 'login'
//         //  loadChildren:()=> import('./components/admin/admin.component').then((c) => c.AdminComponent)
//     },
//     {
//         path: 'home', component: HomeComponent, title: 'Home', canActivate: [loggedInGuard],
//         children: [
//             {
//                 path: 'vehicle_type', component: VehicleTypeComponent, title: 'Vehicle-type'
//                 // loadChildren:()=> import('./components/vehicle-type/vehicle-type.component').then((c) => c.VehicleTypeComponent)
//             },
//             {
//                 path: 'add_country', component: AddCountryComponent, title: 'Country'

//             },
//             {
//                 path: 'city', component: CityComponent, title: 'city'
//             }
//             ,
//             {
//                 path: 'Vehicle_Pricing', component: VehiclePricingComponent, title: 'Vehicle-Pricing'
//             },
//             {
//                 path: 'setting', component: SettingComponent, title: 'Setting'
//             },
//             {
//                 path: 'user', component: UserComponent, title: 'User'
//             },
//             {
//                 path: 'driverList', component: DriverListComponent, title: 'Driver-List'
//             }
//         ]
//     },


// ];
