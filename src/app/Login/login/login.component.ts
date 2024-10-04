import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import {
  LoginI,
  LoginISD,
  ResultadoCarteraI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [
    {
      provide: CarouselConfig,
      useValue: { interval: 1500, noPause: true, showIndicators: true },
    },
  ],
})
export class LoginComponent implements OnInit {
  constructor(
    private api: ApiService,
    private router: Router,
    private cookieService: CookieService,
    private alerta: Alertas
  ) {}
  ngOnInit(): void {
    this.checkLocal();
  }
  checkLocal() {
    if (this.cookieService.get('token_cs')) {
      this.router.navigate(['inicio']);
    }
  }

  loginForm = new FormGroup({
    usr_usuario: new FormControl('', Validators.required),
    usr_password: new FormControl('', Validators.required),
    cambio: new FormControl(),
    servidata: new FormControl(true),
  });

  errorStatus: boolean = false;
  errorMsj: any = '';

  onLoginPost(login: any) {
    let form: LoginI = login;
    const LoginModal = document.getElementById(
      'LoginModal'
    ) as HTMLInputElement;
    LoginModal.classList.add('modal--show');

    this.api
      .PostIniciarSesion(form)
      .pipe(
        map((respuest) => {
          const exito = respuest['exito'];
          const mensaje = respuest['mensaje'];
          const data = respuest['data'];

          if (exito == '1') {
            LoginModal.classList.remove('modal--show');
            const permisos: ResultadoPermisosI = data.Usuario;

            this.cookieService.set('token_cs', data.Token);
            this.cookieService.set('usuarioId', data.UsuarioId);
            localStorage.setItem('usuario', JSON.stringify(data.Usuario));
            this.cookieService.set('img',data.Usuario.gestor.usr_img_url);
            // this.cookieService.set('menu',JSON.stringify(permisos.menu));
            // this.cookieService.set('cartera',JSON.stringify(permisos.cartera));
            // this.cookieService.set('gestor',JSON.stringify(permisos.gestor));

            // this.SeleccionCartera(permisos.cartera);
            if (login.servidata) {
              let login_sd: LoginISD;
              login_sd = {
                codUsuario: form.usr_usuario,
                passwordusuario: form.usr_password,
                cambio: 1,
              };

              this.api
                .PostIniciarSesionServiData(login_sd)
                .pipe(
                  map((respuest) => {
                    const exito = respuest['exito'];
                    const mensaje = respuest['mensaje'];
                    const data = respuest['data'];

                    if (exito == '1') {
                      this.cookieService.set('token', data.Token);
                      this.cookieService.set(
                        'usuario_sd',
                        data.secuencialUsuario
                      );
                      this.alerta.SesionIniciadaSD();
                    } else {
                      this.alerta.SesionRechazadaSD();
                    }
                  }),
                  catchError((error) => {
                    this.alerta.SesionRechazadaSD();
                    throw error;
                  })
                )
                .subscribe();

              this.SeleccionCartera(permisos.cartera);
              this.router.navigate(['inicio']);
            } else {
              this.SeleccionCartera(permisos.cartera);
              this.router.navigate(['inicio']);
            }
          }
          if (exito == '2') {
            LoginModal.classList.remove('modal--show');
            this.showModal('usuario en sesión');
          } else {
            LoginModal.classList.remove('modal--show');
            this.errorStatus = true;
            this.errorMsj = mensaje;
          }
        }),
        catchError((error) => {
          LoginModal.classList.remove('modal--show');
          throw error;
        })
      )
      .subscribe();
  }

  SeleccionCartera(cartera: ResultadoCarteraI[]) {
    let Cartera = cartera.sort((a: ResultadoCarteraI, b: ResultadoCarteraI) =>
      a.cart_id.toString().localeCompare(b.cart_id.toString())
    );
    if (Cartera.length > 0) {
      let primerElemento = Cartera[0];
      this.cookieService.set('id_cartera', primerElemento.cart_id.toString());
      this.cookieService.set(
        'cartera_desc',
        primerElemento.cart_descripcion +
          ' ' +
          primerElemento.cart_tip_descripcion
      );
    } else {
      this.cookieService.delete('id_cartera');
      this.cookieService.delete('cartera_desc');
    }
  }

  showModal(mensaje: string) {
    Swal.fire({
      title: mensaje,
      text: 'Desea Remplazarla',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Remplazar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loginForm.value.cambio = 1;
        this.onLoginPost(this.loginForm.value);
      }
    });
  }
  RecuperarClave() {
    const LoginModal = document.getElementById(
      'LoginModal'
    ) as HTMLInputElement;

    Swal.fire({
      title: 'Usuario a recuperar',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      showLoaderOnConfirm: true,
      preConfirm: async (login) => {
        try {
          LoginModal.classList.add('modal--show');
          this.api
            .GetRestablecerUsuario(login)
            .pipe(
              map((respuest) => {
                const exito = respuest['exito'];
                const mensaje = respuest['mensaje'];
                const data = respuest['data'];

                if (exito == '1') {
                  this.alerta.AlertaEnLaPeticion(mensaje);
                } else {
                  this.alerta.AlertaEnLaPeticion(mensaje);
                }

                LoginModal.classList.remove('modal--show');
              }),
              catchError((error) => {
                LoginModal.classList.remove('modal--show');
                this.alerta.ErrorEnLaPeticion(error);
                throw error;
              })
            )
            .subscribe();
        } catch (error) {
          Swal.showValidationMessage('Error en la petición');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }
}
