import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import {
  PermisoDetalleCI,
  PermisoDetalleMI,
  PermisosI,
} from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Permisos {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService
  ) {}
 
 


}
