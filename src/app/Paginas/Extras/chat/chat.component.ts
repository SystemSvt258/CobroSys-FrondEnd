import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SignalRService } from 'src/app/service/signalr.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  // message: string = '';
  Sms_Recivido: {message: string, user: string}[] = [] ;

  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.ReciveMensaje((sms: string, us: string) => {
      this.Sms_Recivido.push({message:sms,user:us});
    });
  }

  mensaje = new FormControl('', Validators.required)
  sendMessage() {
    this.signalRService.EnvioMensaje(this.mensaje.value!);
    this.mensaje.patchValue('');
  }
}
