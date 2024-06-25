import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Settings } from '../models/models.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private _http = inject(HttpClient)
  backendUrl:string = environment.BACKEND_URL

  constructor() { }
  getSettings() {
    return this._http.get<Settings>(`${this.backendUrl}setting`)
  }


  storeKeys(data: object) {
    return this._http.post<{
      message: string,
      status: number
    }>(`${this.backendUrl}allkeys/update`, data)
  }

  getAllKeys() {
    return this._http.post(`${this.backendUrl}allkeys/getKeys `, {})
  }
}
