import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { ApiService } from 'src/app/service/api.service';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Conectividad {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService
  ) {}

  ListarElementos(fraccion: number, rango: number) {
    return this.api.GetConectividadFracionado(fraccion, rango).pipe(
      map((tracks) => {
        let exito = tracks['exito'];
        let datos = tracks['data'];
        let mensaje = tracks['mensaje'];
        if (exito == '1') {
          if (Array.isArray(datos) && datos.length > 0 || typeof datos === 'object' && datos !== null) {
            return datos;
          } else {
            this.alerta.NoExistenDatos();
            return [];
          }
        } else {
          this.alerta.ErrorEnLaPeticion(mensaje);
          return [];
        }
      }),
      catchError((error) => {
        console.log(error.status);
        throw this.alerta.ErrorAlRecuperarElementos();
        // throw new Error(error);
      })
    );
  }
}
