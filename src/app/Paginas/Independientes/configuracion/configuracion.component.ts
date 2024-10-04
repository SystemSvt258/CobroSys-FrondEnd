import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';


@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit{
  ngOnInit(): void {
    //this.ListarElementos(1);
    this.SubMenus();
  }
  constructor(
    private router: Router,

    private cookeService: CookieService
  ) {}
/**Cargar los permisos que tiene acceso */
/*****************************Para obtener la pagina actual*************************** */
permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Menus: ResultadoMenuI[] = this.permisos.menu;
  MenusReportes!: any[];
  PaginaActual: ResultadoMenuI = this.Menus.find((elemento) => {
    return elemento.men_url === 'configuracion';
  }) as ResultadoMenuI;
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  /******************** */
  async SubMenus() {
    this.MenusReportes = this.Menus.filter((elemento: any) => {
      return (
        elemento.men_url === 'recargo' ||
        elemento.men_url === 'tipo-recargo'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
  }
  BotonNavegar(url: string) {
    this.router.navigate(['/' + url]);
  }
}
