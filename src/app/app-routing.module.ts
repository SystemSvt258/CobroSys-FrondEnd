import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Login/login/login.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { ReportesComponent } from './Paginas/Reportes/reportes/reportes.component';
import { PerfilComponent } from './Paginas/Extras/perfil/perfil.component';
import { MenusComponent } from './Paginas/Administracion/menus/menus.component';
import { AdministracionComponent } from './Paginas/Administracion/administracion/administracion.component';
import { UsuariosComponent } from './Paginas/Administracion/usuarios/usuarios.component';
import { CarteraComponent } from './Paginas/Administracion/cartera/cartera.component';
import { TipoCarteraComponent } from './Paginas/Administracion/tipo-cartera/tipo-cartera.component';
import { TokenGuard } from './Control/token.guard';
import { RolesComponent } from './Paginas/Administracion/roles/roles.component';
import { GestoresComponent } from './Paginas/Administracion/gestores/gestores.component';
import { TipoCorreoComponent } from './Paginas/Administracion/tipo-correo/tipo-correo.component';
import { TipoDireccionComponent } from './Paginas/Administracion/tipo-direccion/tipo-direccion.component';
import { TipoDocAdicionalComponent } from './Paginas/Administracion/tipo-doc-adicional/tipo-doc-adicional.component';
import { TipoGestionComponent } from './Paginas/Administracion/tipo-gestion/tipo-gestion.component';
import { TipoTelefonoComponent } from './Paginas/Administracion/tipo-telefono/tipo-telefono.component';
import { TipoTrabajoComponent } from './Paginas/Administracion/tipo-trabajo/tipo-trabajo.component';
import { CliadminComponent } from './Paginas/Cliente/cliadmin/cliadmin.component';
import { ClienteComponent } from './Paginas/Cliente/cliente/cliente.component';
import { CorreoComponent } from './Paginas/Cliente/correo/correo.component';
import { DireccionComponent } from './Paginas/Cliente/direccion/direccion.component';
import { TelefonoComponent } from './Paginas/Cliente/telefono/telefono.component';
import { TrabajoComponent } from './Paginas/Cliente/trabajo/trabajo.component';
import { DetalleTelefonoComponent } from './Paginas/Administracion/detalle-telefono/detalle-telefono.component';
import { ConectividadComponent } from './Paginas/Administracion/conectividad/conectividad.component';
import { ContactabilidadComponent } from './Paginas/Administracion/contactabilidad/contactabilidad.component';
import { CuentaComponent } from './Paginas/Administracion/cuenta/cuenta.component';
import { GaranteComponent } from './Paginas/Cliente/garante/garante.component';
import { HistorialSesionesComponent } from './Paginas/Reportes/historial-sesiones/historial-sesiones.component';
import { HistorialDescansoComponent } from './Paginas/Reportes/historial-descanso/historial-descanso.component';
import { HisadminComponent } from './Paginas/Reportes/hisadmin/hisadmin.component';
import { AccionesComponent } from './Paginas/Reportes/acciones/acciones.component';
import { CargarComponent } from './Paginas/Independientes/cargar/cargar.component';
import { GestionarComponent } from './Paginas/Independientes/gestionar/gestionar.component';
import { GestionComponent } from './Paginas/Cliente/gestion/gestion.component';
import { PagosComponent } from './Paginas/Cliente/pagos/pagos.component';
import { CreditosComponent } from './Paginas/Cliente/creditos/creditos.component';
import { ActualizarComponent } from './Paginas/Administracion/actualizar/actualizar.component';
import { RecargoComponent } from './Paginas/Independientes/recargo/recargo.component';
import { TipoRecargoComponent } from './Paginas/Independientes/tipo-recargo/tipo-recargo.component';
import { DescargarComponent } from './Paginas/Independientes/descargar/descargar.component';
import { ConfiguracionComponent } from './Paginas/Independientes/configuracion/configuracion.component';
import { GeneralComponent } from './Paginas/Reportes/general/general.component';
import { UltimaComponent } from './Paginas/Reportes/ultima/ultima.component';
import { NotificacionesComponent } from './Paginas/Extras/notificaciones/notificaciones.component';
import { ChatComponent } from './Paginas/Extras/chat/chat.component';
import { AsignacionComponent } from './Paginas/Administracion/asignacion/asignacion.component';
import { CuentaCarteraComponent } from './Paginas/Administracion/cuenta-cartera/cuenta-cartera.component';
import { TgConecContaComponent } from './Paginas/Administracion/tg-conec-conta/tg-conec-conta.component';
import { NosotrosComponent } from './Vistas/nosotros/nosotros.component';

