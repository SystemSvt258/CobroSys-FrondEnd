import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { of, Observable } from 'rxjs';
import { ApiService } from '../service/api.service';
import { Alertas } from '../Control/Alerts';
import { Fechas } from '../Control/Fechas';
import { GestorI } from '../Modelos/response.interface';

@Injectable({
  providedIn: 'root',
})
export class Gestor {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService
  ) {}

  ListarElementos(fraccion: number, rango: number, tipo: number) {
    return this.api.GetGestoresTodos(fraccion, rango, tipo).pipe(
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
    return this.api.GetGestoresFracionadoFiltro(valor, tipo).pipe(
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
        throw new Error(error);
      })
    );
  }
  GuardarElemento(elemento: GestorI) {
    if (elemento.id_gestor != 0) {
      return this.api.PutGestores(elemento).pipe(
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
      return this.api.PostGestores(elemento).pipe(
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
  CambiarMetaGlobal(cartera:string, meta:string) {    
      return this.api.GetGestoresGlobales(cartera, meta).pipe(
        map((tracks) => {
          let exito = tracks['exito'];
          let datos = tracks['data'];
          let mensaje = tracks['mensaje'];
          if (exito == '1') {
            return exito;
          } else {
            this.alerta.ErrorEnLaPeticion(mensaje);
            return exito;
          }
        }),
        catchError((error) => {
          console.log(error.status);
          throw this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      );
  }
}
