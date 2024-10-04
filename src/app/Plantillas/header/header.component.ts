import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import {
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Time } from '@angular/common';
import { interval, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private cookeService: CookieService,
    private location: Location
  ) {}

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);

  ListaCarteras: ResultadoCarteraI[] = this.permisos.cartera;
  Menus: ResultadoMenuI[] = this.permisos.menu;
  TotalCarteras = this.ListaCarteras.length;
  Gestor: ResultadoGestorI = this.permisos.gestor;

  SubMenu!: any[];
  MenuAdminitCount!: number;
  MenuClienteCount!: number;
  
  async SubMenus() {
    this.SubMenu = this.Menus.filter((elemento: any, index: any) => {
      return (
        elemento.men_url === 'inicio' ||
        elemento.men_url === 'usuarios' ||
        elemento.men_url === 'gestion' ||
        // elemento.men_url === 'roles' ||
        // elemento.men_url === 'permisos' ||
        // elemento.men_url === 'administracion' ||
        elemento.men_url === 'notificaciones' ||
        elemento.men_url === 'reportes'
      );
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
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
      return elemento.men_url === 'gestionar';
    }).sort((a: any, b: any) => a.men_url.localeCompare(b.men_url));
    this.MenuAdminitCount = MenuAdministracion.length;
    this.MenuClienteCount = MenuCliente.length;
  }

  ngOnInit(): void {
    this.SubMenus();

    // this.startCountdown();
  }
  public timeLeft: number = 60;
  private countdownSubscription: Subscription | undefined;

  startCountdown(): void {
    this.countdownSubscription = interval(1000)
      .pipe(take(60)) // Limitar a 60 emisiones
      .subscribe(() => {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          localStorage.removeItem('usuario');
          this.cookeService.delete('token_cs');
          this.cookeService.delete('usuarioId');
          this.cookeService.delete('cartera_desc');
          this.cookeService.delete('id_cartera');
          this.cookeService.delete('token');
          this.cookeService.delete('usuario_sd');
          this.cookeService.delete('img');
          this.modalSesionCerrada('Sesión Cerrada');
          this.router.navigate(['nosotros']);
        }
      });
  }

  ngOnDestroy(): void {
    // Cancelar la suscripción si el componente se destruye
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
  cart_id = this.cookeService.get('id_cartera');
  cart_descripcion = this.cookeService.get('cartera_desc');

  SeleccionCartera(carteraId: Number, nombre: string) {
    this.cookeService.delete('id_cartera');
    this.cookeService.delete('cartera_desc');

    this.cookeService.set('id_cartera', carteraId.toString());
    this.cookeService.set('cartera_desc', nombre);
    location.reload();
  }

  CerrarSesion() {
    Swal.fire({
      title: 'Cerrar Sesión !',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Cerrar Sesión',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.GetCerrarSesion().subscribe((respuest) => {
          localStorage.removeItem('usuario');
          this.cookeService.delete('token_cs');
          this.cookeService.delete('usuarioId');
          this.cookeService.delete('cartera_desc');
          this.cookeService.delete('id_cartera');
          this.cookeService.delete('token');
          this.cookeService.delete('usuario_sd');
          this.cookeService.delete('img');
          // this.cookeService.delete('menu');
          // this.cookeService.delete('cartera');
          this.modalSesionCerrada('Sesión Cerrada');
          this.router.navigate(['nosotros']);
        });
      }
    });
  }
  modalSesionCerrada(mensaje: string) {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: mensaje,
      showConfirmButton: false,
      timer: 1500,
    });
  }
  InicioCartera(cartera:any){
    console.log(cartera)
    let id = this.route.snapshot.paramMap.get('id');
    let val = this.route.snapshot.paramMap.get('val');

    if (id == null && val == null) {
      this.router.navigate(['/inicio',cartera.cart_id,cartera.cart_descripcion + ' '+cartera.cart_tip_descripcion]);
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}
