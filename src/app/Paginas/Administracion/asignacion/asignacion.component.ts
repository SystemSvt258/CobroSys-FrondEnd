import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { AsignacionFiltroI, CarteraI, ClienteGestorCarteraI, generarPDF, GestionCG, Tipo_CarteraI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import { TipoCarteraComponent } from '../tipo-cartera/tipo-cartera.component';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Component({
  selector: 'app-asignacion',
  templateUrl: './asignacion.component.html',
  styleUrls: ['./asignacion.component.css'],
})
export class AsignacionComponent implements OnInit {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,public reporte:GeneradorReporte
  ) {}
  ngOnInit(): void {
    this.ListarElementos(1);
  }
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'asignacion';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  BuscarForms = new FormGroup({
    identificacion: new FormControl('', Validators.required),
    nombres_cliente: new FormControl('', Validators.required),
    cartera: new FormControl(0, Validators.required),
    gestor: new FormControl(0, Validators.required),
  });

  ResetClienteForms() {
    this.BuscarForms.reset({
      identificacion: '',
      nombres_cliente: '',
      cartera: 0,
      gestor: 0,
    });
  }

  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaAsignacion: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gAsignacion!:generarPDF;

  ListarElementos(num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    if (num === 1) {
      this.ListaAsignacion = [];
      this.FraccionDatos = 0;
    }

    this.ListaAsignacion = [];
    let listadoObjeto:any[] = [];
    this.api
      .GetClienteGestorCarteraFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaAsignacion = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const a of this.ListaAsignacion)
            {
              let ocD: any = {
                Cedula:a['cli_identificacion'],
                Nombre:a['cli_nombres'].toUpperCase(),
                Gestor:a['gestor'].toUpperCase(),
                Cartera:a['cartera'].toUpperCase(),
                FAsignacion:a['cgc_fecha_in']===null?null:this.Fechas.fechaCortaAbt(a['cgc_fecha_in']),
                Estado:a['cgc_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Asignacion', listado: listadoObjeto
            };
            this.gAsignacion=om;
          if (this.ListaAsignacion.length === 0) {
            CargandoLoad.classList.remove('modal--show');
            this.alerta.NoExistenDatos();
          } else {
            CargandoLoad.classList.remove('modal--show');
            this.ContadorDatosGeneral = this.ListaAsignacion.length;
            this.FraccionarValores(
              this.ListaAsignacion,
              this.ConstanteFraccion
            );
          }
        }),
        catchError((error) => {
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  
  GetFiltrarElemento() {
    let datos = this.BuscarForms.value;
    let filtro: AsignacionFiltroI = {
      identificacion: (datos.identificacion?.trim() == ''
        ? '0'
        : datos.identificacion)!,
      nombres_cliente: (datos.nombres_cliente?.trim() == ''
        ? '0'
        : datos.nombres_cliente)!,
      // cartera: [datos.cartera],
      cartera: datos.cartera!,
      gestor: datos.gestor!,
      codigo: this.FraccionDatos,
      rango: this.RangoDatos,
    };

    this.ListaAsignacion = [];
    let listadoObjeto:any[] = [];
    this.loading = true;

    this.api
      .GetClienteGestorCarteraFiltro(filtro)
      .pipe(
        map((tracks) => {
          this.ListaAsignacion = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const a of this.ListaAsignacion)
            {
              let ocD: any = {
                Cedula:a['cli_identificacion'],
                Nombre:a['cli_nombres'].toUpperCase(),
                Gestor:a['gestor'].toUpperCase(),
                Cartera:a['cartera'].toUpperCase(),
                FAsignacion:a['cgc_fecha_in']===null?null:this.Fechas.fechaCortaAbt(a['cgc_fecha_in']),
                Estado:a['cgc_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Asignacion', listado: listadoObjeto
            };
            this.gAsignacion=om;
          if (this.ListaAsignacion.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaAsignacion.length;
            this.FraccionarValores(
              this.ListaAsignacion,
              this.ConstanteFraccion
            );
          }
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  /************************************** ELEMENTO DE BUSQUEDA  ******************************************************** */
  TodasCarteraList: any[] = [];
  ListarCarteraT() {
    this.api
      .GetCarteraFracionado(0, 0)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.TodasCarteraList = datos;
        })
      )
      .subscribe();
  }

  TodosGestorList: any[] = [];
  ListarGestorT() {
    this.api
      .GetGestoresFracionadoFiltro('A', 5)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.TodosGestorList = datos;
        })
      )
      .subscribe();
  }
  /************************************** AGREGAR ELEMENTO  ******************************************************** */
  TituloFormulario = '';
  AsignacionForms = new FormGroup({
    id_cliente_gestor_cartera: new FormControl(0, Validators.required),
    id_cartera: new FormControl('', Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    id_gestor: new FormControl(''),
    cgc_observacion: new FormControl(''),
    cgc_esactivo: new FormControl(true),
    cgc_baseactual: new FormControl(true),
  });
  ResetAsignacionForms() {
    this.AsignacionForms.reset({
      id_cliente_gestor_cartera: 0,
      id_cartera: '',
      cli_identificacion: '',
      id_gestor: '',
      cgc_observacion: '',
      cgc_esactivo: true,
      cgc_baseactual: true,
    });
  }
  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.AsignacionForms.get('id_cliente_gestor_cartera')?.disable();
      this.AsignacionForms.get('id_cartera')?.disable();
      this.AsignacionForms.get('cli_identificacion')?.disable();
      this.AsignacionForms.get('id_gestor')?.disable();
      this.AsignacionForms.get('cgc_observacion')?.disable();
      this.AsignacionForms.get('cgc_esactivo')?.disable();
      this.AsignacionForms.get('cgc_baseactual')?.disable();
    }
    if (num === 1) {
      //activos
      this.AsignacionForms.get('id_cliente_gestor_cartera')?.enable();
      this.AsignacionForms.get('id_cartera')?.enable();
      this.AsignacionForms.get('cli_identificacion')?.enable();
      this.AsignacionForms.get('id_gestor')?.enable();
      this.AsignacionForms.get('cgc_observacion')?.enable();
      this.AsignacionForms.get('cgc_esactivo')?.enable();
      this.AsignacionForms.get('cgc_baseactual')?.enable();
    }
    if (num === 2) {
      //edicion
      this.AsignacionForms.get('id_cartera')?.enable();
      this.AsignacionForms.get('cli_identificacion')?.enable();
      this.AsignacionForms.get('id_gestor')?.enable();
      this.AsignacionForms.get('cgc_observacion')?.enable();
    }
  }

  AgregarEditarElemento(num: number) {
    if (num === 1) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Agregar';
      this.ActDesControles(1);
    }
    if (num === 2) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Editar';
      this.ActDesControles(2);
    }
    if (num === 3) {
      this.TituloFormulario = 'Visualizar';
      this.ActDesControles(0);
    }
  }

  CerrarAgregarEditarElemento() {
    this.EncerarComponentes();
  }

  GuardarObjeto(datos: any) {
    datos.id_cartera = Number(datos.id_cartera);
    datos.id_gestor = Number(datos.id_gestor);
    datos.cgc_esactivo = datos.cgc_esactivo.toString() === 'true' ? '1' : '0';
    datos.cgc_baseactual = datos.cgc_baseactual.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutClienteGestorCartera(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroActualizado();
            } else {
              this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
              this.ActDesControles(0);
              this.ActDesControles(2);
            }
          }),
          catchError((error) => {
            this.alerta.ErrorEnLaOperacion();
            this.ActDesControles(0);
            this.ActDesControles(2);
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.api
        .PostClienteGestorCartera(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroAgregado();
            } else {
              this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
              this.ActDesControles(0);
              this.ActDesControles(2);
            }
          }),
          catchError((error) => {
            this.alerta.ErrorEnLaOperacion();
            this.ActDesControles(0);
            this.ActDesControles(2);
            throw new Error(error);
          })
        )
        .subscribe();
    }
  }

  /************************************** EDITAR ELEMENTO  ******************************************************** */
 
  EliminarElemento(elemento: ClienteGestorCarteraI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cgc_esactivo = '3';
        this.api.PutClienteGestorCartera(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  CargarElemento(datos: any, num: number) {
    // this.ListarCartera();
    this.AsignacionForms.patchValue({
      id_cliente_gestor_cartera: datos.id_cliente_gestor_cartera,
      id_cartera: datos.id_cartera,
      cli_identificacion: datos.cli_identificacion,
      id_gestor: datos.id_gestor,
      cgc_observacion: datos.cgc_observacion,
      cgc_esactivo: datos.cgc_esactivo == '1' ? true : false,
      cgc_baseactual: datos.cgc_baseactual == '1' ? true : false,
    });
    this.BuscarCliente();
    this.SeleccionarCartera();
    this.AgregarEditarElemento(num);
  }

  // ****************************************** FUNCIONES DE BUSQUEDA *****************************************************************
  ClienteInf = new FormControl(
    { value: '', disabled: true },
    Validators.required
  );
  BuscarCliente() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    let identificacion =
      this.AsignacionForms.get('cli_identificacion')?.value?.trim();
    if (identificacion?.length == 13 || identificacion?.length == 10) {
      CargandoLoad.classList.add('modal--show');
      this.api
        .GetClienteFracionadoFiltro(identificacion!, 10)
        .pipe(
          map((tracks) => {
            const datos = tracks['data'];
            CargandoLoad.classList.remove('modal--show');
            if (!datos) {
              this.alerta.NoExistenDatos();
            } else {
              this.ClienteInf.patchValue(datos.cli_nombres);
              this.ListarCartera(datos.cli_identificacion);
              // this.AsignacionForms.patchValue({ id_gestor: datos.id_gestor });
            }
          }),
          catchError((error) => {
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.ClienteInf.patchValue('');
      this.AsignacionForms.patchValue({
        id_cartera: '',
        id_gestor: '',
        cgc_observacion: '',
      });
      this.CarteraList = [];
      this.GestorList = [];
    }
  }

  CarteraList: any[] = [];
  ListarCartera(identificacion: string) {
    this.api
      .GetCarteraFracionadoFiltro(identificacion, 4)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.CarteraList = datos;
        })
      )
      .subscribe();
  }

  SeleccionarCartera() {
    let id_cartera = this.AsignacionForms.get('id_cartera')?.value;
    if (id_cartera != null) {
      this.ListarGestor(id_cartera!.toString());
    }
  }

  GestorList: any[] = [];
  ListarGestor(id_cartera: string) {
    this.api
      .GetGestoresFracionadoFiltro(id_cartera, 9)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.GestorList = datos;
        })
      )
      .subscribe();
  }

  NoHayDatos() {
    this.alerta.AlertaValidacionOk('¿Revise la informacion del cliente?');
  }
  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.CarteraList = [];
    this.GestorList = [];
    this.TodasCarteraList = [];
    this.TodosGestorList = [];
    this.ClienteInf.patchValue('');
    this.ResetAsignacionForms();
    /************ variables de Contenido ********** */
    
    this.TituloFormulario = '';
    this.ActDesControles(0);
  }
  // ****************************************** PAGINACION *****************************************************************
  DatosCargaMasiva!: any[];
  DatosTemporales: any[] = [];
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

  BtnNextUser(rango?: number) {
    if (rango != null) {
      this.FraccionDatos = this.FraccionDatos + this.RangoDatos;
      this.ListarElementos(2);
    }
    this.InicioPaginacion = this.InicioPaginacion + this.RangoPaginacion;
    this.FinalPaginacion = this.FinalPaginacion + this.RangoPaginacion;
    this.FraccionarValores();
  }

  BtnPreviousUser(rango?: number) {
    if (rango != null) {
      this.FraccionDatos = this.FraccionDatos - this.RangoDatos;
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
  /*********************  FILTRO MODO GENERAL *********************** */
  DatosTemporalesBusqueda: any[] = [];
  FirltroPor: string = '';
  TextoFiltro = new FormControl({ value: '', disabled: true }, [
    Validators.required,
  ]);

  FiltrarPor(filtro: string) {
    this.FirltroPor = filtro;
    this.TextoFiltro.patchValue('');
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    const ThDescripcion = document.getElementById(
      'ThDescripcion'
    ) as HTMLInputElement;

    ThDescripcion.style.color = '';
    inputElement.disabled = false;
    inputElement.focus();
  }
  FiltrarLista(num: number) {
    const contador = this.TextoFiltro.value!.trim().length!;
    this.EncerarVariablesPaginacion();
    this.TextoFiltro.patchValue(this.TextoFiltro.value!.toUpperCase());
    const ThDescripcion = document.getElementById(
      'ThDescripcion'
    ) as HTMLInputElement;
    if (this.FirltroPor === 'Descripcion') {
      let nombre = this.TextoFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaAsignacion.filter((elemento) => {
          return elemento.cart_descripcion.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThDescripcion.style.color = 'red';
      } else {
        ThDescripcion.style.color = '';
      }
    }
  }

  VaciarFiltro() {
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    const ThDescripcion = document.getElementById(
      'ThDescripcion'
    ) as HTMLInputElement;
    ThDescripcion.style.color = '';
    inputElement.disabled = true;
    this.FirltroPor = '';
    this.TextoFiltro.patchValue('');
    this.FraccionarValores(
      this.DatosTemporalesBusqueda,
      this.ConstanteFraccion
    );
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gAsignacion);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gAsignacion);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gAsignacion);
    }
  }
}
