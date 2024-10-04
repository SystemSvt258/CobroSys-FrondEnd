import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { ApiService } from 'src/app/service/api.service';
import { SignalRService } from 'src/app/service/signalr.service';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import {
  EditUsuarioI,
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { UsuariosI } from 'src/app/Modelos/response.interface';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService,
    private router: Router,
    public validar: TipoDeTexto
  ) {}

  chkAcepta = new FormControl(); ///   valor del elemento  chk
  txtNueva = new FormControl();
  txtConfirmar = new FormControl();

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'perfil';
  }) as ResultadoMenuI;
  PaginaNombre: string = this.PaginaActual.men_descripcion;

  ngOnInit(): void {
    this.InformacionUsuario();
  }

  UsuarioInfo: any | null = null;
  InformacionUsuario() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.UsuarioInfo = null;
    this.api
      .GetUsuariosFracionadoFiltro(this.cookeService.get('usuarioId'), 10)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.UsuarioInfo = datos;
          CargandoLoad.classList.remove('modal--show');
        }),
        catchError((error) => {
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  async CambiarImgPerfil() {
    const { value: file } = await Swal.fire({
      title: 'Seleccionar imagen',
      input: 'file',
      showCloseButton: true,
      inputAttributes: {
        accept: 'image/*',
        'aria-label': '',
      },
    }
  );

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        Swal.fire({
          width: '300px',
          // heightAuto: '75px',
          // title: 'Imagen cargada',
          imageUrl: e.target!.result!.toString(),
          // imageAlt: 'La imagen cargada',
          showCloseButton: true,
          showConfirmButton: true,
          showCancelButton: true,
          cancelButtonColor: 'red',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#5cb85c',
          confirmButtonText: 'Guardar',
        }).then((result) => {
          if (result.isConfirmed) {
            let unaImagen = Object.assign(file);
            unaImagen.archivo = file;

            this.api.PotsSubirImagen(unaImagen).subscribe((data) => {
              let exito = data['exito'];
              const url = data['data'];
              if (exito == '1') {
                let perfilUsuario: EditUsuarioI = {
                  idusuario: this.UsuarioInfo.id_usuario,
                  valor: url,
                  tipo: 1,
                };

                this.api.PutUsuariosEdit(perfilUsuario).subscribe((data) => {
                  let exito = data['exito'];
                  if (exito === 1) {
                    this.cookeService.delete('img');

                    Swal.fire({
                      position: 'center',
                      icon: 'success',
                      title: 'Cambios Efectuados Correctamente!',
                      showConfirmButton: false,
                      timer: 1500,
                    });

                    this.cookeService.set('img', url);
                    setTimeout(() => {
                      location.reload();
                    }, 100);
                  } else {
                    Swal.fire('Error en la base de datos!', '', 'error');
                  }
                });
              } else {
                Swal.fire('Error al Intentar Subir la Imagen!', '', 'error');
              }
            });
          } else if (result.isDenied) {
            Swal.fire('No se Efectuaron Cambios', '', 'info');
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }










  EliminarImgPerfil() {
    Swal.fire({
      title: 'Esta seguro de eliminar la imagen de perfil?',
      // showDenyButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: 'red',
      confirmButtonText: 'Aceptar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let perfilUsuario: EditUsuarioI = {
          idusuario: this.UsuarioInfo.id_usuario,
          valor: '',
          tipo: 1,
        };

        this.api.PutUsuariosEdit(perfilUsuario).subscribe((data) => {
          let exito = data['exito'];
          if (exito === 1) {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cambios Efectuados Correctamente!',
              showConfirmButton: false,
              timer: 1500,
            });
            this.cookeService.delete('img');
            setTimeout(() => {
              location.reload();
            }, 100);
          } else {
            Swal.fire('Error en la base de datos!', '', 'error');
          }
        });
      } else if (result.isDenied) {
        Swal.fire('No se Efectuaron Cambios', '', 'info');
      }
    });
  }

  TerminosCondiciones() {
    Swal.fire('No Se Podran Revertir Los Cambios Generados');
  }

  CambiarClave() {
    if (this.chkAcepta.value == null || this.chkAcepta.value == false) {
      Swal.fire('Esta de Acuerdo con los terminos y Condiciones');
    } else {
      if (this.txtNueva.value === null && this.txtConfirmar.value === null) {
        Swal.fire('No Ingreso Ningun Valor');
      } else if (
        this.txtNueva.value === this.txtConfirmar.value &&
        this.txtNueva.value != null
      ) {
        Swal.fire({
          title: 'Esta Seguro Que Desea Guardar Los Cambios?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          denyButtonText: `No Guardar`,
        }).then((result) => {
          if (result.isConfirmed) {
            let PasswordUsuario: EditUsuarioI = {
              idusuario: this.UsuarioInfo.id_usuario,
              valor: this.txtNueva.value,
              tipo: 0,
            };
            this.api.PutUsuariosEdit(PasswordUsuario).subscribe((data) => {
              let exito = data['exito'];
              if (exito === 1) {
                Swal.fire('Cambios Efectuados Correctamente!', '', 'success');
                localStorage.removeItem('usuario');
                this.cookeService.delete('token_cs');
                this.cookeService.delete('usuarioId');
                this.cookeService.delete('cartera_desc');
                this.cookeService.delete('id_cartera');
                this.cookeService.delete('token');
                this.cookeService.delete('usuario_sd');
                this.cookeService.delete('img');
                this.alerta.SuccessTop_End('Sesión Cerrada');
                this.router.navigate(['login']);
              } else {
                Swal.fire('No se Efectuaron los Cambios!', '', 'error');
              }
            });
          } else if (result.isDenied) {
            Swal.fire('No se Efectuaron Cambios', '', 'info');
          }
        });
      } else {
        Swal.fire('Las Contraceñas "No" Coinciden');
      }
    }
  }

}
