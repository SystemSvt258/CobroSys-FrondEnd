import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import {
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { ApiService } from '../service/api.service';
import { Alertas } from './Alerts';
import { Fechas } from './Fechas';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class PermisosAcceso {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private router: Router,
    private cookieService: CookieService
  ) {}

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  Cartera: ResultadoCarteraI[] = this.permisos.cartera;

  checkLocal(pagina: string): object | undefined {
    if (!this.cookieService.get('token_cs') || !this.cookieService.get('usuarioId')) {
        this.router.navigate(['login']);
        this.alerta.AlertaDeSesion();
        return undefined;
    }

    const menu_act = this.Menu.find((elemento) => {
        return elemento.men_url === pagina;
    }) as ResultadoMenuI | undefined;

    if (menu_act == null) {
        this.router.navigate(['inicio']);
        this.alerta.AccesoDenegado();
        return undefined;
    } else {
        const objeto = {
            Usuario: this.Usuario,
            Menu_Act: menu_act,
            Carteras: this.Cartera,
        };
        return objeto;
    }
}


Navegar_RefrescarUrl(url: string) {
  const currentUrl = window.location.href;
  const lastIndex = currentUrl.lastIndexOf('/');
  const substringAfterLastSlash = currentUrl.substring(lastIndex + 1);
  console.log(substringAfterLastSlash);

  if (substringAfterLastSlash != url) {
    this.router.navigate(['/' + url]);
  } else {
    location.reload();
  }
}

}