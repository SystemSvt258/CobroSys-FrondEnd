import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Menus } from 'src/app/Clases/Menus';
import { Rol } from 'src/app/Clases/Rol';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { PermisosAcceso } from 'src/app/Control/Permisos';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { RolesI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
  constructor(
    private P_Acceso: PermisosAcceso,
    private Rol_M: Rol,
    private MenusM: Menus,
    // private ConectividadM: Conectividad,
    // private ContactabilidadM: Contactabilidad,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,
    public validar: TipoDeTexto
  ) {}
  PaginaActual: any;
  ngOnInit(): void {
    this.PaginaActual = this.P_Acceso.checkLocal('roles');
    this.ListarElementos(1);
  }
  TituloFormulario: string = '';

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = ['Rol', 'Observación', 'Estado'];
  ParametrosEstado: any[] = [
    { name: 'Activo', value: 1 },
    { name: 'Inactivo', value: 0 },
    // { name: 'Eliminados', value: 3 },
  ];

  itemBusqueda = new FormControl('', [Validators.required]);
  txtBusqueda = new FormControl('', [Validators.required]);

  GetBusquedaPor(item: string) {
    this.itemBusqueda.patchValue(item);
    this.txtBusqueda.patchValue('');
    const inputElement = document.getElementById(
      'txtValorBusqueda'
    ) as HTMLInputElement;

    if (item.length > 0 && inputElement != null) {
      inputElement.focus();
    }
  }

  ConvertirMayusculas() {
    this.txtBusqueda.patchValue(this.txtBusqueda.value!.toUpperCase());
  }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListRoles: any[] = [];

  ListarElementos(num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.GetBusquedaPor('');
    if (num === 1) {
      this.FraccionDatos = 0;
    }

    this.ListRoles = [];
    this.Rol_M.ListarElementos(
      this.FraccionDatos,
      Number(this.PaginaActual.Usuario.usr_rango_datos)
    )
      .pipe(
        map((datos) => {
          CargandoLoad.classList.remove('modal--show');
          if (datos!) {
            this.ListRoles = datos;
            this.DatosTemporalesBusqueda = datos;
            if (this.ListRoles.length > 0) {
              this.ContadorDatosGeneral = this.ListRoles.length;
              this.FraccionarValores(
                this.ListRoles,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
  }

  FiltrarElemento() {
    const valor: any = this.txtBusqueda.value?.toString().trim();
    let tipo: number;
    if (valor.length > 0) {
      if (this.itemBusqueda.value === 'Estado') {
        tipo = 0;
        this.GetFiltrarElemento(valor, tipo);
      }
      if (this.itemBusqueda.value === 'Rol') {
        tipo = 1;
        this.GetFiltrarElemento(valor, tipo);
      }
      if (this.itemBusqueda.value === 'Observación') {
        tipo = 2;
        this.GetFiltrarElemento(valor, tipo);
      }
    } else {
      this.alerta.AlertaEnLaPeticion('No ingreso ningun parametro de busqueda');
    }
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListRoles = [];
    this.Rol_M.FiltrarElementos(valor, tipo)
      .pipe(
        map((datos) => {
          if (datos!) {
            this.ListRoles = datos;
            this.DatosTemporalesBusqueda = datos;
            if (this.ListRoles.length > 0) {
              this.ContadorDatosGeneral = this.ListRoles.length;
              this.FraccionarValores(
                this.ListRoles,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
  }
  // /************************************** AGREGAR ELEMENTO  ******************************************************** */

  RolesForms = new FormGroup({
    id_rol: new FormControl(0, [Validators.required]),
    rol_descripcion: new FormControl('', [Validators.required]),
    rol_observacion: new FormControl(''),
    rol_fecha_act: new FormControl(this.Fechas.fecha()),
    rol_fecha_desact: new FormControl(this.Fechas.fecha()),
    rol_fecha_in: new FormControl(this.Fechas.fecha()),
    rol_fecha_up: new FormControl(this.Fechas.fecha()),
    rol_esactivo: new FormControl(true),
  });

  ResetRolesForms() {
    this.RolesForms.reset({
      id_rol: 0,
      rol_descripcion: '',
      rol_observacion: '',
      rol_fecha_act: this.Fechas.fecha(),
      rol_fecha_desact: this.Fechas.fecha(),
      rol_fecha_in: this.Fechas.fecha(),
      rol_fecha_up: this.Fechas.fecha(),
      rol_esactivo: true,
    });
  }

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.RolesForms.get('id_rol')?.disable();
      this.RolesForms.get('rol_descripcion')?.disable();
      this.RolesForms.get('rol_observacion')?.disable();
      this.RolesForms.get('rol_fecha_act')?.disable();
      this.RolesForms.get('rol_fecha_desact')?.disable();
      this.RolesForms.get('rol_fecha_in')?.disable();
      this.RolesForms.get('rol_fecha_up')?.disable();
      this.RolesForms.get('rol_esactivo')?.disable();
    }
    if (num === 1) {
      //activos
      this.RolesForms.get('id_rol')?.enable();
      this.RolesForms.get('rol_descripcion')?.enable();
      this.RolesForms.get('rol_observacion')?.enable();
      this.RolesForms.get('rol_fecha_act')?.enable();
      this.RolesForms.get('rol_fecha_desact')?.enable();
      this.RolesForms.get('rol_fecha_in')?.enable();
      this.RolesForms.get('rol_fecha_up')?.enable();
      this.RolesForms.get('rol_esactivo')?.enable();
    }
    if (num === 2) {
      //edicion')?.enable()
      this.RolesForms.get('rol_descripcion')?.enable();
      this.RolesForms.get('rol_observacion')?.enable();
      this.RolesForms.get('rol_esactivo')?.enable();
    }
  }

  AgregarEditarElemento(num: number) {
    if (num === 1) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Agregar';
      this.ListadoMenus();
      this.ActDesControles(2);
    }
    if (num === 2) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Editar';
      this.ActDesControles(2);
    }
    if (num === 3) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Visualizar';
      this.ActDesControles(0);
    }
  }

  CerrarAgregarEditarElemento() {
    this.EncerarComponentes();
  }

  SeleccionadosGuardar(datos: any) {
    let Seleccionados: any[] = [];
    for (let datosmenu of datos) {
      let menu: any = {
        id_rol_detalle_menu: Number(datosmenu.id_rol_detalle_menu),
        id_rol: Number(datosmenu.id_rol),
        id_menu: Number(datosmenu.id_menu),
        rol_det_m_lectura: datosmenu.rol_det_m_lectura,
        rol_det_m_tipo: '0',
        rol_det_m_esactivo: '1',
      };
      Seleccionados.push(menu);
    }
    return Seleccionados;
  }

  GuardarObjeto(datos: any) {
    let seleccionados = this.DatosTemporalesBusquedaM.filter((elements) => {
      return elements.isCheked == '1';
    });

    let select = this.SeleccionadosGuardar(seleccionados);
    datos.id_rol = Number(datos.id_rol);
    datos.rol_esactivo = datos.rol_esactivo.toString() === 'true' ? '1' : '0';
    datos.detalle = select;
    this.Rol_M.GuardarElemento(datos)
      .pipe(
        map((x) => {
          if (x == 1) {
            this.ListarElementos(1);
            this.CerrarAgregarEditarElemento();
            this.EncerarComponentes();
            this.TextoFiltro.patchValue('');
            if (datos.id_cuenta_tipo_cartera != 0) {
              this.alerta.RegistroActualizado();
            } else {
              this.alerta.RegistroAgregado();
            }
          } else {
            this.ActDesControles(0);
            this.ActDesControles(2);
          }
        })
      )
      .subscribe();
  }

  // /************************************** EDITAR ELEMENTO  ******************************************************** */
  ActualizaEstado(elemento: RolesI) {
    elemento.rol_esactivo = (elemento.rol_esactivo == '1' ? 0 : 1).toString();
    this.Rol_M.GuardarElemento(elemento).subscribe((x) => {
      if (x == 1) {
        this.alerta.RegistroActualizado();
      }
    });
  }

  EliminarElemento(elemento: RolesI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.rol_esactivo = '3';
        this.Rol_M.GuardarElemento(elemento).subscribe((x) => {
          if (x == 1) {
            this.ListarElementos(1);
            this.alerta.RegistroEliminado();
          }
        });
      }
    });
  }

  CargarElemento(datos: any, num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.ListadoMenus(datos.detalle);
    this.RolesForms.patchValue({
      id_rol: datos.id_rol.toString(),
      rol_descripcion: datos.rol_descripcion.toString(),
      rol_observacion: datos.rol_observacion.toString(),
      rol_fecha_act: datos.rol_fecha_act,
      rol_fecha_desact: datos.rol_fecha_desact,
      rol_fecha_in: datos.rol_fecha_in,
      rol_fecha_up: datos.rol_fecha_up,
      rol_esactivo: datos.rol_esactivo === '1' ? true : false,
    });
    this.AgregarEditarElemento(num);
    CargandoLoad.classList.remove('modal--show');
  }

  // // ****************************************** COMPLEMENTOS *****************************************************************

  ListaMenus: any[] = [];
  ListadoMenus(detalle?: any) {
    this.MenusM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          if (datos) {
            for (let datosmenu of datos) {
              let menu: any = {
                isCheked: '0',
                id_rol_detalle_menu: '0',
                id_rol: '0',
                id_menu: datosmenu.id_menu,
                men_descripcion: datosmenu.men_descripcion,
                rol_det_m_lectura: '1',
              };
              this.ListaMenus.push(menu);
              this.DatosTemporalesBusquedaM.push(menu);
            }

            if (detalle && detalle.length > 0) {
              for (let det of detalle) {
                let menu: any = {
                  isCheked: '1',
                  id_rol_detalle_menu: det.id_rol_detalle_menu,
                  id_rol: det.id_rol,
                  id_menu: det.id_menu,
                  men_descripcion: '',
                  rol_det_m_lectura: det.rol_det_m_lectura,
                };
                this.ActualizarMenu(menu);
              }
            }
          }
          return datos;
        }),
        catchError((error) => {
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  ActualizarMenu(datos: any, tipo?: number) {
    const posicion: number = this.ListaMenus.findIndex(
      (objeto) => objeto.id_menu == datos.id_menu
    );
    const posicionT: number = this.DatosTemporalesBusquedaM.findIndex(
      (objeto) => objeto.id_menu == datos.id_menu
    );
    const elemento: any = this.ListaMenus.find(
      (objeto) => objeto.id_menu == datos.id_menu
    );
    const elementoT: any = this.DatosTemporalesBusquedaM.find(
      (objeto) => objeto.id_menu == datos.id_menu
    );
    this.ListaMenus = this.ListaMenus.filter((elements) => {
      return elements.id_menu != datos.id_menu;
    });
    this.DatosTemporalesBusquedaM = this.DatosTemporalesBusquedaM.filter((elements) => {
      return elements.id_menu != datos.id_menu;
    });
    let MenuAct: any = {
      isCheked: datos.isCheked,
      id_rol_detalle_menu: datos.id_rol_detalle_menu,
      id_rol: datos.id_rol,
      id_menu: elemento.id_menu,
      men_descripcion: elemento.men_descripcion,
      rol_det_m_lectura: datos.rol_det_m_lectura,
    };
    if (tipo == 1) MenuAct.isCheked = MenuAct.isCheked == '0' ? '1' : '0';
    if (tipo == 2)
      MenuAct.rol_det_m_lectura = MenuAct.rol_det_m_lectura == '0' ? '1' : '0';
    this.ListaMenus.splice(posicion, 0, MenuAct);
    this.DatosTemporalesBusquedaM.splice(posicionT, 0, MenuAct);
  }
  
  // // ****************************************** Encerar  Componentes *****************************************************************

  EncerarComponentes() {
    this.ResetRolesForms();
    this.itemBusqueda.patchValue('');
    this.txtBusqueda.patchValue('');
    this.TituloFormulario = '';
    this.ActDesControles(0);
    this.ListaMenus = [];
    this.DatosTemporalesBusquedaM = [];
    this.VaciarFiltro(1);
    // this.ContactabilidadList = [];
    // this.CamposVisibles = '';
  }

  // // ****************************************** PAGINACION *****************************************************************
  DatosCargaMasiva!: any[];
  DatosTemporales: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;
  ContadorDatos: number = 0;
  RangoPaginacion: number = 0;
  InicioPaginacion: number = 0;
  FinalPaginacion: number = 0;

  FraccionarValores(datos?: any, rango?: number) {
    if (rango != null && datos != null) {
      this.EncerarVariablesPaginacion();
      this.ContadorDatos = datos.length;
      this.DatosTemporales = datos;
      this.RangoPaginacion = rango;
      this.FinalPaginacion = rango;
      this.DatosCargaMasiva = datos.slice(
        this.InicioPaginacion,
        this.FinalPaginacion
      );
    } else {
      this.DatosCargaMasiva = this.DatosTemporales.slice(
        this.InicioPaginacion,
        this.FinalPaginacion
      );
    }
  }

  BtnNext(rango?: number) {
    if (rango != null) {
      this.FraccionDatos =
        this.FraccionDatos + Number(this.PaginaActual.Usuario.usr_rango_datos);
      this.ListarElementos(2);
    }
    this.InicioPaginacion = this.InicioPaginacion + this.RangoPaginacion;
    this.FinalPaginacion = this.FinalPaginacion + this.RangoPaginacion;
    this.FraccionarValores();
  }

  BtnPrevious(rango?: number) {
    if (rango != null) {
      this.FraccionDatos =
        this.FraccionDatos - Number(this.PaginaActual.Usuario.usr_rango_datos);
      this.ListarElementos(2);
    }

    if (this.InicioPaginacion >= this.RangoPaginacion) {
      this.InicioPaginacion = this.InicioPaginacion - this.RangoPaginacion;
      this.FinalPaginacion = this.FinalPaginacion - this.RangoPaginacion;
      this.FraccionarValores();
    }
  }

  EncerarVariablesPaginacion() {
    this.ContadorDatos = 0;
    this.RangoPaginacion = 0;
    this.InicioPaginacion = 0;
    this.FinalPaginacion = 0;
    this.DatosTemporales = [];
  }

  // // ******************************************  FILTRO MODO GENERAL *****************************************************************

  DatosTemporalesBusqueda: any[] = [];
  FiltroPor: string = 'Seleccione ...';
  TextoFiltro = new FormControl({ value: '', disabled: true }, [
    Validators.required,
  ]);
  ParametrosDeFiltro: any[] = [
    { etiqueta: 'ThF0', texto: 'Rol', valor: '0' },
    { etiqueta: 'ThF1', texto: 'Observación', valor: '1' },
    // { etiqueta: 'ThF2', texto: 'Menu', valor: '2' },
  ];
  DatosTemporalesBusquedaM: any[] = [];
  FiltroPorM: string = 'Seleccione ...';
  TextoFiltroM = new FormControl({ value: '', disabled: true }, [
    Validators.required,
  ]);
  ParametrosDeFiltroMenu: any[] = [
    { etiqueta: 'ThF2', texto: 'Menu', valor: '2' },
  ];
  FiltrarPor(filtro: string, tipo: number) {
    this.VaciarFiltro(tipo);
    const EtqFiltro =
      tipo == 0
        ? this.ParametrosDeFiltro.find((elemento) => {
            return elemento.valor == filtro;
          })
        : this.ParametrosDeFiltroMenu.find((elemento) => {
            return elemento.valor == filtro;
          });
    tipo == 0
      ? (this.FiltroPor = EtqFiltro.texto)
      : (this.FiltroPorM = EtqFiltro.texto);
    const inputElement = document.getElementById(
      'TxtF' + tipo
    ) as HTMLInputElement;
    tipo == 0
      ? this.TextoFiltro.patchValue('')
      : this.TextoFiltroM.patchValue('');
    inputElement.disabled = false;
    inputElement.focus();
  }
  FiltrarLista(tipo: number) {
    const EtqFiltro = tipo == 0? this.ParametrosDeFiltro.find((elemento) => {
      return elemento.texto ==  this.FiltroPor;
    }):this.ParametrosDeFiltroMenu.find((elemento) => {
      return elemento.texto ==  this.FiltroPorM;
    });
    const contador =
      tipo == 0
        ? this.TextoFiltro.value!.trim().length!
        : this.TextoFiltroM.value!.trim().length!;
    (tipo == 0 || tipo==null) ?? this.EncerarVariablesPaginacion(); //jkhgcfxdsAzdfghj
    tipo == 0
      ? this.TextoFiltro.patchValue(this.TextoFiltro.value!.toUpperCase())
      : this.TextoFiltroM.patchValue(this.TextoFiltroM.value!.toUpperCase());
    const ThEtiqueta = document.getElementById(
      EtqFiltro.etiqueta
    ) as HTMLInputElement;
    if (contador != 0) {
      ThEtiqueta.style.color = 'red';
    } else {
      ThEtiqueta.style.color = '';
    }
    if (EtqFiltro.texto == 'Rol') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListRoles.filter((elemento) => {
        return elemento.rol_descripcion.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
    }
    if (EtqFiltro.texto == 'Observación') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListRoles.filter((elemento) => {
        return elemento.rol_observacion.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
    }
    if (EtqFiltro.texto == 'Menu') {
      let nombre = this.TextoFiltroM.value!;
      this.ListaMenus = this.ListaMenus.filter((elemento) => {
        return elemento.men_descripcion.includes(nombre.toUpperCase());
      });
    }
  }

  VaciarFiltro(tipo: number) {
    const inputElement = document.getElementById(
      'TxtF' + tipo
    ) as HTMLInputElement;
    inputElement.disabled = true;
    for (let datos of tipo == 0
      ? this.ParametrosDeFiltro
      : this.ParametrosDeFiltroMenu) {
      const ThEtiqueta = document.getElementById(
        datos.etiqueta
      ) as HTMLInputElement;
      if (ThEtiqueta!) {
        ThEtiqueta.style.color = '';
      }
    }
    tipo == 0
      ? (this.FiltroPor = 'Seleccione ...')
      : (this.FiltroPorM = 'Seleccione ...');
    tipo == 0
      ? this.TextoFiltro.patchValue('')
      : this.TextoFiltroM.patchValue('');
      tipo == 0?this.FraccionarValores(this.DatosTemporalesBusqueda,
      Number(this.PaginaActual.Usuario.usr_fraccion_datos)):
      this.ListaMenus = this.DatosTemporalesBusquedaM;
  }
}
