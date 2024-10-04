import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { ApiService } from 'src/app/service/api.service';
import { of, Observable } from 'rxjs';
import { CuentaCarteraI } from '../Modelos/response.interface';

@Injectable({
  providedIn: 'root',
})
export class CuentaCartera {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService
  ) {}

  ListarElementos(fraccion: number, rango: number) {
    return this.api.GetCuentaCarteraFracionado(fraccion, rango).pipe(
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
  FiltrarElementos(valor: string, tipo: number) {
    return this.api.GetCuentaCarteraFracionadoFiltro(valor, tipo).pipe(
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



  GuardarElemento(elemento: CuentaCarteraI) {
    if (elemento.id_cuenta_tipo_cartera != 0) {
      return this.api.PutCuentaCartera(elemento).pipe(
        map((tracks) => {
          let exito = tracks['exito'];
          let mensaje = tracks['mensaje'];
          let datos = tracks['data'];

          if (exito == '1') {
            return exito;
          } else {
            return this.alerta.ErrorEnLaPeticion(mensaje);
          }
        }),
        catchError((error) => {
          console.log(error.status);
          throw this.alerta.ErrorEnLaOperacion();
          // throw new Error(error);
        })
      );
    } else {
      return this.api.PostCuentaCartera(elemento).pipe(
        map((tracks) => {
          let exito = tracks['exito'];
          let mensaje = tracks['mensaje'];
          let datos = tracks['data'];

          if (exito == '1') {
            return exito;
          } else {
            return this.alerta.ErrorEnLaPeticion(mensaje);
          }
        }),
        catchError((error) => {
          console.log(error.status);
          throw this.alerta.ErrorEnLaOperacion();
          // throw new Error(error);
        })
      );
    }
  }
}
