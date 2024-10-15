import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiService,
    private cookeService: CookieService
  ) {}
  ngOnInit(): void {
    this.SubMenus();
    // this.permisos.menu.forEach(elemento=>{
    //   if(elemento.men_descripcion==='CONFIGURACION')
    //    {
    //     const configuracion:any={ number: '9', name: 'Configuracion', icon: 'fa-solid fa-gear',url:'configuracion' };
    //     this.Menus1.push(configuracion);
    //    }
    //    if(elemento.men_descripcion==='CARGAR')
    //      {
    //       const cargar:any={ number: '10', name: 'Cargar', icon: 'fa-solid fa-upload',url:'cargar' };
    //       this.Menus1.push(cargar);
    //      }

    //  });
  }
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  ImgPerfil: string = this.cookeService.get('img').trim();

  Menus: ResultadoMenuI[] = this.permisos.menu;
  Gestor: ResultadoGestorI = this.permisos.gestor;
  GestorNombres = this.Gestor.ges_nombres + ' ' + this.Gestor.ges_apellidos;

  MenuAdminitCount!: number;
  MenuClienteCount!: number;
  MenuGestionarExiste: boolean = false;
  async SubMenus() {
    let MenuAdministracion = this.Menus.filter((elemento: any, index: any) => {
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

    let MenuCliente = this.Menus.filter((elemento: any, index: any) => {
      return (
        elemento.men_url === 'cliente' ||
        elemento.men_url === 'correo' ||
        elemento.men_url === 'direccion' ||
        elemento.men_url === 'garante' ||
        elemento.men_url === 'telefono' ||
        elemento.men_url === 'gestion' ||
        elemento.men_url === 'pagos' ||
        elemento.men_url === 'trabajo'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));

    this.Menus1 = this.Menus.filter((elemento: any, index: any) => {
      return (
        elemento.men_url === 'descargas' ||
        elemento.men_url === 'gestionar' ||
        elemento.men_url === 'gestion' ||
        elemento.men_url === 'pagos' ||
        elemento.men_url === 'cargar' ||
        elemento.men_url === 'configuracion' ||
        elemento.men_url === 'reportes'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));

    let MenuGestionar = this.Menus.filter((elemento: any, index: any) => {
      return elemento.men_url === 'gestionar';
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));

    this.MenuAdminitCount = MenuAdministracion.length;
    this.MenuClienteCount = MenuCliente.length;
    this.MenuGestionarExiste = MenuGestionar.length > 0 ? true : false;
  }

  Menus1: any[] = [];
}
