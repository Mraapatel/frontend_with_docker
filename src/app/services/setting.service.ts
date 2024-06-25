import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Settings } from '../models/models.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private _http = inject(HttpClient)

  constructor() { }
  getSettings() {
    return this._http.get<Settings>('http://localhost:5000/setting')
  }


  storeKeys(data: object) {
    return this._http.post<{
      message: string,
      status: number
    }>('http://localhost:5000/allkeys/update', data)
  }

  getAllKeys() {
    return this._http.post('http://localhost:5000/allkeys/getKeys ', {})
  }
}
