import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserData , Card } from '../models/models.interface';
import { userForCreateRide } from '../models/models.interface';

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

  private _http = inject(HttpClient);

  storeUser(data:FormData){
    return this._http.post('http://localhost:5000/User/addUser',data)
  }

  getExistingUser(data:object){
    // let data = {
    //   page:pageNumber,
    //   sort:sortValue
    // }
    // return this._http.post<UserDataResponse>(`http://localhost:5000/User/getUser?page=${pageNumber}&sort=${sortValue}`)
    return this._http.post<UserDataResponse>(`http://localhost:5000/User/getUser`,data);
    // console.log(`In sevice ${pageNumber}`);
    
  }

  updateUser(data:FormData){
    console.log(data);
    
    return this._http.post<UserData>('http://localhost:5000/User/updateUser',data)
  }

  deleteUser(id:string){
    return this._http.post<UserData>('http://localhost:5000/User/deleteUser',{id:id})
  }

  addCard(data:object){
    return this._http.post<Card>('http://localhost:5000/User/addCard',data)
  }

  getCards(customerId:string){
    return this._http.post<CardResponse>('http://localhost:5000/User/getCards',{stripClientId:customerId})
  }

  setDefaultCard(data:object){
    return this._http.post('http://localhost:5000/User/setDefaultCard',data);
  }

  deleteCard(data:object){
    return this._http.post('http://localhost:5000/User/deleteCard',data);
  }

  getSinglUser(data:object){
    return this._http.post<userForCreateRide>('http://localhost:5000/User/getSinglUser',data);
  }
}
