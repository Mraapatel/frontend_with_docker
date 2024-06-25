import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client'
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  backendUrl = environment.BACKEND_URL
  url = environment.sockerUrl;
  option = {
    withcredentials: true,
    extraHeaders: {
      'Access-control-Allow-Origin': `${this.backendUrl}`,
      'Access-control-Allow-Credentials': true
    }
  }

  private socket !: Socket

  constructor() {
    this.socket = io(this.url, {
      // withCredentials: true,
      extraHeaders: {
        // 'Access-control-Allow-Origin': 'http://localhost:4200',
        // 'Access-control-Allow-Credentials': 'true'
      }
    });
    this.connect()
  }

  connect() {
    this.socket.on('connect', () => {
      console.log('inside connect');
      this.socket.emit('formClient', 'hellow form theh cient');
      console.log(this.socket.id);
    })
  }

  dissconnect() {
    this.socket.on('disconnect', () => {
      console.log(this.socket.id);
    })
  }

  listen(event: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(event, (data) => {
        subscriber.next(data);
      })
    })
  }   

  emitNewEvent(event: string, data: object) {
    this.socket.emit(event, data)
  }
}
