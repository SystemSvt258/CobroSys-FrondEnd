import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {

  constructor(
    private router: Router,

    private cookeService: CookieService
  ) {}
  ngOnInit(): void {
    this.SubMenus();
  }
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Menus: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menus.find((elemento) => {
    return elemento.men_url === 'reportes';
  }) as ResultadoMenuI;
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  MenusReportes!: any[];
  async SubMenus() {
    this.MenusReportes = this.Menus.filter((elemento: any) => {
      return (
        elemento.men_url === 'reporte-general' ||
        elemento.men_url === 'ultima-gestion' 
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
  }
  // MenusAdministracion: any[]=[
  //   {number: '1',name: 'Administracion' ,icon: 'fa-solid fa-screwdriver-wrench',url:'administracion',count:'15'},
  //   {number: '2',name: 'Calcular' ,icon: 'fa-solid fa-calculator',url: 'menu',count:'15'},
  //   {number: '3',name: 'Clientes' ,icon: 'fa-solid fa-user',url: 'menu',count:'15'},
  //   {number: '4',name: 'Descargar' ,icon: 'fa-solid fa-download',url: 'menu',count:'15'},
  //   {number: '5',name: 'Gestionar' ,icon: 'fa-brands fa-get-pocket',url: 'menu',count:'15'},
  //   {number: '6',name: 'Notificaciones' ,icon: 'fa-solid fa-triangle-exclamation',url: 'menu',count:'15'},
  //   {number: '7',name: 'Pagos' ,icon: 'fa-solid fa-piggy-bank',url: 'menu',count:'15'},
  //   {number: '8',name: 'Reportes' ,icon: 'fa-solid fa-ranking-star', url:'reportes',count:'15'},
  //   {number: '9',name: 'Ultima Gestion' ,icon: 'fa-solid fa-chart-line',url: 'menu',count:'15'},
  //   {number: '10',name: 'Volver a Llamar' ,icon: 'fa-solid fa-headset',url: 'menu',count:'15'},
  //   {number: '11',name: 'Tipo de Cartera' ,icon: 'fa-solid fa-calculator',url: 'tipocartera',count:'15'},
  //   {number: '12',name: 'Cartera' ,icon: 'fa-solid fa-calculator',url: 'cartera',count:'15'},
  // ];

  BotonNavegar(url: string) {
    console.log(url)
    this.router.navigate(['/' + url]);
  }
}
