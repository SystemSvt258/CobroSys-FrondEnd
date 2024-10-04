import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.css'],
})
export class AdministracionComponent implements OnInit {
  constructor(
    private router: Router,

    private cookeService: CookieService
  ) {}
  ngOnInit(): void {
    this.SubMenus();
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Menus: ResultadoMenuI[] = this.permisos.menu;
  MenusAdministracion!: any[];
  async SubMenus() {
    this.MenusAdministracion = this.Menus.filter((elemento: any) => {
      return (
        elemento.men_url === 'actualizar' ||
        elemento.men_url === 'asignacion' ||
        elemento.men_url === 'cargar' ||
        elemento.men_url === 'cartera' ||
        elemento.men_url === 'conectividad' ||
        elemento.men_url === 'contactabilidad' ||
        elemento.men_url === 'cuenta' ||
        elemento.men_url === 'cuentacartera' ||
        elemento.men_url === 'detallellamadas' ||
        elemento.men_url === 'gestores' ||
        elemento.men_url === 'menus' ||
        elemento.men_url === 'permisos' ||
        elemento.men_url === 'recargo' ||
        elemento.men_url === 'roles' ||
        elemento.men_url === 'tgconecconta' ||
        elemento.men_url === 'tipocartera' ||
        elemento.men_url === 'tipocorreo' ||
        elemento.men_url === 'tipodireccion' ||
        elemento.men_url === 'tipodocumento' ||
        elemento.men_url === 'tipogestion' ||
        elemento.men_url === 'tipo-recargo' ||
        elemento.men_url === 'tipotelefono' ||
        elemento.men_url === 'tipotrabajo' ||
        elemento.men_url === 'usuarios'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
  }
  BotonNavegar(url: string) {
    this.router.navigate(['/' + url]);
  }
}
