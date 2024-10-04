import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';

@Component({
  selector: 'app-cliadmin',
  templateUrl: './cliadmin.component.html',
  styleUrls: ['./cliadmin.component.css'],
})
export class CliadminComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookeService: CookieService
  ) {}
  PaginaMuestra: string = '';
  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    if (id == 'O') {
      this.PaginaMuestra = id;
      this.SubMenus();
    }
    else{
      
    }
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Menus: ResultadoMenuI[] = this.permisos.menu;
  MenuClientes!: any[];
  async SubMenus() {
    this.MenuClientes = this.Menus.filter((elemento: any) => {
      return (
        elemento.men_url === 'cliente' ||
        elemento.men_url === 'creditos' ||
        elemento.men_url === 'correo' ||
        elemento.men_url === 'garante' ||
        elemento.men_url === 'direccion' ||
        elemento.men_url === 'gestion' ||
        elemento.men_url === 'telefono' ||
        elemento.men_url === 'pagos' ||
        elemento.men_url === 'trabajo'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
  }

  BotonNavegar(url: string) {
    this.router.navigateByUrl(url);
  }
  // BotonNavegar(url: string) {[routerLink]="['/cliadmin','O']" 
  //   this.router.navigateByUrl(url);
  // }
  
}
