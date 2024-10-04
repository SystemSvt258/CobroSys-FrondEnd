import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, timeout } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { Tipo_CarteraI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-actualizar',
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.css'],
})
export class ActualizarComponent implements OnInit {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService
  ) {}

  ngOnInit(): void {
    this.ConteoCreditos();
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Rol: string = this.Usuario.ges_rol;
  MenuAcceso: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.MenuAcceso.find((elemento) => {
    return elemento.men_url === 'actualizar';
  }) as ResultadoMenuI;

  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);

  PaginaNombre: string = this.PaginaActual.men_descripcion;

  FraccionDatos: number = 0;
  DatosGeneralAct: any[]=[];

  ActualizarValores(IdCartera:number) {
    if (this.Rol == 'ADMINISTRADOR') {
      const CargandoLoad = document.getElementById(
        'Cargando'
      ) as HTMLInputElement;
      CargandoLoad.classList.add('modal--show');
      this.api
        .GetCxcOperacionFracionadoFiltro(IdCartera.toString(), 12)
        .pipe(
          map((tracks) => {
            CargandoLoad.classList.remove('modal--show');
            let datos = tracks['data'];
            if(datos.exito == 0){
              this.alerta.ErrorEnLaPeticion(datos.message);
            }
            if(datos.exito == 1){              
              this.alerta.ExitoEnLaPeticion(datos.cont1 +' ' + datos.message);
            }
            
          }),
          catchError((error) => {
            CargandoLoad.classList.remove('modal--show');
            this.alerta.ErrorEnLaPeticion(error);
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.alerta.AlertaEnLaPeticion(
        'No tiene permisos para realizar esta acción'
      );
    }
  }
  ConteoCreditos() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');

    this.api
      .GetCxcOperacionFracionadoFiltro('A', 11)
      .pipe(
        map((tracks) => {
          CargandoLoad.classList.remove('modal--show');
          let datos = tracks['data'];
          this.DatosGeneralAct = datos;
        }),
        catchError((error) => {
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorEnLaPeticion(error);
          throw new Error(error);
        })
      )
      .subscribe();
  }
}
