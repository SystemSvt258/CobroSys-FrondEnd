// permission.guard.ts
import { Injectable, OnInit } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { Observable, Subscription, map } from 'rxjs';
import { ApiService } from '../service/api.service';

@Injectable({
  providedIn: 'root',
})
export class TokenGuard {
  constructor(
    private api: ApiService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  existe!: any;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.ExisteToken().pipe(
      map((exists) => {
        if (exists.exito == '1') {
          return true;
        } else {
          localStorage.removeItem('usuario');
          this.cookieService.delete('token_cs');
          this.cookieService.delete('usuarioId');
          this.cookieService.delete('cartera_desc');
          this.cookieService.delete('id_cartera');
          this.cookieService.delete('token');
          this.cookieService.delete('usuario_sd');
          this.cookieService.delete('img');
          this.router.navigate(['login']);

          Swal.fire({
            // position: 'top-end',
            icon: 'warning',
            title: 'Token expirado',
            showConfirmButton: false,
            timer: 2000,
          });
          return false;
        }
      })
    );
  }

  ExisteToken() {
    return this.api.GetTokenExiste().pipe(
      map((result) => {
        return result;
      })
    );
  }
}
