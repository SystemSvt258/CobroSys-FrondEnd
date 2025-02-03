import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { ApiService } from '../service/api.service';
import { catchError, map, Observable, of } from 'rxjs';
import { Alertas } from '../Control/Alerts';

@Injectable({
  providedIn: 'root',
})

export class CargaArchivos {
  pdfUrl: string | null = null;
  originalUrl: string | null = null;

  constructor(private http: HttpClient, private api: ApiService, private alerta: Alertas) {}


  SubirArchivo(entidad: string, selectedFile: File): Observable<any> {
    if (!selectedFile) return of([]);

    const formData = new FormData();
    formData.append('file', selectedFile);

    return this.api.PostSinIncriptar('Document/'+entidad, formData).pipe(
      map((tracks) => {
        let exito = tracks['exito'];
        let mensaje = tracks['mensaje'];
        let datos = tracks['data'];

        if (exito == '1') {
          return tracks;
        } else {
          return this.alerta.ErrorEnLaPeticion(mensaje);
        }
      }),
      catchError((error) => {
        console.log(error.status);
        throw this.alerta.ErrorEnLaOperacion();
      })
    );
  }
}
