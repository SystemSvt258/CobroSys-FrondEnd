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
import { CarteraI, generarPDF, Tipo_CarteraI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import { TipoCarteraComponent } from '../tipo-cartera/tipo-cartera.component';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-cartera',
  templateUrl: './cartera.component.html',
  styleUrls: ['./cartera.component.css'],
})
export class CarteraComponent implements OnInit {
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
    return elemento.men_url === 'cartera';
}) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gCartera!:generarPDF;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = [
    '',
    'Descripción',
    'Descripción Incompleta',
    'Estado',
  ];
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
  ListaCartera: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaCartera = [];
      this.FraccionDatos = 0;
    }

    this.ListaCartera = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetCarteraFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaCartera = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const c of this.ListaCartera)
            {
              let ocD: any = {
                id:c['id_cartera'],
                Descripcion:c['cart_descripcion'],
                Tipo:c['cart_tip_descripcion'],
                Observacion:c['cart_observacion'],
                Fecha:c['cart_fecha_in'] ===null?null:this.Fechas.fechaCortaAbt(c['cart_fecha_in']),
                Estado:c['cart_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cartera', listado: listadoObjeto
            };
            this.gCartera=om;
          if (this.ListaCartera.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCartera.length;
            this.FraccionarValores(this.ListaCartera, this.ConstanteFraccion);
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
  FiltrarElemento() {
    const valor: any = this.txtBusqueda.value?.toString();
    let tipo: number;
    if (this.itemBusqueda.value === 'Estado') {
      tipo = 0;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Descripción') {
      tipo = 1;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Descripción Incompleta') {
      tipo = 3;
      this.GetFiltrarElemento(valor, tipo);
    }
  }
  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaCartera = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetCarteraFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaCartera = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const c of this.ListaCartera)
            {
              let ocD: any = {
                id:c['id_cartera'],
                Descripcion:c['cart_descripcion'],
                Tipo:c['cart_tip_descripcion'],
                Observacion:c['cart_observacion'],
                Fecha:c['cart_fecha_in'] ===null?null:this.Fechas.fechaCortaAbt(c['cart_fecha_in']),
                Estado:c['cart_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cartera', listado: listadoObjeto
            };
            this.gCartera=om;
          if (this.ListaCartera.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCartera.length;
            this.FraccionarValores(this.ListaCartera, this.ConstanteFraccion);
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
  // ****************************************** OTROS ELEMENTOS *****************************************************************
  TipoCarteraList: Tipo_CarteraI[] = [];
  ModoTipoCartera: Number = 0;
  ListarTipoCartera() {
    this.api
      .GetTipoCarteraFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.TipoCarteraList = tracks['data'];
        })
      )
      .subscribe();
  }
  /************************************** OPERACIONES DE OTROS FORMULARIOS  ******************************************************** */
  TipoCarteraForms = new FormGroup({
    id_tipo_cartera: new FormControl(0, Validators.required),
    cart_tip_descripcion: new FormControl('', Validators.required),
    cart_tip_fecha_act: new FormControl(this.Fechas.fecha()),
    cart_tip_fecha_desact: new FormControl(this.Fechas.fecha()),
    cart_tip_fecha_in: new FormControl(this.Fechas.fecha()),
    cart_tip_fecha_up: new FormControl(this.Fechas.fecha()),
    cart_tip_esactivo: new FormControl(true),
  });
  ResetTipoCarteraForms() {
    this.TipoCarteraForms.reset({
      id_tipo_cartera: 0,
      cart_tip_descripcion: '',
      cart_tip_fecha_act: this.Fechas.fecha(),
      cart_tip_fecha_desact: this.Fechas.fecha(),
      cart_tip_fecha_in: this.Fechas.fecha(),
      cart_tip_fecha_up: this.Fechas.fecha(),
      cart_tip_esactivo: true,
    });
  }
  VerTipoCartera(id: string) {
    this.ModoTipoCartera = 1;
    const resultado: Tipo_CarteraI | undefined = this.TipoCarteraList.find((elemento) => {
      return elemento.id_tipo_cartera === Number(id);
    });
    
if (resultado) {
  this.TipoCarteraForms.patchValue({
    cart_tip_descripcion: resultado.cart_tip_descripcion,
    cart_tip_esactivo: resultado.cart_tip_esactivo === '1' ? true : false,
  
  });
}
    (<HTMLElement>document.getElementById('AgregarTipoCartera')).classList.add(
      'modal--show'
    );
  }
  AgregarTipoCartera() {
    this.TipoCarteraList = [];
    this.CarteraForms.patchValue({
      id_tipo_cartera: ''});
    (<HTMLElement>document.getElementById('AgregarTipoCartera')).classList.add(
      'modal--show'
    );
  }
  CerrarAgregarTipoCartera() {
    this.ModoTipoCartera = 0;
    this.ResetTipoCarteraForms();
    (<HTMLElement>(
      document.getElementById('AgregarTipoCartera')
    )).classList.remove('modal--show');
  }
  GuardarObjetoTC(datos: any) {
    datos.id_tipo_cartera = Number(datos.id_tipo_cartera);
    datos.cart_tip_esactivo = datos.cart_tip_esactivo.toString() === 'true' ? '1' : '0';
    this.api
      .PostTipoCartera(datos)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            this.CerrarAgregarTipoCartera();
          } else {
            this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
          }
        }),
        catchError((error) => {
          this.alerta.ErrorEnLaOperacion();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  /************************************** AGREGAR ELEMENTO  ******************************************************** */
  TituloFormulario = '';
  CarteraForms = new FormGroup({
    id_cartera: new FormControl(0, Validators.required),
    id_tipo_cartera: new FormControl('', Validators.required),
    cart_descripcion: new FormControl('', Validators.required),
    cart_observacion: new FormControl(''),
    cart_fecha_act: new FormControl(this.Fechas.fecha()),
    cart_fecha_desact: new FormControl(this.Fechas.fecha()),
    cart_fecha_in: new FormControl(this.Fechas.fecha()),
    cart_fecha_up: new FormControl(this.Fechas.fecha()),
    cart_esactivo: new FormControl(true),
  });
  ResetCarteraForms() {
    this.CarteraForms.reset({
      id_cartera: 0,
      id_tipo_cartera: '',
      cart_descripcion: '',
      cart_observacion: '',
      cart_fecha_act: this.Fechas.fecha(),
      cart_fecha_desact: this.Fechas.fecha(),
      cart_fecha_in: this.Fechas.fecha(),
      cart_fecha_up: this.Fechas.fecha(),
      cart_esactivo: true,
    });
  }
  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.CarteraForms.get('id_cartera')?.disable();
      this.CarteraForms.get('id_tipo_cartera')?.disable();
      this.CarteraForms.get('cart_descripcion')?.disable();
      this.CarteraForms.get('cart_observacion')?.disable();
      this.CarteraForms.get('cart_fecha_act')?.disable();
      this.CarteraForms.get('cart_fecha_desact')?.disable();
      this.CarteraForms.get('cart_fecha_in')?.disable();
      this.CarteraForms.get('cart_fecha_up')?.disable();
      this.CarteraForms.get('cart_esactivo')?.disable();
    }
    if (num === 1) {
      //activos
      this.CarteraForms.get('id_cartera')?.enable();
      this.CarteraForms.get('id_tipo_cartera')?.enable();
      this.CarteraForms.get('cart_descripcion')?.enable();
      this.CarteraForms.get('cart_observacion')?.enable();
      this.CarteraForms.get('cart_fecha_act')?.enable();
      this.CarteraForms.get('cart_fecha_desact')?.enable();
      this.CarteraForms.get('cart_fecha_in')?.enable();
      this.CarteraForms.get('cart_fecha_up')?.enable();
      this.CarteraForms.get('cart_esactivo')?.enable();
    }
    if (num === 2) {
      //edicion
      this.CarteraForms.get('id_tipo_cartera')?.enable();
      this.CarteraForms.get('cart_descripcion')?.enable();
      this.CarteraForms.get('cart_observacion')?.enable();
      this.CarteraForms.get('cart_esactivo')?.enable();
    }
  }

  AgregarEditarElemento(num: number) {
    if (num === 1) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Agregar';
      this.ActDesControles(2);
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
    datos.id_tipo_cartera = Number(datos.id_tipo_cartera);
    datos.cart_esactivo = datos.cart_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutCartera(datos)
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
        .PostCartera(datos)
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
  ActualizaEstado(elemento: CarteraI) {
    elemento.cart_esactivo = (elemento.cart_esactivo == '1' ? 0 : 1).toString();
    this.api.PutCartera(elemento).subscribe((x) => this.ListarElementos(1));
  }
  EliminarElemento(elemento: CarteraI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cart_esactivo = '3';
        this.api.PutCartera(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  CargarElemento(datos: any, num: number) {
    this.ListarTipoCartera();
    this.CarteraForms.patchValue({
      id_cartera: datos.id_cartera,
      id_tipo_cartera: datos.id_tipo_cartera,
      cart_descripcion: datos.cart_descripcion,
      cart_observacion: datos.cart_observacion,
      cart_fecha_act: this.Fechas.fechaFormato(datos.cart_fecha_act),
      cart_fecha_desact: this.Fechas.fechaFormato(datos.cart_fecha_desact),
      cart_fecha_in: this.Fechas.fechaFormato(datos.cart_fecha_in),
      cart_fecha_up: this.Fechas.fechaFormato(datos.cart_fecha_up),
      cart_esactivo: datos.cart_esactivo === '1' ? true : false,
    });

    this.AgregarEditarElemento(num);
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.TipoCarteraList = [];
    this.ResetCarteraForms();
    /************ variables de Contenido ********** */
    this.loading = false;

    this.itemBusqueda.patchValue('');
    this.txtBusqueda.patchValue('');

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
        const resultado = this.ListaCartera.filter((elemento) => {
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
      this.reporte.generarPDF(this.gCartera);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gCartera);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gCartera);
    }
  }
}