const routes: Routes = [
  { path: '', redirectTo: 'nosotros', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: InicioComponent, canActivate: [TokenGuard]},
  { path: 'inicio/:id/:val', component: InicioComponent, canActivate: [TokenGuard]},
  { path: 'notificaciones', component: NotificacionesComponent, canActivate: [TokenGuard]},
  { path: 'chat', component: ChatComponent, canActivate: [TokenGuard]},
  { path: 'reportes', component: ReportesComponent, canActivate: [TokenGuard]},
  { path: 'perfil', component: PerfilComponent, canActivate: [TokenGuard]},
  { path: 'menus', component: MenusComponent, canActivate: [TokenGuard]},
  { path: 'administracion', component: AdministracionComponent, canActivate: [TokenGuard]},
  { path: 'detallellamadas', component: DetalleTelefonoComponent, canActivate: [TokenGuard]},
  { path: 'usuarios', component: UsuariosComponent, canActivate: [TokenGuard]},
  { path: 'cartera', component: CarteraComponent, canActivate: [TokenGuard]},
  { path: 'tipocartera', component: TipoCarteraComponent, canActivate: [TokenGuard]},
  { path: 'roles', component: RolesComponent, canActivate: [TokenGuard]},
  { path: 'gestores', component: GestoresComponent, canActivate: [TokenGuard]},
  { path: 'gestion', component: GestionComponent, canActivate: [TokenGuard]},
  { path: 'tipocorreo', component: TipoCorreoComponent, canActivate: [TokenGuard]},
  { path: 'tipodireccion', component: TipoDireccionComponent, canActivate: [TokenGuard]},
  { path: 'tipodocumento', component: TipoDocAdicionalComponent, canActivate: [TokenGuard]},
  { path: 'tipogestion', component: TipoGestionComponent, canActivate: [TokenGuard]},
  { path: 'tipotelefono', component: TipoTelefonoComponent, canActivate: [TokenGuard]},
  { path: 'tipotrabajo', component: TipoTrabajoComponent, canActivate: [TokenGuard]},
  { path: 'cliadmin', component: CliadminComponent, canActivate: [TokenGuard]},
  { path: 'cliadmin/:id', component: CliadminComponent, canActivate: [TokenGuard]},
  { path: 'cliente', component: ClienteComponent, canActivate: [TokenGuard]},
  { path: 'correo', component: CorreoComponent, canActivate: [TokenGuard]},
  { path: 'direccion', component: DireccionComponent, canActivate: [TokenGuard]},
  { path: 'telefono', component: TelefonoComponent, canActivate: [TokenGuard]},
  { path: 'trabajo', component: TrabajoComponent, canActivate: [TokenGuard]},
  { path: 'conectividad', component: ConectividadComponent, canActivate: [TokenGuard]},
  { path: 'contactabilidad', component: ContactabilidadComponent, canActivate: [TokenGuard]},
  { path: 'cuenta', component: CuentaComponent, canActivate: [TokenGuard]},
  { path: 'garante', component: GaranteComponent, canActivate: [TokenGuard]},
  { path: 'historialsesiones', component: HistorialSesionesComponent, canActivate: [TokenGuard]},
  { path: 'historialdescansos', component: HistorialDescansoComponent, canActivate: [TokenGuard]},
  { path: 'hisadmin', component: HisadminComponent, canActivate: [TokenGuard]},
  { path: 'acciones', component: AccionesComponent, canActivate: [TokenGuard]},
  { path: 'cargar', component: CargarComponent, canActivate: [TokenGuard]},
  { path: 'gestionar', component: GestionarComponent, canActivate: [TokenGuard]},
  { path: 'gestionar/:id', component: GestionarComponent, canActivate: [TokenGuard]},
  { path: 'gestionar/:cli/:car/:ges', component: GestionarComponent, canActivate: [TokenGuard]},
  { path: 'pagos', component: PagosComponent, canActivate: [TokenGuard]},
  { path: 'creditos', component: CreditosComponent, canActivate: [TokenGuard]},
  { path: 'actualizar', component: ActualizarComponent, canActivate: [TokenGuard]},
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [TokenGuard]},
  { path: 'recargo', component: RecargoComponent, canActivate: [TokenGuard]},
  { path: 'tipo-recargo', component: TipoRecargoComponent, canActivate: [TokenGuard]},
  { path: 'descargas', component: DescargarComponent, canActivate: [TokenGuard]},
  { path: 'reporte-general', component: GeneralComponent, canActivate: [TokenGuard]},
  { path: 'ultima-gestion', component: UltimaComponent, canActivate: [TokenGuard]},
  { path: 'asignacion', component: AsignacionComponent, canActivate: [TokenGuard]},
  { path: 'cuentacartera', component: CuentaCarteraComponent, canActivate: [TokenGuard]},
  { path: 'tgconecconta', component: TgConecContaComponent, canActivate: [TokenGuard]},
  { path: 'nosotros', component: NosotrosComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponent = [
  LoginComponent,
  InicioComponent,
  ReportesComponent,
  PerfilComponent,
  MenusComponent,
  AdministracionComponent,
  DetalleTelefonoComponent,
  UsuariosComponent,
  CarteraComponent,
  TipoCarteraComponent,
  RolesComponent,
  GestoresComponent,
  GestionComponent,
  AccionesComponent,
  TipoCorreoComponent,
  TipoDireccionComponent,
  TipoDocAdicionalComponent,
  TipoGestionComponent,
  TipoTelefonoComponent,
  TipoTrabajoComponent,
  TrabajoComponent,
  ClienteComponent,
  CorreoComponent,
  DireccionComponent,
  TelefonoComponent,
  CliadminComponent,
  ConectividadComponent,
  ContactabilidadComponent,
  CuentaComponent,
  GaranteComponent,
  HistorialSesionesComponent,
  HistorialDescansoComponent,
  HisadminComponent,
  AccionesComponent,
  CargarComponent,
  GestionarComponent,
  PagosComponent,
  CreditosComponent,
  ActualizarComponent,
  NotificacionesComponent,
  ChatComponent,
  AsignacionComponent,
  CuentaCarteraComponent,
  TgConecContaComponent,
  NosotrosComponent,
];
