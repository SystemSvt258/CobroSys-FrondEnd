import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Alertas } from './Alerts';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    private router: Router,
    private alerta: Alertas
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token: string;
    if (request.url.includes('Familiares')) {
      // Cambiar el token según sea necesario
      token = `Bearer ${this.cookieService.get('token')}`;
    } else {
      token = `Bearer ${this.cookieService.get('token_cs')}`;
    }

    const headers = new HttpHeaders({ Authorization: token });
    const headersClone = request.clone({ headers });

    return next.handle(headersClone).pipe(
      catchError((err) => {
        if ([401, 403].indexOf(err.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(err.status,'Acceso no autorizado o credenciales no válidas');
          this.cookieService.delete('token_cs');
          this.cookieService.delete('usuarioId');
          this.cookieService.delete('token');
          this.cookieService.delete('usuario_sd');
          this.cookieService.delete('id_cartera');
          this.cookieService.delete('cartera_desc');
          localStorage.removeItem('usuario');
          this.router.navigate(['login']);
        }
        if ([500].indexOf(err.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(err.status,'No se Encuentra Información Relacionada');
        }
        if ([0].indexOf(err.status) !== -1) {
          this.alerta.ErrorAlRecuperarElementosError(err.status,'No es Posible Acceder a la Información del Servidor');
        }
        const error = err.error.message || err.statusText;
        return throwError(() => err);
      })
    );
  }

  private customToken: string | null = null;

  setCustomToken(token: string): void {
    this.customToken = token;
  }

  intercept_sd(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Verificar si hay un token personalizado y aplicarlo solo a la solicitud específica
    if (this.customToken && req.url.includes('Familiares')) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.customToken}`,
        },
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
