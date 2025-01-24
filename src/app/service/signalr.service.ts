import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { ApiService } from './api.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  hubConnection!: signalR.HubConnection;

  constructor(
    private api: ApiService) { }

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.api.url.substring(0, this.api.url.length - 4)+'R_Message', { withCredentials: true })
    .build();

    this.hubConnection
      .start()
      .then(() => console.log('Conectado'))      
      .catch(err => console.log('Sin Conexión'));
  }
 
  EnvioMensaje = async (message: string) => {
    this.api.GetEnvioMensaje(message, 'juan',0).pipe(map(x => {console.log(x)})).subscribe()
  };


  ReciveMensaje = (callback: (message: string, user : string, res:boolean) => void) => {    
    this.hubConnection.on('E_Message', callback);
  };
}
