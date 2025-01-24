import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Encriptacion } from '../Control/EncryptDescrypt';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  AsignacionFiltroI,
  CXC_OperacionI,
  CarteraI,
  ClienteGestorCarteraI,
  ClienteI,
  ConectividadI,
  ContactabilidadI,
  CorreoI,
  CuentaCarteraI,
  CuentaI,
  CxcOperacionI,
  DetalleTelefonoI,
  DireccionI,
  EntidadEncriptado,
  FiltroDescarga,
  FiltroGestion,
  FiltroGestion2,
  FiltroPagos,
  GaranteI,
  GestionCG,
  GestionI,
  GestionarPropio,
  GestorI,
  MenuI,
  NotificacionI,
  PagosI,
  PermisosI,
  RecargoI,
  ResponseI,
  RolesI,
  TelefonoI,
  TipoGestion_Conectividad_ContactivilidadI,
  Tipo_CarteraI,
  Tipo_CorreoI,
  Tipo_DireccionI,
  Tipo_Doc_AdicionalI,
  Tipo_GestionI,
  Tipo_RecargoI,
  Tipo_TelefonoI,
  Tipo_TrabajoI,
  TrabajoI,
  UploadFileI,
  UsuariosI,
  cargaMasiva,
} from '../Modelos/response.interface';
import { EditUsuarioI, LoginI } from '../Modelos/login.interface';
import Swal from 'sweetalert2';
import { AuthInterceptorService } from '../Control/jwt-interceptor.interceptor';
import { TipoGestionConectividadContactivilidadClasss } from '../Modelos/clases.interface';
import { Alertas } from '../Control/Alerts';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private alerta: Alertas,
    private router: Router // private alerta: Alertas // private tokenInterceptor: AuthInterceptorService
  ) {}
  objeto = new Encriptacion();

  // url: string = 'http://192.168.0.83:9094/api/';
  // url: string = 'https://cobranzaapi.cobrosystem.com/api/';
  url: string = 'https://localhost/api/';

  /********************** INICIAR Y CERRAR SESIÓN *************************** */

  PostIniciarSesion(loginData: LoginI): Observable<ResponseI> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(loginData),
    };
    let direccion = this.url + 'Login';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  GetCerrarSesion(): Observable<ResponseI> {
    let direccion = this.url + 'Login/CerrarSesion';
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  SesionEnOtroDispocitivo() {
    Swal.fire({
      // position: 'top-end',
      icon: 'warning',
      title: 'El usuario inicio sesión en otro Dispositivo',
      showConfirmButton: false,
      timer: 2000,
    });
    localStorage.removeItem('usuario');
    this.cookieService.delete('token_cs');
    this.cookieService.delete('usuarioId');
    this.cookieService.delete('cartera_desc');
    this.cookieService.delete('id_cartera');
    this.cookieService.delete('token');
    this.cookieService.delete('usuario_sd');
    this.cookieService.delete('img');
    this.router.navigate(['login']);
  }
  GetRestablecerUsuario(usuario: string): Observable<ResponseI> {
    let direccion = this.url + 'Login/Restablecer' + usuario;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  GetEnvioMensaje(
    mensaje: string,
    user: string,
    para: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Chat/' + mensaje + ',' + user + ',' + para;
    return this.http.get<any>(direccion).pipe();
  }
  //********************* TOKEN *********************** */
  GetTokenExiste(): Observable<ResponseI> {
    let direccion = this.url + 'Tokens';
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  //********************* CARTERA *********************** */
  GetCarteraFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Cartera/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCarteraFracionadoDesactivos(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Cartera/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCarteraFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Cartera/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCartera(elemento: CarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cartera';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCartera(elemento: CarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cartera';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CLIENTES *********************** */
  GetClienteFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Cliente/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteDesactivados(
    codigo: number,
    rango: number,
    cartera: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Cliente/Desactivados' + codigo + ',' + rango + ',' + cartera;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Cliente/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCliente(elemento: ClienteI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cliente';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCliente(elemento: ClienteI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cliente';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CONECTIVIDAD *********************** */
  GetConectividadFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Conectividad/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetConectividadFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Conectividad/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostConectividad(elemento: ConectividadI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Conectividad';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutConectividad(elemento: ConectividadI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Conectividad';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /***************************DESACTIVAR TODAS LAS CONECTIVIDADES*************************************** */
  GetDesactivadosConectividadFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Conectividad/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CONTACTABILIDAD *********************** */
  GetContactabilidadFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Contactabilidad/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetContactabilidadFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Contactabilidad/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostContactabilidad(elemento: ContactabilidadI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Contactabilidad';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutContactabilidad(elemento: ContactabilidadI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Contactabilidad';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /******************************************Desactivar todas Contactibilidades************************************************* */
  GetDesactivadosContactabilidadFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Contactabilidad/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CORREOS   *********************** */
  GetCorreosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Correo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCorreosFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Correo/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCorreosFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Correo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCorreos(elemento: CorreoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Correo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCorreos(elemento: CorreoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Correo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CUENTAS   *********************** */
  GetCuentasFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Cuenta/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCuentasFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Cuenta/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCuentas(elemento: CuentaI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cuenta';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCuentas(elemento: CuentaI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cuenta';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* CUENTAS_CARTERA   *********************** */
  GetCuentaCarteraFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Cuenta_Tipo_Cartera/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        console.log(error.status);
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }
        throw error;
      })
    );
  }
  GetCuentaCarteraDesactivados(
    codigo: number,
    rango: number,
    cartera: number
  ): Observable<ResponseI> {
    let direccion =
      this.url +
      'Cuenta_Tipo_Cartera/Desactivados' +
      codigo +
      ',' +
      rango +
      ',' +
      cartera;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCuentaCartera(codigo: number, rango: number): Observable<ResponseI> {
    let direccion =
      this.url + 'Cuenta_Tipo_Cartera/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCuentaCarteraFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Cuenta_Tipo_Cartera/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCuentaCartera(elemento: CuentaCarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cuenta_Tipo_Cartera';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCuentaCartera(elemento: CuentaCarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Cuenta_Tipo_Cartera';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  /************************************Desactivar las todas las cuentas activas***************************************** */
  GetCuentasFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Cuenta/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* Cxc Operacion   *********************** */
  GetCxcOperacionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'CxcOperacion/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCxcOperacionFracionadoDesactivado(
    codigo: number,
    rango: number,
    cartera: number
  ): Observable<ResponseI> {
    let direccion =
      this.url +
      'CxcOperacion/Desactivados' +
      codigo +
      ',' +
      rango +
      ',' +
      cartera;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCxcOperacionFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'CxcOperacion/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCxcOperacion(elemento: CxcOperacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CxcOperacion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCxcOperacion(elemento: CxcOperacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CxcOperacion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* DETALLE TELEFONO   *********************** */
  GetDetTelefonoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Detalle_Telefono/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDetTelefonoFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Detalle_Telefono/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDetTelefonoFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Detalle_Telefono/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostDetTelefono(elemento: DetalleTelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Detalle_Telefono';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutDetTelefono(elemento: DetalleTelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Detalle_Telefono';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* DIRECCIONES   *********************** */
  GetDireccionesFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Direccion/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDireccionesFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Direccion/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDireccionesFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Direccion/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostDirecciones(elemento: DireccionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Direccion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutDirecciones(elemento: DireccionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Direccion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* GARANTE   *********************** */
  GetGarantesFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Garante/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGarantesFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Garante/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGarantesFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Garante/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostGarantes(elemento: GaranteI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Garante';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutGarantes(elemento: GaranteI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Garante';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* MENU *********************** */
  GetMenuFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Menu/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetMenuFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Menu/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostMenu(elemento: MenuI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Menu';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutMenu(elemento: MenuI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Menu';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* NOTIFICACION *********************** */
  GetNotificacionFracionado(tipo: number): Observable<ResponseI> {
    let direccion = this.url + 'Notificaciones/Todos' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetNotificacionFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Notificaciones/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostNotificacion(elemento: NotificacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Notificaciones';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutNotificacion(elemento: NotificacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Notificaciones';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* PERMISOS *********************** */
  GetPermisosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Permisos/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetPermisosFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Permisos/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostPermisos(elemento: PermisosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Permisos';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutPermisos(elemento: PermisosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Permisos';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* ROLES *********************** */
  GetRolesFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Roles/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetRolesFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Roles/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostRoles(elemento: RolesI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Roles';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutRoles(elemento: RolesI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Roles';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TELEFONOS *********************** */
  GetTelefonosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Telefono/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTelefonosFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Telefono/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTelefonosFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Telefono/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTelefonos(elemento: TelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Telefono';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTelefonos(elemento: TelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Telefono';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TRABAJO *********************** */
  GetTrabajosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Trabajo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTrabajosFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Trabajo/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTrabajosFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Trabajo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTrabajos(elemento: TrabajoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Trabajo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTrabajos(elemento: TrabajoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Trabajo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* USUARIOS *********************** */
  GetUsuariosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Usuarios/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetUsuariosFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Usuarios/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostUsuarios(elemento: UsuariosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Usuarios';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutUsuarios(elemento: UsuariosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Usuarios';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutUsuariosEdit(usuario: EditUsuarioI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(usuario),
    };
    let direccion = this.url + 'Usuarios/EditUsuario';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* GESTORES *********************** */
  GetGestoresTodos(
    codigo: number,
    rango: number,
    tipo: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Gestor/' + codigo + ',' + rango + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestoresFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Gestor/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestoresFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Gestor/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestoresFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Gestor/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestoresGlobales(
    variable1: string,
    variable2: string
  ): Observable<ResponseI> {
    const cod1 = encodeURIComponent(variable1);
    const cod2 = encodeURIComponent(variable2);
    let direccion = this.url + 'Gestor/Global' + cod1 + ',' + cod2;
    console.log(direccion);
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostGestores(elemento: GestorI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestor';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutGestores(elemento: GestorI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestor';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* GESTION *********************** */
  GetGestionFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionFracionado2(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/TodasGestiones' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionFracionadoFiltro(filtro: FiltroGestion): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/Filtro';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionFracionadoSecondFiltro(
    filtro: FiltroGestion2
  ): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/FiltroSecond';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionFracionadoThirdFiltro(
    filtro: FiltroGestion2
  ): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/FiltroThird';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionFracionado3(codigo: number, rango: number): Observable<ResponseI> {
    let direccion =
      this.url + 'Gestion/TodasUltimasGestiones' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostGestion(elemento: GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutGestion(elemento: GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostUploadFile(data: UploadFileI) {
    let direccion = this.url + 'FileUpload/upload';
    let formData = new FormData();
    formData.append('archivo', data.archivo ?? '');
    formData.append('url', this.url.substring(0, this.url.length - 4));
    return this.http.post<ResponseI>(direccion, formData);
  }
  /**********************DESCARGAS**************************************/
  GetDescargaFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Cliente/Descarga' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /****Telefonos */
  GetDescargaBaseGeneralTelefonoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseGeneral' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaTelefonoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseGestionados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaTelefonoFracionadoFiltro(
    filtro: FiltroDescarga
  ): Observable<ResponseI> {
    let direccion = this.url + 'Descargas/FiltroDescargaTelefono';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaCorreoFracionadoFiltro(
    filtro: FiltroDescarga
  ): Observable<ResponseI> {
    let direccion = this.url + 'Descargas/FiltroDescargaCorreo';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaDireccionFracionadoFiltro(
    filtro: FiltroDescarga
  ): Observable<ResponseI> {
    let direccion = this.url + 'Descargas/FiltroDescargaDireccion';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  GetDescargaBaseSinGestionarTelefonoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseSinGestion' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /****Correos */
  GetDescargaBaseGeneralCorreoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseGCorreos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaCorreoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseGestCorreos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseSinGestionarCorreoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseSinGestCorreos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /*******Direcciones*** */
  GetDescargaBaseGeneralDireccionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseGenDirecciones' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseGestionadaDireccionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBGestDirecciones' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetDescargaBaseSinGestionarDireccionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Descargas/TodosBaseSinGesDirecciones' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* GESTIONAR *********************** */
  GetGestionarFracionado(filtro: GestionCG): Observable<ResponseI> {
    let direccion = this.url + 'Gestionar/Todos';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetGestionarFracionadoFiltro(filtro: GestionarPropio): Observable<ResponseI> {
    let direccion = this.url + 'Gestionar/Filtro';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostGestionar(elemento: GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutGestionar(elemento: GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Gestion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO CARTERA *********************** */
  GetTipoCarteraFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Cartera/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoCarteraFracionadoDesactivos(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Cartera/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetT_C_FracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Cartera/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoCartera(elemento: Tipo_CarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Cartera';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoCartera(elemento: Tipo_CarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Cartera';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  //********************* TIPO CORREOS *********************** */
  GetTipoCorreoDesactivoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Correo/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoCorreoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Correo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoCorreoFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Correo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoCorreo(elemento: Tipo_CorreoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Correo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoCorreo(elemento: Tipo_CorreoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Correo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO DIRECCIONES *********************** */
  GetTipoDireccionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Direccion/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoDireccionFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Direccion/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoDireccionFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Direccion/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoDireccion(elemento: Tipo_DireccionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Direccion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoDireccion(elemento: Tipo_DireccionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Direccion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO DOCUMENTOS *********************** */
  GetTipoDocAdicionalFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Doc_Adicional/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoDocAdicionalFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Doc_Adicional/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoDocAdicional(elemento: Tipo_Doc_AdicionalI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Doc_Adicional';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoDocAdicional(elemento: Tipo_Doc_AdicionalI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Doc_Adicional';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO GESTION *********************** */
  GetTipoGestionFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Gestion/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoGestionFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Gestion/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoGestionFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Gestion/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoGestion(elemento: Tipo_GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Gestion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoGestion(elemento: Tipo_GestionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Gestion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO TELEFONO *********************** */
  GetTipoTelefonoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Telefono/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoTelefonoFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Telefono/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoTelefonoFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Telefono/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoTelefono(elemento: Tipo_TelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Telefono';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoTelefono(elemento: Tipo_TelefonoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Telefono';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO TRABAJO *********************** */
  GetTipoTrabajoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Trabajo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoTrabajoFracionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'Tipo_Trabajo/Desactivados' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoTrabajoFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Trabajo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoTrabajo(elemento: Tipo_TrabajoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Trabajo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoTrabajo(elemento: Tipo_TrabajoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Trabajo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* PAGOS *********************** */
  GetPagosFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Pagos/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetPagosFracionadoFiltro(filtro: FiltroPagos): Observable<ResponseI> {
    let direccion = this.url + 'Pagos/Filtro';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostPagos(elemento: PagosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Pagos';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutPagos(elemento: PagosI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Pagos';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  //********************* SUBIR UNA IMAGEN AL BACK_END *********************** */
  PotsSubirImagen(data: any): Observable<any> {
    let direccion = this.url + 'SubirImagen/CargarImg';
    const formData = new FormData();
    if (data instanceof File) {
      formData.append('archivo', data);
    }
    formData.append('url', this.url.substring(0, this.url.length - 4));
    return this.http.post<any>(direccion, formData).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO     public class TipoGestion_Conectividad_Contactavilidad *********************** */
  GetTG_Conec_Contac(tg: number, conect: number): Observable<ResponseI> {
    let direccion = this.url + 'Gestionar/TG_Conect_Contac' + tg + ',' + conect;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTG_Predeterminados(tipo: number): Observable<ResponseI> {
    let direccion = this.url + 'Gestionar/Predeterminado' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO Buscar Clientes General *********************** */
  GetBuscarClientesGeneral(tp: number, val: string): Observable<ResponseI> {
    let direccion =
      this.url + 'Gestionar/BuscarClientesGeneral' + tp + ',' + val;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  PostIniciarSesionServiData(loginData: LoginI): Observable<ResponseI> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(loginData),
    };

    let direccion = 'https://cobrosystemapi.cobrosystem.com/api/Login';

    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        // this.alerta.PeticionModificada();
        throw error;
      })
    );
  }

  GetFamiliares(cedula: string, par: string): Observable<ResponseI> {
    const direccion = `https://cobrosystemapi.cobrosystem.com/api/Personas/Familiares${cedula},${par}`;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  /************************************RECARGOS***************************************** */
  GetRecargasFracionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + 'Recargo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetRecargasFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Recargo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostRecarga(elemento: RecargoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Recargo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutRecarga(elemento: RecargoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Recargo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  //********************* TIPO Recargos *********************** */
  GetTipoRecargoFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion = this.url + 'Tipo_Recargo/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTipoRecargoFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'Tipo_Recargo/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostTipoRecargo(elemento: Tipo_RecargoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Recargo';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTipoRecargo(elemento: Tipo_RecargoI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'Tipo_Recargo';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetCxCFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'CXCOperacion/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteGestorCarteraFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + 'ClienteGestorCartera/Filtro' + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteGestorCarteraFiltro(
    filtro: AsignacionFiltroI
  ): Observable<ResponseI> {
    let direccion = this.url + 'ClienteGestorCartera/Filtro';
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutCxC(elemento: CXC_OperacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CXCOperacion';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  PostCxC(elemento: CXC_OperacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CXCOperacion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostClienteGestorCartera(elemento: ClienteGestorCarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'ClienteGestorCartera';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutClienteGestorCartera(elemento: ClienteGestorCarteraI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'ClienteGestorCartera';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCxCActualizacion(elemento: CXC_OperacionI): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CXCOperacionActualizacion';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  GetClienteGestorCarteraFracionado(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'ClienteGestorCartera/Todos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteGestorCarteraFracionadoActivos(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url + 'ClienteGestorCartera/GetActivos' + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteGestorCarteraFracionadoInactivos(
    codigo: number,
    rango: number,
    cartera: number
  ): Observable<ResponseI> {
    let direccion =
      this.url +
      'ClienteGestorCartera/GetTodsInactivos' +
      codigo +
      ',' +
      rango +
      ',' +
      cartera;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetClienteGestorCarteraFracionadoDesactivados(
    codigo: number,
    rango: number,
    cartera: number
  ): Observable<ResponseI> {
    let direccion =
      this.url +
      'ClienteGestorCartera/Desactivados' +
      codigo +
      ',' +
      rango +
      ',' +
      cartera;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  /***************************************TipoGestionConectividadContactavilidad******************************************************************** */
  GetTGCCFraccionado(codigo: number, rango: number): Observable<ResponseI> {
    let direccion =
      this.url +
      'TipoGestionConectividadContactavilidad/Todos' +
      codigo +
      ',' +
      rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTGCCFraccionadoDesactivados(
    codigo: number,
    rango: number
  ): Observable<ResponseI> {
    let direccion =
      this.url +
      'TipoGestionConectividadContactavilidad/Desactivados' +
      codigo +
      ',' +
      rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetTGCCFracionadoFiltro(
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion =
      this.url +
      'TipoGestionConectividadContactavilidad/Filtro' +
      cod +
      ',' +
      tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PosTGCC(
    elemento: TipoGestion_Conectividad_ContactivilidadI
  ): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'TipoGestionConectividadContactavilidad';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PutTGCC(
    elemento: TipoGestion_Conectividad_ContactivilidadI
  ): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'TipoGestionConectividadContactavilidad';
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCargaMasiva(elemento: cargaMasiva): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'cargaMasica';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  PostCargaMasivaList(elemento: cargaMasiva): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + 'CargaMasiva';
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get(entidad: string, codigo: number, rango: number): Observable<ResponseI> {
    let direccion = this.url + entidad + codigo + ',' + rango;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        console.log(error.status);
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }
        throw error;
      })
    );
  }
  GetUnPaqrametro(entidad: string, tipo: number): Observable<ResponseI> {
    let direccion = this.url + entidad + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        console.log(error.status);
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }
        throw error;
      })
    );
  }
  GetFiltro(
    entidad: string,
    variable: string,
    tipo: number
  ): Observable<ResponseI> {
    const cod = encodeURIComponent(variable);
    let direccion = this.url + entidad + cod + ',' + tipo;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  Post(entidad: string, elemento: any): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + entidad;
    return this.http.post<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  Put(entidad: string, elemento: any): Observable<any> {
    let Encryptado: EntidadEncriptado = {
      valor: this.objeto.encriptarAES(elemento),
    };
    let direccion = this.url + entidad;
    return this.http.put<any>(direccion, Encryptado).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }

  GetFiltroCompuesto(entidad:string, filtro: any): Observable<ResponseI> {
    let direccion = this.url + entidad;
    const params = new HttpParams({ fromObject: filtro });
    return this.http.get<any>(direccion, { params }).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
            'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }

        throw error;
      })
    );
  }
  GetPagoXCedula(cedula:string,credito:string,cartera:number,gestor:number): Observable<ResponseI> {
    let direccion = this.url + 'Pagos/buscarPagoXCedula' + cedula + ',' + credito + ',' +cartera+ ',' +gestor;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
             'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }
        throw error;
      })
    );
  }
  GetGestionXCedula(cedula:string,credito:string,cartera:number,gestor:number): Observable<ResponseI> {
    let direccion = this.url + 'Gestion/buscarGestionXCedula' + cedula + ',' + credito + ',' +cartera+ ',' +gestor;
    return this.http.get<any>(direccion).pipe(
      map((data) => {
        return JSON.parse(this.objeto.decrypt(data['valor']));
      }),
      catchError((error) => {
        if ([undefined].indexOf(error.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(
             'Encriptar-ES8',
            'Error al desencriptar los datos'
          );
        }
        throw error;
      })
    );
  }
  
  
}
