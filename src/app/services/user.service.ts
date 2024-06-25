import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserData , Card } from '../models/models.interface';
import { userForCreateRide } from '../models/models.interface';
import { environment } from '../../environments/environment.development';

interface UserDataResponse {
  totalUsers: number;
  users: UserData[];
}

interface CardResponse {
  cards: Card[];
  defaultCardId: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  backendUrl = environment.BACKEND_URL
  private _http = inject(HttpClient);

  storeUser(data:FormData){
    return this._http.post(`${this.backendUrl}User/addUser`,data)
  }

  getExistingUser(data:object){
    // let data = {
    //   page:pageNumber,
    //   sort:sortValue
    // }
    // return this._http.post<UserDataResponse>(`${this.backendUrl}User/getUser?page=${pageNumber}&sort=${sortValue}`)
    return this._http.post<UserDataResponse>(`${this.backendUrl}User/getUser`,data);
    // console.log(`In sevice ${pageNumber}`);  
  }

  updateUser(data:FormData){
    console.log(data);
    
    return this._http.post<UserData>(`${this.backendUrl}User/updateUser`,data)
  }

  deleteUser(id:string){
    return this._http.post<UserData>(`${this.backendUrl}User/deleteUser`,{id:id})
  }

  addCard(data:object){
    return this._http.post<Card>(`${this.backendUrl}User/addCard`,data)
  }

  getCards(customerId:string){
    return this._http.post<CardResponse>(`${this.backendUrl}User/getCards`,{stripClientId:customerId})
  }

  setDefaultCard(data:object){
    return this._http.post(`${this.backendUrl}User/setDefaultCard`,data);
  }

  deleteCard(data:object){
    return this._http.post(`${this.backendUrl}User/deleteCard`,data);
  }

  getSinglUser(data:object){
    return this._http.post<userForCreateRide>(`${this.backendUrl}User/getSinglUser`,data);
  }
}
