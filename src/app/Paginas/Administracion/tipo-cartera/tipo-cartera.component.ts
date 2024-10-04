import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, timeout } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { generarPDF, Tipo_CarteraI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-tipo-cartera',
  templateUrl: './tipo-cartera.component.html',
  styleUrls: ['./tipo-cartera.component.css'],
})
export class TipoCarteraComponent implements OnInit {
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
  MenuAcceso: ResultadoMenuI[] = this.permisos.menu;  
  PaginaActual: ResultadoMenuI = this.MenuAcceso.find((elemento) => {
    return elemento.men_url === 'tipocartera';
}) as ResultadoMenuI;


  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);


  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gTipoCartera!:generarPDF;

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
      this.txtBusqueda.patchValue(
        this.txtBusqueda.value!.toUpperCase()
      );
  }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaTipoCartera: Tipo_CarteraI[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaTipoCartera = [];
      this.FraccionDatos = 0;
    }

    this.ListaTipoCartera = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetTipoCarteraFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaTipoCartera = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaTipoCartera)
            {
              let ocD: any = {
                idTipo:tipoT.id_tipo_cartera,
                Descripcion:tipoT.cart_tip_descripcion,
                FIngreso:tipoT.cart_tip_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.cart_tip_fecha_in.toString()),
                Estado:tipoT.cart_tip_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'tipoCartera', listado: listadoObjeto
            };
            this.gTipoCartera=om;
          if (this.ListaTipoCartera.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaTipoCartera.length;
            this.FraccionarValores(
              this.ListaTipoCartera,
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

  GetFiltrarElemento(valor: string, tipo: number){
    this.ListaTipoCartera = [];
    this.loading = true;

    this.api
      .GetT_C_FracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaTipoCartera = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaTipoCartera.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaTipoCartera.length;
            this.FraccionarValores(
              this.ListaTipoCartera,
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
  /************************************** AGREGAR ELEMENTO  ******************************************************** */
  TituloFormulario = '';
  TipoCarteraForms = new FormGroup({
    id_tipo_cartera: new FormControl( 0, Validators.required),
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
  ActDesControles(num:number){
    if(num === 0){ //inactivos
      this.TipoCarteraForms.get('id_tipo_cartera')?.disable()
      this.TipoCarteraForms.get('cart_tip_descripcion')?.disable()
      this.TipoCarteraForms.get('cart_tip_fecha_act')?.disable()
      this.TipoCarteraForms.get('cart_tip_fecha_desact')?.disable()
      this.TipoCarteraForms.get('cart_tip_fecha_in')?.disable()
      this.TipoCarteraForms.get('cart_tip_fecha_up')?.disable()
      this.TipoCarteraForms.get('cart_tip_esactivo')?.disable()
    }
    if(num === 1){ //activos
      this.TipoCarteraForms.get('id_tipo_cartera')?.enable()
      this.TipoCarteraForms.get('cart_tip_descripcion')?.enable()
      this.TipoCarteraForms.get('cart_tip_fecha_act')?.enable()
      this.TipoCarteraForms.get('cart_tip_fecha_desact')?.enable()
      this.TipoCarteraForms.get('cart_tip_fecha_in')?.enable()
      this.TipoCarteraForms.get('cart_tip_fecha_up')?.enable()
      this.TipoCarteraForms.get('cart_tip_esactivo')?.enable()
    }
    if(num === 2){ //edicion
      this.TipoCarteraForms.get('cart_tip_descripcion')?.enable()
      this.TipoCarteraForms.get('cart_tip_esactivo')?.enable()
  
    }
  }

  AgregarEditarElemento(num: number) {
    if (num === 1) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Agregar';
      this.ActDesControles(2)
    }
    if (num === 2) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Editar';
      this.ActDesControles(2)
      
    }
    if (num === 3) {
      this.TituloFormulario = 'Visualizar';
      this.ActDesControles(0)
    }
   
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gTipoCartera);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gTipoCartera);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gTipoCartera);
    }
  }

  CerrarAgregarEditarElemento() {
      this.EncerarComponentes();
  }

  GuardarObjeto(datos:any) {
    
    datos.cart_tip_esactivo =
      datos.cart_tip_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutTipoCartera(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if(exito == 1){
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroActualizado();
            }
            else{
              
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
        .PostTipoCartera(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if(exito == 1){
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroAgregado();
            }
            else{
              
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
  ActualizaEstado(elemento: Tipo_CarteraI) {
    elemento.cart_tip_esactivo = (
      elemento.cart_tip_esactivo == '1' ? 0 : 1
    ).toString();
    this.api.PutTipoCartera(elemento).subscribe((x) => this.ListarElementos(1));
  }
  EliminarElemento(elemento: Tipo_CarteraI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cart_tip_esactivo = '3';
        this.api.PutTipoCartera(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  CargarElemento(datos: any, num: number) {
    this.TipoCarteraForms.patchValue({
      id_tipo_cartera: datos.id_tipo_cartera,
      cart_tip_descripcion: datos.cart_tip_descripcion,
      cart_tip_fecha_act: this.Fechas.fechaFormato(datos.cart_tip_fecha_act),
      cart_tip_fecha_desact: this.Fechas.fechaFormato(datos.cart_tip_fecha_desact),
      cart_tip_fecha_in: this.Fechas.fechaFormato(datos.cart_tip_fecha_in),
      cart_tip_fecha_up: this.Fechas.fechaFormato(datos.cart_tip_fecha_up),
      cart_tip_esactivo: datos.cart_tip_esactivo === '1' ? true : false,
    });

    this.AgregarEditarElemento(num);
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.ResetTipoCarteraForms();
    /************ variables de Contenido ********** */
    this.loading = false;
    // this.visible = false;
    // this.FraccionDatos = 0;
    // this.DatosBienInmueble = [];
    this.itemBusqueda.patchValue('');
    this.txtBusqueda.patchValue('');
    // this.buscarPersona.patchValue('');

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
        const resultado = this.ListaTipoCartera.filter((elemento) => {
          return elemento.cart_tip_descripcion.includes(nombre.toUpperCase());
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
}
