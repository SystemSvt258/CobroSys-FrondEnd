import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  AsignacionClass,
  CarteraClass,
  ClienteCarteraClass,
  Conectivilidad_Class,
  Contactabilidad_Class,
  CorreosClass,
  CuentaCarteraClass,
  Cuenta_Class,
  CxCOperacionClass,
  DetalleTelefonoCClass,
  DireccionClass,
  GaranteClass,
  GestionCClass,
  GestionClass,
  GestorClass,
  PagoCClass,
  Pagos_Class,
  TelefonoClass,
  TipoCorreoCClass,
  TipoDireccionCClass,
  TipoGestionConectividadContactivilidadClasss,
  TipoTelefonoCClass,
  Tipo_CarteraClass,
  Tipo_Gestion_Class,
  Tipo_Trabajo_Class,
  Trabajo_Class,
} from 'src/app/Modelos/clases.interface';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import {
  CarteraI,
  ClienteI,
  CorreoI,
  DireccionI,
  GaranteI,
  TelefonoI,
  TipoGestionConectividadContactivilidadIC,
  TrabajoI,
  cargaMasiva,
} from 'src/app/Modelos/response.interface';
import * as XLSX from 'xlsx';
import { ApiService } from 'src/app/service/api.service';
import {
  Observable,
  catchError,
  concatMap,
  forkJoin,
  map,
  mergeMap,
  of,
  throwError,
} from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';

@Component({
  selector: 'app-cargar',
  templateUrl: './cargar.component.html',
  styleUrls: ['./cargar.component.css'],
})
export class CargarComponent implements OnInit {
  @ViewChild('archivoInput') archivoInput!: ElementRef;
  constructor(
    private router: Router,
    private api: ApiService,
    private cookeService: CookieService,
    private alerta:Alertas,
    private alertaCarga:Alertas,
    private Fechas:Fechas,
    private elementRef: ElementRef,

  ) {
  }
  ngOnInit() {
    // this.SubMenus();
    this.form = new FormGroup({
      title: new FormControl(''),
      archivo: new FormControl(null),
    });
    this.busquedaForm = new FormGroup({
      parametro: new FormControl(),
      opcionBusqueda: new FormControl(),
    });
    this.api
      .GetCarteraFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.listaCarteras = tracks['data'];
        }),
        catchError((error) => {
          throw new Error(error);
        })
      )
      .subscribe();
  }
  banderaGuardar:boolean=false;
  vDefecto:string='';
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menus: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menus.find((elemento) => {
    return elemento.men_url === 'cargar';
  }) as ResultadoMenuI;
  form!: FormGroup;
  archivo: File | null = null;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;

  TituloPagina: string = '';
  cargando: boolean = false;
  esImagen: boolean = false;
  esPdf: boolean = false;
  urlAbs!: string;
  url!: string;
  esCorrecto: boolean = false;
  ocultar: boolean = false;
  indicesDeHojas: number[] = [];
  listaFiltros: string[] = ['Correcto', 'Incorrectos', 'Filtro', 'Todos'];
  bDownload: boolean = true;
  bVerificar:boolean=false

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  TipoArchivo: any[] = [
    { id: 1, name: 'IMAGEN', value: '1' },
    { id: 2, name: 'PDF', value: '2' },
  ];
  itemFile = new FormControl('', [Validators.required]);
  CargarArchivos() {
    this.TituloPagina = 'Cargar Archivos';
  }
  cambiarTipoArchivo() {
    const SubirArchivo = document.getElementById(
      'SubirArchivo'
    ) as HTMLInputElement;

    if (this.itemFile.value == '1') {
      SubirArchivo.accept = 'image/*';
    } else if (this.itemFile.value == '2') {
      SubirArchivo.accept = '.pdf';
    } else {
      SubirArchivo.accept = '';
    }
  }
  /*******************************************************ELEMENTOS************************************************************** */
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  tamRow: number = 0;
  banderaMenajeError: boolean = false;
  banderaBusqueda: boolean = false;
  banderaFiltroCartera: boolean = false;
  busquedaForm!: FormGroup;
  listaCarteras!: CarteraI[];
  banderaNotificar: boolean = false;
  /********************************************************* */
  TipoElemento: any[] = [
    { id: 1, name: 'CLIENTES', value: '1' },
    { id: 2, name: 'CREDITOS', value: '2' },
    { id: 3, name: 'CORREOS', value: '3' },
    { id: 4, name: 'DIRECCIONES', value: '4' },
    { id: 5, name: 'GARANTES', value: '5' },
    { id: 6, name: 'TELEFONOS', value: '6' },
    { id: 7, name: 'TRABAJOS', value: '7' },
    { id: 8, name: 'TIPO CORREO', value: '8' },
    { id: 9, name: 'TIPO TELEFONO', value: '9' },
    { id: 10, name: 'TIPO DIRECCION', value: '10' },
    { id: 11, name: 'DETALLE TELEFONO', value: '11' },
    { id: 12, name: 'TIPO TRABAJO', value: '12' },
    { id: 13, name: 'CONTACTIVIDAD', value: '13' },
    { id: 14, name: 'CONECTIVIDAD', value: '14' },
    { id: 15, name: 'CUENTA', value: '15' },
    { id: 16, name: 'TIPO GESTION', value: '16' },
    { id: 17, name: 'CARTERA', value: '17' },
    { id: 18, name: 'TIPO CARTERA', value: '18' },
    { id: 19, name: 'GESTOR', value: '19' },
    { id: 20, name: 'ASIGNACION', value: '20' },
    { id: 21, name: 'CUENTA CARTERA', value: '21' },
    { id: 22, name: 'TIPO GESTION CONECTIVIDAD CONTACTIVIDAD', value: '22' },
    {id:23,name:'GESTIONES',value:'23'},
    {id:24,name:'PAGOS',value:'24'}
  ];
  TipoElementoOrdenado = this.TipoElemento.slice().sort((a:any, b:any) => a.name.localeCompare(b.name));

  itemFiles = new FormControl('', [Validators.required]);
  hojaFile = new FormControl('', [Validators.required]);
  countRows = new FormControl('', [Validators.required]);
  countColumns = new FormControl('', [Validators.required]);
  filtroCartera = new FormControl('', [Validators.required]);
  filtroMensaje = new FormControl('', [Validators.required]);
  isLoading: boolean = false;

  CargarElementos() {
    this.TituloPagina = 'Cargar Elementos';
  }

  /************************LISTA que se man a utilzar para el proceso de verificacion de las propiedades de cada entidad********************************* */
  data: any[] = [];
  dataGood: any[] = [];
  dataBad: any[] = [];
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ListaClientes: any[] = [];
  ListaErroresXRow: any[] = [];
  headers!: any;
  entidad!:
    | ClienteCarteraClass
    | TelefonoClass
    | DireccionClass
    | GaranteClass
    | CorreosClass
    | CxCOperacionClass
    | TipoCorreoCClass
    | TipoDireccionCClass
    | TipoTelefonoCClass
    | DetalleTelefonoCClass
    | Tipo_Trabajo_Class
    | Trabajo_Class
    | Cuenta_Class
    | Conectivilidad_Class
    | Contactabilidad_Class
    | Pagos_Class
    | GestionClass
    | Tipo_Gestion_Class
    | CarteraClass
    | Tipo_CarteraClass
    | GestorClass
    | AsignacionClass
    | CuentaCarteraClass
    | TipoGestionConectividadContactivilidadClasss
    |GestionCClass
    |PagoCClass;
  listaTipos: any[] = [];

  dataC: CorreoI[] = [];
  listaPerEdi: any[] = [{tipges_per_edi: 0,descripcion: 'Los demas Estados'}, {tipges_per_edi: 1,descripcion: 'Compromisos,Convenios,Liquidados,liquidados por confirmar'}, {tipges_per_edi: 2,descripcion: 'Todos los incumplidos'}];
  LeerArchivo(event: any): void {
    //const file = event.target.files[0];
    const files = (event.target as HTMLInputElement).files;
    this.archivo = files![0];
    this.indicesDeHojas = [];
    this.form.patchValue({ archivo: this.archivo });

    if (this.archivo) {
      const reader = new FileReader();
      if (
        this.archivo.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        reader.onload = (e: any) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const numeroHojasFile: number = workbook.SheetNames.length;
          for (let i = 0; i < numeroHojasFile; i++) {
            this.indicesDeHojas.push(i);
          }
          if (this.indicesDeHojas.length > 0) {
            this.hojaFile.setValue(this.indicesDeHojas[0].toString());
          }
        };
        reader.readAsBinaryString(this.archivo);
      } else {
        if (
          this.archivo.type === 'application/pdf' ||
          this.archivo.type === 'image/png' ||
          this.archivo.type === 'image/jpg' ||
          this.archivo.type === 'image/jpeg' ||
          this.archivo.type === 'image/webp' ||
          this.archivo.type === 'image/gif'
        ) {
          this.ocultar = false;
          this.getUrl();
        }
      }
    } else {
      this.alerta.ErrorEnLaPeticion('El control del archivo no está presente en el formulario.');
      this.onCleanSelect();
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  reiniciarArchivo() {
    // Reiniciar el valor del input de archivo
    //this.archivoInput.nativeElement.value = null;
    this.itemFiles.patchValue('');
    this.hojaFile.patchValue('');
    this.indicesDeHojas = [];
    this.data = [];
    const vacio: any[] = [];
    this.data = vacio;
    //this.archivo=null;
  }

  EncerarComponentes() {
    this.TituloPagina = '';
    this.itemFile.patchValue('');
    this.itemFiles.patchValue('');
    this.cargando = false;
  }

    // ****************************************** PAGINACION *****************************************************************
    DatosCargaMasiva!: any[];
    DatosTemporales: any[] = [];
    ContadorDatos: number = 0;
    RangoPaginacion: number = 0;
    InicioPaginacion: number = 0;
    FinalPaginacion: number = 0;
    FraccionDatos: number = 0;
    ContadorDatosGeneral: number = 0;
  
    FraccionarValores(tipo: number, datos?: any, rango?: number) {
      if (rango != null && datos != null) {
        if (tipo == 0) {
          this.EncerarVariablesPaginacion(0);
          this.ContadorDatos = datos.length;
          this.DatosTemporales = datos;
          this.RangoPaginacion = rango;
          this.FinalPaginacion = rango;
          this.DatosCargaMasiva = datos.slice(
            this.InicioPaginacion,
            this.FinalPaginacion
          );
        }
      } else {
        if (tipo == 0) {
          this.DatosCargaMasiva = this.DatosTemporales.slice(
            this.InicioPaginacion,
            this.FinalPaginacion
          );
        }
      }
    }
  
    BtnNext(tipo: number, rango?: number) {
      if (tipo == 0) {
        if (rango != null) {
          this.FraccionDatos = this.FraccionDatos + this.RangoDatos;
          // this.ListarElementos(2);
        }
        this.InicioPaginacion = this.InicioPaginacion + this.RangoPaginacion;
        this.FinalPaginacion = this.FinalPaginacion + this.RangoPaginacion;
        this.FraccionarValores(0);
      }
    }
  
    BtnPrevious(tipo: number, rango?: number) {
      if (tipo == 0) {
        if (rango != null) {
          this.FraccionDatos = this.FraccionDatos - this.RangoDatos;
          // this.ListarElementos(2);
        }
  
        if (this.InicioPaginacion >= this.RangoPaginacion) {
          this.InicioPaginacion = this.InicioPaginacion - this.RangoPaginacion;
          this.FinalPaginacion = this.FinalPaginacion - this.RangoPaginacion;
          this.FraccionarValores(0);
        }
      }
    }
  
    EncerarVariablesPaginacion(tipo: number) {
      if (tipo == 0) {
        this.ContadorDatos = 0;
        this.RangoPaginacion = 0;
        this.InicioPaginacion = 0;
        this.FinalPaginacion = 0;
        this.DatosTemporales = [];
      }
    }
    CargaMasivaPost!: any[];
    /****Obtener la url que se desea cargar para su previsualizacion */
    getUrl() {
      //const archivoControl = this.form.get('archivo');
        const valorArchivo = this.archivo;
        if (valorArchivo) {
          const lectura = new FileReader();
          lectura.onloadend = () => {
            this.urlAbs = lectura.result as string;
            this.url=this.urlAbs.split(",")[1];
            if(this.urlAbs.includes('image'))
            {
              this.esImagen=true;
              this.esPdf=false;
            }else
            {
              this.esImagen=false;
              this.esPdf=true;
            }
          };
          lectura.readAsDataURL(valorArchivo);
        }
    }
    banderaCartera:boolean=false;
    valorSelecEntidad:any;
    isButtonDisabled(): boolean {
      if(this.banderaCartera===false)
        {
          return this.itemFiles.invalid;
        }else{
          return this.filtroCartera.invalid;
        }
      
    }

  
    async iniciarEntidad()
    {
      try
      {
            this.valorSelecEntidad = this.itemFiles.value;
          if(this.countColumns.value==='' && this.countRows.value==='')
            {
                this.selectEntidad(this.valorSelecEntidad);
            }else
            {
              this.selectEntidad(this.valorSelecEntidad);
              await this.onCleanSelect();
            }
      }catch(error){}
    }
    selectEntidad(valor :string)
    {
          if ( valor=== '1') {
            this.entidad = new ClienteCarteraClass();
            this.banderaCartera = true;
          }
          if (valor === '2') {
            this.entidad = new CxCOperacionClass();
            this.banderaCartera = true;
          }
          if (valor === '3') {
            this.entidad = new CorreosClass();
            this.bVerificar=false;
          }
          if (valor === '4') {
            this.entidad = new DireccionClass();
          }
          if (valor === '5') {
            this.entidad = new GaranteClass();
          }
          if (valor === '6') {
            this.entidad = new TelefonoClass();
          }
          if (valor === '7') {
            this.entidad = new Trabajo_Class();
          }
          if (valor === '8') {
            this.entidad = new TipoCorreoCClass();
          }
          if (valor === '9') {
            this.entidad = new TipoTelefonoCClass();
          }
          if (valor === '10') {
            this.entidad = new TipoDireccionCClass();
          }
          if (valor === '11') {
            this.entidad = new DetalleTelefonoCClass();
          }
          if (valor === '12') {
            this.entidad = new Tipo_Trabajo_Class();
          }
          if (valor === '13') {
            this.entidad = new Contactabilidad_Class();
          }
          if (valor === '14') {
            this.entidad = new Conectivilidad_Class();
          }
          if (valor === '15') {
            this.entidad = new Cuenta_Class();
          }
          if (valor === '16') {
            this.entidad = new Tipo_Gestion_Class();
          }
          if (valor === '17') {
            this.entidad = new CarteraClass();
          }
          if (valor === '18') {
            this.entidad = new Tipo_CarteraClass();
          }
          if (valor === '19') {
            this.entidad = new GestorClass();
          }
          if (valor === '20') {
            this.entidad = new AsignacionClass();
            this.banderaCartera = true;
          }
          if (valor === '21') {
            this.entidad = new CuentaCarteraClass();
            this.banderaCartera = true;
          }
          if (valor === '22') {
            this.entidad = new TipoGestionConectividadContactivilidadClasss();
          }
          if (valor === '23') {
            this.entidad = new GestionCClass();
            this.banderaCartera = true;
          }
          if (valor === '24') {
            this.entidad = new PagoCClass();
            this.banderaCartera = true;
          }
    }
  /****seleccionde las entidades para proceder a cargar los datos directo al servidor */
  async seleccionEntidad() {
    if (this.valorSelecEntidad === '1') {
      this.alertaCarga.showCustomModal('Cliente-Cartera');
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelClienteCartera();
          this.alerta.DescargaModelo('Descargar Modelo Cliente-Cartera');
        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
    }
    if (this.valorSelecEntidad === '2') {
      this.alertaCarga.showCustomModal('Credito-Cartera');
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelCreditoCartera();
          this.alerta.DescargaModelo('Descargar Modelo Credito-Cartera');
        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
    }
    if (this.valorSelecEntidad === '3') {
      this.alertaCarga.showCustomModal('Correo');
      this.descargarArchivoExcelCorreo();
      this.alerta.DescargaModelo('Descargar Modelo de Correos');
    }
    if (this.valorSelecEntidad === '4') {
      this.alertaCarga.showCustomModal('Direccion');
      this.descargarArchivoExcelDireccion();
      this.alerta.DescargaModelo('Descargar Modelo de Direcciones');
    }
    if (this.valorSelecEntidad === '5') {
      this.alertaCarga.showCustomModal('Garante');
      this.alerta.DescargaModelo('Descargar Modelo de Garante');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '6') {
      this.alertaCarga.showCustomModal('Telefono');
      this.alerta.DescargaModelo('Descargar Modelo de Telefonos');
      this.descargarArchivoExcelTelefono();
    }
    if (this.valorSelecEntidad === '7') {
      this.alertaCarga.showCustomModal('Trabajo');
      this.alerta.DescargaModelo('Descargar Modelo de Trabajo');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '8') {
      this.alertaCarga.showCustomModal('tipoTrabajo');
      this.alerta.DescargaModelo('Descargar Modelo de TiposCorreo');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '9') {
      this.alertaCarga.showCustomModal('tipoTelefono');
      this.alerta.DescargaModelo('Descargar Modelo de TiposTelefono');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '10') {
      this.alertaCarga.showCustomModal('tipoDireccion');
      this.alerta.DescargaModelo('Descargar Modelo de TiposDireccion');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '11') {
      this.alertaCarga.showCustomModal('detallesTelefono');
      this.alerta.DescargaModelo('Descargar Modelo de DetallesTelefono');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '12') {
      this.alertaCarga.showCustomModal('tipoTrabajo');
      this.alerta.DescargaModelo('Descargar Modelo Tipo_Trabajo');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '13') {
      this.alertaCarga.showCustomModal('Contactabilidad');
      this.alerta.DescargaModelo('Descargar Modelo Contactabilidad');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '14') {
      this.alertaCarga.showCustomModal('Conectivilidad');
      this.alerta.DescargaModelo('Descargar Modelo Conectivilidad');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '15') {
      this.alerta.DescargaModelo('Descargar Modelo Cuenta');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '16') {
      this.alertaCarga.showCustomModal('tipoGestion');
      this.alerta.DescargaModelo('Descargar Modelo Tipo_Gestion');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '17') {
      this.alertaCarga.showCustomModal('Cartera');
      this.alerta.DescargaModelo('Descargar Modelo Cartera');
      this.descargarArchivoCartera();
    }
    if (this.valorSelecEntidad === '18') {
      this.alertaCarga.showCustomModal('tipoCartera');
      this.alerta.DescargaModelo('Descargar Modelo Tipo-Cartera');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '19') {
      this.alertaCarga.showCustomModal('Gestor');
      this.alerta.DescargaModelo('Descargar Modelo Gestor');
      this.seleccionTipo(this.valorSelecEntidad);
    }
    if (this.valorSelecEntidad === '20') {
      this.alertaCarga.showCustomModal('Asignacion'); 
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelClienteGestorCartera();
          this.alerta.DescargaModelo('Descargar Modelo Asignacion');
        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
    }
    if (this.valorSelecEntidad === '21') {
      this.alertaCarga.showCustomModal('cuentaCartera');
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelCuentaCartera();
          this.alerta.DescargaModelo('Descargar Modelo CuentaCartera');
        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
    }
    if (this.valorSelecEntidad === '22') {
      this.alertaCarga.showCustomModal('tipoGCC');
      this.alerta.DescargaModelo(
        'Descargar Modelo TipoGestionConectividadContactivilidad');
      this.descargarArchivoExcelTipoGestionConectividadContactavilidad();
    }
    if (this.valorSelecEntidad === '23') {
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelGestion();
          this.alerta.DescargaModelo('Descargar la plantilla de Gestion');
        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
      //this.alertaCarga.showCustomModal('Gestiones');
    }
    if (this.valorSelecEntidad === '24') {
      //this.alertaCarga.showCustomModal('Pagos');
      if(this.filtroCartera.invalid===false)
        {
          await this.descargarArchivoExcelPagos();
          this.alerta.DescargaModelo('Descargar la plantilla de Pagos');

        }else
        {
          this.alerta.ErrorEnLaPeticion('Necesita seleccionar una cartera');
        }
    }
  }
  seleccionTipo(valor: string) {
    if (valor === '5') {
      const val = 'Garante';
      this.getGarante().subscribe((garantes) => {
        const wb = XLSX.utils.book_new();
        // Agregar los datos de los garantes a una pestaña
        const wsGarantes = XLSX.utils.json_to_sheet(garantes);
        const wsGarantesRef = wsGarantes['!ref'];
        if (wsGarantesRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsGarantesRef);
          const columnIndexTelefono = 0;
          const columnIndexTelefonofn = 1;
          const columnIndexTdom = 6;
          const columnIndexTlab = 7;
          const columnIndexTadic = 8;
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddressTelefono = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefono,
            });
            const cellAddressTelefonofn = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefonofn,
            });
            const cellAddressTelefonodom= XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTdom,
            });
            const cellAddressTelefonolab= XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTlab,
            });
            const cellAddressTelefonoadic= XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTadic,
            });

            if (wsGarantes[cellAddressTelefono]) {
              wsGarantes[cellAddressTelefono].z = '@';
            }
            if (wsGarantes[cellAddressTelefonofn]) {
              wsGarantes[cellAddressTelefonofn].z = '@';
            }
            if (wsGarantes[cellAddressTelefonodom]) {
              wsGarantes[cellAddressTelefonodom].z = '@';
            }
            if (wsGarantes[cellAddressTelefonolab]) {
              wsGarantes[cellAddressTelefonolab].z = '@';
            }
            if (wsGarantes[cellAddressTelefonoadic]) {
              wsGarantes[cellAddressTelefonoadic].z = '@';
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, wsGarantes, val);
        // Escribir el archivo Excel
        XLSX.writeFile(wb, val + '.xlsx');
      });
    }
    if (valor === '7') {
      this.descargarArchivoExcelTrabajo();
    }
    if (valor === '8') {
      this.api
        .GetTipoCorreoFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_correo: '0',
                  corr_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_correo: item['id_tipo_correo'],
                corr_tip_descripcion: item['corr_tip_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('TipoCorreo');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }

    if (valor === '9') {
      this.api
        .GetTipoTelefonoFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_telefono: '0',
                  tel_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_telefono: item['id_tipo_telefono'],
                tel_tip_descripcion: item['tel_tip_descripcion'],
              }));
            }

            this.descargarArchivoExcelTipo('TipoTelefono');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '10') {
      this.api
        .GetTipoDireccionFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_direccion: '0',
                  dir_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_direccion: item['id_tipo_direccion'],
                dir_tip_descripcion: item['dir_tip_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('TipoDireccion');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '11') {
      this.api
        .GetDetTelefonoFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_detalle_telefono: '0',
                  tel_detal_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_detalle_telefono: item['id_detalle_telefono'],
                tel_detal_descripcion: item['tel_detal_descripcion'],
              }));
            }

            this.descargarArchivoExcelTipo('DetalleTelefono');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '12') {
      this.api
        .GetTipoTrabajoFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_trabajo: '0',
                  trab_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_trabajo: item['id_tipo_trabajo'],
                trab_tip_descripcion: item['trab_tip_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('Tipo_Trabajo');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '13') {
      this.api
        .GetContactabilidadFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_contactabilidad: '0',
                  contac_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_contactabilidad: item['id_contactabilidad'],
                contac_descripcion: item['contac_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('Contactibilidad');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '14') {
      this.api
        .GetConectividadFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_conectividad: '0',
                  conec_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_conectividad: item['id_conectividad'],
                conec_descripcion: item['conec_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('Conectividad');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '15') {
      this.api
        .GetCuentasFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  cuent_nombre: '',
                  cuent_entidadfinanciera: 'vacio'.toLocaleUpperCase(),
                  cuent_numero: '0',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                cuent_nombre: item['cuent_nombre'],
                cuent_entidadfinanciera:
                  item['cuent_entidadfinanciera'] === null
                    ? 'vacio'.toUpperCase()
                    : item['cuent_entidadfinanciera'],
                cuent_numero:
                  item['cuent_numero'] === null ? '0' : item['cuent_numero'],
              }));
            }
            this.descargarArchivoExcelTipo('Cuenta');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '16') {
      this.api
        .GetTipoGestionFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_gestion: '0',
                  gestion_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_gestion: item['id_tipo_gestion'],
                gestion_tip_descripcion: item['gestion_tip_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('Tipo_Gestion');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '17') {
      this.api
        .GetCarteraFracionado(0, 0)
        .pipe(
          map((tracks) => {
            this.listaTipos = tracks['data'].map((item: any) => ({
              cart_descripcion: item['cart_descripcion'],
              cart_observacion: item['cart_observacion'],
              id_tipo_cartera: item['id_tipo_cartera'],
            }));
            this.descargarArchivoExcelTipo('Gestiones');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '18') {
      this.api
        .GetTipoCarteraFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  id_tipo_cartera: '0',
                  cart_tip_descripcion: '',
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                id_tipo_cartera: item['id_tipo_cartera'],
                cart_tip_descripcion: item['cart_tip_descripcion'],
              }));
            }
            this.descargarArchivoExcelTipo('Tipo_Cartera');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '19') {
      this.api
        .GetGestoresFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  ges_nombres: '',
                  ges_apellidos: '',
                  ges_esgestor: '0',
                  ges_observacion: '',
                  ges_fecha_entrada: this.Fechas.fechaActualCorta(),
                  ges_fecha_salida: this.Fechas.fechaActualCorta(),
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                ges_nombres: item['ges_nombres'],
                ges_apellidos:
                  this.contieneSoloLetras(item['ges_apellidos']) === false
                    ? ''
                    : item['ges_apellidos'],
                ges_esgestor:
                  item['ges_esgestor'] === null ? '1' : item['ges_esgestor'],
                ges_observacion:
                  item['ges_observacion'] === null
                    ? ''
                    : item['ges_observacion'],
                ges_fecha_entrada: this.Fechas.fechaActualCortaEnvio(
                  item['ges_fecha_entrada']
                ),
                ges_fecha_salida: this.Fechas.fechaActualCortaEnvio(
                  item['ges_fecha_salida']
                ),
              }));
            }
            this.descargarArchivoExcelTipo('Gestor');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (valor === '21') {
      this.api
        .GetGestoresFracionado(0, 0)
        .pipe(
          map((tracks) => {
            if (tracks['data'].length === 0) {
              this.listaTipos = [
                {
                  ges_nombres: '',
                  ges_apellidos: '',
                  ges_esgestor: '0',
                  ges_observacion: '',
                  ges_fecha_entrada: this.Fechas.fechaActualCorta(),
                  ges_fecha_salida: this.Fechas.fechaActualCorta(),
                },
              ];
            } else {
              this.listaTipos = tracks['data'].map((item: any) => ({
                ges_nombres: item['ges_nombres'],
                ges_apellidos:
                  this.contieneSoloLetras(item['ges_apellidos']) === false
                    ? ''
                    : item['ges_apellidos'],
                ges_esgestor:
                  item['ges_esgestor'] === null ? '1' : item['ges_esgestor'],
                ges_observacion:
                  item['ges_observacion'] === null
                    ? ''
                    : item['ges_observacion'],
                ges_fecha_entrada: this.Fechas.fechaActualCortaEnvio(
                  item['ges_fecha_entrada']
                ),
                ges_fecha_salida: this.Fechas.fechaActualCortaEnvio(
                  item['ges_fecha_salida']
                ),
              }));
            }
            this.descargarArchivoExcelTipo('Gestor');
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
  }
  descargarArchivoExcelTipo(valor: string) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.listaTipos);
    if (valor === 'Gestor') {
      const wsGestorRef = ws['!ref'];
      if (wsGestorRef) {
        const rangeTelefono = XLSX.utils.decode_range(wsGestorRef);
        const columnIndexTelefono = 4;
        const columnIndexTelefonofn = 5;
        for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
          const cellAddressTelefono = XLSX.utils.encode_cell({
            r: R,
            c: columnIndexTelefono,
          });
          const cellAddressTelefonofn = XLSX.utils.encode_cell({
            r: R,
            c: columnIndexTelefonofn,
          });
          if (ws[cellAddressTelefono]) {
            ws[cellAddressTelefono].z = '@';
          }
          if (ws[cellAddressTelefonofn]) {
            ws[cellAddressTelefonofn].z = '@';
          }
        }
      }
    }
    if(valor==='Cuenta')
      {
        const wsCuentaRef = ws['!ref'];
      if (wsCuentaRef) {
        const rangeTelefono = XLSX.utils.decode_range(wsCuentaRef);
        const columnIndexNombre= 0;
        const columnIndexEntidadBfn = 1;
        const columnIndexNumeroCfn = 2;
        for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
          const cellAddressTelefono = XLSX.utils.encode_cell({
            r: R,
            c: columnIndexNombre,
          });
          const cellAddressTelefonofn = XLSX.utils.encode_cell({
            r: R,
            c: columnIndexEntidadBfn,
          });
          const cellAddressTelefonofn2 = XLSX.utils.encode_cell({
            r: R,
            c: columnIndexNumeroCfn,
          });
          if (ws[cellAddressTelefono]) {
            ws[cellAddressTelefono].z = '@';
          }
          if (ws[cellAddressTelefonofn]) {
            ws[cellAddressTelefonofn].z = '@';
          }
          if (ws[cellAddressTelefonofn2]) {
            ws[cellAddressTelefonofn2].z = '@';
          }
        }
      }
      }
    XLSX.utils.book_append_sheet(wb, ws, valor);
    const name = valor + '.xlsx';
    const nombreArchivo = name;
    XLSX.writeFile(wb, nombreArchivo);
  }

  /****Metodos para la descargar los modelos de muestra */
  getGarante(): Observable<any[]> {
    return this.api.GetGarantesFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cli_identificacion: '010',
              gar_identificacion: '010',
              gar_nombres: ' ',
              gar_trabajo: ' ',
              gar_direccion_dom: ' ',
              gar_direccion_trabajo: ' ',
              gar_telefono_domicilio: '0',
              gar_telefono_trabajo: '0',
              gar_telefono_adicional: '0',
              gar_observacion: ' ',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            gar_identificacion: item['gar_identificacion'],
            gar_nombres: item['gar_nombres'],
            gar_trabajo: item['gar_trabajo'],
            gar_direccion_dom: item['gar_direccion_dom'],
            gar_direccion_trabajo: item['gar_direccion_trabajo'],
            gar_telefono_domicilio: item['gar_telefono_domicilio'],
            gar_telefono_trabajo: item['gar_telefono_trabajo'],
            gar_telefono_adicional: item['gar_telefono_adicional'],
            gar_observacion: item['gar_observacion'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getClienteCarteraModelo(): Observable<any[]> {
    return this.api.GetClienteFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cli_identificacion: '0100000000',
              cli_tipo_identificacion: '0',
              cli_nombres: '',
              cli_genero: '',
              cli_estado_civil: '',
              cli_ocupacion: '',
              cli_fecha_nacimiento: this.Fechas.fechaActualCorta(),
              cli_score: '0',
              cli_fallecido: '0',
              cli_fecha_fallecido: this.Fechas.fechaActualCorta(),
              cli_observacion: '',
              cli_provincia: '',
              cli_canton: '',
              cli_parroquia: '',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            cli_tipo_identificacion: item['cli_tipo_identificacion'],
            cli_nombres: item['cli_nombres'],
            cli_genero: item['cli_genero'],
            cli_estado_civil: item['cli_estado_civil'],
            cli_ocupacion: item['cli_ocupacion'],
            cli_fecha_nacimiento: this.Fechas.fechaActualCortaEnvio(
              item['cli_fecha_nacimiento']
            ),
            cli_score: item['cli_score'],
            cli_fallecido:
              item['cli_fallecido'] === null ? '0' : item['cli_fallecido'],
            cli_fecha_fallecido: this.Fechas.fechaActualCortaEnvio(
              item['cli_fecha_fallecido']
            ),
            cli_observacion: item['cli_observacion'],
            cli_provincia: item['cli_provincia'],
            cli_canton: item['cli_canton'],
            cli_parroquia: item['cli_parroquia'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getCxCModelo(): Observable<any[]> {
    return this.api.GetCxcOperacionFracionado(0, 10).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              ope_cod_credito: '0',
              cli_identificacion: '0100000000',
              ope_descripcion: 'VACIO',
              ope_linea: 'VACIO',
              ope_producto: 'VACIO',
              ope_dias_mora: '0',
              ope_interes_mora: '0',
              ope_gastos_cobranzas: '0',
              ope_saldo_cxc_actual: '0',
              ope_saldo_cuota_actual: '0',
              ope_saldo_capital_venc: '0',
              ope_poner_aldia: '0',
              ope_liquidar: '0',
              ope_fecha_venc: this.Fechas.fechaActualCorta(),
              ope_plazo: '0',
              ope_liquidado: '0',
              ope_deuda_pagada: '0',
              ope_fecha_pagada: this.Fechas.fechaActualCorta(),
              ope_provincia: 'VACIO',
              ope_tiene_garante: '0',
              ope_fecha_compra: this.Fechas.fechaActualCorta(),
              ope_observacion: 'VACIO',
              ope_abono_realizado: '0',
              ope_valor_total_pag: '0',
              ope_tipo_actualizacion: '',
              ope_total_vencido: '0',
              ope_nom_segm_vencido: 'VACIO',
              ope_categoria_cliente: 'VACIO',
              ope_segmentacion: 'VACIO',
              ope_promo_cuotas_gratis: '0',
              ope_deuda_actual: '0',
              ope_saldo_interes: '0',
              ope_saldo_amortizacion: '0',
              ope_int_cobra: '0',
              ope_saldo_cobra_mora: '0',
              ope_descu_campa_saldo_capit: '0',
              ope_valor_descu_saldo_capit: '0',
              ope_descrip_unidad_gestion: 'VACIO',
              ope_id_ultima_gestion: '0',
              ope_estado_contacta: 'VACIO',
              ope_fecha_entrega: this.Fechas.fechaActualCorta(),
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            ope_cod_credito: item['ope_cod_credito'],
            cli_identificacion: item['cli_identificacion'],
            ope_descripcion: item['ope_descripcion']
              ? item['ope_descripcion']
              : '',
            ope_linea: item['ope_linea'] ? item['ope_linea'] : 'VACIO',
            ope_producto: item['ope_producto'] ? item['ope_producto'] : 'VACIO',
            ope_dias_mora: item['ope_dias_mora'] ? item['ope_dias_mora'] : '0',
            ope_interes_mora: item['ope_interes_mora']
              ? item['ope_interes_mora']
              : '0',
            ope_gastos_cobranzas: item['ope_gastos_cobranzas']
              ? item['ope_gastos_cobranzas']
              : '0',
            ope_saldo_cxc_actual: item['ope_saldo_cxc_actual']
              ? item['ope_saldo_cxc_actual']
              : '0',
            ope_saldo_cuota_actual: item['ope_saldo_cuota_actual']
              ? item['ope_saldo_cuota_actual']
              : '0',
            ope_saldo_capital_venc: item['ope_saldo_capital_venc']
              ? item['ope_saldo_capital_venc']
              : '0',
            ope_poner_aldia: item['ope_poner_aldia'] ? '1' : '0',
            ope_liquidar: item['ope_liquidar'] ? item['ope_liquidar'] : '0',
            ope_fecha_venc: this.Fechas.fechaActualCortaEnvio(
              item['ope_fecha_venc']
            ),
            ope_plazo: item['ope_plazo'] ? item['ope_plazo'] : '0',
            ope_liquidado: item['ope_liquidado'] ? '1' : '0',
            ope_deuda_pagada: item['ope_deuda_pagada'] ? '1' : '0',
            ope_fecha_pagada: this.Fechas.fechaActualCortaEnvio(
              item['ope_fecha_pagada']
            ),
            ope_provincia: item['ope_provincia'] ? item['ope_provincia'] : ' ',
            ope_tiene_garante: item['ope_tiene_garante'] ? '1' : '0',
            ope_fecha_compra: this.Fechas.fechaActualCortaEnvio(
              item['ope_fecha_compra']
            ),
            ope_observacion: item['ope_observacion']
              ? item['ope_descripcion']
              : 'VACIO',
            ope_abono_realizado: item['ope_abono_realizado']
              ? item['ope_abono_realizado']
              : '0',
            ope_valor_total_pag: item['ope_valor_total_pag']
              ? item['ope_valor_total_pag']
              : '0',
            ope_tipo_actualizacion: item['ope_tipo_actualizacion']
              ? item['ope_tipo_actualizacion']
              : 'VACIO',
            ope_total_vencido: item['ope_total_vencido']
              ? item['ope_valor_total_pag']
              : '0',
            ope_nom_segm_vencido: item['ope_nom_segm_vencido']
              ? item['ope_nom_segm_vencido']
              : 'VACIO',
            ope_categoria_cliente: item['ope_categoria_cliente']
              ? item['ope_categoria_cliente']
              : 'VACIO',
            ope_segmentacion: item['ope_segmentacion']
              ? item['ope_segmentacion']
              : 'VACIO',
            ope_promo_cuotas_gratis: item['ope_promo_cuotas_gratis']
              ? item['ope_promo_cuotas_gratis']
              : '0',
            ope_deuda_actual: item['ope_deuda_actual']
              ? item['ope_deuda_actual']
              : '0',
            ope_saldo_interes: item['ope_saldo_interes']
              ? item['ope_saldo_interes']
              : '0',
            ope_saldo_amortizacion: item['ope_saldo_amortizacion']
              ? item['ope_saldo_amortizacion']
              : '0',
            ope_int_cobra: item['ope_int_cobra'] ? item['ope_int_cobra'] : '0',
            ope_saldo_cobra_mora: item['ope_saldo_cobra_mora']
              ? item['ope_saldo_cobra_mora']
              : '0',
            ope_descu_campa_saldo_capit: item['ope_descu_campa_saldo_capit']
              ? item['ope_descu_campa_saldo_capit']
              : '0',
            ope_valor_descu_saldo_capit: item['ope_valor_descu_saldo_capit']
              ? item['ope_valor_descu_saldo_capit']
              : '0',
            ope_descrip_unidad_gestion: item['ope_descrip_unidad_gestion']
              ? item['ope_categoria_cliente']
              : 'VACIO',
            ope_id_ultima_gestion: item['ope_id_ultima_gestion']
              ? item['ope_id_ultima_gestion']
              : '0',
            ope_estado_contacta: item['ope_estado_contacta']
              ? item['ope_estado_contacta']
              : 'VACIO',
            ope_fecha_entrega: this.Fechas.fechaActualCortaEnvio(
              item['ope_fecha_entrega']
            ),
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getCarteraModelo(): Observable<any[]> {
    return this.api.GetCarteraFracionado(0, 0).pipe(
      map((tracks) => {
        return tracks['data'].map((item: any) => ({
          cart_descripcion:
            item['cart_descripcion'] + ' ' + item['cart_tip_descripcion'],
          id_cartera: item['id_cartera'],
        }));
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getCuentaModelo(): Observable<any[]> {
    return this.api.GetCuentasFracionado(0, 0).pipe(
      map((tracks) => {
        return tracks['data'].map((item: any) => ({
          cuent_nombre: item['cuent_nombre'],
          cuent_entidadfinanciera:
            item['cuent_entidadfinanciera'] === null
              ? ' '
              : item['cuent_entidadfinanciera'],
          cuent_numero:
            item['cuent_numero'] === null ? '0' : item['cuent_numero'],
        }));
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getGestorModelo(): Observable<any[]> {
    return this.api.GetGestoresFracionado(0, 0).pipe(
      map((tracks) => {
        return tracks['data'].map((item: any) => ({
          ges_nombres: item['ges_nombres'],
          ges_apellidos:
            this.contieneSoloLetras(item['ges_apellidos']) === false
              ? ''
              : item['ges_apellidos'],
              id_gestor:item['id_gestor'],
          ges_esgestor:
            item['ges_esgestor'] === null ? '1' : item['ges_esgestor'],
          ges_observacion:
            item['ges_observacion'] === null ? '' : item['ges_observacion'],
          ges_fecha_entrada: this.Fechas.fechaActualCortaEnvio(
            item['ges_fecha_entrada']
          ),
          ges_fecha_salida: this.Fechas.fechaActualCortaEnvio(
            item['ges_fecha_salida']
          ),
        }));
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getClienteGestorCarteraModelo(): Observable<any[]> {
    return this.api.GetClienteGestorCarteraFracionadoInactivos(0, 3500,Number(this.filtroCartera.value)).pipe(
      mergeMap((tracks) => {
        if (tracks['data'].length === 0) {
          return this.api.GetClienteFracionado(0, 3500).pipe(
            mergeMap((tracks) => {
              const array: any[] = [];
              tracks['data'].forEach((val: any) => {
                const obj = {
                  cli_identificacion: val['cli_identificacion'],
                  id_gestor: 2,
                  cgc_observacion: 'VACIO',
                };
                array.push(obj);
              });
              return of(array);
            }),
            catchError((error) => {
              this.alerta.ErrorAlRecuperarElementos();
              throw new Error(error);
            })
          );
        } else {
          return of(
            tracks['data'].map((item: any) => ({
              cli_identificacion: item['cli_identificacion'],
              id_gestor: item['id_gestor'],
              cgc_observacion:
                item['cgc_observacion'] === null
                  ? 'VACIO'
                  : item['cgc_observacion']
            }))
          );
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getCuentaCarteraModelo(): Observable<any[]> {
    return this.api.GetCuentaCartera(0, 0).pipe(
      mergeMap((tracks) => {
        if (tracks['data'].length === 0) {
          return this.api.GetCuentasFracionado(0, 0).pipe(
            mergeMap((tracks) => {
              const array: any[] = [];
              tracks['data'].forEach((val: any) => {
                const obj = {
                  id_cuenta: val['id_cuenta'],
                  id_cartera: Number(this.filtroCartera.value),
                  ctipcar_observacion: 'VACIO',
                };
                array.push(obj);
              });
              return of(array);
            }),
            catchError((error) => {
              this.alerta.ErrorAlRecuperarElementos();
              throw new Error(error);
            })
          );
        } else {
          return of(
            tracks['data'].map((item: any) => ({
              id_cuenta: item['id_cuenta'],
              id_cartera:
                item['id_cartera'] === null ? '0' : item['id_cartera'],
              ctipcar_observacion:
                item['ctipcar_observacion'] === null
                  ? 'VACIO'
                  : item['ctipcar_observacion'],
            }))
          );
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  async descargarArchivoExcelClienteCartera() {
    forkJoin({
      clientes: this.getClienteCarteraModelo(),
      carteras: this.getCarteraModelo(),
    }).subscribe(({ clientes, carteras }) => {
      if (carteras.length > 0) {
        const wb = XLSX.utils.book_new();
        // Agregar la lista de tipos de correo a una pestaña
        const wsTelefono = XLSX.utils.json_to_sheet(clientes);
        const wsTelefonoRef = wsTelefono['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexTelefono = 0;
          const columnIndexTelefonofn = 6;
          const columnIndexTelefonoff = 9;
          // Iterar sobre todas las filas de la columna cli_identificacion (excluyendo la primera fila de encabezados) y establecer el formato de texto
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefono,
            });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefonofn,
            });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefonoff,
            });
            wsTelefono[cellAddress].z = '@';
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'Clientes');
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTiposTelefono = XLSX.utils.json_to_sheet(carteras);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Cartera');
        // Escribir el archivo Excel
        XLSX.writeFile(wb, 'ModeloClienteCartera.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Clientes actuales en la Base de Datos que no existan en este archivo se perderan'
        );
      }
    });
  }
  async descargarArchivoExcelCreditoCartera() {
    forkJoin({
      credito: this.getCxCModelo(),
      carteras: this.getCarteraModelo(),
    }).subscribe(({ credito, carteras }) => {
      if (carteras.length > 0) {
        const wb = XLSX.utils.book_new();
        // Agregar la lista de tipos de correo a una pestaña
        const wsTelefono = XLSX.utils.json_to_sheet(credito);
        const wsTelefonoRef = wsTelefono['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexCodigo = 0;
          const columnIndexcedula = 1;
          const columnIndexf1 = 13;
          const columnIndexf2 = 17;
          const columnIndexf3 = 20;
          const columnIndexf4 = 40;
          //Aplicando que sean de formato texto
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexCodigo });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexcedula });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexf1 });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexf2 });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexf3 });
            wsTelefono[cellAddress].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexf4 });
            wsTelefono[cellAddress].z = '@';
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, "CxC_Operacion");
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTiposTelefono = XLSX.utils.json_to_sheet(carteras);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Cartera');
        // Escribir el archivo Excel
        XLSX.writeFile(wb, 'ModeloCxCCartera.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para proceder la descarga de la plantilla es necesario llenar los datos en Cartera!!'
        );
      }
    });
  }
  /**Descargar el modelo de Correo */
  getCorreo(): Observable<any[]> {
    return this.api.GetCorreosFracionado(0, 10).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cli_identificacion: '0100000000',
              cor_descripcion: 'vacio'.toUpperCase(),
              cor_id_tipo_correo: '0',
              cor_email: 'ejemplo07@gmail.com',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            cor_descripcion: item['cor_descripcion']===null?'VACIO':item['cor_descripcion'].toUpperCase(),
            cor_id_tipo_correo: item['cor_id_tipo_correo'],
            cor_email: item['cor_email'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTipoCorreo(): Observable<any[]> {
    return this.api.GetTipoCorreoFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              corr_tip_descripcion: '',
              id_tipo_correoid_tipo_correo: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            corr_tip_descripcion: item['corr_tip_descripcion'],
            id_tipo_correo: item['id_tipo_correo'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  descargarArchivoExcelCorreo() {
    forkJoin({
      correo: this.getCorreo(),
      tipoCorreo: this.getTipoCorreo(),
    }).subscribe(({ correo, tipoCorreo }) => {
      if (tipoCorreo.length > 1) {
        const wb = XLSX.utils.book_new();
        // Agregar la lista de tipos de correo a una pestaña
        const wsCorreo = XLSX.utils.json_to_sheet(correo);
        const wsTelefonoRef = wsCorreo['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexTelefono = 0;
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexTelefono});
            wsCorreo[cellAddress].z = '@';
          }

        }
        XLSX.utils.book_append_sheet(wb, wsCorreo, "Correo");
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTipoCorreo = XLSX.utils.json_to_sheet(tipoCorreo);
        XLSX.utils.book_append_sheet(wb, wsTipoCorreo, 'TipoCorreo');
        // Escribir el archivo Excel
        XLSX.writeFile(wb, 'Correo.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'No se puede descargar  la  plantilla de Correo ,debido a que no cuenta con datos de Tipos de Correo'
        );
      }
    });
  }

descargarArchivoExcelDireccion() {
  forkJoin({
    direccion: this.getDireccion(),
    tipoDireccion: this.getTipoCorreo(),
  }).subscribe(({direccion, tipoDireccion}) => {
    if(tipoDireccion.length>1){
      const wb = XLSX.utils.book_new();
    // Agregar la lista de tipos de correo a una pestaña
    const wsCorreo = XLSX.utils.json_to_sheet(direccion);
    const wsTelefonoRef = wsCorreo['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexTelefono = 0;
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexTelefono });
            wsCorreo[cellAddress].z = '@';
          }
        }

    XLSX.utils.book_append_sheet(wb, wsCorreo, "Direccion");
    // Agregar la lista de tipos de teléfono a otra pestaña
    const wsTipoCorreo = XLSX.utils.json_to_sheet(tipoDireccion);
    XLSX.utils.book_append_sheet(wb, wsTipoCorreo, "TipoDireccion");
    // Escribir el archivo Excel
    XLSX.writeFile(wb, 'Direccion.xlsx');
    }else
    {
      this.alerta.ErrorEnLaPeticion('No se puede obtener el modelo de Direccion ,debido a que no cuenta con datos en Tipo de Direccion');
    }
  });
}
/**Descarga del modelo de direccion */
getDireccion(): Observable<any[]> {
  return this.api.GetDireccionesFracionado(0,10).pipe(
    map((tracks) => {
      if(tracks['data'].length===0)
        {
          return [{
            cli_identificacion: '0100000000',
            dir_id_tipo_direccion: '0',
            dir_completa: 'VACIO',
            dir_calle_principal: 'VACIO',
            dir_calle_secundaria: 'VACIO',
            dir_numero_casa: '0',
            dir_referencia: 'VACIO',
            dir_provincia: 'VACIO',
            dir_canton: 'VACIO',
            dir_parroquia: 'VACIO',
          }];
        }else{
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            dir_id_tipo_direccion: item['dir_id_tipo_direccion'],
            dir_completa: item['dir_completa'],
            dir_calle_principal: item['dir_calle_principal']
              ? item['dir_calle_principal']
              : 'vacio'.toLocaleUpperCase(),
            dir_calle_secundaria: item['dir_calle_secundaria']
              ? item['dir_calle_secundaria']
              : 'vacio'.toLocaleUpperCase(),
            dir_numero_casa: item['dir_numero_casa']
              ? item['dir_numero_casa']
              : '0',
            dir_referencia: item['dir_referencia']
              ? item['dir_referencia']
              : 'vacio'.toLocaleUpperCase(),
            dir_provincia: item['dir_provincia']
              ? item['dir_provincia']
              : 'vacio'.toLocaleUpperCase(),
            dir_canton: item['dir_canton'] ? item['dir_canton'] : 'vacio'.toUpperCase(),
            dir_parroquia: item['dir_parroquia']
              ? item['dir_parroquia']
              : 'vacio'.toUpperCase(),
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTipoDireccion(): Observable<any[]> {
    return this.api.GetTipoDireccionFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'] === 0) {
          return [
            {
              dir_tip_descripcion: '',
              id_tipo_direccion: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            dir_tip_descripcion: item['dir_tip_descripcion'],
            id_tipo_direccion: item['id_tipo_direccion'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  /**TELEFONO */
  getTipoTelefono(): Observable<any[]> {
    return this.api.GetTipoTelefonoFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              tel_tip_descripcion: '',
              id_tipo_telefono: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            tel_tip_descripcion: item['tel_tip_descripcion'],
            id_tipo_telefono: item['id_tipo_telefono'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTelefono(): Observable<any[]> {
    return this.api.GetTelefonosFracionado(0, 10).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cli_identificacion: '0100000000',
              tel_numero: '000000',
              tel_observacion: '',
              tel_operadora: '',
              tel_tipo_operadora: '',
              tel_id_tipo_telefono: '0',
              tel_id_detal_telefono: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            tel_numero: item['tel_numero'],
            tel_observacion: item['tel_observacion'],
            tel_operadora: item['tel_operadora'],
            tel_tipo_operadora: item['tel_tipo_operadora'],
            tel_id_tipo_telefono: item['tel_id_tipo_telefono'],
            tel_id_detal_telefono: item['tel_id_detal_telefono'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getCartera(): Observable<any[]> {
    return this.api.GetCarteraFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cart_descripcion: 'VACIO',
              cart_observacion: 'VACIO',
              id_tipo_cartera: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cart_descripcion: item['cart_descripcion'],
            cart_observacion:
              item['cart_observacion'] === null ? 'VACIO' : item['cart_observacion'],
            id_tipo_cartera: item['id_tipo_cartera'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTipoCartera(): Observable<any[]> {
    return this.api.GetTipoCarteraFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cart_tip_descripcion: '',
              id_tipo_cartera: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cart_tip_descripcion: item['cart_tip_descripcion'],
            id_tipo_cartera: item['id_tipo_cartera'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTrabajo(): Observable<any[]> {
    return this.api.GetTrabajosFracionado(0, 10).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              cli_identificacion: '0100000000',
              tra_ruc: '0100000000001',
              tra_descripcion: ' ',
              tra_direccion: ' ',
              tra_telefono: '0000000',
              tra_correo: 'ejemplo@gmail.com',
              tra_observacion: ' ',
              tra_id_tipo_trabajo: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            tra_ruc: item['tra_ruc'],
            tra_descripcion: item['tra_descripcion'],
            tra_direccion: item['tra_direccion'],
            tra_telefono: item['tra_telefono'],
            tra_correo: item['tra_correo'],
            tra_observacion: item['tra_observacion'],
            tra_id_tipo_trabajo: item['tra_id_tipo_trabajo'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getTiposTrabajos(): Observable<any[]> {
    return this.api.GetTipoTrabajoFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              trab_tip_descripcion: ' ',
              id_tipo_trabajo: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            trab_tip_descripcion: item['trab_tip_descripcion'],
            id_tipo_trabajo: item['id_tipo_trabajo'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  getDetalleTelefono(): Observable<any[]> {
    return this.api.GetDetTelefonoFracionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              tel_detal_descripcion: ' ',
              id_detalle_telefono: '0',
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            tel_detal_descripcion: item['tel_detal_descripcion'],
            id_detalle_telefono: item['id_detalle_telefono'],
          }));
        }
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  descargarArchivoExcelTelefono() {
    forkJoin({
      telefono: this.getTelefono(),
      tiposTelefono: this.getTipoTelefono(),
      detalles: this.getDetalleTelefono(),
    }).subscribe(({ telefono, tiposTelefono, detalles }) => {
      if (tiposTelefono.length > 1 && detalles.length > 1) {
        const wb = XLSX.utils.book_new();
      // Agregar la lista de tipos de correo a una pestaña
      const wsTelefono = XLSX.utils.json_to_sheet(telefono);
      const wsTelefonoRef = wsTelefono['!ref'];
      if (wsTelefonoRef) {
        const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
        const columnIndexTelefono = 0;
        const columnIndexTelefono2 = 1;
        // Iterar sobre todas las filas de la columna cli_identificacion (excluyendo la primera fila de encabezados) y establecer el formato de texto
        for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexTelefono });
          wsTelefono[cellAddress].z = '@';
        }
        for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: columnIndexTelefono2 });
          wsTelefono[cellAddress].z = '@';
        }
      }

      XLSX.utils.book_append_sheet(wb, wsTelefono, "Telefonos");
      // Agregar la lista de tipos de teléfono a otra pestaña
      const wsTiposTelefono = XLSX.utils.json_to_sheet(tiposTelefono);
      XLSX.utils.book_append_sheet(wb, wsTiposTelefono, "TipoTeléfono");
      // Agregar la lista de clientes a otra pestaña
      const wsDetalles = XLSX.utils.json_to_sheet(detalles);
      XLSX.utils.book_append_sheet(wb, wsDetalles, "DetalleTelefono");
      // Escribir el archivo Excel
      XLSX.writeFile(wb, 'Telefono.xlsx');
    }else{
      this.alerta.ErrorEnLaPeticion('No se puede obtener el modelo de Telefono ,debido a que no cuenta con datos en Tipo de Telefono y Detalle telefono');
    }
  });
}
descargarArchivoCartera() {
  forkJoin({
    cartera: this.getCartera(),
    tipoCartera: this.getTipoCartera()
  }).subscribe(({ cartera, tipoCartera}) => {
      if(tipoCartera.length>1)
        {
          const wb = XLSX.utils.book_new();
          // Agregar la lista de tipos de correo a una pestaña
          const wsTelefono = XLSX.utils.json_to_sheet(cartera);
          XLSX.utils.book_append_sheet(wb, wsTelefono, "Cartera");
          // Agregar la lista de tipos de teléfono a otra pestaña
          const wsTiposTelefono = XLSX.utils.json_to_sheet(tipoCartera);
          XLSX.utils.book_append_sheet(wb, wsTiposTelefono, "TipoCartera");
          // Escribir el archivo Excel
          XLSX.writeFile(wb, 'cartera.xlsx');
        }else
        {
          this.alerta.ErrorEnLaPeticion('No se puede obtener el modelo Cartera,debido que no cuenta con datos de Tipo Cartera en su Base de Datos');
        }
        

    
  });
}
descargarArchivoExcelTrabajo() {
  forkJoin({
    trabajo: this.getTrabajo(),
    tiposTrabajo: this.getTiposTrabajos(),
  }).subscribe(({ trabajo, tiposTrabajo}) => {
    if(tiposTrabajo.length>1)
      {
        const wb = XLSX.utils.book_new();
        // Agregar la lista de tipos de correo a una pestaña
        const wsTelefono = XLSX.utils.json_to_sheet(trabajo);
        const wsTrabajoRef = wsTelefono['!ref'];
        if (wsTrabajoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTrabajoRef);
          const columnIndexCedula = 0;
          const columnIndexRuc = 1;
          const columnIndexTelefono = 4;
          const columnIndexCorreo = 5;
          const columnIndexTipo = 7;
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddressCedula = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexCedula,
            });
            const cellAddressRuc = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexRuc,
            });
            const cellAddressTelefono = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefono,
            });
            const cellAddressCorreo = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexCorreo,
            });
            const cellAddressTipo = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTipo,
            });
            if (wsTelefono[cellAddressCedula]) {
              wsTelefono[cellAddressCedula].z = '@';
            }
            if (wsTelefono[cellAddressRuc]) {
              wsTelefono[cellAddressRuc].z = '@';
            }
            if (wsTelefono[cellAddressTelefono]) {
              wsTelefono[cellAddressTelefono].z = '@';
            }
            if (wsTelefono[cellAddressCorreo]) {
              wsTelefono[cellAddressCorreo].z = '@';
            }
            if (wsTelefono[cellAddressTipo]) {
              wsTelefono[cellAddressTipo].z = '@';
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'Trabajo');
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTiposTelefono = XLSX.utils.json_to_sheet(tiposTrabajo);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Tipo_Trabajo');
        // Escribir el archivo Excel
        XLSX.writeFile(wb, 'Trabajo.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'No se puede obtener el modelo de Trabajo ,debido a que no cuenta con datos en Tipo de Trabajo'
        );
      }
    });
  }

  /***Para limpiar el archico cargado */
  clearFileInput(input: HTMLInputElement) {
    this.banderaGuardar=false;
    this.banderaCartera =false;
    input.value = '';
    //window.location.reload();
    this.archivo = null;
    this.ocultar = true;
    this.form.get('title')?.patchValue('');
    this.form.get('archivo')?.reset;
    this.form.patchValue({ archivo: this.archivo });
    this.itemFiles.patchValue('');
    this.itemFile.patchValue('');
    this.urlAbs = '';
    this.hojaFile.patchValue('');
    this.countColumns.patchValue('');
    this.countRows.patchValue('');
    this.indicesDeHojas = [];
    this.data = [];
    this.esImagen = false;
    this.esPdf = false;
    this.filtroCartera.patchValue('');
    // Limpiar el FormControl
  }
  async onCleanSelect()
  {
    const miInput: HTMLInputElement = document.getElementById('SubirArchivos') as HTMLInputElement;
    // Llamando a clearFileInput
    this.clearForSelect(miInput);
  }
  clearForSelect(input: HTMLInputElement)
  {
    this.banderaGuardar=false;
    this.banderaCartera =false;
    input.value = '';
    //window.location.reload();
    this.archivo = null;
    this.ocultar = true;
    this.form.get('title')?.patchValue('');
    this.form.get('archivo')?.reset;
    this.form.patchValue({ archivo: this.archivo });
    this.itemFile.patchValue('');
    this.urlAbs = '';
    this.hojaFile.patchValue('');
    this.countColumns.patchValue('');
    this.countRows.patchValue('');
    this.indicesDeHojas = [];
    this.data = [];
    this.esImagen = false;
    this.esPdf = false;
    this.filtroCartera.patchValue('');
    // Limpiar el FormControl
  }
  uploadFile() {
    const archivoControl = this.form.get('archivo');
    if (archivoControl) {
      const valorArchivo = archivoControl.value;
      if (valorArchivo) {
        let unArchivo = Object.assign(valorArchivo);
        unArchivo.archivo = valorArchivo;
        this.api.PostUploadFile(unArchivo).subscribe((data: any) => {
          const exito = data['exito'];
          if (exito == 1) {
            this.alerta.ArchivoCargado();
            this.onLimpiar();
          } else {
            this.alerta.ErrorEnLaOperacion();
            this.onLimpiar();
          }
        });
      }
    } else {
      this.alerta.ErrorEnLaPeticion('El control del archivo no está presente en el formulario.');
      //this.onCleanSelect();
    }
  }
  onLimpiar() {
    // Obtener la referencia al elemento input
    const inputElement =
      this.elementRef?.nativeElement.querySelector('#SubirArchivo'); // Ajusta el selector según corresponda con el id del input
    // Llamar al método clearFileInput con el elemento input como argumento
    this.clearFileInput(inputElement);
  }
  async onLimpiar2() {
    // Obtener la referencia al elemento input
    const miInput: HTMLInputElement = document.getElementById(
      'SubirArchivos'
    ) as HTMLInputElement;
    // Llamando a clearFileInput
    this.clearFileInput(miInput);
}
  verificarSiContieneCartera():boolean
  {
    let valor:boolean=false;
    for (let i = 0; i < this.headers.length; i++) 
      {
            if(this.headers[i]==='id_cartera')
              {
                valor= true;
              }else{
                valor=false;
              }
      }
      return valor;
  }
  cargarInf() {
    let valor: any = this.hojaFile.value;
    let valorComoNumero: number = Number(valor);
    const archivoControl = this.form.get('archivo');
    if (archivoControl) {
      const valorArchivo = archivoControl.value;
      if (valorArchivo) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[valorComoNumero];
          const sheet = workbook.Sheets[sheetName];
          const result: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          this.headers = result[0];
          if (this.verificar(this.entidad) === true) {
            this.dataBad = [];
            this.dataGood = [];
            this.ListaErroresXRow = [];
            this.esCorrecto = true;
            //console.log('Valido');
            this.banderaFiltroCartera = this.verificarSiContieneCartera();
            this.data = result.slice(1);
            //console.log(this.headers);
            this.data.forEach((elementos) => {
              this.obtencionErroresRow(elementos);
            });
            let contadorVLetras: number = 0;
            let contadorVNumericos: number = 0;
            this.countColumns.patchValue(this.headers.length);
            this.countRows.patchValue(this.data.length.toString());
          } else {
            this.alerta.ErrorEnLaPeticion('invalido');
            this.headers = [];
            this.data = [];
            this.onLimpiar2();
          }
        };
        this.ListarElementos(Number(this.itemFiles.value));
        reader.readAsBinaryString(valorArchivo);
      }
    } else {
      this.alerta.ErrorEnLaPeticion('El control del archivo no está presente en el formulario.');
      this.onCleanSelect();
      console.log('entro 3');
    }
  }

  /*********Metodos para verifcar */
  verificar(entidad: any): boolean {
    var entidadCoincide = false;
    const cantidadAtributos = Object.keys(entidad).length;
    const tamHeaders = this.headers.length;
    // console.log(cantidadAtributos);
    // console.log(tamHeaders);
    // console.log(this.headers);
    // console.log(Object.keys(entidad));
    for (var i = 0; i < this.headers.length; i++) {
      var objeto = this.headers[i];
      // Comparar propiedades
      var propiedadesCoinciden = true;
      if (
        entidad.hasOwnProperty(objeto) === true &&
        cantidadAtributos === tamHeaders
      ) {
        propiedadesCoinciden = true;
      } else {
        propiedadesCoinciden = false;
      }
      if (propiedadesCoinciden) {
        entidadCoincide = true;
        break;
      }
    }
    return entidadCoincide;
  }
  /**********metodos necesarios */
  obtencionErroresRow(row: any) {
    const resultado: any = {};
    if (this.itemFiles.value === '1') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 7, 8].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 5, 10, 11, 12, 13].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([6, 9].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '2') {
      for (const [indiceInf, objeto] of row.entries()) {
        if([0].includes(indiceInf))
          {
            const esCodigo = this.contieneSoloCodigo(objeto);
          resultado[indiceInf] = esCodigo;
          }
        if (
          [
            1, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19, 22, 23, 25, 29, 30,
            31, 32, 33, 34, 35, 36, 38,
          ].includes(indiceInf)
        ) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4, 18, 21, 24, 26, 27, 28, 37, 39].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([13, 17, 20, 40].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '3') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([3].includes(indiceInf)) {
          const escorreo = this.contieneSoloCorreo(objeto);
          resultado[indiceInf] = escorreo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '4') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 5].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4, 6, 7, 8, 9].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '5') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 3, 6, 7, 8].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 4, 5, 9].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '6') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 5, 6, 7].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '7') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 7].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 6].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([5].includes(indiceInf)) {
          const esLetras = this.contieneSoloCorreo(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '8') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '9') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '10') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '11') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '12') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '13') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '14') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '15') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '16') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '17') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '18') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '19') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1, 3].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([4, 5].includes(indiceInf)) {
          const esLetras = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '20') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '21') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '22') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 2,3].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '23') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0,1,3,4,5,6,7,8,13,14,15,16,17,18,19,23,24,27].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([9,12,22].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([10,11,20,21,25].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
        if ([26].includes(indiceInf)) {
          const esHoras = this.contieneSoloHora(objeto);
          resultado[indiceInf] = esHoras;
        }
        if ([2].includes(indiceInf)) {
          const esCodigo = this.contieneSoloCodigo(objeto);
          resultado[indiceInf] = esCodigo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
    if (this.itemFiles.value === '24') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0,1,3,4,5,7,10,11,12].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([6,9,13,16].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([14,15].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
        if ([8].includes(indiceInf)) {
          const esUrl = this.contieneSoloUrl(objeto);
          resultado[indiceInf] = esUrl;
        }
        if ([2].includes(indiceInf)) {
          const esCodigo = this.contieneSoloCodigo(objeto);
          resultado[indiceInf] = esCodigo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        this.dataGood.push(row);
      } else if (aux == 'Comprobar') {
        this.banderaMenajeError = true;
        this.dataBad.push(row);
        const valuesArray = Object.values(resultado);
        let messageBad = '';
        for (let i = 0; i < valuesArray.length; i++) {
          if (valuesArray[i] === false) {
            messageBad += this.headers[i] + ' ' + i + ', ';
          }
        }
        let message: string = 'Revise estas columnas: ' + messageBad;
        const ultimaComaIndex = message.lastIndexOf(',');
        if (ultimaComaIndex !== -1) {
          message =
            message.substring(0, ultimaComaIndex) +
            '.' +
            message.substring(ultimaComaIndex + 1);
        }
        let obj: any = { cedula: row[0], estado: false, mensaje: message };
        this.ListaErroresXRow.push(obj);
      }
    }
  }
  eliminarElementoListaError(row: any): void {
    // Lógica de la operación con los datos de la fila
    const rem = this.ListaErroresXRow.indexOf(row);
    if (rem !== -1) {
      this.ListaErroresXRow.splice(rem, 1);
      //this.countRows.patchValue(this.data.length.toString());
    } else {
      //console.log('Objeto no encontrado en la lista');
    }
  }
  mostrarDatosIncorrectos() {
    this.banderaMenajeError = true;
    this.data = this.dataBad;
  }
  mostrarDatosCorrectos() {
    this.data = this.dataGood;
    this.banderaMenajeError = false;
  }
  busquedaXFiltro() {
    this.banderaMenajeError = true;
    const valorBusq = this.busquedaForm.get('parametro')?.value;
    this.ListaErroresXRow = [];
    let valorAuxiliar = '';
    let arrayResp: any[] = [];
    console.log(this.ListaErroresXRow.length);
    const selectedIndex = this.headers.indexOf(
      this.busquedaForm.get('opcionBusqueda')?.value
    );
    console.log(
      'Valor seleccionado:',
      this.busquedaForm.get('opcionBusqueda')?.value
    );
    console.log('Posición seleccionada:', selectedIndex);
    this.data = this.data.filter((elemento) => {
      const valor = this.convertirStringATipo(
        valorBusq,
        typeof elemento[selectedIndex]
      );
      if (valor === 'Tipo no soportado') {
        return elemento[selectedIndex] === valorBusq;
      } else {
        return elemento[selectedIndex] === valor;
      }
    });
    this.data.forEach((elemento) => {
      this.obtencionErroresRow(elemento);
      arrayResp.push(elemento[0]);
    });

    arrayResp.forEach((elemento) => {
      const existe = this.ListaErroresXRow.some((elemento2) => {
        return elemento2['cedula'] === elemento;
      });

      // Hacer algo si existe un elemento que cumple la condición
      if (existe) {
        console.log(
          'Se encontró un elemento en ListaErroresXRow con la misma cedula.'
        );
        // Aquí puedes agregar cualquier acción que necesites realizar
      }
    });
  }
  seleccionFiltro() {
    const valor = this.filtroMensaje.value;
    if (valor === 'Correcto') {
      this.banderaBusqueda = false;
      this.mostrarDatosCorrectos();
    }
    if (valor === 'Incorrectos') {
      this.banderaBusqueda = false;
      this.mostrarDatosIncorrectos();
    }
    if (valor === 'Filtro') {
      this.banderaBusqueda = !this.banderaBusqueda;
    }
    if (valor === 'Todos') {
      this.banderaBusqueda = false;
      this.cargarInf();
    }
  }

  convertirStringATipo(str: string, tipo: string): number | string {
    switch (tipo) {
      case 'number':
        return Number(str);
      default:
        return 'Tipo no soportado';
    }
  }
  verificarErroresRowXDesabilitarBotonSaved(row: any): boolean {
    let resDesabilitarBoton: boolean = false;
    const resultado: any = {};
    if (this.itemFiles.value === '1') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 7, 8].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 5, 10, 11, 12, 13].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([6, 9].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '2') {
      for (const [indiceInf, objeto] of row.entries()) {
        if([0].includes(indiceInf))
          {
            const esCodigo = this.contieneSoloCodigo(objeto);
            resultado[indiceInf] = esCodigo;
          }
        if (
          [1, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19, 22, 23, 25, 29, 30,
            31, 32, 33, 34, 35, 36, 38,
          ].includes(indiceInf)
        ) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4, 18, 21, 24, 26, 27, 28, 37, 39].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([13, 17, 20, 40].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '3') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([3].includes(indiceInf)) {
          const esCorreo = this.contieneSoloCorreo(objeto);
          resultado[indiceInf] = esCorreo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '4') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 5].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4, 6, 7, 8, 9].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '5') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 3, 6, 7, 8].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 4, 5, 9].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '6') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 5, 6, 7].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 4].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '7') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 4, 7].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2, 3, 6].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([5].includes(indiceInf)) {
          const esLetras = this.contieneSoloCorreo(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '8') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '9') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '10') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '11') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '12') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '13') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '14') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '15') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '16') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '17') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '18') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '19') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([2].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([0, 1, 3].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([4, 5].includes(indiceInf)) {
          const esLetras = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '20') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([2].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '21') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([1].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '22') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0, 1, 2,3].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }//
    if (this.itemFiles.value === '23') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0,1,3,4,5,6,7,8,13,14,15,16,17,18,19,23,24,27].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([9,12,22].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([10,11,20,21,25].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
        if ([26].includes(indiceInf)) {
          const esHoras = this.contieneSoloHora(objeto);
          resultado[indiceInf] = esHoras;
        }
        if ([2].includes(indiceInf)) {
          const esCodigo = this.contieneSoloCodigo(objeto);
          resultado[indiceInf] = esCodigo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    if (this.itemFiles.value === '24') {
      for (const [indiceInf, objeto] of row.entries()) {
        if ([0,1,3,4,5,7,10,11,12].includes(indiceInf)) {
          const esNumero = this.contieneSoloNumeros(objeto);
          resultado[indiceInf] = esNumero;
        }
        if ([6,9,13,16].includes(indiceInf)) {
          const esLetras = this.contieneSoloLetras(objeto);
          resultado[indiceInf] = esLetras;
        }
        if ([14,15].includes(indiceInf)) {
          const esFechas = this.contieneSoloFecha(objeto);
          resultado[indiceInf] = esFechas;
        }
        if ([8].includes(indiceInf)) {
          const esUrl = this.contieneSoloUrl(objeto);
          resultado[indiceInf] = esUrl;
        }
        if ([2].includes(indiceInf)) {
          const esCodigo = this.contieneSoloCodigo(objeto);
          resultado[indiceInf] = esCodigo;
        }
      }
      let aux = this.todoCorrecto(resultado);
      if (aux === 'Correcto') {
        resDesabilitarBoton = false;
      } else if (aux == 'Comprobar') {
        resDesabilitarBoton = true;
      }
    }
    return resDesabilitarBoton;
  }
  /****************************METODOS DE VALIDACION EL VALOR DEL CONTENIDO DEL OBJETO***************************************************************/
  contieneSoloLetras(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      //console.log("entro letras ........");
      return true;
    }
    const expresionRegular =
      /^([A-Za-z .,\/:\-áéíóúÁÉÍÓÚñÑ_]+[A-Za-z .,\/:\-áéíóúÁÉÍÓÚñÑ0-9_]*)?$/;
    return expresionRegular.test(valor);
  }
  contieneSoloNumeros(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      console.log('entroVacio' + ' ' + valor);
      return true;
    }
    const expresionRegular = /^(?:[0-9]+(\.[0-9]+)?)?$|^VACIO$|^ $|^$/;
    return expresionRegular.test(valor);
  }
  contieneSoloCodigo(valor:string|null):boolean
  {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      console.log('entroVacio' + ' ' + valor);
      return true;
    }
    const expresionRegular = /^(?:[0-9]+|[a-zA-Z]*[0-9]+)?$|^VACIO$|^ $|^$/;
    return expresionRegular.test(valor);
  }
  contieneSoloFecha(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      //console.log("entro fechas ........");
      return true;
    }
    const expresionRegular =
      /^(|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?)|vacio$/;
    return expresionRegular.test(valor);
  }
  contieneSoloCorreo(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      // Si el valor es nulo o vacío, se considera válido (true)
      return true;
    }

    const expresionRegular = /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|VACIO)?$/;
    return expresionRegular.test(valor);
  }
  contieneSoloHora(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      return true;
    }
    const expresionRegular =/^(?:[0-9]+|[a-zA-Z]*[0-9]+)?$|^VACIO$|^ $|^$|^\d{2}:\d{2}:\d{2}$/;
    return expresionRegular.test(valor);
  }
  contieneSoloUrl(valor: string | null): boolean {
    if (
      valor === 'NULL' ||
      valor === 'null' ||
      valor === null ||
      valor === ''
    ) {
      return true;
    }
    const expresionRegular = /^(?:[0-9]+|[a-zA-Z]*[0-9]+)?$|^VACIO$|^ $|^$|^\d{2}:\d{2}:\d{2}$|^\/[^\/]+(\/[^\/]+)*\/[^\/]+\.[a-zA-Z0-9]+$/;
    //const expresionRegular =/^(?:[0-9]+|[a-zA-Z]*[0-9]+)?$|^VACIO$|^ $|^$|^\d{2}:\d{2}:\d{2}$|^~\/[^\/]+(\/[^\/]+)*\/[^\/]+\.[a-zA-Z0-9]+$/;
    //const expresionRegular = /^(?:[0-9]+|[a-zA-Z]*[0-9]+)?$|^VACIO$|^ $|^$|^\d{2}:\d{2}:\d{2}$|^\/[^\/]+(\/[^\/]+)*\/[^\/]+\.[a-zA-Z0-9]+$/;

    return expresionRegular.test(valor);
  }
  /***************************************************************************** */
  todoCorrecto(param: any): string {
    const valores = Object.values(param);
    const todosSonTrue = valores.every((valor) => valor === true);
    let res: string = '';
    if (todosSonTrue === true) {
      res = 'Correcto';
    } else {
      res = 'Comprobar';
    }
    return res;
  }
  index = 0;

  aplicarValidacionElemento(valor: string, posicion: number): boolean {
    let res: boolean = false;
    if (this.itemFiles.value === '1') {
      if ([0, 1, 4, 7, 8].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 3, 5, 10, 11, 12, 13].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([6, 9].includes(posicion)) {
        res = this.contieneSoloFecha(valor);
      }
    } //Para ClienteCartera

    if (this.itemFiles.value === '2') {
      if([0].includes(posicion))
        {
          res = this.contieneSoloCodigo(valor);
        }
      if (
        [1, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19, 22, 23, 25, 29, 30,
          31, 32, 33, 34, 35, 36, 38,
        ].includes(posicion)
      ) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 3, 4, 18, 21, 24, 26, 27, 28, 37, 39].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([13, 17, 20, 40].includes(posicion)) {
        res = this.contieneSoloFecha(valor);
      }
    } //CXC
    if (this.itemFiles.value === '3') {
      if ([0, 2].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([3].includes(posicion)) {
        res = this.contieneSoloCorreo(valor);
      }
    } //Correo
    if (this.itemFiles.value === '4') {
      if ([0, 1, 4, 5].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 3, 4, 6, 7, 8, 9].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //Direccion
    if (this.itemFiles.value === '5') {
      if ([0, 1, 3, 6, 7, 8].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 4, 5, 9].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //garante
    if (this.itemFiles.value === '6') {
      if ([0, 1, 5, 6, 7].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 3, 4].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //telefono
    if (this.itemFiles.value === '7') {
      if ([0, 1, 4, 7].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2, 3, 6].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([5].includes(posicion)) {
        res = this.contieneSoloCorreo(valor);
      }
    } //trabajo
    if (this.itemFiles.value === '8') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '9') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '10') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '11') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '12') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '13') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '14') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCorreo
    if (this.itemFiles.value === '15') {
      if ([2].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([0, 1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //Cuenta
    if (this.itemFiles.value === '16') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoGestion
    if (this.itemFiles.value === '17') {
      if ([2].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([0, 1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //cartera
    if (this.itemFiles.value === '18') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //tipoCartera
    if (this.itemFiles.value === '19') {
      if ([2].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([0, 1, 3].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([4, 5].includes(posicion)) {
        res = this.contieneSoloFecha(valor);
      }
    } //gestor
    if (this.itemFiles.value === '20') {
      if ([0, 1].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([2].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //Asignacion
    if (this.itemFiles.value === '21') {
      if ([0].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([1].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
    } //Cuenta-Cartera
    if (this.itemFiles.value === '22') {
      if ([0, 1, 2,3].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
    } //TipoGestionConectividadContactavilidad
    if (this.itemFiles.value === '23') {
      if ([0,1,3,4,5,6,7,8,13,14,15,16,17,18,19,23,24,27].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([9,12,22].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([10,11,20,21,25].includes(posicion)) {
        res = this.contieneSoloFecha(valor);
      }
      if ([26].includes(posicion)) {
        res = this.contieneSoloHora(valor);
      }
      if ([2].includes(posicion)) {
        res = this.contieneSoloCodigo(valor);
      }
    } //Gestiones
    if (this.itemFiles.value === '24') {
      if ([0,1,3,4,5,7,10,11,12].includes(posicion)) {
        res = this.contieneSoloNumeros(valor);
      }
      if ([6,9,13,16].includes(posicion)) {
        res = this.contieneSoloLetras(valor);
      }
      if ([14,15].includes(posicion)) {
        res = this.contieneSoloFecha(valor);
      }
      if ([8].includes(posicion)) {
        res = this.contieneSoloUrl(valor);
      }
      if ([2].includes(posicion)) {
        res = this.contieneSoloCodigo(valor);
      }
    } //Pagos
    return res;
  }

 async procesarDatos()
 {
  await this.procesarTodoDatos();
 }
 cElem:number=0;
 vDataTam:number=0;
async guardarTodo() 
{
    try {
      this.vDataTam=this.data.length;
    for (const row of this.data) {
        //console.log(row);
        await this.agregarObjeto(row);
        this.cElem+=1;
    }
      if(this.cElem===this.vDataTam)
      {
        this.alerta.ExitoEnLaPeticion(
        'Todos los objetos se han guardado correctamente.'
      );
          await this.onLimpiar2();
      }
        } catch (error) {
      this.alerta.ErrorEnLaPeticion('Error al guardar objetos:' + ' ' + error);
    }
    
}

async guardarMasivo()
{
  await this.guardarMasiva();
  //this.alerta.ExitoEnLaPeticion('Todos los objetos se han guardado correctamente.');
  await this.onLimpiar2();
  this.banderaGuardar=false;

}
async guardarIndividualmente(row:any)
{
  await this.agregarObjeto(row);
}

valaux:number=0;
async procesarTodoDatos():Promise<string>
{  let retorno:string='';
let nombre: string = this.archivo?.name ?? "";
let listrowsG:any[]=[];
let listrowsB:any[]=[];
  try {
    const aux = this.data.length;
     let objInf:any={};
    for (const row of this.data) {
      if (this.procesarFila(row)['bandera'] === false) {
        listrowsG.push(row);
        this.valaux++;
      } else {
        objInf={nombreArchivo:this.archivo?.name,mensaje:this.procesarFila(row)['mensaje'],posicion:this.data.indexOf(row),elemento:row}
        listrowsB.push(objInf);
        this.listaTipos=listrowsB;
      }
    }
    let elim:any[]=listrowsB.map((item: any) => ({
      row: item['elemento']
    }));
    for (const row of elim) {
      this.eliminarObjeto(row['row']);
    }
    if (this.valaux === aux) {
      this.alerta.ExitoEnLaPeticion('Todos los objetos se han procesado correctamente.');
      retorno='si';
      this.banderaGuardar=true;
    } else {
      const msg1='Se han procesado correctamente '+listrowsG.length;
      const msg2='Se han procesado incorrectamente '+listrowsB.length+',se procedio a la eliminacion de las filas incorrectas. Al precionar en guardar solo se guardara los filas correctas y no las incorrectas';
      if(listrowsB.length>0&& retorno!='si')
        {
          const msg3='Se genero el archivo con los errores para su descarga';
          this.mostrar2Alertas(msg1,msg2,msg3,1);
        }else{
          const msg3='No se genero el archivo con los errores para su descarga';
          this.mostrar2Alertas(msg1,msg2,msg3,0);
        }
    }
  } catch (error) {
    console.error('Error processing data', error);
  }

  listrowsG=[];
  listrowsB=[];
  return retorno;
}
async mostrar2Alertas(msg1:string,msg2:string,msg3:string,descarga:number)
{
  try {
    // Muestra la primera alerta y espera la respuesta del usuario
    const respuesta1 = await this.alerta.AlertaProcesadosBien(msg1);
    // Si el usuario confirma la primera alerta, muestra la segunda alerta
    if (respuesta1) {
      const respuesta2 = await this.alerta.AlertaProcesadosMal(msg2);
      if (respuesta2) {
        const respuesta3 = await this.alerta.AlertaProcesadosBien(msg3);
        if(descarga===1)
          {
            this.descargarArchivoExcelTipo('InformeErrores');
          }
        this.banderaGuardar = true;
      }
      // Aquí puedes realizar acciones adicionales según la respuesta de la segunda alerta
    } 
  } catch (error) {
    // Maneja cualquier error que ocurra durante la ejecución de las alertas
    console.error('Error al mostrar las alertas:', error);
  }
}
async mostrar4Alertas(msg1:string,msg2:string,msg3:string,msg4:string)
{
  try {
    // Muestra la primera alerta y espera la respuesta del usuario
    const respuesta1 = await this.alerta.AlertaProcesadosBien(msg1);
    // Si el usuario confirma la primera alerta, muestra la segunda alerta
    if (respuesta1) {
      const respuesta2 = await this.alerta.AlertaProcesadosBien(msg2);
      if (respuesta2) {
        const respuesta3 = await this.alerta.AlertaProcesadosBien(msg3);
        if(respuesta3)
          {
            const respuesta4 = await this.alerta.AlertaProcesadosMal(msg4);
          }
      }
      // Aquí puedes realizar acciones adicionales según la respuesta de la segunda alerta
    } 
  } catch (error) {
    // Maneja cualquier error que ocurra durante la ejecución de las alertas
    console.error('Error al mostrar las alertas:', error);
  }
}
validarDatosRow(row:any):any
{
  let retorno: any = {};
      // const validaciones = [
      //     { indice: 0, requerido: true, mensaje: 'El campo cuent_nombre está vacío.' },
      //     {indice: 1, requerido: true, mensaje: 'El campo cuent_entidadfinanciera está vacío.' },
      //     {indice: 2, requerido: true, mensaje: 'El campo cuent_numero está vacío.'}
      //     ];
      const validaciones = Object.keys(this.entidad).map((clave, indice) => ({
          indice: indice,
          requerido: true,
          mensaje: `El campo ${clave} está vacío.`
        }));
          retorno = { mensaje: null, estado: 'Correcto' };
          for (const regla of validaciones) {
            const value = row[regla.indice].toString() === " " ? "" : row[regla.indice].toString();
            if (regla.requerido && value === "") {
                retorno = { mensaje: regla.mensaje, estado: 'Incorrecto' };
                break; // Exit the loop early if a validation fails
            }
        }
        return retorno;
 
  // const validaciones = Object.keys(this.entidad).map((clave, indice) => ({
  //   indice: indice,
  //   requerido: true,
  //   mensaje: `El campo ${clave} está vacío.`
  // }));
  // for (const regla of validaciones) {
  //   const valor = row[regla.indice].toString();
  //   if (regla.requerido && (valor === null || valor.trim() === '')) {
  //     console.log(regla.mensaje);
  //     retorno = { mensaje: regla.mensaje, estado: 'Incorrecto' };
  //   } else {
  //     retorno = { mensaje: null, estado: 'Correcto' };
  //   }
  // }
  //   console.log(retorno['estado']+'mostrar')
  //   return retorno;
}
  async limpiarFiltro() {
    this.filtroCartera.patchValue('');
    //this.busquedaForm.get('parametro')?.patchValue('');
    this.busquedaForm.reset;
    this.busquedaForm.patchValue({parametro:'',opcionBusqueda:''});
    this.busquedaForm.get('opcionBusqueda')?.patchValue('');
    this.busquedaForm.get('parametro')?.patchValue('');
    this.cargarInf();
  }

  procesarFila(row:any):any {
    let variable:any={};
    if (this.validarDatosRow(row)['mensaje']!==null&&this.validarDatosRow(row)['estado']==='Incorrecto') {
        variable={mensaje:this.validarDatosRow(row)['mensaje'],estado:this.validarDatosRow(row)['estado'],bandera:true};
        this.manejarProblema();
    }else{
         variable={mensaje:null,estado:'Correcto',bandera:false}
    }
    return variable;
  }

  manejarProblema()
  {
    this.alerta.ErrorEnLaPeticion('Se ha detectado un problema con los datos de entrada.');
  }
  async onModelChange() {
    await this.guardarTodo();
    this.onLimpiar2();
  }
  filtrarCarteras() {
    const seleccion: any = this.filtroCartera.value;
    const valorNumerico: number = Number(seleccion);
    let posicion: number = 0;
    const aux = this.data[0];
    this.tamRow = aux.length - 1;
    if (this.itemFiles.value === '2') {
      posicion = this.tamRow;
    }
    if (this.itemFiles.value === '1') {
      posicion = this.tamRow;
    }
    this.data = this.data.filter((elemento) => {
      return elemento[posicion] === valorNumerico;
    });
  }
  desactivaXCartera() {
    const seleccion: any = this.filtroCartera.value;
    console.log(seleccion);
    if (this.valorSelecEntidad === '1') {
      const valorNumerico: number = Number(seleccion);
      // this.api
      //   .GetClienteDesactivados(0, 0, valorNumerico)
      //   .pipe(
      //     map((tracks) => {
      //       let valor: any = tracks['data'];
      //       if (valor === 1) {
      //         console.log('se cambio');
      //       }
      //     }),
      //     catchError((error) => {
      //       throw new Error(error);
      //     })
      //   )
      //   .subscribe();
    }
    if (this.valorSelecEntidad === '2') {
      const valorNumerico: number = Number(seleccion);
      // this.api
      //   .GetCxcOperacionFracionadoDesactivado(0, 0,valorNumerico)
      //   .pipe(
      //     map((tracks) => {
      //       let valor: any = tracks['data'];
      //       if (valor === 1) {
      //         console.log('se cambio')
      //       }
      //     }),
      //     catchError((error) => {
      //       throw new Error(error);
      //     })
      //   )
      //   .subscribe();
    }
    if (this.valorSelecEntidad === '20') {
      const valorNumerico: number = Number(seleccion);
      // this.api
      //   .GetClienteGestorCarteraFracionadoDesactivados(0, 0, valorNumerico)
      //   .pipe(
      //     map((tracks) => {
      //       let valor: any = tracks['data'];
      //       if (valor === 1) {
      //         console.log('se cambio');
      //       }
      //     }),
      //     catchError((error) => {
      //       throw new Error(error);
      //     })
      //   )
      //   .subscribe();
    }
    if (this.valorSelecEntidad === '21') {
      const valorNumerico: number = Number(seleccion);
      // this.api
      //   .GetCuentaCarteraDesactivados(0, 0, valorNumerico)
      //   .pipe(
      //     map((tracks) => {
      //       let valor: any = tracks['data'];
      //       if (valor === 1) {
      //         console.log('se cambio');
      //       }
      //     }),
      //     catchError((error) => {
      //       throw new Error(error);
      //     })
      //   )
      //   .subscribe();
    }
  }
  row!:any;
  async agregarObjeto(row: any) {
    let objCliente: any;
    let banderaCarga: boolean = false;
    if (this.itemFiles.value === '1') {
      let finCXC = '';
      let finClienteCarteraGestor = '';
      let cartera: number = Number(this.filtroCartera.value);
      //const gestor: number = Number(this.Usuario.id_gestor);
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      let ocM:any={
        cli_identificacion: row[0],
        cli_tipo_identificacion: row[1],
        cli_nombres:(row[2] === '' || row[2] === 'VACIO'||row[2] === 'vacio'||row[2] === ' ') ? null : row[2].toUpperCase(),
        cli_genero: row[3]===''?null:row[3].toUpperCase(),
        cli_estado_civil: row[4] === '' ? null : row[4].toString(),
        cli_ocupacion:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5].toUpperCase(),
        cli_fecha_nacimiento:this.solucionarFecha(row[6])===''?minDate:this.solucionarFecha(row[6]),
        cli_score: row[7] === '' ? null : row[7].toString(),
        cli_fallecido: row[8] === '' ? null : row[8].toString(),
        cli_fecha_fallecido:this.solucionarFecha(row[9])===''?minDate:this.solucionarFecha(row[9]),
        cli_observacion:(row[10] === '' || row[10] === 'VACIO'||row[10] === 'vacio'||row[10] === ' ') ? null : row[10].toUpperCase(),
        cli_provincia:(row[11] === '' || row[11] === 'VACIO'||row[11] === 'vacio'||row[11] === ' ') ? null : row[11].toUpperCase(),
        cli_canton:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12].toUpperCase(),
        cli_parroquia:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toUpperCase(),
        id_cartera:cartera,
        id_gestor:2
      };    
    this.row=row;
    ocM['cli_fecha_nacimiento']=ocM['cli_fecha_nacimiento']==='1969-12-31'?null:ocM['cli_fecha_nacimiento'];
    ocM['cli_fecha_fallecido']=ocM['cli_fecha_fallecido']==='1969-12-31'?null:ocM['cli_fecha_fallecido'];
    this.clienteCarterAgregar(ocM['cli_identificacion'],1,cartera,Number(this.Usuario.id_gestor),ocM);
    }
    if (this.itemFiles.value === '2') {
      //console.log(row[2]+' '+row[3]);
      this.api
        .GetCxCFracionadoFiltro(row[1], 4)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoPost: any = {
                id_cxc_operacion: 0,
                ope_cod_credito: row[0],
                cli_identificacion: row[1],
                ope_descripcion: row[2],
                ope_linea: row[3],
                ope_producto: row[4],
                ope_dias_mora: row[5].toString(),
                ope_interes_mora: row[6].toString(),
                ope_gastos_cobranzas: row[7].toString(),
                ope_saldo_cxc_actual: row[8].toString(),
                ope_saldo_cuota_actual: row[9].toString(),
                ope_saldo_capital_venc: row[10].toString(),
                ope_poner_aldia: row[11].toString(),
                ope_liquidar: row[12].toString(),
                ope_fecha_venc:
                  this.solucionarFecha(row[13]) === ''
                    ? null
                    : this.solucionarFecha(row[13]),
                ope_plazo: row[14].toString(),
                ope_liquidado: row[15].toString(),
                ope_deuda_pagada: row[16].toString(),
                ope_fecha_pagada:
                  this.solucionarFecha(row[17]) === ''
                    ? null
                    : this.solucionarFecha(row[17]),
                ope_provincia: row[18],
                ope_tiene_garante: row[19].toString(),
                ope_fecha_compra:
                  this.solucionarFecha(row[20]) === ''
                    ? null
                    : this.solucionarFecha(row[20]),
                ope_observacion: row[21],
                ope_abono_realizado: row[22].toString(),
                ope_valor_total_pag: row[23].toString(),
                ope_tipo_actualizacion: row[24],
                ope_total_vencido: row[25].toString(),
                ope_nom_segm_vencido: row[26],
                ope_categoria_cliente: row[27],
                ope_segmentacion: row[28],
                ope_promo_cuotas_gratis: row[29].toString(),
                ope_deuda_actual: row[30].toString(),
                ope_saldo_interes: row[31].toString(),
                ope_saldo_amortizacion: row[32].toString(),
                ope_int_cobra: row[33].toString(),
                ope_saldo_cobra_mora: row[34].toString(),
                ope_descu_campa_saldo_capit: row[35].toString(),
                ope_valor_descu_saldo_capit: row[36].toString(),
                ope_descrip_unidad_gestion: row[37],
                ope_id_ultima_gestion:
                  row[38].toString() === '0'
                    ? null
                    : Number(row[38].toString()),
                ope_estado_contacta: row[39],
                ope_fecha_entrega:
                  this.solucionarFecha(row[40]) === ''
                    ? null
                    : this.solucionarFecha(row[40]),
                id_cartera: Number(this.filtroCartera.value),
                ope_fecha_act: null,
                ope_fecha_desact: null,
                ope_fecha_in: null,
                ope_fecha_up: null,
                ope_esactivo: '1',
                ope_origendatos: 'cobrosystem',
                ope_baseactual: '1',
              };
              console.log(objetoPost);
              this.verificacionPostOrPut(objetoPost, banderaCarga, row);
            } else {
              banderaCarga = true;
              console.log('entro');
              let objetoRow: any = {
                id_cxc_operacion: 0,
                ope_cod_credito: row[0],
                cli_identificacion: row[1],
                ope_descripcion: row[2],
                ope_linea: row[3],
                ope_producto: row[4],
                ope_dias_mora:
                  row[5].toString() === '0' ? null : row[5].toString(),
                ope_interes_mora:
                  row[6].toString() === '0' ? null : row[6].toString(),
                ope_gastos_cobranzas:
                  row[7].toString() === '0' ? null : row[7].toString(),
                ope_saldo_cxc_actual:
                  row[8].toString() === '0' ? null : row[8].toString(),
                ope_saldo_cuota_actual:
                  row[9].toString() === '0' ? null : row[9].toString(),
                ope_saldo_capital_venc:
                  row[10].toString() === '0' ? null : row[10].toString(),
                ope_poner_aldia:
                  row[11].toString() === '0' ? null : row[11].toString(),
                ope_liquidar:
                  row[12].toString() === '0' ? null : row[12].toString(),
                ope_fecha_venc:
                  this.solucionarFecha(row[13]) === ''
                    ? null
                    : this.solucionarFecha(row[13]),
                ope_plazo:
                  row[14].toString() === '0' ? null : row[14].toString(),
                ope_liquidado:
                  row[15].toString() === '0' ? null : row[15].toString(),
                ope_deuda_pagada:
                  row[16].toString() === '0' ? null : row[16].toString(),
                ope_fecha_pagada:
                  this.solucionarFecha(row[17]) === ''
                    ? null
                    : this.solucionarFecha(row[17]),
                ope_provincia: row[18] === ' ' ? null : row[18],
                ope_tiene_garante:
                  row[19].toString() === '0' ? null : row[19].toString(),
                ope_fecha_compra:
                  this.solucionarFecha(row[20]) === ''
                    ? null
                    : this.solucionarFecha(row[20]),
                ope_observacion: row[21] === ' ' ? null : row[21],
                ope_abono_realizado:
                  row[22].toString() === '0' ? null : row[22].toString(),
                ope_valor_total_pag:
                  row[23].toString() === '0' ? null : row[23].toString(),
                ope_tipo_actualizacion:
                  row[24] === ' ' ? null : row[24].toString(),
                ope_total_vencido:
                  row[25].toString() === '0' ? null : row[25].toString(),
                ope_nom_segm_vencido: row[26] === ' ' ? null : row[26],
                ope_categoria_cliente: row[27] === ' ' ? null : row[27],
                ope_segmentacion: row[28] === ' ' ? null : row[28],
                ope_promo_cuotas_gratis:
                  row[29].toString() === '0' ? null : row[29].toString(),
                ope_deuda_actual:
                  row[30].toString() === '0' ? null : row[30].toString(),
                ope_saldo_interes:
                  row[31].toString() === '0' ? null : row[31].toString(),
                ope_saldo_amortizacion:
                  row[32].toString() === '0' ? null : row[32].toString(),
                ope_int_cobra:
                  row[33].toString() === '0' ? null : row[33].toString(),
                ope_saldo_cobra_mora:
                  row[34].toString() === '0' ? null : row[34].toString(),
                ope_descu_campa_saldo_capit:
                  row[35].toString() === '0' ? null : row[35].toString(),
                ope_valor_descu_saldo_capit:
                  row[36].toString() === '0' ? null : row[36].toString(),
                ope_descrip_unidad_gestion: row[37] === ' ' ? null : row[37],
                ope_id_ultima_gestion:
                  row[38].toString() === '0' ? null : row[38].toString(),
                ope_estado_contacta: row[39] === ' ' ? null : row[39],
                ope_fecha_entrega:
                  this.solucionarFecha(row[40]) === ''
                    ? null
                    : this.solucionarFecha(row[40]),
                id_cartera: Number(this.filtroCartera.value),
                ope_fecha_act: null,
                ope_fecha_desact: null,
                ope_fecha_in: null,
                ope_fecha_up: null,
                ope_esactivo: '1',
                ope_origendatos: 'cobrosystem'.toUpperCase(),
                ope_baseactual: '1',
              };
              if (this.ListaClientes !== undefined) {
                console.log(this.ListaClientes[0]);
                console.log(objetoRow);
                let propiedadesOmitidas = [
                  'Cartera',
                  'Cliente',
                  'ope_gestor_act',
                  'ope_gestor_desact',
                  'ope_gestor_in',
                  'ope_gestor_rem',
                  'ope_gestor_up',
                ];
                let propiedadesRestantes: any = {};
                for (const prop in this.ListaClientes[0]) {
                  if (!propiedadesOmitidas.includes(prop)) {
                    propiedadesRestantes[prop] = this.ListaClientes[0][prop];
                  }
                }
                let contIgualdad = 0;
                let contdesig = 0;
                Object.keys(propiedadesRestantes).forEach((prop) => {
                  if (propiedadesRestantes[prop] === objetoRow[prop]) {
                    console.log('iguales');
                    console.log(
                      prop +
                        '' +
                        propiedadesRestantes[prop] +
                        '' +
                        objetoRow[prop]
                    );
                    contIgualdad += 1;
                  } else {
                    console.log('diferentes');
                    console.log(
                      prop +
                        '' +
                        propiedadesRestantes[prop] +
                        '' +
                        objetoRow[prop]
                    );
                    contdesig += 1;
                  }
                });
                console.log(propiedadesRestantes);
                console.log(objetoRow);
                //Mandar esto en un metodo patra controlarlo mejor
                Object.keys(propiedadesRestantes).forEach((prop) => {
                  if (propiedadesRestantes[prop] === objetoRow[prop]) {
                    console.log('los valores son iguales');
                  } else if (
                    objetoRow[prop] === null ||
                    objetoRow[prop] === '0' ||
                    objetoRow[prop] === ' ' ||
                    objetoRow[prop] === 0
                  ) {
                    // Keep the current value in propiedadesRestantes
                    propiedadesRestantes[prop] = propiedadesRestantes[prop];
                  } else {
                    if (
                      prop === 'id_cxc_operacion' ||
                      prop === 'ope_cod_credito'
                    ) {
                      // Specific properties to retain their original values
                      propiedadesRestantes['id_cxc_operacion'] =
                        propiedadesRestantes['id_cxc_operacion'];
                      propiedadesRestantes['ope_cod_credito'] =
                        propiedadesRestantes['ope_cod_credito'];
                    } else {
                      // Update propiedadesRestantes with the value from objetoRow
                      console.log('se cargo los cambios');
                      console.log(
                        `propiedad --> ${prop} --> ${objetoRow[prop]} ------> ${propiedadesRestantes[prop]}`
                      );
                      console.log('Asignacion de este valor');
                      propiedadesRestantes[prop] = objetoRow[prop];
                      console.log(
                        `Asignacion de este valor en la propiedad ${prop} --> ${objetoRow[prop]}`
                      );
                    }
                  }
                });

                console.log(propiedadesRestantes);

                let objCliente = { ...propiedadesRestantes };
                console.log('----------------------------------------------');

                // Additional properties to be set
                objCliente.ope_baseactual = '1';
                objCliente.ope_origendatos = 'Cobro-System';

                console.log('----------------------------------------------');
                console.log(objCliente);
                this.verificacionPostOrPut(objCliente, banderaCarga, row);
          }
        }
        }),
        catchError((error) => {
          throw new Error(error);
        })
      )
      .subscribe();
    }
    if (this.itemFiles.value === '3') {
      this.api
        .GetCorreosFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any;
              objetoC = {
                id_correo: 0,
                cli_identificacion: row[0],
                cor_descripcion: (row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase(),
                cor_email: row[3],
                cor_fecha_act: this.Fechas.fecha(),
                cor_fecha_desact: this.Fechas.fecha(),
                cor_fecha_in: this.Fechas.fecha(),
                cor_fecha_up: this.Fechas.fecha(),
                cor_esactivo: '1',
                cor_id_tipo_correo: row[2].toString(),
                cor_origendatos: 'Sistema_CobroSys',
              };
              this.api
                .PostCorreos(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let contadoraux: number = 0;
              if (this.ListaClientes.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['cor_descripcion'] === (row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase() &&
                    elemento['cor_id_tipo_correo'] === row[2].toString() &&
                    elemento['cor_email'] === row[3]
                  ) {
                    console.log(elemento);
                    if (elemento['cor_esactivo'] === '1') {
                      console.log('entroEsActivo');
                      this.alerta.ErrorEnLaPeticion(
                        'Son iguales, se Mantienen los datos!!!!!'
                      );
                      this.eliminarObjeto(row);
                      break;
                    } else {
                      objetoC = {
                        id_correo: elemento['id_correo'],
                        cli_identificacion: elemento['cli_identificacion'],
                        cor_descripcion: (row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase(),
                        cor_email: elemento['cor_email'],
                        cor_fecha_act: this.Fechas.fecha(),
                        cor_fecha_desact: this.Fechas.fecha(),
                        cor_fecha_in: this.Fechas.fecha(),
                        cor_fecha_up: this.Fechas.fecha(),
                        cor_esactivo: '1',
                        cor_id_tipo_correo: row[2].toString(),
                        cor_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutCorreos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['cor_id_tipo_correo'] === row[2].toString() &&
                    elemento['cor_email'] === row[3]
                  ) {
                    if (elemento['cor_descripcion'] !== row[1].toUpperCase()) {
                      objetoC = {
                        id_correo: elemento['id_correo'],
                        cli_identificacion: elemento['cli_identificacion'],
                        cor_descripcion: (row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase(),
                        cor_email: elemento['cor_email'],
                        cor_fecha_act: this.Fechas.fecha(),
                        cor_fecha_desact: this.Fechas.fecha(),
                        cor_fecha_in: this.Fechas.fecha(),
                        cor_fecha_up: this.Fechas.fecha(),
                        cor_esactivo: '1',
                        cor_id_tipo_correo: row[2].toString(),
                        cor_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutCorreos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  if(elemento['cli_identificacion'] === row[0] &&
                    elemento['cor_id_tipo_correo'] === row[2].toString()&&elemento['cor_email'] != row[3])
                    {
                      objetoC = {
                        id_correo: elemento['id_correo'],
                        cli_identificacion: elemento['cli_identificacion'],
                        cor_descripcion:(row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase(),
                        cor_email: row[3],
                        cor_fecha_act: this.Fechas.fecha(),
                        cor_fecha_desact: this.Fechas.fecha(),
                        cor_fecha_in: this.Fechas.fecha(),
                        cor_fecha_up: this.Fechas.fecha(),
                        cor_esactivo: '1',
                        cor_id_tipo_correo: row[2].toString(),
                        cor_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutCorreos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  contadoraux++;
                }
                if (contadoraux === this.ListaClientes.length) {
                  objetoC = {
                    id_correo: 0,
                    cli_identificacion: row[0],
                    cor_descripcion:(row[1]==='VACIO'||row[1]==='vacio'||row[1]===' ')?null:row[1].toUpperCase(),
                    cor_email: row[3],
                    cor_fecha_act: this.Fechas.fecha(),
                    cor_fecha_desact: this.Fechas.fecha(),
                    cor_fecha_in: this.Fechas.fecha(),
                    cor_fecha_up: this.Fechas.fecha(),
                    cor_esactivo: '1',
                    cor_id_tipo_correo: row[2].toString(),
                    cor_origendatos: 'Sistema_CobroSys',
                  };
                  this.api
                    .PostCorreos(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '4') {
      this.api
        .GetDireccionesFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any = {
                id_direccion: 0,
                cli_identificacion: row[0],
                dir_completa: row[2].toUpperCase(),
                dir_calle_principal:
                (row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')? null : row[3].toUpperCase(),
                dir_calle_secundaria:
                (row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')? null : row[4].toUpperCase(),
                dir_numero_casa: (row[5]==='VACIO'||row[5]==='vacio'||row[5]===' '||row[5]==='0')?null:row[5].toString(),
                dir_referencia:
                (row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')? null : row[6].toUpperCase(),
                dir_provincia:
                (row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')? null : row[7].toUpperCase(),
                dir_canton:
                (row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')? null : row[8].toUpperCase(),
                dir_parroquia:
                (row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')? null : row[9].toUpperCase(),
                dir_fecha_act: this.Fechas.fecha(),
                dir_fecha_desact: this.Fechas.fecha(),
                dir_fecha_in: this.Fechas.fecha(),
                dir_fecha_up: this.Fechas.fecha(),
                dir_esactivo: '1',
                dir_id_tipo_direccion: row[1].toString(),
                dir_origendatos: 'Sistema_CobroSys',
              }; //Creacion de objeto de direcciones
              this.api
                .PostDirecciones(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } //fin del if
            else {
              banderaCarga = true;
              let objetoC: any;
              let contadorAux: number = 0;
              /****Obtejo conformado de los datos del archivo */
              let objetoRow: any = {
                id_direccion: 0,
                cli_identificacion: row[0],
                dir_completa: row[2].toUpperCase(),
                dir_calle_principal:
                (row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ') ? null : row[3].toUpperCase(),
                dir_calle_secundaria:
                (row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')? null : row[4].toUpperCase(),
                dir_numero_casa:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                dir_referencia:
                (row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null : row[6].toUpperCase(),
                dir_provincia:
                (row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')? null : row[7].toUpperCase(),
                dir_canton:
                (row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')? null : row[8].toUpperCase(),
                dir_parroquia:
                (row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')? null : row[9].toUpperCase(),
                dir_fecha_act: this.Fechas.fecha(),
                dir_fecha_desact: this.Fechas.fecha(),
                dir_fecha_in: this.Fechas.fecha(),
                dir_fecha_up: this.Fechas.fecha(),
                dir_esactivo: '1',
                dir_id_tipo_direccion: row[1].toString(),
                dir_origendatos: 'Sistema_CobroSys',
              };
              if (this.ListaClientes.length > 0) {
                for (let elemento of this.ListaClientes) {
                  console.log(elemento);
                  console.log(objetoRow);
                  if (
                    elemento['cli_identificacion'] ===
                      objetoRow['cli_identificacion'] &&
                    elemento['dir_id_tipo_direccion'] ===
                      objetoRow['dir_id_tipo_direccion'] &&
                    elemento['dir_completa'] === objetoRow['dir_completa'] &&
                    elemento['dir_calle_principal'] ===
                      objetoRow['dir_calle_principal'] &&
                    elemento['dir_calle_secundaria'] ===
                      objetoRow['dir_calle_secundaria'] &&
                    elemento['dir_numero_casa'] ===
                      objetoRow['dir_numero_casa'] &&
                    elemento['dir_referencia'] ===
                      objetoRow['dir_referencia'] &&
                    elemento['dir_provincia'] === objetoRow['dir_provincia'] &&
                    elemento['dir_canton'] === objetoRow['dir_canton'] &&
                    elemento['dir_parroquia'] === objetoRow['dir_parroquia']
                  ) {
                    if (elemento['dir_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion(
                        'Son iguales, y se Mantiene los Datos!!!!!'
                      );
                      this.eliminarObjeto(row);
                      break;
                    } else {
                      this.alerta.AlertaEnLaPeticion('Hacer PUT');
                      objetoC = {
                        id_direccion: elemento['id_direccion'],
                        cli_identificacion: row[0],
                        dir_completa: row[2].toUpperCase(),
                        dir_calle_principal:
                        (row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')? null
                            : row[3].toUpperCase(),
                        dir_calle_secundaria:
                        (row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')? null:row[4].toUpperCase(),
                        dir_numero_casa:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' '||row[5]==='0')?null:row[5].toString(),
                        dir_referencia:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')? null: row[6].toUpperCase(),
                        dir_provincia:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')? null: row[7].toUpperCase(),
                        dir_canton:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')? null: row[8].toUpperCase(),
                        dir_parroquia:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')? null:row[9].toUpperCase(),
                        dir_fecha_act: this.Fechas.fecha(),
                        dir_fecha_desact: this.Fechas.fecha(),
                        dir_fecha_in: this.Fechas.fecha(),
                        dir_fecha_up: this.Fechas.fecha(),
                        dir_esactivo: '1',
                        dir_id_tipo_direccion: row[1].toString(),
                        dir_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutDirecciones(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  } //fin del if si hay igualdad
                  if(elemento['dir_completa'] !== objetoRow['dir_completa']&&elemento['dir_id_tipo_direccion']===row[1].toString()){
                    this.alerta.AlertaEnLaPeticion('Hacer Put');
                      objetoC = {
                        id_direccion: elemento['id_direccion'],
                        cli_identificacion: row[0],
                        dir_completa: row[2].toUpperCase(),
                        dir_calle_principal:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                        dir_calle_secundaria:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        dir_numero_casa:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' '||row[5]==='0')?null:row[5].toString(),
                        dir_referencia:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toUpperCase(),
                        dir_provincia:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toUpperCase(),
                        dir_canton:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toUpperCase(),
                        dir_parroquia:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                        dir_fecha_act: this.Fechas.fecha(),
                        dir_fecha_desact: this.Fechas.fecha(),
                        dir_fecha_in: this.Fechas.fecha(),
                        dir_fecha_up: this.Fechas.fecha(),
                        dir_esactivo: '1',
                        dir_id_tipo_direccion: row[1].toString(),
                        dir_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutDirecciones(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                    break;
                    }
                  if (
                    elemento['cli_identificacion'] ===
                      objetoRow['cli_identificacion'] &&
                    elemento['dir_id_tipo_direccion'] ===
                      objetoRow['dir_id_tipo_direccion'] &&
                    elemento['dir_completa'] === objetoRow['dir_completa'] &&
                    elemento['dir_calle_principal'].toUpperCase() ===
                      objetoRow['dir_calle_principal'] &&
                    elemento['dir_calle_secundaria'].toUpperCase() ===
                      objetoRow['dir_calle_secundaria']
                  ) {
                    if (
                      elemento['dir_numero_casa'] !==
                        objetoRow['dir_numero_casa'] ||
                      elemento['dir_referencia'].toUpperCase() !==
                        objetoRow['dir_referencia'] ||
                      elemento['dir_provincia'].toUpperCase() !==
                        objetoRow['dir_provincia'] ||
                      elemento['dir_canton'].toUpperCase() !==
                        objetoRow['dir_canton'] ||
                      elemento['dir_parroquia'].toUpperCase() !==
                        objetoRow['dir_parroquia']
                    ) {
                      this.alerta.AlertaEnLaPeticion('Hacer Put');
                      objetoC = {
                        id_direccion: elemento['id_direccion'],
                        cli_identificacion: row[0],
                        dir_completa: row[2].toUpperCase(),
                        dir_calle_principal:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                        dir_calle_secundaria:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        dir_numero_casa:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' '||row[5]==='0')?null:row[5].toString(),
                        dir_referencia:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toUpperCase(),
                        dir_provincia:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toUpperCase(),
                        dir_canton:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toUpperCase(),
                        dir_parroquia:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                        dir_fecha_act: this.Fechas.fecha(),
                        dir_fecha_desact: this.Fechas.fecha(),
                        dir_fecha_in: this.Fechas.fecha(),
                        dir_fecha_up: this.Fechas.fecha(),
                        dir_esactivo: '1',
                        dir_id_tipo_direccion: row[1].toString(),
                        dir_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutDirecciones(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  contadorAux++;
                } //fin del for
                if (contadorAux === this.ListaClientes.length) {
                  this.alerta.AlertaEnLaPeticion('Hacer post');
                  objetoC = {
                    id_direccion: 0,
                    cli_identificacion: row[0],
                    dir_completa: row[2].toUpperCase(),
                    dir_calle_principal:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null : row[3].toUpperCase(),
                    dir_calle_secundaria:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')? null : row[4].toUpperCase(),
                    dir_numero_casa:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' '||row[5]==='0')?null :row[5].toString(),
                    dir_referencia:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')? null : row[6].toUpperCase(),
                    dir_provincia:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')? null : row[7].toUpperCase(),
                    dir_canton:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')? null : row[8].toUpperCase(),
                    dir_parroquia:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')? null : row[9].toUpperCase(),
                    dir_fecha_act: this.Fechas.fecha(),
                    dir_fecha_desact: this.Fechas.fecha(),
                    dir_fecha_in: this.Fechas.fecha(),
                    dir_fecha_up: this.Fechas.fecha(),
                    dir_esactivo: '1',
                    dir_id_tipo_direccion: row[1].toString(),
                    dir_origendatos: 'Sistema_CobroSys',
                  };
                  this.api
                    .PostDirecciones(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              } //if si hay mas direcciones anidadas a la persona
            } //fin del else
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '5') {
      let objetoC: any;
      this.api
        .GetGarantesFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              objetoC = {
                id_garante: 0,
                cli_identificacion: row[0],
                gar_identificacion: row[1],
                gar_nombres:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                gar_trabajo:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toString(),
                gar_direccion_dom:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                gar_direccion_trabajo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                gar_telefono_domicilio:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                gar_telefono_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                gar_telefono_adicional:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toString(),
                gar_observacion:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                gar_fecha_act: this.Fechas.fecha(),
                gar_fecha_desact: this.Fechas.fecha(),
                gar_fecha_in: this.Fechas.fecha(),
                gar_fecha_up: this.Fechas.fecha(),
                gar_esactivo: '1',
                gar_origendatos: 'Sistema_CobroSys',
              }; //Creacion de objeto de direcciones
              console.log(this.ListaClientes);
              this.api
                .PostGarantes(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let contadorAux: number = 0;
              //const valuesArrayRow = Object.values(row);
              let valorEncontrado: boolean = false;
              if (this.ListaClientes.length > 0) {
                for (let elemento of this.ListaClientes) {
                  console.log(elemento);
                  console.log(row);
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['gar_identificacion'] === row[1] &&
                    elemento['gar_nombres'] === row[2].toUpperCase() &&
                    elemento['gar_trabajo'] === row[3].toString() &&
                    elemento['gar_direccion_dom'] === row[4].toUpperCase() &&
                    elemento['gar_direccion_trabajo'] ===row[5].toUpperCase() &&
                    elemento['gar_telefono_domicilio'] === row[6].toString() &&
                    elemento['gar_telefono_trabajo'] === row[7].toString() &&
                    elemento['gar_telefono_adicional'] === row[8].toString() &&
                    elemento['gar_observacion'] === row[9].toUpperCase()
                  ) {
                    if (elemento['gar_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion(
                        'Son iguales;se Mantiene los Datos!!!!!!!!!!'
                      );
                      this.eliminarObjeto(row);
                      break;
                    } else {
                      objetoC = {
                        id_garante: elemento['id_garante'],
                        cli_identificacion: elemento['cli_identificacion'],
                        gar_identificacion: elemento['gar_identificacion'],
                        gar_nombres: elemento['gar_nombres'].toUpperCase(),
                        gar_trabajo:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toString(),
                        gar_direccion_dom:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        gar_direccion_trabajo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                        gar_telefono_domicilio:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        gar_telefono_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                        gar_telefono_adicional:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toString(),
                        gar_observacion:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                        gar_fecha_act: this.Fechas.fecha(),
                        gar_fecha_desact: this.Fechas.fecha(),
                        gar_fecha_in: this.Fechas.fecha(),
                        gar_fecha_up: this.Fechas.fecha(),
                        gar_esactivo: '1',
                        gar_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutGarantes(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
                              //this.onLimpiar();
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
                      break;
                    }
                  }
                  if(elemento['gar_nombres'] !== row[2].toUpperCase()&&elemento['gar_identificacion']===row[1].toString())
                    {
                      objetoC = {
                        id_garante: elemento['id_garante'],
                        cli_identificacion: elemento['cli_identificacion'],
                        gar_identificacion: elemento['gar_identificacion'],
                        gar_nombres:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                        gar_trabajo:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toString(),
                        gar_direccion_dom:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        gar_direccion_trabajo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                        gar_telefono_domicilio:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        gar_telefono_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                        gar_telefono_adicional:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toString(),
                        gar_observacion:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                        gar_fecha_act: this.Fechas.fecha(),
                        gar_fecha_desact: this.Fechas.fecha(),
                        gar_fecha_in: this.Fechas.fecha(),
                        gar_fecha_up: this.Fechas.fecha(),
                        gar_esactivo: '1',
                        gar_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutGarantes(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['gar_identificacion'] === row[1] &&
                    elemento['gar_nombres'] === row[2].toUpperCase()
                  ) {
                    if (
                      elemento['gar_trabajo'] !== row[3] ||
                      elemento['gar_direccion_dom'] !== row[4].toUpperCase() ||
                      elemento['gar_direccion_trabajo'] !==row[5].toUpperCase() ||
                      elemento['gar_telefono_domicilio'] !== row[6].toString() ||
                      elemento['gar_telefono_trabajo'] !== row[7].toString() ||
                      elemento['gar_telefono_adicional'] !== row[8].toString() ||
                      elemento['gar_observacion'] !== row[9].toUpperCase()
                    ) {
                      objetoC = {
                        id_garante: elemento['id_garante'],
                        cli_identificacion: elemento['cli_identificacion'],
                        gar_identificacion: elemento['gar_identificacion'],
                        gar_nombres: elemento['gar_nombres'].toUpperCase(),
                        gar_trabajo:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toString(),
                        gar_direccion_dom:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        gar_direccion_trabajo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                        gar_telefono_domicilio:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        gar_telefono_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                        gar_telefono_adicional:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toString(),
                        gar_observacion:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                        gar_fecha_act: this.Fechas.fecha(),
                        gar_fecha_desact: this.Fechas.fecha(),
                        gar_fecha_in: this.Fechas.fecha(),
                        gar_fecha_up: this.Fechas.fecha(),
                        gar_esactivo: '1',
                        gar_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutGarantes(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  contadorAux++;
                }
                if (contadorAux === this.ListaClientes.length) {
                  objetoC = {
                    id_garante: 0,
                    cli_identificacion: row[0],
                    gar_identificacion: row[1],
                    gar_nombres:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                    gar_trabajo:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toString(),
                    gar_direccion_dom:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                    gar_direccion_trabajo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                    gar_telefono_domicilio:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                    gar_telefono_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                    gar_telefono_adicional:(row[8]==='VACIO'||row[8]==='vacio'||row[8]===' ')?null:row[8].toString(),
                    gar_observacion:(row[9]==='VACIO'||row[9]==='vacio'||row[9]===' ')?null:row[9].toUpperCase(),
                    gar_fecha_act: this.Fechas.fecha(),
                    gar_fecha_desact: this.Fechas.fecha(),
                    gar_fecha_in: this.Fechas.fecha(),
                    gar_fecha_up: this.Fechas.fecha(),
                    gar_esactivo: '1',
                    gar_origendatos: 'Sistema_CobroSys',
                  };
                  this.api
                    .PostGarantes(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '6') {
      this.api
        .GetTelefonosFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            console.log(tracks['data']);
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any;
              objetoC = {
                id_telefono: 0,
                cli_identificacion: row[0],
                tel_numero: row[1],
                tel_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                tel_operadora:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                tel_tipo_operadora:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                tel_esactivo: '1',
                tel_id_tipo_telefono:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                tel_id_detal_telefono:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                tel_fecha_act: this.Fechas.fecha(),
                tel_fecha_desact: this.Fechas.fecha(),
                tel_fecha_in: this.Fechas.fecha(),
                tel_fecha_up: this.Fechas.fecha(),
                tel_origendatos: 'Sistema_CobroSys',
              }; //Creacion de objeto de direcciones
              this.api
                .PostTelefonos(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } //fin del if si nohay telefonos
            else {
              banderaCarga = true;
              let objetoC: any;
              let contadorAux = 0;
              if (this.ListaClientes.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['tel_numero'] === row[1] &&
                    elemento['tel_observacion'] === row[2].toUpperCase() &&
                    elemento['tel_operadora'] === row[3].toUpperCase() &&
                    elemento['tel_tipo_operadora'] === row[4].toUpperCase() &&
                    elemento['tel_id_tipo_telefono'] === row[5].toString() &&
                    elemento['tel_id_detal_telefono'] === row[6].toString()
                  ) {
                    if (elemento['tel_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion('Son iguales');
                      this.eliminarObjeto(row);
                      break;
                    } else {
                      objetoC = {
                        id_telefono: elemento['id_telefono'],
                        cli_identificacion: elemento['cli_identificacion'],
                        tel_numero: elemento['tel_numero'].toString(),
                        tel_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                        tel_operadora:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                        tel_tipo_operadora:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        tel_esactivo: '1',
                        tel_id_tipo_telefono:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                        tel_id_detal_telefono:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        tel_fecha_act: this.Fechas.fecha(),
                        tel_fecha_desact: this.Fechas.fecha(),
                        tel_fecha_in: this.Fechas.fecha(),
                        tel_fecha_up: this.Fechas.fecha(),
                        tel_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutTelefonos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                        break;
                    }
                  }
                  if(elemento['cli_identificacion'] === row[0] &&
                    elemento['tel_numero'] !== row[1]&&elemento['tel_id_tipo_telefono'] === row[5].toString())
                    {
                      this.alerta.ErrorEnLaPeticion('PUT');
                      objetoC = {
                        id_telefono: elemento['id_telefono'],
                        cli_identificacion: elemento['cli_identificacion'],
                        tel_numero: row[1].toString(),
                        tel_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                        tel_operadora:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                        tel_tipo_operadora:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        tel_esactivo: '1',
                        tel_id_tipo_telefono: elemento['tel_id_tipo_telefono'].toString(),
                        tel_id_detal_telefono:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        tel_fecha_act: this.Fechas.fecha(),
                        tel_fecha_desact: this.Fechas.fecha(),
                        tel_fecha_in: this.Fechas.fecha(),
                        tel_fecha_up: this.Fechas.fecha(),
                        tel_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutTelefonos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['tel_numero'] === row[1]
                  ) {
                    if (
                      elemento['tel_observacion'] !== row[2].toUpperCase() ||
                      elemento['tel_operadora'] !== row[3].toUpperCase() ||
                      elemento['tel_tipo_operadora'] !== row[4].toUpperCase() ||
                      elemento['tel_id_tipo_telefono'] !== row[5].toString() ||
                      elemento['tel_id_detal_telefono'] !== row[6].toString()
                    ) {
                      this.alerta.ErrorEnLaPeticion('PUT');
                      objetoC = {
                        id_telefono: elemento['id_telefono'],
                        cli_identificacion: elemento['cli_identificacion'],
                        tel_numero: elemento['tel_numero'].toString(),
                        tel_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                        tel_operadora: row[3].toUpperCase()==='VACIO'?null:row[3].toUpperCase(),
                        tel_tipo_operadora:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                        tel_esactivo: '1',
                        tel_id_tipo_telefono: (row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                        tel_id_detal_telefono:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                        tel_fecha_act: this.Fechas.fecha(),
                        tel_fecha_desact: this.Fechas.fecha(),
                        tel_fecha_in: this.Fechas.fecha(),
                        tel_fecha_up: this.Fechas.fecha(),
                        tel_origendatos: 'Sistema_CobroSys',
                      };
                      this.api
                        .PutTelefonos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  contadorAux++;
                }
                if (contadorAux === this.ListaClientes.length) {
                  this.alerta.ErrorEnLaPeticion('Post');
                  objetoC = {
                    id_telefono: 0,
                    cli_identificacion: row[0],
                    tel_numero: row[1].toString(),
                    tel_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                    tel_operadora:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                    tel_tipo_operadora:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toUpperCase(),
                    tel_esactivo: '1',
                    tel_id_tipo_telefono:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                    tel_id_detal_telefono:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toString(),
                    tel_fecha_act: this.Fechas.fecha(),
                    tel_fecha_desact: this.Fechas.fecha(),
                    tel_fecha_in: this.Fechas.fecha(),
                    tel_fecha_up: this.Fechas.fecha(),
                    tel_origendatos: 'Sistema_CobroSys',
                  };
                  this.api
                    .PostTelefonos(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            } //fin del else
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '7') {
      this.api
        .GetTrabajosFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              objetoC = {
                id_trabajo: 0,
                cli_identificacion: row[0],
                tra_ruc: row[1],
                tra_descripcion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                tra_direccion:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                tra_telefono: (row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toString(),
                tra_correo: (row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5],
                tra_observacion:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toUpperCase(),
                tra_id_tipo_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                tra_esactivo: '1',
                tra_fecha_act: this.Fechas.fecha(),
                tra_fecha_desact: this.Fechas.fecha(),
                tra_fecha_in: this.Fechas.fecha(),
                tra_fecha_up: this.Fechas.fecha(),
                tra_origendatos: 'Sistema_CobroSys',
              }; //Creacion de objeto de direcciones
              this.api
                .PostTrabajos(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let contadorAux = 0;
              if (this.ListaClientes.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['tra_ruc'] === row[1].toString() &&
                    elemento['tra_descripcion'] === row[2].toUpperCase() &&
                    elemento['tra_direccion'] === row[3].toUpperCase() &&
                    elemento['tra_telefono'] === row[4].toString() &&
                    elemento['tra_correo'] === row[5] &&
                    elemento['tra_observacion'] === row[6].toUpperCase() &&
                    elemento['tra_id_tipo_trabajo'] === row[7].toString()
                  ) {
                    if (elemento['tra_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion('Son iguales');
                      this.eliminarObjeto(row);
                      break;
                    } else {
                      objetoC = {
                        id_trabajo: elemento['id_trabajo'],
                        cli_identificacion: row[0],
                        tra_ruc: row[1],
                        tra_descripcion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                        tra_direccion:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                        tra_telefono:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toString(),
                        tra_correo: (row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toString(),
                        tra_observacion:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toUpperCase(),
                        tra_id_tipo_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                        tra_esactivo: '1',
                        tra_fecha_act: this.Fechas.fecha(),
                        tra_fecha_desact: this.Fechas.fecha(),
                        tra_fecha_in: this.Fechas.fecha(),
                        tra_fecha_up: this.Fechas.fecha(),
                        tra_origendatos: 'Sistema_CobroSys',
                      }; //Creacion de objeto de direcciones
                      this.api
                        .PutTrabajos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  if (
                    elemento['cli_identificacion'] === row[0] &&
                    elemento['tra_ruc'] === row[1]
                  ) {
                    if (
                      elemento['tra_descripcion'] !== row[2].toUpperCase() ||
                      elemento['tra_direccion'] !== row[3].toUpperCase() ||
                      elemento['tra_telefono'] !== row[4] ||
                      elemento['tra_correo'] !== row[5].toString() ||
                      elemento['tra_observacion'] !== row[6].toUpperCase()
                    ) {
                      if(elemento['tra_id_tipo_trabajo'] === row[7].toString())
                        {
                            this.alerta.ErrorEnLaPeticion('PUT');
                            objetoC = {
                              id_trabajo: elemento['id_trabajo'],
                              cli_identificacion: row[0],
                              tra_ruc: row[1],
                              tra_descripcion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null:row[2].toUpperCase(),
                              tra_direccion:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null:row[3].toUpperCase(),
                              tra_telefono:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null:row[4].toString(),
                              tra_correo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null:row[5].toUpperCase(),
                              tra_observacion:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null:row[6].toUpperCase(),
                              tra_id_tipo_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null:row[7].toString(),
                              tra_esactivo: '1',
                              tra_fecha_act: this.Fechas.fecha(),
                              tra_fecha_desact: this.Fechas.fecha(),
                              tra_fecha_in: this.Fechas.fecha(),
                              tra_fecha_up: this.Fechas.fecha(),
                              tra_origendatos: 'Sistema_CobroSys',
                            };
                            this.api
                              .PutTrabajos(objetoC)
                              .pipe(
                                map((tracks) => {
                                  const exito = tracks['exito'];
                                  if (exito == 1) {
                                    this.eliminarObjeto(row);
                                    this.alerta.RegistroActualizado();
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
                              break;
                        }
                    }
                  }
                  contadorAux++;
                }
                if (contadorAux === this.ListaClientes.length) {
                  this.alerta.ErrorEnLaPeticion('Post');
                  objetoC = {
                    id_trabajo: 0,
                    cli_identificacion: row[0],
                    tra_ruc: row[1].toString(),
                    tra_descripcion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')?null: row[2].toUpperCase(),
                    tra_direccion:(row[3]==='VACIO'||row[3]==='vacio'||row[3]===' ')?null: row[3].toUpperCase(),
                    tra_telefono:(row[4]==='VACIO'||row[4]==='vacio'||row[4]===' ')?null: row[4].toString(),
                    tra_correo:(row[5]==='VACIO'||row[5]==='vacio'||row[5]===' ')?null: row[5],
                    tra_observacion:(row[6]==='VACIO'||row[6]==='vacio'||row[6]===' ')?null: row[6].toUpperCase(),
                    tra_id_tipo_trabajo:(row[7]==='VACIO'||row[7]==='vacio'||row[7]===' ')?null: row[7].toString(),
                    tra_esactivo: '1',
                    tra_fecha_act: this.Fechas.fecha(),
                    tra_fecha_desact: this.Fechas.fecha(),
                    tra_fecha_in: this.Fechas.fecha(),
                    tra_fecha_up: this.Fechas.fecha(),
                    tra_origendatos: 'Sistema_CobroSys',
                  };
                  this.api
                    .PostTrabajos(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '8') {
      this.api
        .GetTipoCorreoFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_tipo_correo: 0,
                corr_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                corr_tip_esactivo: '1',
                corr_tip_fecha_act: this.Fechas.fecha(),
                corr_tip_fecha_desact: this.Fechas.fecha(),
                corr_tip_fecha_in: this.Fechas.fecha(),
                corr_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoCorreo(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              if (
                valorRecuperado['corr_tip_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['corr_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_correo: valorRecuperado['id_tipo_correo'],
                    corr_tip_descripcion:
                      valorRecuperado['corr_tip_descripcion'].toUpperCase(),
                    corr_tip_esactivo: '1',
                    corr_tip_fecha_act: this.Fechas.fecha(),
                    corr_tip_fecha_desact: this.Fechas.fecha(),
                    corr_tip_fecha_in: this.Fechas.fecha(),
                    corr_tip_fecha_up: this.Fechas.fecha(),
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PutTipoCorreo(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['corr_tip_descripcion'] !== row[1].toUpperCase()
              ) {
                objetoC = {
                  id_tipo_correo: 0,
                  corr_tip_descripcion: row[1].toUpperCase(),
                  corr_tip_esactivo: '1',
                  corr_tip_fecha_act: this.Fechas.fecha(),
                  corr_tip_fecha_desact: this.Fechas.fecha(),
                  corr_tip_fecha_in: this.Fechas.fecha(),
                  corr_tip_fecha_up: this.Fechas.fecha(),
                }; //Creacion de objeto de direcciones
                this.api
                  .PostTipoCorreo(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroActualizado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '9') {
      this.api
        .GetTipoTelefonoFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_tipo_telefono: 0,
                tel_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                tel_tip_esactivo: '1',
                tel_tip_fecha_act: this.Fechas.fecha(),
                tel_tip_fecha_desact: this.Fechas.fecha(),
                tel_tip_fecha_in: this.Fechas.fecha(),
                tel_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoTelefono(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              if (
                valorRecuperado['tel_tip_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['tel_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_telefono: valorRecuperado['id_tipo_telefono'],
                    tel_tip_descripcion:
                      valorRecuperado['tel_tip_descripcion'].toUpperCase(),
                    tel_tip_esactivo: '1',
                    tel_tip_fecha_act: this.Fechas.fecha(),
                    tel_tip_fecha_desact: this.Fechas.fecha(),
                    tel_tip_fecha_in: this.Fechas.fecha(),
                    tel_tip_fecha_up: this.Fechas.fecha(),
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PutTipoTelefono(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['tel_tip_descripcion'] !== row[1].toUpperCase()
              ) {
                objetoC = {
                  id_tipo_telefono: 0,
                  tel_tip_descripcion: row[1].toUpperCase(),
                  tel_tip_esactivo: '1',
                  tel_tip_fecha_act: this.Fechas.fecha(),
                  tel_tip_fecha_desact: this.Fechas.fecha(),
                  tel_tip_fecha_in: this.Fechas.fecha(),
                  tel_tip_fecha_up: this.Fechas.fecha(),
                }; //Creacion de objeto de direcciones
                this.api
                  .PostTipoTelefono(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroActualizado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '10') {
      this.api
        .GetTipoDireccionFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any;
              this.alerta.ErrorEnLaPeticion('Post');
              objetoC = {
                id_tipo_direccion: 0,
                dir_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                dir_tip_esactivo: '1',
                dir_tip_fecha_act: this.Fechas.fecha(),
                dir_tip_fecha_desact: this.Fechas.fecha(),
                dir_tip_fecha_in: this.Fechas.fecha(),
                dir_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoDireccion(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              if (
                valorRecuperado['dir_tip_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['dir_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_direccion: valorRecuperado['id_tipo_direccion'],
                    dir_tip_descripcion:
                      valorRecuperado['dir_tip_descripcion'].toUpperCase(),
                    dir_tip_esactivo: '1',
                    dir_tip_fecha_act: this.Fechas.fecha(),
                    dir_tip_fecha_desact: this.Fechas.fecha(),
                    dir_tip_fecha_in: this.Fechas.fecha(),
                    dir_tip_fecha_up: this.Fechas.fecha(),
                  };
                  this.api
                    .PutTipoDireccion(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['dir_tip_descripcion'] !== row[1].toUpperCase()
              ) {
                this.alerta.ErrorEnLaPeticion('Post');
                objetoC = {
                  id_tipo_direccion: 0,
                  dir_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                  dir_tip_esactivo: '1',
                  dir_tip_fecha_act: this.Fechas.fecha(),
                  dir_tip_fecha_desact: this.Fechas.fecha(),
                  dir_tip_fecha_in: this.Fechas.fecha(),
                  dir_tip_fecha_up: this.Fechas.fecha(),
                }; //Creacion de objeto de direcciones
                this.api
                  .PostTipoDireccion(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroActualizado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '11') {
      this.api
        .GetDetTelefonoFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_detalle_telefono: 0,
                tel_detal_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                tel_detal_esactivo: '1',
                tel_detal_fecha_act: this.Fechas.fecha(),
                tel_detal_fecha_desact: this.Fechas.fecha(),
                tel_detal_fecha_in: this.Fechas.fecha(),
                tel_detal_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostDetTelefono(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              console.log(valorRecuperado);
              if (
                valorRecuperado['tel_detal_descripcion'] ===
                row[1].toUpperCase()
              ) {
                if (valorRecuperado['tel_detal_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_detalle_telefono: valorRecuperado['id_detalle_telefono'],
                    tel_detal_descripcion:
                      valorRecuperado['tel_detal_descripcion'].toUpperCase(),
                    tel_detal_esactivo: '1',
                    tel_detal_fecha_act: this.Fechas.fecha(),
                    tel_detal_desact: this.Fechas.fecha(),
                    tel_detal_fecha_in: this.Fechas.fecha(),
                    tel_detal_fecha_up: this.Fechas.fecha(),
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PutDetTelefono(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['tel_detal_descripcion'] !==
                row[1].toUpperCase()
              ) {
                objetoC = {
                  id_detalle_telefono: 0,
                  tel_detal_descripcion: row[1].toUpperCase(),
                  tel_detal_esactivo: '1',
                  tel_detal_fecha_act: this.Fechas.fecha(),
                  tel_detal_desact: this.Fechas.fecha(),
                  tel_detal_fecha_in: this.Fechas.fecha(),
                  tel_detal_fecha_up: this.Fechas.fecha(),
                }; //Creacion de objeto de direcciones
                this.api
                  .PostDetTelefono(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '12') {
      this.api
        .GetTipoTrabajoFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_tipo_trabajo: 0,
                trab_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                trab_tip_esactivo: '1',
                trab_tip_fecha_act: this.Fechas.fecha(),
                trab_tip_fecha_desact: this.Fechas.fecha(),
                trab_tip_fecha_in: this.Fechas.fecha(),
                trab_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoTrabajo(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              console.log(valorRecuperado);
              if (
                valorRecuperado['trab_tip_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['trab_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_trabajo: valorRecuperado['id_tipo_trabajo'],
                    trab_tip_descripcion: row[1].toUpperCase(),
                    trab_tip_esactivo: '1',
                    trab_tip_fecha_act: this.Fechas.fecha(),
                    trab_tip_fecha_desact: this.Fechas.fecha(),
                    trab_tip_fecha_in: this.Fechas.fecha(),
                    trab_tip_fecha_up: this.Fechas.fecha(),
                  }; //Crereacion de objeto de direcciones
                  this.api
                    .PutTipoTrabajo(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['trab_tip_descripcion'] !== row[1].toUpperCase()
              ) {
                this.alerta.ErrorEnLaPeticion('Post');
                objetoC = {
                  id_tipo_trabajo: 0,
                  trab_tip_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                  trab_tip_esactivo: '1',
                  trab_tip_fecha_act: this.Fechas.fecha(),
                  trab_tip_fecha_desact: this.Fechas.fecha(),
                  trab_tip_fecha_in: this.Fechas.fecha(),
                  trab_tip_fecha_up: this.Fechas.fecha(),
                }; ///Creacion de objeto de direcciones
                this.api
                  .PostTipoTrabajo(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '13') {
      this.api
        .GetContactabilidadFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_contactabilidad: 0,
                contac_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                contac_esactivo: '1',
                contac_fecha_act: this.Fechas.fecha(),
                contac_fecha_desact: this.Fechas.fecha(),
                contac_fecha_in: this.Fechas.fecha(),
                contac_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostContactabilidad(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              console.log(valorRecuperado);
              if (
                valorRecuperado['contac_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['contac_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_contactabilidad: valorRecuperado['id_contactabilidad'],
                    contac_descripcion: row[1].toUpperCase(),
                    contac_esactivo: '1',
                    contac_fecha_act: this.Fechas.fecha(),
                    contac_fecha_desact: this.Fechas.fecha(),
                    contac_fecha_in: this.Fechas.fecha(),
                    contac_fecha_up: this.Fechas.fecha(),
                  }; //C
                  this.api
                    .PutContactabilidad(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['contac_descripcion'] !== row[1].toUpperCase()
              ) {
                this.alerta.ErrorEnLaPeticion('Post');
                objetoC = {
                  id_contactabilidad: 0,
                  contac_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                  contac_esactivo: '1',
                  contac_fecha_act: this.Fechas.fecha(),
                  contac_fecha_desact: this.Fechas.fecha(),
                  contac_fecha_in: this.Fechas.fecha(),
                  contac_fecha_up: this.Fechas.fecha(),
                }; //C
                this.api
                  .PostContactabilidad(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '14') {
      this.api
        .GetConectividadFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.alerta.ErrorEnLaPeticion('Post');
              let objetoC: any;
              objetoC = {
                id_conectividad: 0,
                conec_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                conec_esactivo: '1',
                conec_fecha_act: this.Fechas.fecha(),
                conec_fecha_desact: this.Fechas.fecha(),
                conec_fecha_in: this.Fechas.fecha(),
                conec_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostConectividad(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              console.log(valorRecuperado);
              if (
                valorRecuperado['conec_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['conec_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_conectividad: valorRecuperado['id_conectividad'],
                    conec_descripcion: row[1].toUpperCase(),
                    conec_esactivo: '1',
                    conec_fecha_act: this.Fechas.fecha(),
                    conec_fecha_desact: this.Fechas.fecha(),
                    conec_fecha_in: this.Fechas.fecha(),
                    conec_fecha_up: this.Fechas.fecha(),
                  }; //C
                  this.api
                    .PutConectividad(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['conec_descripcion'] !== row[1].toUpperCase()
              ) {
                this.alerta.ErrorEnLaPeticion('Post');
                objetoC = {
                  id_conectividad: 0,
                  conec_descripcion: row[1].toUpperCase()==='VACIO'?'CAMBIAR':row[1].toUpperCase(),
                  conec_esactivo: '1',
                  conec_fecha_act: this.Fechas.fecha(),
                  conec_fecha_desact: this.Fechas.fecha(),
                  conec_fecha_in: this.Fechas.fecha(),
                  conec_fecha_up: this.Fechas.fecha(),
                }; //C
                this.api
                  .PostConectividad(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '15') {
      this.api
        .GetCuentasFracionadoFiltro(row[0], 2)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any;
              this.alerta.ErrorEnLaPeticion('AGREGAR');
              objetoC = {
                id_cuenta: 0,
                cuent_nombre:
                  row[0].toUpperCase() === 'VACIO' ? null : row[0].toUpperCase(),
                cuent_entidadfinanciera:
                  row[1].toUpperCase() === 'VACIO' ? null : row[1].toUpperCase(),
                cuent_numero:
                  row[2].toString() === '0' ? null : row[2].toString(),
                cuent_esactivo: '1',
                cuent_fecha_act: this.Fechas.fecha(),
                cuent_fecha_desact: this.Fechas.fecha(),
                cuent_fecha_in: this.Fechas.fecha(),
                cuent_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostCuentas(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              const rowdata: any = {
                cuent_nombre: row[0].toUpperCase(),
                cuent_entidadfinanciera:
                  row[1] === ' ' ? null : row[1].toUpperCase(),
                cuent_numero:
                  row[2].toString() === '0' ? null : row[2].toString(),
              };
              if (
                valorRecuperado['cuent_nombre'] === rowdata['cuent_nombre'] &&
                valorRecuperado['cuent_entidadfinanciera'] ===
                  rowdata['cuent_entidadfinanciera'] &&
                valorRecuperado['cuent_numero'] === rowdata['cuent_numero']
              ) {
                if (valorRecuperado['cuent_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {

                  this.alerta.ErrorEnLaPeticion('ACTUALIZAR');
                  objetoC = {
                    id_cuenta: valorRecuperado['id_cuenta'],
                    cuent_nombre: row[0].toUpperCase(),
                    cuent_entidadfinanciera:
                      row[1] === 'VACIO' ? null : row[1].toUpperCase(),
                    cuent_numero:
                      row[2].toString() === '0' ? null : row[2].toString(),
                    cuent_esactivo: '1',
                    cuent_fecha_act: this.Fechas.fecha(),
                    cuent_fecha_desact: this.Fechas.fecha(),
                    cuent_fecha_in: this.Fechas.fecha(),
                    cuent_fecha_up: this.Fechas.fecha(),
                  }; //C
                  this.api
                    .PutCuentas(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['cuent_nombre'] !== rowdata['cuent_nombre'] ||
                valorRecuperado['cuent_entidadfinanciera'] !==
                  rowdata['cuent_entidadfinanciera'] ||
                valorRecuperado['cuent_numero'] !== rowdata['cuent_numero']
              ) {
                this.alerta.ErrorEnLaPeticion('ACTUALIZAR');
                objetoC = {
                  id_cuenta: valorRecuperado['id_cuenta'],
                  cuent_nombre: row[0].toUpperCase(),
                  cuent_entidadfinanciera:
                    row[1] === ' ' ? null : row[1].toUpperCase(),
                  cuent_numero:
                    row[2].toString() === '0' ? null : row[2].toString(),
                  cuent_esactivo: '1',
                  cuent_fecha_act: this.Fechas.fecha(),
                  cuent_fecha_desact: this.Fechas.fecha(),
                  cuent_fecha_in: this.Fechas.fecha(),
                  cuent_fecha_up: this.Fechas.fecha(),
                }; //C
                this.api
                  .PutCuentas(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroActualizado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '16') {
      this.api
        .GetTipoGestionFracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              objetoC = {
                id_tipo_gestion: 0,
                gestion_tip_descripcion: row[1].toUpperCase(),
                gestion_tip_esactivo: '1',
                gestion_tip_fecha_act: this.Fechas.fecha(),
                gestion_tip_fecha_desact: this.Fechas.fecha(),
                gestion_tip_fecha_in: this.Fechas.fecha(),
                gestion_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoGestion(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              if (
                valorRecuperado['gestion_tip_descripcion'] ===
                row[1].toUpperCase()
              ) {
                if (valorRecuperado['gestion_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_gestion: valorRecuperado['id_tipo_gestion'],
                    gestion_tip_descripcion: row[1].toUpperCase(),
                    gestion_tip_esactivo: '1',
                    gestion_tip_fecha_act: this.Fechas.fecha(),
                    gestion_tip_fecha_desact: this.Fechas.fecha(),
                    gestion_tip_fecha_in: this.Fechas.fecha(),
                    gestion_tip_fecha_up: this.Fechas.fecha(),
                  }; //Crereacion de objeto de direcciones
                  this.api
                    .PutTipoGestion(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['gestion_tip_descripcion'] !==
                row[1].toUpperCase()
              ) {
                objetoC = {
                  id_tipo_gestion: 0,
                  gestion_tip_descripcion: row[1].toUpperCase(),
                  gestion_tip_esactivo: '1',
                  gestion_tip_fecha_act: this.Fechas.fecha(),
                  gestion_tip_fecha_desact: this.Fechas.fecha(),
                  gestion_tip_fecha_in: this.Fechas.fecha(),
                  gestion_tip_fecha_up: this.Fechas.fecha(),
                }; ///Creacion de objeto de direcciones
                this.api
                  .PostTipoGestion(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '17') {
      this.api
        .GetCarteraFracionadoFiltro(row[0], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            console.log(this.ListaClientes.length);
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              console.log(
                '----------------------------------------------------------------'
              );
              console.log(
                '------------------------HACER POST----------------------------------------'
              );
              console.log(
                '----------------------------------------------------------------'
              );
              objetoC = {
                id_cartera: 0,
                cart_descripcion: row[0].toUpperCase(),
                cart_observacion: row[1] === '' ? null : row[1],
                id_tipo_cartera: row[2],
                cart_esactivo: '1',
                cart_fecha_act: this.Fechas.fecha(),
                cart_fecha_desact: this.Fechas.fecha(),
                cart_fecha_in: this.Fechas.fecha(),
                cart_fecha_up: this.Fechas.fecha(),
              };
              console.log(objetoC); //Creacion de objeto de direcciones
              this.api
                .PostCartera(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let contadoraux: number = 0;
              const objetoRow: any = {
                cart_descripcion: row[0].toUpperCase(),
                cart_observacion: row[1] === '' ? null : row[1],
                id_tipo_cartera: row[2],
              };
              console.log(objetoRow);
              console.log(this.ListaClientes);
              if (this.ListaClientes.length > 0) 
              {
                contadoraux+=1;
                for (let elemento of this.ListaClientes) 
                {
                  if (
                    elemento['cart_descripcion'] ===
                    objetoRow['cart_descripcion'] &&
                    elemento['cart_observacion'] ===
                    objetoRow['cart_observacion'] &&
                    elemento['id_tipo_cartera'] === objetoRow['id_tipo_cartera']
                  ) {
                    if (elemento['cart_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion(
                        'Son iguales, se Mantienen los datos!!!!!'
                      );
                      this.eliminarObjeto(row);
                      break;
                    } 
                  }else
                  {
                    objetoC = {
                      id_cartera: elemento['id_cartera'],
                      cart_descripcion: objetoRow['cart_descripcion'],
                      cart_observacion: objetoRow['cart_observacion'],
                      id_tipo_cartera: objetoRow['id_tipo_cartera'],
                      cart_esactivo: '1',
                      cart_fecha_act: this.Fechas.fecha(),
                      cart_fecha_desact: this.Fechas.fecha(),
                      cart_fecha_in: this.Fechas.fecha(),
                      cart_fecha_up: this.Fechas.fecha(),
                    };
                    console.log(objetoC + 'put');
                    //Crereacion de objeto cartera
                    this.api
                      .PutCartera(objetoC)
                      .pipe(
                        map((tracks) => {
                          const exito = tracks['exito'];
                          if (exito == 1) {
                            this.eliminarObjeto(row);
                            this.alerta.RegistroActualizado();
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
                    break;
                  }//fin del else
                  if (
                    elemento['cart_descripcion'] ===
                    objetoRow['cart_descripcion'] &&
                    elemento['cart_observacion'] !=
                    objetoRow['cart_observacion'] &&
                    elemento['id_tipo_cartera'] === objetoRow['id_tipo_cartera']
                  ) {
                    objetoC = {
                      id_cartera: elemento['id_cartera'],
                      cart_descripcion: objetoRow['cart_descripcion'],
                      cart_observacion: objetoRow['cart_observacion'],
                      id_tipo_cartera: objetoRow['id_tipo_cartera'],
                      cart_esactivo: '1',
                      cart_fecha_act: this.Fechas.fecha(),
                      cart_fecha_desact: this.Fechas.fecha(),
                      cart_fecha_in: this.Fechas.fecha(),
                      cart_fecha_up: this.Fechas.fecha(),
                    };
                    console.log(objetoC + 'put');
                    //Crereacion de objeto cartera
                    this.api
                      .PutCartera(objetoC)
                      .pipe(
                        map((tracks) => {
                          const exito = tracks['exito'];
                          if (exito == 1) {
                            this.eliminarObjeto(row);
                            this.alerta.RegistroActualizado();
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
                    break;
                  }else
                  {
                    objetoC = {
                      id_cartera: elemento['id_cartera'],
                      cart_descripcion: objetoRow['cart_descripcion'],
                      cart_observacion: objetoRow['cart_observacion'],
                      id_tipo_cartera: objetoRow['id_tipo_cartera'],
                      cart_esactivo: '1',
                      cart_fecha_act: this.Fechas.fecha(),
                      cart_fecha_desact: this.Fechas.fecha(),
                      cart_fecha_in: this.Fechas.fecha(),
                      cart_fecha_up: this.Fechas.fecha()
                    };
                    console.log(objetoC + 'put');
                    //Crereacion de objeto cartera
                    this.api
                      .PutCartera(objetoC)
                      .pipe(
                        map((tracks) => {
                          const exito = tracks['exito'];
                          if (exito == 1) {
                            this.eliminarObjeto(row);
                            this.alerta.RegistroActualizado();
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
                    break;
                    }
                }//end for
              } //end if
              if (this.ListaClientes.length === contadoraux) {
                objetoC = {
                  id_cartera: 0,
                  cart_descripcion: objetoRow['cart_descripcion'],
                  cart_observacion: objetoRow['cart_observacion'],
                  id_tipo_cartera: objetoRow['id_tipo_cartera'],
                  cart_esactivo: '1',
                  cart_fecha_act: this.Fechas.fecha(),
                  cart_fecha_desact: this.Fechas.fecha(),
                  cart_fecha_in: this.Fechas.fecha(),
                  cart_fecha_up: this.Fechas.fecha(),
                };
                console.log(objetoC + 'post');
                //Creacion de objeto de direcciones
                this.api
                  .PostCartera(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '18') {
      this.api
        .GetT_C_FracionadoFiltro(row[1], 1)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              console.log(
                '----------------------------------------------------------------'
              );
              console.log(
                '------------------------HACER POST----------------------------------------'
              );
              console.log(
                '----------------------------------------------------------------'
              );
              objetoC = {
                id_tipo_cartera: 0,
                cart_tip_descripcion: row[1].toUpperCase(),
                cart_tip_esactivo: '1',
                cart_tip_fecha_act: this.Fechas.fecha(),
                cart_tip_fecha_desact: this.Fechas.fecha(),
                cart_tip_fecha_in: this.Fechas.fecha(),
                cart_tip_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostTipoCartera(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              console.log(valorRecuperado);
              if (
                valorRecuperado['cart_tip_descripcion'] === row[1].toUpperCase()
              ) {
                if (valorRecuperado['cart_tip_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  objetoC = {
                    id_tipo_cartera: valorRecuperado['id_tipo_cartera'],
                    cart_tip_descripcion: row[1].toUpperCase(),
                    cart_tip_esactivo: '1',
                    cart_tip_fecha_act: this.Fechas.fecha(),
                    cart_tip_fecha_desact: this.Fechas.fecha(),
                    cart_tip_fecha_in: this.Fechas.fecha(),
                    cart_tip_fecha_up: this.Fechas.fecha(),
                  }; //Crereacion de objeto de direcciones
                  this.api
                    .PutTipoCartera(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
              if (
                valorRecuperado['cart_tip_descripcion'] !== row[1].toUpperCase()
              ) {
                objetoC = {
                  id_tipo_cartera: 0,
                  cart_tip_descripcion: row[1].toUpperCase(),
                  cart_tip_esactivo: '1',
                  cart_tip_fecha_act: this.Fechas.fecha(),
                  cart_tip_fecha_desact: this.Fechas.fecha(),
                  cart_tip_fecha_in: this.Fechas.fecha(),
                  cart_tip_fecha_up: this.Fechas.fecha(),
                }; ///Creacion de objeto de direcciones
                this.api
                  .PostTipoCartera(objetoC)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.eliminarObjeto(row);
                        this.alerta.RegistroAgregado();
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
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '19') {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDaten = new Date(row[4]).toISOString().split('T')[0];
      const minDatesa = new Date(row[5]).toISOString().split('T')[0];

      const objetoRow: any = {
        ges_nombres: row[0].toUpperCase(),
        ges_apellidos: row[1].toUpperCase(),
        ges_esgestor: row[2].toString() === '' ? '0' : row[2].toString(),
        ges_observacion: row[3] === '' ? null : row[3],
        ges_fecha_entrada:
          this.solucionarFecha(row[4]) === '' ? minDate : minDaten,
        ges_fecha_salida:
          this.solucionarFecha(row[5]) === '' ? minDate : minDatesa,
      };
      objetoRow['ges_fecha_entrada']=objetoRow['ges_fecha_entrada']==='1969-12-31'?null:objetoRow['ges_fecha_entrada'];
      objetoRow['ges_fecha_salida']=objetoRow['ges_fecha_salida']==='1969-12-31'?null:objetoRow['ges_fecha_salida'];
      this.api
        .GetGestoresFracionadoFiltro(row[0] + '' + row[1], 4)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              objetoC = {
                id_gestor: 0,
                ges_nombres: row[0].toUpperCase(),
                ges_apellidos: row[1].toUpperCase(),
                ges_esgestor:
                  row[2].toString() === '' ? '0' : row[2].toString(),
                ges_observacion: row[3],
                ges_fecha_entrada:
                  this.solucionarFecha(row[4]) === '' ? minDate : minDaten,
                ges_fecha_salida:
                  this.solucionarFecha(row[5]) === '' ? minDate : minDatesa,
                ges_esactivo: '1',
                ges_fecha_act: this.Fechas.fecha(),
                ges_fecha_desact: this.Fechas.fecha(),
                ges_fecha_in: this.Fechas.fecha(),
                ges_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostGestores(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes[0];
              if (
                valorRecuperado['ges_nombres'] === objetoRow['ges_nombres'] &&
                valorRecuperado['ges_apellidos'] ===
                  objetoRow['ges_apellidos'] &&
                valorRecuperado['ges_esgestor'] === objetoRow['ges_esgestor'] &&
                this.Fechas.fechaActualCortaEnvio(
                  valorRecuperado['ges_fecha_entrada']
                ) === minDaten &&
                this.Fechas.fechaActualCortaEnvio(
                  valorRecuperado['ges_fecha_salida']
                ) === minDatesa
              ) {
                if (valorRecuperado['ges_esactivo'] === '1') {
                  this.alerta.ErrorEnLaPeticion(
                    'Son iguales , se Mantiene los datos'
                  );
                  this.eliminarObjeto(row);
                } else {
                  console.log('entro');
                  objetoC = {
                    id_gestor: valorRecuperado['id_gestor'],
                    ges_nombres: row[0].toUpperCase(),
                    ges_apellidos: row[1].toUpperCase(),
                    ges_esgestor:
                      row[2].toString() === '' ? '0' : row[2].toString(),
                    ges_observacion: row[3],
                    ges_fecha_entrada:
                      this.solucionarFecha(row[4]) === ''
                        ? minDate
                        : new Date(this.solucionarFecha(row[4])),
                    ges_fecha_salida:
                      this.solucionarFecha(row[5]) === ''
                        ? minDate
                        : new Date(this.solucionarFecha(row[5])),
                    ges_esactivo: '1',
                    ges_fecha_act: this.Fechas.fecha(),
                    ges_fecha_desact: this.Fechas.fecha(),
                    ges_fecha_in: this.Fechas.fecha(),
                    ges_fecha_up: this.Fechas.fecha(),
                  }; //Crereacion de objeto gestor
                  console.log(objetoC);
                  this.api
                    .PutGestores(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroActualizado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '20') {
      //const minDate = new Date('1969-12-31').toISOString().split('T')[0];

      const objetoRow: any = {
        cli_identificacion: row[0],
        id_gestor: row[1] === '' ? 2 : row[1],
        id_cartera:Number(this.filtroCartera.value),
        cgc_observacion: row[2] === ' ' ? null : row[2],
      };
      this.api
        .GetClienteGestorCarteraFracionadoFiltro(
          objetoRow['cli_identificacion'],
          1
        )
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              objetoC = {
                id_cliente_gestor_cartera: 0,
                id_cartera: objetoRow['id_cartera'],
                cli_identificacion: objetoRow['cli_identificacion'],
                id_gestor: objetoRow['id_gestor'],
                cgc_observacion: objetoRow['cgc_observacion'],
                cgc_esactivo: '1',
                cgc_fecha_act: this.Fechas.fecha(),
                cgc_fecha_desact: this.Fechas.fecha(),
                cgc_fecha_in: this.Fechas.fecha(),
                cgc_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostClienteGestorCartera(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes;
              console.log(valorRecuperado);
              console.log(objetoRow);
              let contadorAux: number = 0;
              if (valorRecuperado.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['cli_identificacion'] ===
                      objetoRow['cli_identificacion'] &&
                    elemento['id_cartera'] === objetoRow['id_cartera'] &&
                    elemento['id_gestor'] === objetoRow['id_gestor']
                  ) {
                    if (elemento['cgc_esactivo'] === '0') {
                      objetoC = {
                        id_cliente_gestor_cartera:
                          elemento['id_cliente_gestor_cartera'],
                        id_cartera: objetoRow['id_cartera'],
                        cli_identificacion: objetoRow['cli_identificacion'],
                        id_gestor: objetoRow['id_gestor'],
                        cgc_observacion: objetoRow['cgc_observacion'],
                        cgc_esactivo: '1',
                        cgc_fecha_act: this.Fechas.fecha(),
                        cgc_fecha_desact: this.Fechas.fecha(),
                        cgc_fecha_in: this.Fechas.fecha(),
                        cgc_fecha_up: this.Fechas.fecha(),
                      }; //Crereacion de objeto gestor
                      console.log(objetoC + 'put');
                      this.api
                        .PutClienteGestorCartera(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(row);
                              this.alerta.RegistroActualizado();
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
                      break;
                    }
                  }
                  if (
                    elemento['cli_identificacion'] ===
                      objetoRow['cli_identificacion'] &&
                    elemento['id_cartera'] !== objetoRow['id_cartera'] &&
                    elemento['id_gestor'] === objetoRow['id_gestor']
                  ) {
                    elemento['cgc_esactivo'] = '0';
                    const cedulaValor = elemento['cli_identificacion'];
                    const banderaux = true;
                    const input2 =
                      this.verificacionAgregarEditarClienteGestorCartera(
                        elemento,
                        banderaux
                      );
                    if (input2 === 0) {
                      const banderaux = false;
                      const nuevo = this.cargarClienteGestorCartera(
                        cedulaValor,
                        objetoRow['id_cartera'],
                        objetoRow['id_gestor']
                      );
                      const input3 =
                        this.verificacionAgregarEditarClienteGestorCartera(
                          nuevo,
                          banderaux
                        );
                      if (input3 === 0) {
                        this.eliminarObjeto(row);
                        break;
                      }
                    }
                  }
                  if (
                    elemento['cli_identificacion'] ===
                      objetoRow['cli_identificacion'] &&
                    elemento['id_cartera'] === objetoRow['id_cartera'] &&
                    elemento['id_gestor'] !== objetoRow['id_gestor']
                  ) {
                    elemento['cgc_esactivo'] = '0';
                    const cedulaValor = elemento['cli_identificacion'];
                    const banderaux = true;
                    const input2 =
                      this.verificacionAgregarEditarClienteGestorCartera(
                        elemento,
                        banderaux
                      );
                    if (input2 === 0) {
                      const banderaux = false;
                      const nuevo = this.cargarClienteGestorCartera(
                        cedulaValor,
                        objetoRow['id_cartera'],
                        objetoRow['id_gestor']
                      );
                      const input3 =
                        this.verificacionAgregarEditarClienteGestorCartera(
                          nuevo,
                          banderaux
                        );
                      if (input3 === 0) {
                        this.eliminarObjeto(row);
                        break;
                      }
                    }
                  }
                  contadorAux++;
                } //fin del for
                if (contadorAux === this.ListaClientes.length) {
                  objetoC = {
                    id_cliente_gestor_cartera: 0,
                    id_cartera: objetoRow['id_cartera'],
                    cli_identificacion: objetoRow['cli_identificacion'],
                    id_gestor: objetoRow['id_gestor'],
                    cgc_observacion: objetoRow['cgc_observacion'],
                    cgc_esactivo: '1',
                    cgc_fecha_act: this.Fechas.fecha(),
                    cgc_fecha_desact: this.Fechas.fecha(),
                    cgc_fecha_in: this.Fechas.fecha(),
                    cgc_fecha_up: this.Fechas.fecha(),
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PostClienteGestorCartera(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '21') {
      //const minDate = new Date('1969-12-31').toISOString().split('T')[0];

      const objetoRow: any = {
        id_cuenta: row[0],
        id_cartera:Number(this.filtroCartera.value),
        ctipcar_observacion:(row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1].toUpperCase(),
      };
      this.api
        .GetCuentaCarteraFracionadoFiltro(objetoRow['id_cuenta'], 4)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            console.log(this.ListaClientes)
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row+'POST');
              let objetoC: any;
              objetoC = {
                id_cuenta_tipo_cartera: 0,
                id_cuenta: row[0],
                id_cartera: row[1],
                ctipcar_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')? null : row[2].toUpperCase(),
                ctipcar_esactivo: '1',
                ctipcar_fecha_act: this.Fechas.fecha(),
                ctipcar_fecha_desact: this.Fechas.fecha(),
                ctipcar_fecha_in: this.Fechas.fecha(),
                ctipcar_fecha_up: this.Fechas.fecha(),
              }; //Creacion de objeto de direcciones
              this.api
                .PostCuentaCartera(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes;
              console.log('------------------');
              console.log(valorRecuperado);
              console.log(objetoRow);
              console.log('------------------');
              let contadorAux: number = 0;
              if (valorRecuperado.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['id_cuenta'] === objetoRow['id_cuenta'] &&
                    elemento['id_cartera'] === objetoRow['id_cartera'] &&
                    elemento['ctipcar_observacion'] ===
                      objetoRow['ctipcar_observacion']
                  ) {
                    if (elemento['ctipcar_esactivo'] === '1')
                      {
                        this.alerta.ErrorEnLaPeticion('Son iguales');
                        this.eliminarObjeto(row);
                        break;
                      }else
                      {
                        objetoC = {
                              id_cuenta_tipo_cartera:elemento['id_cuenta_tipo_cartera'],
                              id_cartera: objetoRow['id_cartera'],
                              id_cuenta: objetoRow['id_cuenta'],
                              ctipcar_observacion:objetoRow['ctipcar_observacion'],
                              ctipcar_esactivo: '1',
                              ctipcar_fecha_act: this.Fechas.fecha(),
                              ctipcar_fecha_desact: this.Fechas.fecha(),
                              ctipcar_fecha_in: this.Fechas.fecha(),
                              ctipcar_fecha_up: this.Fechas.fecha(),
                            }; 
                            this.api
                              .PutCuentaCartera(objetoC)
                              .pipe(
                                map((tracks) => {
                                  const exito = tracks['exito'];
                                  if (exito == 1) {
                                    this.eliminarObjeto(row);
                                    this.alerta.RegistroActualizado();
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
                            break;
                      }
                  }
                  if (elemento['id_cuenta'] === objetoRow['id_cuenta'] && elemento['id_cartera'] === objetoRow['id_cartera']&&elemento['ctipcar_observacion'] !=objetoRow['ctipcar_observacion']) 
                    {
                            objetoC = 
                            {
                                  id_cuenta_tipo_cartera:elemento['id_cuenta_tipo_cartera'],
                                  id_cartera: objetoRow['id_cartera'],
                                  id_cuenta: objetoRow['id_cuenta'],
                                  ctipcar_observacion:objetoRow['ctipcar_observacion'],
                                  ctipcar_esactivo: '1',
                                  ctipcar_fecha_act: this.Fechas.fecha(),
                                  ctipcar_fecha_desact: this.Fechas.fecha(),
                                  ctipcar_fecha_in: this.Fechas.fecha(),
                                  ctipcar_fecha_up: this.Fechas.fecha(),
                            };
                          this.api
                            .PutCuentaCartera(objetoC)
                            .pipe(
                              map((tracks) => {
                                const exito = tracks['exito'];
                                if (exito == 1) {
                                  this.eliminarObjeto(row);
                                  this.alerta.RegistroActualizado();
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
                      break;
                  }
                  contadorAux++;
                } //fin del for
                if (contadorAux === this.ListaClientes.length) {
                  let objetoC: any;
                  objetoC = {
                    id_cuenta_tipo_cartera: 0,
                    id_cuenta: row[0],
                    id_cartera: row[1],
                    ctipcar_observacion:(row[2]==='VACIO'||row[2]==='vacio'||row[2]===' ')? null : row[2].toUpperCase(),
                    ctipcar_esactivo: '1',
                    ctipcar_fecha_act: this.Fechas.fecha(),
                    ctipcar_fecha_desact: this.Fechas.fecha(),
                    ctipcar_fecha_in: this.Fechas.fecha(),
                    ctipcar_fecha_up: this.Fechas.fecha(),
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PostCuentaCartera(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '22') {
      //const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const objetoRow: any = {
        id_tipo_gestion: row[0],
        id_conectividad: row[1],
        id_contactabilidad: row[2],
        tipges_per_edi:row[3].toString()
      };
      this.row=row;
      this.api
        .GetTGCCFracionadoFiltro(objetoRow['id_tipo_gestion'], 3)
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              let objetoC: any;
              objetoC = {
                id_tipges_conect_contac: 0,
                id_tipo_gestion: row[0],
                id_conectividad: row[1],
                id_contactabilidad: row[2],
                tipges_esactivo: '1',
                tipges_fecha_act: this.Fechas.fecha(),
                tipges_fecha_desact: this.Fechas.fecha(),
                tipges_fecha_in: this.Fechas.fecha(),
                tipges_fecha_up: this.Fechas.fecha(),
                tipges_per_edi:row[3].toString()
              }; //Creacion de objeto de direcciones
              this.api
                .PosTGCC(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(this.row);
                      this.alerta.RegistroAgregado();
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
            } else {
              banderaCarga = true;
              let objetoC: any;
              let valorRecuperado: any = this.ListaClientes;
              let contadorAux: number = 0;
              if (valorRecuperado.length > 0) {
                for (let elemento of this.ListaClientes) {
                  if (
                    elemento['id_tipo_gestion'] ===
                      objetoRow['id_tipo_gestion'] &&
                    elemento['id_conectividad'] ===
                      objetoRow['id_conectividad'] &&
                    elemento['id_contactabilidad'] ===
                      objetoRow['id_contactabilidad']&&elemento['tipges_per_edi'] ===objetoRow['tipges_per_edi']
                  ) {
                    if (elemento['tipges_esactivo'] === '1') {
                      this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                      this.eliminarObjeto(this.row);
                      break;
                    }else
                    {
                      objetoC = {
                        id_tipges_conect_contac:
                          elemento['id_tipges_conect_contac'],
                        id_tipo_gestion: row[0],
                        id_conectividad: row[1],
                        id_contactabilidad: row[2],
                        tipges_esactivo: '1',
                        tipges_fecha_act: this.Fechas.fecha(),
                        tipges_fecha_desact: this.Fechas.fecha(),
                        tipges_fecha_in: this.Fechas.fecha(),
                        tipges_fecha_up: this.Fechas.fecha(),
                        tipges_per_edi: row[3].toString()
                      }; //Crereacion de objeto gestor
                      this.api
                        .PutTGCC(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(this.row);
                              this.alerta.RegistroActualizado();
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
                        break;
                    }
                  }
                    if (
                      (elemento['id_tipo_gestion'] ===objetoRow['id_tipo_gestion'] &&elemento['id_conectividad'] ===objetoRow['id_conectividad'])&&
                      elemento['id_contactabilidad'] ===objetoRow['id_contactabilidad']&&elemento['tipges_per_edi'] !==objetoRow['tipges_per_edi']) 
                      {
                        objetoC = {
                          id_tipges_conect_contac:
                            elemento['id_tipges_conect_contac'],
                          id_tipo_gestion: row[0],
                          id_conectividad: row[1],
                          id_contactabilidad: row[2],
                          tipges_esactivo: '1',
                          tipges_fecha_act: this.Fechas.fecha(),
                          tipges_fecha_desact: this.Fechas.fecha(),
                          tipges_fecha_in: this.Fechas.fecha(),
                          tipges_fecha_up: this.Fechas.fecha(),
                          tipges_per_edi: row[3].toString()
                        }; //Crereacion de objeto gestor
                        this.api
                          .PutTGCC(objetoC)
                          .pipe(
                            map((tracks) => {
                              const exito = tracks['exito'];
                              if (exito == 1) {
                                this.eliminarObjeto(this.row);
                                this.alerta.RegistroActualizado();
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
                        break;
                    }
                  contadorAux++;
                } //fin del for
                if (contadorAux === this.ListaClientes.length) {
                  let objetoC: any;
                  objetoC = {
                    id_tipges_conect_contac: 0,
                    id_tipo_gestion: row[0],
                    id_conectividad: row[1],
                    id_contactabilidad: row[2],
                    tipges_esactivo: '1',
                    tipges_fecha_act: this.Fechas.fecha(),
                    tipges_fecha_desact: this.Fechas.fecha(),
                    tipges_fecha_in: this.Fechas.fecha(),
                    tipges_fecha_up: this.Fechas.fecha(),
                    tipges_per_edi: row[3].toString()
                  }; //Creacion de objeto de direcciones
                  this.api
                    .PosTGCC(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(this.row);
                          this.alerta.RegistroAgregado();
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
              }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '23') {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDate1 = new Date(row[10]).toISOString().split('T')[0];
      const minDate2 = new Date(row[11]).toISOString().split('T')[0];
      const minDate3 = new Date(row[20]).toISOString().split('T')[0];
      const minDate4 = new Date(row[21]).toISOString().split('T')[0];
      const minDate5 = new Date(row[25]).toISOString().split('T')[0];
      let ocD: any = {
        id_gestor: (row[0] === '' || row[0] === 'VACIO'||row[0] === 'vacio'||row[0] === ' ') ? null : Number(row[0]),
        cli_identificacion: (row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1],
        ope_cod_credito: (row[2].toString() === '' || row[2].toString() === 'VACIO'||row[2].toString() === 'vacio'||row[2].toString() === ' '||row[2].toString() === '0') ? null : row[2].toString(),
        gest_id_gestor_asign:(row[3] === '' || row[3] === 'VACIO'||row[3] === 'vacio'||row[3] === ' ') ? null : row[3],
        gest_id_tipo_gestion:(row[4] === '' || row[4] === 'VACIO'||row[4] === 'vacio'||row[4] === ' ') ? null : row[4],
        gest_id_contactabilidad:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5],
        gest_id_conectividad:(row[6] === '' || row[6] === 'VACIO'||row[6] === 'vacio'||row[6] === ' ') ? null : row[6],
        gest_id_contacto:(row[7] === '' || row[7] === 'VACIO'||row[7] === 'vacio'||row[7] === ' ') ? null : row[7],
        gest_num_contacto:(row[8] === '' || row[8] === 'VACIO'||row[8] === 'vacio'||row[8] === ' ') ? null : row[8].toString(),
        gest_gestion_mediante:(row[9] === '' || row[9] === 'VACIO'||row[9] === 'vacio'||row[9] === ' ') ? null : row[9].toUpperCase(),
        gest_fecha_compromiso:this.solucionarFecha(row[10]) === '' ? minDate : minDate1,
        gest_fecha_incumplido:this.solucionarFecha(row[11]) === '' ? minDate : minDate2,
        gest_descripcion:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12].toUpperCase(),
        gest_valor_comp:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toString(),
        gest_abonos:(row[14] === '' || row[14] === 'VACIO'||row[14] === 'vacio'||row[14] === ' ') ? null : row[14].toString(),
        gest_num_coutas:(row[15] === '' || row[15] === 'VACIO'||row[15] === 'vacio'||row[15] === ' ') ? null : row[15].toString(),
        gest_num_coutas_res:(row[16] === '' || row[16] === 'VACIO'||row[16] === 'vacio'||row[16] === ' ') ? null : row[16].toString(),
        gest_couta:(row[17] === '' || row[17] === 'VACIO'||row[17] === 'vacio'||row[17] === ' ') ? null : row[17].toString(),
        gest_valor_a_cobrar:(row[18] === '' || row[18] === 'VACIO'||row[18] === 'vacio'||row[18] === ' ') ? null : row[18].toString(),
        gest_valor_incumplido:(row[19] === '' || row[19] === 'VACIO'||row[19] === 'vacio'||row[19] === ' ') ? null : row[19].toString(),
        gest_fecha_prox_pago:this.solucionarFecha(row[20]) === '' ? minDate : minDate3,
        gest_fecha_conv:this.solucionarFecha(row[21]) === '' ? minDate : minDate4,
        gest_observacion:(row[22] === '' || row[22] === 'VACIO'||row[22] === 'vacio'||row[22] === ' ') ? null : row[22].toUpperCase(),
        gest_certificado:(row[23] === '' || row[23] === 'VACIO'||row[23] === 'vacio'||row[23] === ' ') ? null : row[23].toString(),
        gest_volver_llamar:(row[24] === '' || row[24] === 'VACIO'||row[24] === 'vacio'||row[24] === ' ') ? null : row[24].toString(),
        gest_fecha_volver_llamar:this.solucionarFecha(row[25]) === '' ? minDate : minDate5,
        gest_hora_volver_llamar:(row[26] === '' || row[26] === 'VACIO'||row[26] === 'vacio'||row[26] === ' ') ? null : row[26].toString(),
        gest_perdio_contacto:(row[27] === '' || row[27] === 'VACIO'||row[27] === 'vacio'||row[27] === ' ') ? null : row[27].toString(),
        gest_id_cartera:Number(this.filtroCartera.value)
      };
      ocD['gest_fecha_compromiso']=ocD['gest_fecha_compromiso']==='1969-12-31'?null:ocD['gest_fecha_compromiso'];
      ocD['gest_fecha_incumplido']=ocD['gest_fecha_incumplido']==='1969-12-31'?null:ocD['gest_fecha_incumplido'];
      ocD['gest_fecha_prox_pago']=ocD['gest_fecha_prox_pago']==='1969-12-31'?null:ocD['gest_fecha_prox_pago'];
      ocD['gest_fecha_conv']=ocD['gest_fecha_conv']==='1969-12-31'?null:ocD['gest_fecha_conv'];
      ocD['gest_fecha_volver_llamar']=ocD['gest_fecha_volver_llamar']==='1969-12-31'?null:ocD['gest_fecha_volver_llamar'];
      this.row=row;
      this.api.GetGestionXCedula(ocD['cli_identificacion'],ocD['ope_cod_credito'],ocD['gest_id_cartera'],ocD['id_gestor'])
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            let objetoC: any;
            objetoC = {
              id_gestion: 0,
              id_gestor: (row[0] === '' || row[0] === 'VACIO'||row[0] === 'vacio'||row[0] === ' ') ? null : Number(row[0]),
              cli_identificacion: (row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1],
              ope_cod_credito: (row[2].toString() === '' || row[2].toString() === 'VACIO'||row[2].toString() === 'vacio'||row[2].toString() === ' '||row[2].toString() === '0') ? null : row[2].toString(),
              gest_id_gestor_asign:(row[3] === '' || row[3] === 'VACIO'||row[3] === 'vacio'||row[3] === ' ') ? null : row[3],
              gest_id_tipo_gestion:(row[4] === '' || row[4] === 'VACIO'||row[4] === 'vacio'||row[4] === ' ') ? null : row[4],
              gest_id_contactabilidad:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5],
              gest_id_conectividad:(row[6] === '' || row[6] === 'VACIO'||row[6] === 'vacio'||row[6] === ' ') ? null : row[6],
              gest_id_contacto:(row[7] === '' || row[7] === 'VACIO'||row[7] === 'vacio'||row[7] === ' ') ? null : row[7],
              gest_num_contacto:(row[8] === '' || row[8] === 'VACIO'||row[8] === 'vacio'||row[8] === ' ') ? null : row[8].toString(),
              gest_gestion_mediante:(row[9] === '' || row[9] === 'VACIO'||row[9] === 'vacio'||row[9] === ' ') ? null : row[9].toUpperCase(),
              gest_fecha_compromiso:this.solucionarFecha(row[10]) === '' ? minDate : minDate1,
              gest_fecha_incumplido:this.solucionarFecha(row[11]) === '' ? minDate : minDate2,
              gest_descripcion:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12].toUpperCase(),
              gest_valor_comp:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toString(),
              gest_abonos:(row[14] === '' || row[14] === 'VACIO'||row[14] === 'vacio'||row[14] === ' ') ? null : row[14].toString(),
              gest_num_coutas:(row[15] === '' || row[15] === 'VACIO'||row[15] === 'vacio'||row[15] === ' ') ? null : row[15].toString(),
              gest_num_coutas_res:(row[16] === '' || row[16] === 'VACIO'||row[16] === 'vacio'||row[16] === ' ') ? null : row[16].toString(),
              gest_couta:(row[17] === '' || row[17] === 'VACIO'||row[17] === 'vacio'||row[17] === ' ') ? null : row[17].toString(),
              gest_valor_a_cobrar:(row[18] === '' || row[18] === 'VACIO'||row[18] === 'vacio'||row[18] === ' ') ? null : row[18].toString(),
              gest_valor_incumplido:(row[19] === '' || row[19] === 'VACIO'||row[19] === 'vacio'||row[19] === ' ') ? null : row[19].toString(),
              gest_fecha_prox_pago:this.solucionarFecha(row[20]) === '' ? minDate : minDate3,
              gest_fecha_conv:this.solucionarFecha(row[21]) === '' ? minDate : minDate4,
              gest_observacion:(row[22] === '' || row[22] === 'VACIO'||row[22] === 'vacio'||row[22] === ' ') ? null : row[22].toUpperCase(),
              gest_certificado:(row[23] === '' || row[23] === 'VACIO'||row[23] === 'vacio'||row[23] === ' ') ? null : row[23].toString(),
              gest_volver_llamar:(row[24] === '' || row[24] === 'VACIO'||row[24] === 'vacio'||row[24] === ' ') ? null : row[24].toString(),
              gest_fecha_volver_llamar:this.solucionarFecha(row[25]) === '' ? minDate : minDate5,
              gest_hora_volver_llamar:(row[26] === '' || row[26] === 'VACIO'||row[26] === 'vacio'||row[26] === ' ') ? null : row[26].toString(),
              gest_perdio_contacto:(row[27] === '' || row[27] === 'VACIO'||row[27] === 'vacio'||row[27] === ' ') ? null : row[27].toString(),
              gest_id_cartera:Number(this.filtroCartera.value),
              gest_esactivo: '1',
              gest_fecha_act: this.Fechas.fecha(),
              gest_fecha_desact: this.Fechas.fecha(),
              gest_fecha_in: this.Fechas.fecha(),
              gest_fecha_up: this.Fechas.fecha()
            };
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              this.api
                .PostGestion(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(this.row);
                      this.alerta.RegistroAgregado();
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
            } else{
              var recuperado:any=this.ListaClientes;
              if(recuperado!=objetoC&&recuperado['gest_fecha_gestion']===this.Fechas.fechaActualCorta())
                {
                  console.log('entro');
                  console.log('Se ingresa el dato');
                  console.log(objetoC);
                      this.api
                    .PostGestion(objetoC)
                    .pipe(
                      map((tracks) => {
                        const exito = tracks['exito'];
                        if (exito == 1) {
                          this.eliminarObjeto(this.row);
                          this.alerta.RegistroAgregado();
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
                }else
                {
                  this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                  this.eliminarObjeto(this.row);
                }
              
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
    if (this.itemFiles.value === '24') {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDaten = new Date(row[14]).toISOString().split('T')[0];
      const minDatesa = new Date(row[15]).toISOString().split('T')[0];
      let ocD: any = {
        cli_identificacion: (row[0] === '' || row[0] === 'VACIO'||row[0] === 'vacio'||row[0] === ' ') ? null : row[0],
        id_gestor: (row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1],
        ope_cod_credito: (row[2].toString() === '' || row[2].toString() === 'VACIO'||row[2].toString() === 'vacio'||row[2].toString() === ' '||row[2].toString() === '0') ? null : row[2].toString(),
        id_cuenta:(row[3] === '' || row[3] === 'VACIO'||row[3] === 'vacio'||row[3] === ' ') ? null : row[3],
        pag_pago:(row[4] === '' || row[4] === 'VACIO'||row[4] === 'vacio'||row[4] === ' ') ? null : row[4].toString(),
        pag_valor_total_comprobante:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5].toString(),
        pag_observacion_pago:(row[6] === '' || row[6] === 'VACIO'||row[6] === 'vacio'||row[6] === ' ') ? null : row[6].toUpperCase(),
        pag_codigo_comprobante:(row[7] === '' || row[7] === 'VACIO'||row[7] === 'vacio'||row[7] === ' ') ? null : row[7].toString(),
        pag_url_comprobante:(row[8] === '' || row[8] === 'VACIO'||row[8] === 'vacio'||row[8] === ' ') ? null : row[8].toString(),
        pag_observ_comprobante:(row[9] === '' || row[9] === 'VACIO'||row[9] === 'vacio'||row[9] === ' ') ? null : row[9].toUpperCase(),
        pag_pago_verificado:(row[10] === '' || row[10] === 'VACIO'||row[10] === 'vacio'||row[10] === ' ') ? null : row[10].toString(),
        pag_id_gestor_ingresa:(row[11] === '' || row[11] === 'VACIO'||row[11] === 'vacio'||row[11] === ' ') ? null : row[11],
        pag_id_gestor_verifica:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12],
        pag_mes_pago:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toUpperCase(),
        pag_fecha_pago:this.solucionarFecha(row[14]) === '' ? minDate : minDaten,
        pag_fecha_verificacion:this.solucionarFecha(row[15]) === '' ? minDate : minDatesa,
        pag_medio_contacto:(row[16] === '' || row[16] === 'VACIO'||row[16] === 'vacio'||row[16] === ' ') ? null : row[16].toUpperCase(),
        id_cartera:Number(this.filtroCartera.value)
      };
      ocD['pag_fecha_pago']=ocD['pag_fecha_pago']==='1969-12-31'?null:ocD['pag_fecha_pago'];
      ocD['pag_fecha_verificacion']=ocD['pag_fecha_verificacion']==='1969-12-31'?null:ocD['pag_fecha_verificacion'];
      this.row=row;
      this.api
        .GetPagoXCedula(ocD['cli_identificacion'],ocD['ope_cod_credito'],ocD['id_cartera'],ocD['id_gestor'])
        .pipe(
          map((tracks) => {
            this.ListaClientes = tracks['data'];
            if (this.ListaClientes.length === 0) {
              banderaCarga = false;
              console.log(row);
              let objetoC: any;
              objetoC = {
                id_pagos: 0,
                cli_identificacion: (row[0] === '' || row[0] === 'VACIO'||row[0] === 'vacio'||row[0] === ' ') ? null : row[0],
                id_gestor: (row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1],
                ope_cod_credito: (row[2].toString() === '' || row[2].toString() === 'VACIO'||row[2].toString() === 'vacio'||row[2].toString() === ' '||row[2].toString() === '0') ? null : row[2].toString(),
                id_cuenta:(row[3] === '' || row[3] === 'VACIO'||row[3] === 'vacio'||row[3] === ' ') ? null : row[3],
                pag_pago:(row[4] === '' || row[4] === 'VACIO'||row[4] === 'vacio'||row[4] === ' ') ? null : row[4].toString(),
                pag_valor_total_comprobante:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5].toString(),
                pag_observacion_pago:(row[6] === '' || row[6] === 'VACIO'||row[6] === 'vacio'||row[6] === ' ') ? null : row[6].toUpperCase(),
                pag_codigo_comprobante:(row[7] === '' || row[7] === 'VACIO'||row[7] === 'vacio'||row[7] === ' ') ? null : row[7].toString(),
                pag_url_comprobante:(row[8] === '' || row[8] === 'VACIO'||row[8] === 'vacio'||row[8] === ' ') ? null : row[8].toString(),
                pag_observ_comprobante:(row[9] === '' || row[9] === 'VACIO'||row[9] === 'vacio'||row[9] === ' ') ? null : row[9].toUpperCase(),
                pag_pago_verificado:(row[10] === '' || row[10] === 'VACIO'||row[10] === 'vacio'||row[10] === ' ') ? null : row[10].toString(),
                pag_id_gestor_ingresa:(row[11] === '' || row[11] === 'VACIO'||row[11] === 'vacio'||row[11] === ' ') ? null : row[11],
                pag_id_gestor_verifica:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12],
                pag_mes_pago:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toUpperCase(),
                pag_fecha_pago:this.solucionarFecha(row[14]) === '' ? minDate : minDaten,
                pag_fecha_verificacion:this.solucionarFecha(row[15]) === '' ? minDate : minDatesa,
                pag_medio_contacto:(row[16] === '' || row[16] === 'VACIO'||row[16] === 'vacio'||row[16] === ' ') ? null : row[16].toUpperCase(),
                id_cartera:Number(this.filtroCartera.value),
                pag_esactivo: '1',
                pag_fecha_act: this.Fechas.fecha(),
                pag_fecha_desact: this.Fechas.fecha(),
                pag_fecha_in: this.Fechas.fecha(),
                pag_fecha_up: this.Fechas.fecha()
              }; //Creacion de objeto de direcciones
              this.api
                .PostPagos(objetoC)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.eliminarObjeto(this.row);
                      this.alerta.RegistroAgregado();
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
            } else
            {
              var recuperado:any=this.ListaClientes;
              console.log('Pago existe comparacion')
              if(recuperado!=ocD&&recuperado['pag_fecha_in']!=this.Fechas.fechaActualCorta())
                {
                  console.log('Pago existe comparacion 1')
                  if(recuperado['pag_codigo_comprobante']===null||recuperado['pag_codigo_comprobante'].trim()==='')
                    {
                      console.log('Pago existe comparacion 2')
                      let objetoC: any;
                      objetoC = {
                        id_pagos: 0,
                        cli_identificacion: (row[0] === '' || row[0] === 'VACIO'||row[0] === 'vacio'||row[0] === ' ') ? null : row[0],
                        id_gestor: (row[1] === '' || row[1] === 'VACIO'||row[1] === 'vacio'||row[1] === ' ') ? null : row[1],
                        ope_cod_credito: (row[2].toString() === '' || row[2].toString() === 'VACIO'||row[2].toString() === 'vacio'||row[2].toString() === ' '||row[2].toString() === '0') ? null : row[2].toString(),
                        id_cuenta:(row[3] === '' || row[3] === 'VACIO'||row[3] === 'vacio'||row[3] === ' ') ? null : row[3],
                        pag_pago:(row[4] === '' || row[4] === 'VACIO'||row[4] === 'vacio'||row[4] === ' ') ? null : row[4].toString(),
                        pag_valor_total_comprobante:(row[5] === '' || row[5] === 'VACIO'||row[5] === 'vacio'||row[5] === ' ') ? null : row[5].toString(),
                        pag_observacion_pago:(row[6] === '' || row[6] === 'VACIO'||row[6] === 'vacio'||row[6] === ' ') ? null : row[6].toUpperCase(),
                        pag_codigo_comprobante:(row[7] === '' || row[7] === 'VACIO'||row[7] === 'vacio'||row[7] === ' ') ? null : row[7].toString(),
                        pag_url_comprobante:(row[8] === '' || row[8] === 'VACIO'||row[8] === 'vacio'||row[8] === ' ') ? null : row[8].toString(),
                        pag_observ_comprobante:(row[9] === '' || row[9] === 'VACIO'||row[9] === 'vacio'||row[9] === ' ') ? null : row[9].toUpperCase(),
                        pag_pago_verificado:(row[10] === '' || row[10] === 'VACIO'||row[10] === 'vacio'||row[10] === ' ') ? null : row[10].toString(),
                        pag_id_gestor_ingresa:(row[11] === '' || row[11] === 'VACIO'||row[11] === 'vacio'||row[11] === ' ') ? null : row[11],
                        pag_id_gestor_verifica:(row[12] === '' || row[12] === 'VACIO'||row[12] === 'vacio'||row[12] === ' ') ? null : row[12],
                        pag_mes_pago:(row[13] === '' || row[13] === 'VACIO'||row[13] === 'vacio'||row[13] === ' ') ? null : row[13].toUpperCase(),
                        pag_fecha_pago:this.solucionarFecha(row[14]) === '' ? minDate : minDaten,
                        pag_fecha_verificacion:this.solucionarFecha(row[15]) === '' ? minDate : minDatesa,
                        pag_medio_contacto:(row[16] === '' || row[16] === 'VACIO'||row[16] === 'vacio'||row[16] === ' ') ? null : row[16].toUpperCase(),
                        id_cartera:Number(this.filtroCartera.value),
                        pag_esactivo: '1',
                        pag_fecha_act: this.Fechas.fecha(),
                        pag_fecha_desact: this.Fechas.fecha(),
                        pag_fecha_in: this.Fechas.fecha(),
                        pag_fecha_up: this.Fechas.fecha()
                      }; //Creacion de objeto de direcciones
                      this.api
                        .PostPagos(objetoC)
                        .pipe(
                          map((tracks) => {
                            const exito = tracks['exito'];
                            if (exito == 1) {
                              this.eliminarObjeto(this.row);
                              this.alerta.RegistroAgregado();
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
                    }else{
                      this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                      this.eliminarObjeto(this.row);
                    }
                }else
                {
                  this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                  this.eliminarObjeto(this.row);
                }
            }
          }),
          catchError((error) => {
            throw new Error(error);
          })
        )
        .subscribe();
    }
  }//fin del metodo agregar
  
  eliminarObjeto(row: any): void {
    // Lógica de la operación con los datos de la fila
    const rem = this.data.indexOf(row);
    if (rem !== -1) {
      this.data.splice(rem, 1);
      this.countRows.patchValue(this.data.length.toString());
      const valor:number=Number(this.countRows.value);
      if(valor===0)
        {
          this.onLimpiar2();
        }
    } else {
      console.log('Objeto no encontrado en la lista');
    }
  }
  findClosestDate(currentDate: Date, dateList: Date[]): Date | null {
    if (dateList.length === 0) {
      return null;
    }

    let closestDate: Date = dateList[0];
    let smallestDiff = Math.abs(currentDate.getTime() - closestDate.getTime());

    for (const date of dateList) {
      const diff = Math.abs(currentDate.getTime() - date.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestDate = date;
      }
    }

    return closestDate;
  }
  /****Metodo de agregarCLiente */
  clienteCarterAgregar(
    cedula: string,
    tipo: number,
    cartera: number,
    gestor: number,
    row: any
  ) {
    forkJoin({
      cliente: this.buscarClienteObservable(cedula, tipo),
      credito: this.buscarCreditoObservable(cedula, 10),
      clienteGestorCartera: this.buscarClienteGestorCarteraObservable2(
        cedula,
        tipo,
        cartera,
        gestor
      ),
    }).subscribe(({ cliente, credito, clienteGestorCartera }) => {
      console.log('entro');
      console.log(
        '-------------------------------------------------------------------------------------->'
      );
      console.log(cliente);
      console.log(credito);
      console.log(clienteGestorCartera);
      console.log(
        '-------------------------------------------------------------------------------------->'
      );
      console.log(row);
      let banderaux: boolean = false;
      let input1: number = 0;
      let input2: number = 0;
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];

    let rowData: any =
    {
      cli_identificacion: row['cli_identificacion'],
      cli_tipo_identificacion: row['cli_tipo_identificacion'],
      cli_nombres: row['cli_nombres'].toUpperCase(),
      cli_genero: row['cli_genero'],
      cli_estado_civil: row['cli_estado_civil'] === '' ? null : row['cli_estado_civil'],
      cli_ocupacion: row['cli_ocupacion']===''?null:row['cli_ocupacion'],
      cli_fecha_nacimiento:this.solucionarFecha(row['cli_fecha_nacimiento'])===''?minDate:this.solucionarFecha(row['cli_fecha_nacimiento']),
      cli_score: row['cli_score'] === '' ? null : row['cli_score'],
      cli_fallecido: row['cli_fallecido'] === '' ? null : row['cli_fallecido'],
      cli_fecha_fallecido:this.solucionarFecha(row['cli_fecha_fallecido'])===''?minDate:this.solucionarFecha(row['cli_fecha_fallecido']),
      cli_observacion: row['cli_observacion']===''?null:row['cli_observacion'],
      cli_provincia: row['cli_provincia']===''?null:row['cli_provincia'],
      cli_canton: row['cli_canton']===''?null:row['cli_canton'],
      cli_parroquia: row['cli_parroquia']===''?null:row['cli_parroquia'],
      cli_esactivo:'1',
      cli_baseactual:'1',
      cli_origendatos:'Cobro-System'
    };
    if(cliente===undefined)
      {
        this.PostCliente(rowData,row,cartera,2);
      }else
      {
        console.log(rowData);
        console.log(clienteGestorCartera);
        if(clienteGestorCartera['id_cliente_gestor_cartera']>0)
          {
            console.log('jkl');
            console.log(cartera);
            if(clienteGestorCartera['id_cartera']===cartera)
              {
                console.log('jkl');
                console.log('se mantiene los datos de clienteGestorCartera y credito');
                input1=1;
                input2=1;
                if(input1===1&&input2===1)
                  {
                    console.log('entro1');
                    console.log(cliente['cli_fecha_nacimiento']);
                    const rowDate = new Date(rowData['cli_fecha_nacimiento']).toISOString().split('T')[0];
                    const clienteDate = new Date(cliente['cli_fecha_nacimiento']).toISOString().split('T')[0];
                    if(cliente['cli_identificacion']===rowData['cli_identificacion']&&cliente['cli_tipo_identificacion']===rowData['cli_tipo_identificacion']&&cliente['cli_nombres'].toUpperCase()===rowData['cli_nombres'].toUpperCase()&&cliente['cli_genero'].toUpperCase()===rowData['cli_genero'].toUpperCase()&&cliente['cli_estado_civil']===rowData['cli_estado_civil']&&cliente['cli_ocupacion'].toUpperCase()===rowData['cli_ocupacion'].toUpperCase()&&clienteDate===rowDate&&cliente['cli_score']&&rowData['cli_score'])
                      {
                        console.log('entro2');
                        if(cliente['cli_esactivo']==='1')
                          {
                            console.log('entro3');
                            this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                            this.eliminarObjeto(row);
                          }else
                          {
                            const nuevo:any=this.cargarNuevoCliente(row);
                            nuevo['id_cliente']=cliente['id_cliente'];
                            console.log(nuevo);
                            nuevo['cli_esactivo']='1';
                            this.PutCliente(nuevo,row);
                          }
                      }
                  }
              }else
              {
                clienteGestorCartera['cgc_esactivo'] = '0';
                const cedulaValor=clienteGestorCartera['cli_identificacion'];
                banderaux=true;
                console.log(clienteGestorCartera);
                input2=this.verificacionAgregarEditarClienteGestorCartera(clienteGestorCartera, banderaux);
                if(input2===0)
                  {
                    console.log(clienteGestorCartera);
                    const valor=Number(this.filtroCartera.value)
                    console.log(cedulaValor+' '+valor+' '+gestor);
                    banderaux=false;
                    const nuevo=this.cargarClienteGestorCartera(cedulaValor,valor,gestor);
                    input2=this.verificacionAgregarEditarClienteGestorCartera(nuevo, banderaux);

                    if(input2===0)
                      {
                        this.eliminarObjeto(row);
                        this.alertaCarga.RegistroAgregado();
                      }
                    // if(credito['id_cartera']===nuevo['id_cartera'])
                    //   {
                    //     console.log('Se mantiene los datos del credito')
                    //   }else
                    //   {
                    //     credito['id_cartera']=cartera;
                    //     input1=this.agregarEditarCXC(credito,1);
                    //   }
    
                  }
              }
          }else
          {
            input1=1;
                input2=1;
                if(input1===1&&input2===1)
                  {
                    console.log('entro1');
                    console.log(cliente['cli_fecha_nacimiento']);
                    const rowDate = new Date(rowData['cli_fecha_nacimiento']).toISOString().split('T')[0];
                    const clienteDate = new Date(cliente['cli_fecha_nacimiento']).toISOString().split('T')[0];
                    if(cliente['cli_identificacion']===rowData['cli_identificacion']&&cliente['cli_tipo_identificacion']===rowData['cli_tipo_identificacion']&&cliente['cli_nombres'].toUpperCase()===rowData['cli_nombres'].toUpperCase()&&cliente['cli_genero'].toUpperCase()===rowData['cli_genero'].toUpperCase()&&cliente['cli_estado_civil']===rowData['cli_estado_civil']&&cliente['cli_ocupacion'].toUpperCase()===rowData['cli_ocupacion'].toUpperCase()&&clienteDate===rowDate&&cliente['cli_score']&&rowData['cli_score'])
                      {
                        console.log('entro2');
                        if(cliente['cli_esactivo']==='1')
                          {
                            console.log('entro3');
                            this.alerta.ErrorEnLaPeticion('Son iguales, se Mantienen los datos!!!!!');
                            this.eliminarObjeto(this.row);
                          }else
                          {
                            const nuevo:any=this.cargarNuevoCliente(row);
                            nuevo['id_cliente']=cliente['id_cliente'];
                            console.log(nuevo);
                            nuevo['cli_esactivo']='1';
                            this.PutCliente(nuevo,row);
                          }
                      }else
                      {
                        console.log(rowData);
                        const nuevo:any=this.cargarNuevoCliente(rowData);
                            nuevo['id_cliente']=cliente['id_cliente'];
                            console.log(nuevo);
                            nuevo['cli_esactivo']='1';
                            this.PutCliente(nuevo,row);
                      }
                  }
          //   banderaux=false;
          //   input2=this.verificacionAgregarEditarClienteGestorCartera(clienteGestorCartera, banderaux);

          // if (input2 === 0) {
          //   console.log('Agregar credito');
          //   credito['id_cartera'] = cartera;
          //   credito['ope_origendatos'] = 'Cobro-System';
          //   credito['ope_baseactual'] = '1';
          //   this.verificacionPostOrPut(credito, false, row);
          // }
        }
      }
  });
}
/************************** */
buscarClienteObservable(valor: string, tipo: number): Observable<any> {
  return this.api.GetClienteFracionadoFiltro(valor, tipo)
    .pipe(
      map((tracks) => {
        let cliente: any = tracks['data'][0];
        return cliente;
      }),
      catchError((error) => {
        console.error('Error during API call:', error);
        return throwError(error);
      })
    );
  }
  buscarCreditoObservable(valor: string, tipo: number): Observable<any> {
    return this.api.GetCxCFracionadoFiltro(valor, tipo).pipe(
      map((tracks) => {
        let ListaCxC: any[] = tracks['data'];
        let objetoCxc: any;
        if (ListaCxC.length === 0) {
          objetoCxc = {
            ope_cod_credito: 'CXC' + valor,
            cli_identificacion: valor,
            ope_descripcion: 'nuevo',
            ope_linea: 'nuevo',
            ope_producto: 'nuevo',
            ope_dias_mora: '0',
            ope_interes_mora: '0',
            ope_gastos_cobranzas: '0',
            ope_saldo_cxc_actual: '0',
            ope_saldo_cuota_actual: '0',
            ope_saldo_capital_venc: '0',
            ope_poner_aldia: '0',
            ope_liquidar: '0',
            ope_fecha_venc: this.solucionarFecha(
              this.Fechas.fechaActualCorta()
            ),
            ope_plazo: '0',
            ope_liquidado: '0',
            ope_deuda_pagada: '0',
            ope_fecha_pagada: this.solucionarFecha(
              this.Fechas.fechaActualCorta()
            ),
            ope_provincia: '',
            ope_tiene_garante: '0',
            ope_fecha_compra: this.solucionarFecha(
              this.Fechas.fechaActualCorta()
            ),
            ope_observacion: '',
            ope_abono_realizado: '0',
            ope_valor_total_pag: '0',
            ope_tipo_actualizacion: '',
            ope_total_vencido: '0',
            ope_nom_segm_vencido: '',
            ope_categoria_cliente: '',
            ope_segmentacion: '',
            ope_promo_cuotas_gratis: '0',
            ope_deuda_actual: '0',
            ope_saldo_interes: '0',
            ope_saldo_amortizacion: '0',
            ope_int_cobra: '0',
            ope_saldo_cobra_mora: '0',
            ope_descu_campa_saldo_capit: '0',
            ope_valor_descu_saldo_capit: '0',
            ope_descrip_unidad_gestion: '',
            ope_id_ultima_gestion: null,
            ope_estado_contacta: '',
            ope_fecha_entrega: this.solucionarFecha(
              this.Fechas.fechaActualCorta()
            ),
            ope_esactivo: '1',
          };
        } else {
          objetoCxc = ListaCxC[0];
        }
        return objetoCxc;
      }),
      catchError((error) => {
        console.error('Error during API call:', error);
        return throwError(error);
      })
    );
  }
  buscarClienteGestorCarteraObservable2(
    cedula: string,
    tipo: number,
    cartera: number,
    gestor: number
  ): Observable<any> {
    return this.api.GetClienteGestorCarteraFracionadoFiltro(cedula, tipo).pipe(
      map((tracks) => {
        let ListaClienteGestorCartera = tracks['data'];
        let objetocligestcartera: any;

        if (ListaClienteGestorCartera.length === 0) {
          let objetoClienteGestorCartera: any = {
            id_cliente_gestor_cartera: 0,
            id_cartera: cartera,
            cli_identificacion: cedula,
            id_gestor: gestor,
            cgc_observacion: null,
            cgc_gestor_in: null,
            cgc_gestor_up: null,
            cgc_gestor_rem: null,
            cgc_gestor_act: null,
            cgc_gestor_desact: null,
            cgc_fecha_act: null,
            cgc_fecha_desact: null,
            cgc_fecha_in: null,
            cgc_fecha_up: null,
            cgc_esactivo: '1',
            cgc_baseactual: null,
          };
          objetocligestcartera = objetoClienteGestorCartera;
        } else {
          objetocligestcartera = ListaClienteGestorCartera[0];
        }

        return objetocligestcartera;
      }),
      catchError((error) => {
        console.error('Error during API call:', error);
        return throwError(error);
      })
    );
  }
  verificacionPostOrPut(objeto: any, bandera: boolean, row: any) {
    objeto['ope_fecha_venc']=objeto['ope_fecha_venc']==='1969-12-31'?null:objeto['ope_fecha_venc'];
    objeto['ope_fecha_pagada']=objeto['ope_fecha_pagada']==='1969-12-31'?null:objeto['ope_fecha_pagada'];
    objeto['ope_fecha_compra']=objeto['ope_fecha_compra']==='1969-12-31'?null:objeto['ope_fecha_compra'];
    objeto['ope_fecha_entrega']=objeto['ope_fecha_entrega']==='1969-12-31'?null:objeto['ope_fecha_entrega'];
    if (bandera === true) {
      console.log('entro al put');
      console.log('------>');
      console.log(objeto);
      console.log('------>');
      console.log(bandera);
      console.log('------>');
      console.log(row);
      this.api
        .PutCxC(objeto)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.eliminarObjeto(row);
              this.alerta.RegistroActualizado();
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
    if (bandera === false) {
      console.log('entro al post');
      console.log(objeto);
      console.log(bandera);
      this.api
        .PostCxC(objeto)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.eliminarObjeto(row);
              this.alerta.RegistroAgregado();
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
  }
  cargarNuevoCliente(row: any): any {
    const minDate = new Date('1969-12-31').toISOString().split('T')[0];
    let clienteNuevo: any = {
      id_cliente: 0,
      cli_identificacion: row['cli_identificacion'],
      cli_nombres: row['cli_nombres'].toUpperCase(),
      cli_tipo_identificacion: row['cli_tipo_identificacion'] === 'vacio' ? null : row['cli_tipo_identificacion'],
      cli_genero: row['cli_genero'].toUpperCase(),
      cli_estado_civil: row['cli_estado_civil'],
      cli_ocupacion: row['cli_ocupacion'].toUpperCase(),
      cli_fecha_nacimiento:this.solucionarFecha(row['cli_fecha_nacimiento'])===''?minDate:this.solucionarFecha(row['cli_fecha_nacimiento']),
      cli_score: row['cli_score'] === 'vacio' ? null : row['cli_score'].toString(),
      cli_fallecido: row['cli_fallecido'] === 'vacio' ? null : row['cli_fallecido'],
      cli_fecha_fallecido:this.solucionarFecha(row['cli_fecha_fallecido'])===''?minDate:this.solucionarFecha(row['cli_fecha_fallecido']),
      cli_observacion: row['cli_observacion'].toUpperCase(),
      cli_provincia: row['cli_provincia'].toUpperCase(),
      cli_canton: row['cli_canton'].toUpperCase(),
      cli_parroquia: row['cli_parroquia'].toUpperCase(),
      cli_fecha_act: this.Fechas.fecha(),
      cli_fecha_desact: this.Fechas.fecha(),
      cli_fecha_in: this.Fechas.fecha(),
      cli_fecha_up: this.Fechas.fecha(),
      cli_esactivo: '1',
      cli_id_ultima_gestion: null,
      cli_baseactual: '1',
      cli_origendatos: 'Sistema_CobroSys',
    };
    return clienteNuevo;

  }
  PostCXC(dato:any,row:any,cartera:number,gestor:number)
  {
    //const cedula:string=dato['cli_identificacion'];
    this.api
      .PostCxC(dato)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            //this.PostNewClienteGestorCartera(dato['cli_identificacion'],cartera,gestor);
            this.alerta.RegistroAgregado();
            this.eliminarObjeto(row);
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
  PostCliente(dato: any, row: any, cartera: number, gestor: number) {
    //const cedula:string=dato['cli_identificacion'];
    this.api
      .PostCliente(dato)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            // this.PostNewClienteGestorCartera(
            //   dato['cli_identificacion'],
            //   cartera,
            //   gestor
            // );
            this.eliminarObjeto(this.row);
            this.alerta.RegistroAgregado();
            
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
  PostNewClienteGestorCartera(
    cedula: string,
    cartera: number,
    gestor: number
  ): void {
    console.log('entroNew');
    console.log(cedula);
    console.log(cartera);
    console.log(gestor);
    let banderaux = false;
    this.buscarClienteGestorCarteraObservable2(cedula, 1, cartera, gestor)
      .pipe(
        map((tracks) => {
          console.log(tracks);
          let res = tracks;
          console.log(tracks);
          console.log('hacer post clientegestorcarte');
          banderaux = false;
          let objetoNewRegistro: any = {
            id_cliente_gestor_cartera: 0,
            id_cartera: cartera,
            cli_identificacion: cedula,
            id_gestor: gestor,
            cgc_observacion: null,
            cgc_gestor_in: null,
            cgc_gestor_up: null,
            cgc_gestor_rem: null,
            cgc_gestor_act: null,
            cgc_gestor_desact: null,
            cgc_fecha_act: null,
            cgc_fecha_desact: null,
            cgc_fecha_in: null,
            cgc_fecha_up: null,
            cgc_esactivo: '1',
            cgc_baseactual: null,
          };
          this.verificacionAgregarEditarClienteGestorCartera(
            objetoNewRegistro,
            banderaux
          );
        }),
        catchError((error) => {
          throw new Error(error);
        })
      )
      .subscribe();
  }
  verificacionAgregarEditarClienteGestorCartera(
    objeto: any,
    bandera: boolean
  ): number {
    let valor: number = 0;
    if (bandera === false) {
      this.api
        .PostClienteGestorCartera(objeto)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              valor = 0;
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
    if (bandera === true) {
      this.api
        .PutClienteGestorCartera(objeto)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              valor = 1;
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
    return valor;
  }
  PutCliente(dato: any, row: any) {
    this.api
      .PutCliente(dato)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            this.eliminarObjeto(this.row);
            this.alerta.RegistroActualizado();
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
  cargarClienteGestorCartera(
    cedula: string,
    cartera: number,
    gestor: number
  ): any {
    let valor: any = {
      id_cliente_gestor_cartera: 0,
      id_cartera: cartera,
      cli_identificacion: cedula,
      id_gestor: gestor,
      cgc_observacion: null,
      cgc_gestor_in: null,
      cgc_gestor_up: null,
      cgc_gestor_rem: null,
      cgc_gestor_act: null,
      cgc_gestor_desact: null,
      cgc_fecha_act: null,
      cgc_fecha_desact: null,
      cgc_fecha_in: null,
      cgc_fecha_up: null,
      cgc_esactivo: '1',
      cgc_baseactual: null,
    };
    return valor;
  }
  agregarEditarCXC(dato: any, tipo: number): number {
    let valor = 0;
    if (tipo === 0) {
      this.api
        .PostCxC(dato)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              valor = 1;
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
    if (tipo === 1) {
      this.api
        .PutCxC(dato)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              valor = 1;
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
    return valor;
  }
  cargarCXCActualizacion(cxc: any): any {
    //PostCxCActualizacion
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const nombresMeses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const nombreMesActual = nombresMeses[mesActual];
    let cxca: any = {
      id_cxc_operacion_act: 0,
      id_cartera: cxc.id_cartera,
      ope_act_cod_credito: cxc.ope_cod_credito,
      ope_act_cli_identificacion: cxc.cli_identificacion,
      ope_act_linea: cxc.ope_linea,
      ope_act_producto: cxc.ope_producto,
      ope_act_dias_mora: cxc.ope_dias_mora,
      ope_act_interes_mora: cxc.ope_interes_mora,
      ope_act_gastos_cobranzas: cxc.ope_gastos_cobranzas,
      ope_act_saldo_cxc_actual: cxc.ope_saldo_cxc_actual,
      ope_act_saldo_cuota_actual: cxc.ope_saldo_cuota_actual,
      ope_act_saldo_capital: cxc.ope_saldo_capital_venc,
      ope_act_poner_aldia: cxc.ope_poner_aldia,
      ope_act_liquidar: cxc.ope_liquidar,
      ope_act_abono_realizado: cxc.ope_abono_realizado,
      ope_act_valor_total_pag: cxc.ope_valor_total_pag,
      ope_act_tipo_actualizacion: cxc.ope_tipo_actualizacion,
      ope_act_observacion: cxc.ope_observacion,
      ope_act_total_vencido: cxc.ope_total_vencido,
      ope_act_nom_segm_vencido: cxc.ope_nom_segm_vencido,
      ope_act_categoria_cliente: cxc.ope_categoria_cliente,
      ope_act_segmentacion: cxc.ope_segmentacion,
      ope_act_promo_cuotas_gratis: cxc.ope_promo_cuotas_gratis,
      ope_act_deuda_actual: cxc.ope_deuda_actual,
      ope_act_saldo_interes: cxc.ope_saldo_interes,
      ope_act_saldo_amortizacion: cxc.ope_saldo_amortizacion,
      ope_act_int_cobra: cxc.ope_int_cobra,
      ope_act_saldo_cobra_mora: cxc.ope_saldo_cobra_mora,
      ope_act_descu_campa_saldo_capit: cxc.ope_descu_campa_saldo_capit,
      ope_act_valor_descu_saldo_capit: cxc.ope_valor_descu_saldo_capit,
      ope_act_descrip_unidad_gestion: cxc.ope_descrip_unidad_gestion,
      ope_act_plazo: cxc.ope_plazo,
      ope_act_provincia: cxc.ope_provincia,
      ope_act_tiene_garante: cxc.ope_tiene_garante,
      ope_act_fecha_compra: cxc.ope_fecha_compra,
      ope_act_fecha_venc: cxc.ope_fecha_venc,
      ope_act_gestor_in: cxc.ope_gestor_in,
      ope_act_gestor_up: null,
      ope_act_gestor_rem: null,
      ope_act_gestor_act: cxc.ope_gestor_act,
      ope_act_gestor_desact: cxc.ope_gestor_desact,
      ope_act_fecha_act: cxc.ope_fecha_act,
      ope_act_fecha_desact: cxc.ope_fecha_desact,
      ope_act_fecha_in: cxc.ope_fecha_in,
      ope_act_fecha_up: cxc.ope_fecha_up,
      ope_act_mes_actualizacion: nombreMesActual,
      ope_act_esactivo: cxc.ope_esactivo,
      ope_act_fechade_entrega: cxc.ope_fecha_entrega,
      ope_act_origendatos: cxc.ope_origendatos,
      ope_act_baseactual: cxc.ope_baseactual,
    };
    return cxca;
  }
  agregarCxCActualizacion(dato: any) {
    this.api
      .PostCxCActualizacion(dato)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
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
  valid(val: any): any {
    let retorno: any = {}; // No estoy seguro si necesitas este objeto retorno, ya que no lo estás utilizando en tu función actualmente

    for (let key in val) {
      if (val.hasOwnProperty(key)) {
        // Accedemos a cada propiedad o elemento de la variable utilizando la clave 'key'
        if (val[key] === 'vacio') {
          val[key] = null;
        } else {
          val[key] = val[key];
        }
        // Si deseas asignar los cambios al objeto retorno, puedes hacerlo aquí
        retorno[key] = val[key];
      }
    }

    return retorno; // Devuelve el objeto con los cambios
  }
  valid2(val: any): boolean {
    let retorno = false;
    let contieneTrue = false;
    let aux: boolean[] = [];
    let aux2 = false;
    for (let key in val) {
      if (val.hasOwnProperty(key)) {
        // Accedemos a cada propiedad o elemento de la variable utilizando la clave 'key'
        if (val[key] === null) {
          aux2 = true;
          aux.push(aux2);
        }
      }
    }
    for (let valor of aux) {
      if (valor === true) {
        contieneTrue = true;
        break; // Si encontramos un true, podemos detener el bucle
      }
    }
    if (contieneTrue) {
      retorno = contieneTrue;
    }
    return retorno;
  }
  solucionarFecha(valor:string):string
  {
    let v= '';
    let banderaFechaV=false;
    const date = new Date(valor); // Convertir la cadena a un objeto Date
    if (!isNaN(date.getTime())) {
     banderaFechaV=true;
  } else {
    banderaFechaV=false;
    
  }
    if(banderaFechaV===true){
      date.setDate(date.getDate());
    let h= date.toISOString();
    if(h==="1969-12-31T00:00:00.000Z"||h==='1969-12-31')
      {
        v='';
      }else
      {
         v=h;
      }
    }else{
      v='';
    }
    
    return v;
  }
  ListarElementos(num: number) {
    // if (num === 2) {
    //   this.api
    //     .GetCxcOperacionFracionadoDesactivado(0, 0,Number(this.filtroCartera.value))
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio')
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();

    // }
    // if (num === 3) {
    //   this.api
    //     .GetCorreosFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 4) {
    //   this.api
    //     .GetDireccionesFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 5) {
    //   this.api
    //     .GetGarantesFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 6) {
    //   this.api
    //     .GetTelefonosFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 7) {
    //   this.api
    //     .GetTrabajosFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 8) {
    //   this.api
    //     .GetTipoCorreoDesactivoFracionado(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 9) {
    //   this.api
    //     .GetTipoTelefonoFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 10) {
    //   this.api
    //     .GetTipoDireccionFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 11) {
    //   this.api
    //     .GetDetTelefonoFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 12) {
    //   this.api
    //     .GetTipoTrabajoFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 13) {
    //   this.api
    //     .GetDesactivadosContactabilidadFracionado(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 14) {
    //   this.api
    //     .GetDesactivadosConectividadFracionado(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 15) {
    //   this.api
    //     .GetCuentasFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 16) {
    //   this.api
    //     .GetTipoGestionFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 17) {
    //   this.api
    //     .GetCarteraFracionadoDesactivos(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 18) {
    //   this.api
    //     .GetTipoCarteraFracionadoDesactivos(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 19) {
    //   this.api
    //     .GetGestoresFracionadoDesactivados(0, 0)
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 20) {
    //   this.api
    //     .GetClienteGestorCarteraFracionadoDesactivados(
    //       0,
    //       0,
    //       Number(this.filtroCartera.value)
    //     )
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
    // if (num === 22) {
    //   this.api
    //     .GetTGCCFraccionadoDesactivados(
    //       0,
    //       0
    //     )
    //     .pipe(
    //       map((tracks) => {
    //         let valor: any = tracks['data'];
    //         if (valor === 1) {
    //           console.log('se cambio');
    //         }
    //       }),
    //       catchError((error) => {
    //         throw new Error(error);
    //       })
    //     )
    //     .subscribe();
    // }
  }
  async descargarArchivoExcelClienteGestorCartera() {
    forkJoin({
      cgc: this.getClienteGestorCarteraModelo(),
      clientes: this.getClienteCarteraModelo(),
      carteras: this.getCarteraModelo(),
      gestor: this.getGestorModelo(),
    }).subscribe(({ cgc, clientes, carteras, gestor }) => {
      if (carteras.length > 0 && gestor.length > 0 && clientes.length > 0) {
        const wb = XLSX.utils.book_new();
        console.log(cgc);
        //Agregar la lista de tipos de correo a una pestaña
        // const resultado = cgc.filter((elemento) => {
        //   return elemento['id_cartera'] === Number(this.filtroCartera.value);
        // });
        const wsTelefono = XLSX.utils.json_to_sheet(cgc);
        const wsTelefonoRef = wsTelefono['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexTelefono = 0;
          // Iterar sobre todas las filas de la columna cli_identificacion (excluyendo la primera fila de encabezados) y establecer el formato de texto
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({
              r: R,
              c: columnIndexTelefono,
            });
            wsTelefono[cellAddress].z = '@';
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'ClienteGestorCartera');
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTiposTelefono = XLSX.utils.json_to_sheet(clientes);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Clientes');
        const wscartera = XLSX.utils.json_to_sheet(carteras);
        XLSX.utils.book_append_sheet(wb, wscartera, 'Carteras');
        const wsgestor = XLSX.utils.json_to_sheet(gestor);
        XLSX.utils.book_append_sheet(wb, wsgestor, 'Gestor');
        //Escribir el archivo Excel

        XLSX.writeFile(wb, 'ModeloAsignacion.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para iniciar la descarga de esta plantilla es necesario agregar datos en Clientes,Gestor,Cartera'
        );
      }
    });
  }
  async descargarArchivoExcelCuentaCartera() {
    forkJoin({
      cc: this.getCuentaCarteraModelo(),
      cuentas: this.getCuentaModelo(),
      carteras: this.getCarteraModelo(),
    }).subscribe(({ cc, cuentas, carteras }) => {
      if (carteras.length > 0 && cuentas.length > 0) {
        const wb = XLSX.utils.book_new();
        //Agregar la lista de tipos de correo a una pestaña
        const wsTelefono = XLSX.utils.json_to_sheet(cc);

        XLSX.utils.book_append_sheet(wb, wsTelefono, 'ClienteGestorCartera');
        // Agregar la lista de tipos de teléfono a otra pestaña
        const wsTiposTelefono = XLSX.utils.json_to_sheet(cuentas);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Cuentas');
        const wscartera = XLSX.utils.json_to_sheet(carteras);
        XLSX.utils.book_append_sheet(wb, wscartera, 'Carteras');

        //Escribir el archivo Excel

        XLSX.writeFile(wb, 'ModeloCuentaCartera.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para poder descargar esta plantilla debere agregar antes los datos en Cartera'
        );
      }
    });
  }
  async descargarArchivoExcelTipoGestionConectividadContactavilidad() {
    forkJoin({
      tgcc: this.getTipoGestionCC2(),
      tipogestion: this.getTipoGestion(),
      conectividad: this.getConectividad(),
      contactavilidad: this.getContactabilidad(),
    }).subscribe(({ tgcc, tipogestion, conectividad, contactavilidad }) => {
      if (
        tipogestion.length > 0 &&
        conectividad.length > 0 &&
        contactavilidad.length > 0
      ) {
        const wb = XLSX.utils.book_new();
        const wsTelefono = XLSX.utils.json_to_sheet(tgcc);
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'TipoGestionCC');
        const wsTiposTelefono = XLSX.utils.json_to_sheet(tipogestion);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Tipo Gestion');
        const wscartera = XLSX.utils.json_to_sheet(conectividad);
        XLSX.utils.book_append_sheet(wb, wscartera, 'conectividad');
        const wscartera2 = XLSX.utils.json_to_sheet(contactavilidad);
        XLSX.utils.book_append_sheet(wb, wscartera2, 'contactavilidad');
        const wscartera3 = XLSX.utils.json_to_sheet(this.listaPerEdi);
        XLSX.utils.book_append_sheet(wb, wscartera3, 'PermisosEdicion');
        XLSX.writeFile(wb, 'ModeloTipoGestionConectvidadContactavidad.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para descargar esta Plantilla es necesario agregar datos en Tipo Gestion ,Conectividad y Contactividad!!!.'
        );
      }
    });
  }
  async descargarArchivoExcelGestion() {
    forkJoin({
      tgcc: this.getGestiones(),
      cartera:this.getCartera(),
      gestor:this.getGestorModelo(),
      tipogestion: this.getTipoGestion(),
      conectividad: this.getConectividad(),
      contactavilidad: this.getContactabilidad(),
    }).subscribe(({ tgcc,cartera, gestor,tipogestion, conectividad, contactavilidad }) => {
      if (
        tipogestion.length > 0 &&
        conectividad.length > 0 &&
        contactavilidad.length > 0
      ) {

        const wb = XLSX.utils.book_new();
        const wsTelefono = XLSX.utils.json_to_sheet(tgcc);
        const wsTelefonoRef = wsTelefono['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexCedula = 0;
          const columnIndexcodigo = 1;
          const columnIndexNumeroC = 8;
          const columnIndexf1 = 10;
          const columnIndexf2 = 11;
          const columnIndexf3 = 12;
          const columnIndexf4 = 21;
          const columnIndexf5 = 22;
          const columnIndexf6 = 26;
          const columnIndexf7 = 27;
          //Aplicando que sean de formato texto
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellCedula = XLSX.utils.encode_cell({ r: R, c: columnIndexCedula });
            wsTelefono[cellCedula].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellCodigo = XLSX.utils.encode_cell({ r: R, c: columnIndexcodigo });
            wsTelefono[cellCodigo].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellNumeroC = XLSX.utils.encode_cell({ r: R, c: columnIndexNumeroC });
            wsTelefono[cellNumeroC].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF1 = XLSX.utils.encode_cell({ r: R, c: columnIndexf1 });
            wsTelefono[cellF1].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF2 = XLSX.utils.encode_cell({ r: R, c: columnIndexf2 });
            wsTelefono[cellF2].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF3 = XLSX.utils.encode_cell({ r: R, c: columnIndexf3 });
            wsTelefono[cellF3].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF4 = XLSX.utils.encode_cell({ r: R, c: columnIndexf4 });
            wsTelefono[cellF4].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF5 = XLSX.utils.encode_cell({ r: R, c: columnIndexf5 });
            wsTelefono[cellF5].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF6 = XLSX.utils.encode_cell({ r: R, c: columnIndexf6 });
            wsTelefono[cellF6].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF7 = XLSX.utils.encode_cell({ r: R, c: columnIndexf7 });
            wsTelefono[cellF7].z = '@';
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'Gestiones');
        const wsTiposTelefono = XLSX.utils.json_to_sheet(cartera);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Carteras');
        const wscartera = XLSX.utils.json_to_sheet(gestor);
        XLSX.utils.book_append_sheet(wb, wscartera, 'Gestores');
        const wscartera2 = XLSX.utils.json_to_sheet(tipogestion);
        XLSX.utils.book_append_sheet(wb, wscartera2, 'Tipos Gestion');
        const wscartera3 = XLSX.utils.json_to_sheet(conectividad);
        XLSX.utils.book_append_sheet(wb, wscartera3, 'Conectividad');
        const wscartera4 = XLSX.utils.json_to_sheet(contactavilidad);
        XLSX.utils.book_append_sheet(wb, wscartera4, 'Contactabilidad');
        XLSX.writeFile(wb, 'ModeloPlantillaGestiones.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para descargar esta Plantilla es necesario agregar datos en Tipo Gestion ,Conectividad y Contactividad!!!.'
        );
      }
    });
  }
  async descargarArchivoExcelPagos() {
    forkJoin({
      tgcc: this.getPagos(),
      cartera:this.getCartera(),
      gestor:this.getGestorModelo(),
      cuenta: this.getCuentaModelo()
    }).subscribe(({ tgcc, cartera, gestor,cuenta}) => {
      if (
          cartera.length > 0 &&
          gestor.length > 0 &&
          cuenta.length > 0
      ) {
        const wb = XLSX.utils.book_new();
        const wsTelefono = XLSX.utils.json_to_sheet(tgcc);
        const wsTelefonoRef = wsTelefono['!ref'];
        if (wsTelefonoRef) {
          const rangeTelefono = XLSX.utils.decode_range(wsTelefonoRef);
          const columnIndexCedula = 0;
          const columnIndexcodigo = 2;
          const columnIndexUrl = 8;
          const columnIndexf1 = 14;
          const columnIndexf2 = 15;
          const columnIndexNumeroC = 16;
          //Aplicando que sean de formato texto
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellCedula = XLSX.utils.encode_cell({ r: R, c: columnIndexCedula });
            wsTelefono[cellCedula].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellCodigo = XLSX.utils.encode_cell({ r: R, c: columnIndexcodigo });
            wsTelefono[cellCodigo].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellUrl = XLSX.utils.encode_cell({ r: R, c: columnIndexUrl});
            wsTelefono[cellUrl].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF1 = XLSX.utils.encode_cell({ r: R, c: columnIndexf1 });
            wsTelefono[cellF1].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellF2 = XLSX.utils.encode_cell({ r: R, c: columnIndexf2 });
            wsTelefono[cellF2].z = '@';
          }
          for (let R = rangeTelefono.s.r + 1; R <= rangeTelefono.e.r; ++R) {
            const cellNc = XLSX.utils.encode_cell({ r: R, c: columnIndexNumeroC });
            wsTelefono[cellNc].z = '@';
          }
        }
        XLSX.utils.book_append_sheet(wb, wsTelefono, 'Plantilla_Pago');
        const wsTiposTelefono = XLSX.utils.json_to_sheet(cartera);
        XLSX.utils.book_append_sheet(wb, wsTiposTelefono, 'Carteras');
        const wscartera = XLSX.utils.json_to_sheet(gestor);
        XLSX.utils.book_append_sheet(wb, wscartera, 'Gestores');
        const wscartera2 = XLSX.utils.json_to_sheet(cuenta);
        XLSX.utils.book_append_sheet(wb, wscartera2, 'Cuentas');
        XLSX.writeFile(wb, 'ModeloPlantillaPagosCargaMasiva.xlsx');
      } else {
        this.alerta.ErrorEnLaPeticion(
          'Para descargar esta Plantilla es necesario agregar datos en Tipo Gestion ,Conectividad y Contactividad!!!.'
        );
      }
    });
  }
  getTipoGestionCC(): Observable<any[]> {
    return this.api.GetTGCCFraccionado(0, 0).pipe(
      map((tracks) => {
        if (tracks['data'].length === 0) {
          return [
            {
              id_tipo_gestion: '0',
              id_conectividad: '0',
              id_contactabilidad: '0',
              tipges_per_edi:'0'
            },
          ];
        } else {
          return tracks['data'].map((item: any) => ({
            id_tipo_gestion: item['id_tipo_gestion'],
            id_conectividad: item['id_conectividad'],
            id_contactabilidad:item['id_contactabilidad'],
            tipges_per_edi:item['tipges_per_edi']
          }));
        }
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getTipoGestionCC2(): Observable<any[]> {
  return this.api.GetTGCCFraccionado(0, 0).pipe(
    mergeMap((tracks) => {
      if (tracks['data'].length === 0) {
        return this.api.GetTipoGestionFracionado(0,0).pipe(
          mergeMap((tracks) => {
            const array: any[] = [];
            tracks['data'].forEach((val: any) => {
              const obj = {
                id_tipo_gestion: val['id_tipo_gestion'],
                id_conectividad:'0',
                id_contactabilidad:'0',
                tipges_per_edi:'0'
              };
              array.push(obj);
            });
            return of(array);
          }),
          catchError((error) => {
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        );
      } else {
        return of(
          tracks['data'].map((item: any) => ({
            id_tipo_gestion: item['id_tipo_gestion'],
            id_conectividad: item['id_conectividad'],
            id_contactabilidad:item['id_contactabilidad'],
            tipges_per_edi:item['tipges_per_edi']
          }))
        );
      }
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getPagos(): Observable<any[]> {
  return this.api.GetPagosFracionado(0, 0).pipe(
    map((tracks) => {
      if (tracks['data'].length === 0) {
        return [
          {
            cli_identificacion: '0100000000',
            id_gestor: '0',
            ope_cod_credito: '0',
            id_cuenta: '0',
            pag_pago:'0',
            pag_valor_total_comprobante:'0',
            pag_observacion_pago:'vacio'.toUpperCase(),
            pag_codigo_comprobante:'0',
            pag_url_comprobante:'/ejemplo/ejemplo.jpg',
            pag_observ_comprobante:'vacio'.toUpperCase(),
            pag_pago_verificado:'0',
            pag_id_gestor_ingresa:'0',
            pag_id_gestor_verifica:'0',
            pag_mes_pago:'enero'.toUpperCase(),
            pag_fecha_pago:this.Fechas.fechaActualCorta(),
            pag_fecha_verificacion:this.Fechas.fechaActualCorta(),
            pag_medio_contacto:'vacio'.toUpperCase()
          },
        ];
      } else {
        return tracks['data'].map((item: any) => ({
          cli_identificacion: item['cli_identificacion'],
          id_gestor: item['id_gestor']===null?'0':item['id_gestor'],
          ope_cod_credito: item['ope_cod_credito'],
          id_cuenta: item['id_cuenta'],
          pag_pago: item['pag_pago'],
          pag_valor_total_comprobante: item['pag_valor_total_comprobante'],
          pag_observacion_pago: item['pag_observacion_pago']===null?'VACIO':item['pag_observacion_pago'].toUpperCase(),
          pag_codigo_comprobante: item['pag_codigo_comprobante']===null?'0':item['pag_codigo_comprobante'],
          pag_url_comprobante: item['pag_url_comprobante']===null?'VACIO':item['pag_url_comprobante'],
          pag_observ_comprobante:item['pag_observ_comprobante']===null?'VACIO':item['pag_observ_comprobante'].toUpperCase(),
          pag_pago_verificado: item['pag_pago_verificado']===null?'0':item['pag_pago_verificado'],
          pag_id_gestor_ingresa: item['pag_id_gestor_ingresa']===null?'0':item['pag_id_gestor_ingresa'],
          pag_id_gestor_verifica: item['pag_id_gestor_verifica']===null?'0':item['pag_id_gestor_verifica'],
          pag_mes_pago: item['pag_mes_pago']===null?'VACIO':item['pag_mes_pago'].toUpperCase(),
          pag_fecha_pago:item['pag_fecha_pago']===null?this.Fechas.fechaActualCorta():this.Fechas.fechaActualCortaEnvio(item['pag_fecha_pago']),
          pag_fecha_verificacion:item['pag_fecha_verificacion']===null?this.Fechas.fechaActualCorta():this.Fechas.fechaActualCortaEnvio(item['pag_fecha_verificacion']),
          pag_medio_contacto: item['pag_medio_contacto']===null?'VACIO':item['pag_medio_contacto'].toUpperCase(),
        }));
      }
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getGestiones(): Observable<any[]> {
  return this.api.GetGestionFracionado2(0, 0).pipe(
    map((tracks) => {
      if (tracks['data'].length === 0) {
        return [
          {
            id_gestor: '0',
            cli_identificacion: '0100000000',
            ope_cod_credito: 'AAABBB-123',
            gest_id_gestor_asign: '0',
            gest_id_tipo_gestion:'0',
            gest_id_contactabilidad:'0',
            gest_id_conectividad:'0',
            gest_id_contacto:'0',
            gest_num_contacto:'099999999',
            gest_gestion_mediante:'vacio'.toUpperCase(),
            gest_fecha_compromiso:this.Fechas.fechaActualCorta(),
            gest_fecha_incumplido:this.Fechas.fechaActualCorta(),
            gest_descripcion:'vacio'.toUpperCase(),
            gest_valor_comp:'0',
            gest_abonos:'0',
            gest_num_coutas:'0',
            gest_num_coutas_res:'0',
            gest_couta:'0',
            gest_valor_a_cobrar:'0',
            gest_valor_incumplido:'0',
            gest_fecha_prox_pago:this.Fechas.fechaActualCorta(),
            gest_fecha_conv:this.Fechas.fechaActualCorta(),
            gest_observacion:'vacio'.toUpperCase(),
            gest_certificado:'0',
            gest_volver_llamar:'0',
            gest_fecha_volver_llamar:this.Fechas.fechaActualCorta(),
            gest_hora_volver_llamar:'00:00:00',
            gest_perdio_contacto:'vacio'.toUpperCase()
          }
        ];
      } else {
        return tracks['data'].map((item: any) => ({
          cli_identificacion:item['cli_identificacion'],
          ope_cod_credito: item['ope_cod_credito']===null?'VACIO':item['ope_cod_credito'],
          id_gestor: item['id_gestor'],
          gest_id_gestor_asign: item['gest_id_gestor_asign']===null?'VACIO':item['gest_id_gestor_asign'],
          gest_id_tipo_gestion: item['gest_id_tipo_gestion']===null?'VACIO':item['gest_id_tipo_gestion'],
          gest_id_contactabilidad:item['gest_id_contactabilidad']===null?'VACIO':item['gest_id_contactabilidad'],
          gest_id_conectividad:item['gest_id_conectividad']===null?'VACIO':item['gest_id_conectividad'],
          gest_id_contacto:item['gest_id_contacto']===null?'VACIO':item['gest_id_contacto'],
          gest_num_contacto:item['gest_num_contacto']===null?'VACIO':item['gest_num_contacto'],
          gest_gestion_mediante:item['gest_gestion_mediante']===null?'VACIO':item['gest_gestion_mediante'].toUpperCase(),
          gest_fecha_compromiso:item['gest_fecha_compromiso']===null?'1969-01-31':this.Fechas.fechaActualCortaEnvio(item['gest_fecha_compromiso']),
          gest_fecha_incumplido:item['gest_fecha_incumplido']===null?'1969-01-31':this.Fechas.fechaActualCortaEnvio(item['gest_fecha_incumplido']),
          gest_descripcion:item['gest_descripcion']===null?'VACIO':item['gest_descripcion'].toUpperCase(),
          gest_valor_comp:item['gest_valor_comp']===null?'0':item['gest_valor_comp'],
          gest_abonos:item['gest_abonos']===null?'0':item['gest_abonos'],
          gest_num_coutas:item['gest_num_coutas']===null?'0':item['gest_num_coutas'],
          gest_num_coutas_res:item['gest_num_coutas_res']===null?'0':item['gest_num_coutas_res'],
          gest_couta:item['gest_couta']===null?'0':item['gest_couta'],
          gest_valor_a_cobrar:item['gest_valor_a_cobrar']===null?'0':item['gest_valor_a_cobrar'],
          gest_valor_incumplido:item['gest_valor_incumplido']===null?'0':item['gest_valor_incumplido'],
          gest_fecha_prox_pago:item['gest_fecha_prox_pago']===null?'1969-01-31':this.Fechas.fechaActualCortaEnvio(item['gest_fecha_prox_pago']),
          gest_fecha_conv:item['gest_fecha_conv']===null?'1969-01-31':this.Fechas.fechaActualCortaEnvio(item['gest_fecha_conv']),
          gest_observacion:item['gest_observacion']===null?'VACIO':item['gest_observacion'].toUpperCase(),
          gest_certificado:item['gest_certificado']===null?'0':item['gest_certificado'],
          gest_volver_llamar:item['gest_volver_llamar']===null?'0':item['gest_volver_llamar'],
          gest_fecha_volver_llamar:item['gest_fecha_volver_llamar']===null?'1969-01-31':this.Fechas.fechaActualCortaEnvio(item['gest_fecha_volver_llamar']),
          gest_hora_volver_llamar:item['gest_hora_volver_llamar']===null?'00:00:00':this.Fechas.formatearHora(item['gest_hora_volver_llamar']),
          gest_perdio_contacto:item['gest_perdio_contacto']===null?'0':item['gest_perdio_contacto']
        }));
      }
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getTipoGestion(): Observable<any[]> {
  return this.api.GetTipoGestionFracionado(0,0).pipe(
    map((tracks) => {
      return tracks['data'].map((item: any) => ({
        gestion_tip_descripcion: item['gestion_tip_descripcion'],
        id_tipo_gestion: item['id_tipo_gestion']
      }));
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getConectividad(): Observable<any[]> {
  return this.api.GetConectividadFracionado(0,0).pipe(
    map((tracks) => {
      return tracks['data'].map((item: any) => ({
        conec_descripcion: item['conec_descripcion'],
        id_conectividad: item['id_conectividad']
      }));
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
getContactabilidad(): Observable<any[]> {
  return this.api.GetContactabilidadFracionado(0,0).pipe(
    map((tracks) => {
      return tracks['data'].map((item: any) => ({
        contac_descripcion: item['contac_descripcion'],
        id_contactabilidad: item['id_contactabilidad']
      }));
    }),
    catchError((error) => {
      throw new Error(error);
    })
  );
}
guardarMasiva()
{
   this.CargaMasivaPost=[];
   let listaMantienen:any[]=[];
  /*****Agregar un for que recorra  la lista y aplicar esto */
  if(this.valorSelecEntidad==='1')
    {
    for (const rowf of this.data) {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      let ocD: any = {
        cli_identificacion: rowf[0],
        cli_tipo_identificacion: rowf[1],
        cli_nombres:(rowf[2] === '' || rowf[2] === 'VACIO'||rowf[2] === 'vacio'||rowf[2] === ' ') ? null : rowf[2].toUpperCase(),
        cli_genero: rowf[3] === '' ? null : rowf[3].toUpperCase(),
        cli_estado_civil: rowf[4] === '' ? null : rowf[4].toString(),
        cli_ocupacion:(rowf[5] === '' || rowf[5] === 'VACIO'||rowf[5] === 'vacio'||rowf[5] === ' ') ? null : rowf[5].toUpperCase(),
        cli_fecha_nacimiento: this.solucionarFecha(rowf[6]) === '' ? minDate : this.solucionarFecha(rowf[6]),
        cli_score: rowf[7] === '' ? null : rowf[7].toString(),
        cli_fallecido: rowf[8] === '' ? null : rowf[8].toString(),
        cli_fecha_fallecido: this.solucionarFecha(rowf[9]) === '' ? minDate : this.solucionarFecha(rowf[9]),
        cli_observacion:(rowf[10] === '' || rowf[10] === 'VACIO'||rowf[10] === 'vacio'||rowf[10] === ' ') ? null : rowf[10].toUpperCase(),
        cli_provincia: (rowf[11] === '' || rowf[11] === 'VACIO'||rowf[11] === 'vacio'||rowf[11] === ' ') ? null : rowf[11].toUpperCase(),
        cli_canton:(rowf[12] === '' || rowf[12] === 'VACIO'||rowf[12] === 'vacio'||rowf[12] === ' ') ? null : rowf[12].toUpperCase(),
        cli_parroquia:(rowf[13] === '' || rowf[13] === 'VACIO'||rowf[13] === 'vacio'||rowf[13] === ' ') ? null : rowf[13].toUpperCase(),
        id_cartera: Number(this.filtroCartera.value),
        id_gestor: 2
      };

      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'cliente', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos 1min , luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
      if (result) {
        this.isLoading=true;
        let listaDNoInsertados:any[]=[];
        const start = performance.now();
        this.api
          .PostCargaMasiva(om)
          .pipe(
            map((tracks) => {
              let cont: number = 0;
              const exito = tracks['exito'];
              if (exito == 1) {
                for (const row of tracks['data']) {
                  if (row['exito'] === 4) {
                    listaMantienen.push(row);
                  }
                  if (row['exito'] === 3) {
                    listaDNoInsertados=row['data'];
                    datosnoinsertados=row['data'].length;
                  }
                  if (row['exito'] === 2) {
                    datosactualizados=row['data'].length;
                  }
                  if (row['exito'] === 1) {
                    datosinsertados=row['data'].length;
                  }
                  cont += 1;
                }//fin del for
                const end = performance.now();
                const inSeconds = (end - start) / 1000;
                const rounded = Number(inSeconds).toFixed(3);
                console.log(rounded + ' en segundos');
                /******************************************************************************/
                const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                if(listaDNoInsertados.length>0)
                  {
                    const wb = XLSX.utils.book_new();
                    const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                    XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                    XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                  }
                this.data.filter((elemento): any => {
                  if (elemento[0] === tracks['data']['data']) {
                    this.eliminarObjeto(elemento);
                  }
                });
              } else {
                this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
              }
              this.isLoading = false;
            }),
            catchError((error) => {
              this.alerta.ErrorEnLaOperacion();
              throw new Error(error);
            })
          )
          .subscribe();
      }
    });
    }
    if (this.valorSelecEntidad === '2') {
      for (const rowf of this.data) {
        let ocD: any = {
          id_cxc_operacion: 0,
          ope_cod_credito: rowf[0],
          cli_identificacion: rowf[1],
          ope_descripcion: (rowf[2] === '' || rowf[2] === 'VACIO'||rowf[2] === 'vacio'||rowf[2] === ' ') ? null : rowf[2].toUpperCase(),
          ope_linea: (rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3].toUpperCase(),
          ope_producto: (rowf[4] === '' || rowf[4] === 'VACIO'||rowf[4] === 'vacio'||rowf[4] === ' ') ? null : rowf[4].toUpperCase(),
          ope_dias_mora: rowf[5].toString(),
          ope_interes_mora: rowf[6].toString(),
          ope_gastos_cobranzas: rowf[7].toString(),
          ope_saldo_cxc_actual: rowf[8].toString(),
          ope_saldo_cuota_actual: rowf[9].toString(),
          ope_saldo_capital_venc: rowf[10].toString(),
          ope_poner_aldia: rowf[11].toString(),
          ope_liquidar: rowf[12].toString(),
          ope_fecha_venc:
            this.solucionarFecha(rowf[13]) === ''
              ? null
              : this.solucionarFecha(rowf[13]),
          ope_plazo: rowf[14].toString(),
          ope_liquidado: rowf[15].toString(),
          ope_deuda_pagada: rowf[16].toString(),
          ope_fecha_pagada:
            this.solucionarFecha(rowf[17]) === ''
              ? null
              : this.solucionarFecha(rowf[17]),
          ope_provincia: rowf[18],
          ope_tiene_garante: rowf[19].toString(),
          ope_fecha_compra:
            this.solucionarFecha(rowf[20]) === ''
              ? null
              : this.solucionarFecha(rowf[20]),
          ope_observacion:(rowf[21] === '' || rowf[21] === 'VACIO'||rowf[21] === 'vacio'||rowf[21] === ' ') ? null : rowf[21].toUpperCase(),
          ope_abono_realizado: rowf[22].toString(),
          ope_valor_total_pag: rowf[23].toString(),
          ope_tipo_actualizacion: rowf[24],
          ope_total_vencido: rowf[25].toString(),
          ope_nom_segm_vencido: rowf[26],
          ope_categoria_cliente: rowf[27],
          ope_segmentacion: rowf[28],
          ope_promo_cuotas_gratis: rowf[29].toString(),
          ope_deuda_actual: rowf[30].toString(),
          ope_saldo_interes: rowf[31].toString(),
          ope_saldo_amortizacion: rowf[32].toString(),
          ope_int_cobra: rowf[33].toString(),
          ope_saldo_cobra_mora: rowf[34].toString(),
          ope_descu_campa_saldo_capit: rowf[35].toString(),
          ope_valor_descu_saldo_capit: rowf[36].toString(),
          ope_descrip_unidad_gestion: rowf[37],
          ope_id_ultima_gestion:
            rowf[38].toString() === '0'
              ? null
              : Number(rowf[38].toString()),
          ope_estado_contacta: rowf[39],
          ope_fecha_entrega:
            this.solucionarFecha(rowf[40]) === ''
              ? null
              : this.solucionarFecha(rowf[40]),
          id_cartera: Number(this.filtroCartera.value),
          ope_fecha_act: null,
          ope_fecha_desact: null,
          ope_fecha_in: null,
          ope_fecha_up: null,
          ope_esactivo: '1',
          ope_origendatos: 'Sistema_CobroSys',
          ope_baseactual: '1'
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'credito', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
      let datosactualizados:number=0;
      let datosnoinsertados:number=0;
      this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 2 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      }); 
    }
    if (this.valorSelecEntidad === '3') {
      for (const rowf of this.data) {
        let ocD: any = {
          cli_identificacion:rowf[0].toUpperCase(),
          cor_descripcion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
          cor_id_tipo_correo:rowf[2].toString(),
          cor_email:rowf[3]
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'correo', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
      let datosactualizados:number=0;
      let datosnoinsertados:number=0;
      this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          let listaDNoInsertados:any[]=[];
          this.isLoading=true;
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
    }
    if (this.valorSelecEntidad === '4') {
      for (const rowf of this.data) {
        let ocD: any = {
          cli_identificacion:rowf[0].toString(),
          dir_id_tipo_direccion:rowf[1].toString(),
          dir_completa:(rowf[2] === '' || rowf[2] === 'VACIO'||rowf[2] === 'vacio'||rowf[2] === ' ') ? null : rowf[2].toUpperCase(),
          dir_calle_principal:(rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3].toUpperCase(),
          dir_calle_secundaria:(rowf[4] === '' || rowf[4] === 'VACIO'||rowf[4] === 'vacio'||rowf[4] === ' ') ? null : rowf[4].toUpperCase(),
          dir_numero_casa:rowf[5]==='0'?null:rowf[5].toString(),
          dir_referencia:(rowf[6] === '' || rowf[6] === 'VACIO'||rowf[6] === 'vacio'||rowf[6] === ' ') ? null : rowf[6].toUpperCase(),
          dir_provincia:(rowf[7] === '' || rowf[7] === 'VACIO'||rowf[7] === 'vacio'||rowf[7] === ' ') ? null : rowf[7].toUpperCase(),
          dir_canton:(rowf[8] === '' || rowf[8] === 'VACIO'||rowf[8] === 'vacio'||rowf[8] === ' ') ? null : rowf[8].toUpperCase(),
          dir_parroquia:(rowf[9] === '' || rowf[9] === 'VACIO'||rowf[9] === 'vacio'||rowf[9] === ' ') ? null : rowf[9].toUpperCase()
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'direccion', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
      let datosactualizados:number=0;
      let datosnoinsertados:number=0;
      this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
    }
    if (this.valorSelecEntidad === '5') {
      for (const rowf of this.data) {
        let ocD: any = {
          cli_identificacion:rowf[0],
          gar_identificacion:rowf[1],
          gar_nombres:(rowf[2] === '' || rowf[2] === 'VACIO'||rowf[2] === 'vacio'||rowf[2] === ' ') ? null : rowf[2].toUpperCase(),
          gar_trabajo:(rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3].toString(),
          gar_direccion_dom:(rowf[4] === '' || rowf[4] === 'VACIO'||rowf[4] === 'vacio'||rowf[4] === ' ') ? null : rowf[4].toUpperCase(),
          gar_direccion_trabajo:(rowf[5] === '' || rowf[5] === 'VACIO'||rowf[5] === 'vacio'||rowf[5] === ' ') ? null : rowf[5].toUpperCase(),
          gar_telefono_domicilio:rowf[6]===' '?null:rowf[6],
          gar_telefono_trabajo:rowf[7]===' '?null:rowf[7],
          gar_telefono_adicional:rowf[8]===' '?null:rowf[8],
          gar_observacion:(rowf[9] === '' || rowf[9] === 'VACIO'||rowf[9] === 'vacio'||rowf[9] === ' ') ? null : rowf[9].toUpperCase()
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'garante', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
    }
    if (this.valorSelecEntidad === '6') {
      for (const rowf of this.data) {
        let ocD: any = {
          cli_identificacion:rowf[0],
          tel_numero:rowf[1].toString(),
          tel_observacion:rowf[2]===' '?null:rowf[2].toUpperCase(),
          tel_operadora:rowf[3]===' '?null:rowf[3].toString(),
          tel_tipo_operadora:rowf[4]===' '?null:rowf[4].toUpperCase(),
          tel_id_tipo_telefono:rowf[5]===' '?null:rowf[5].toString(),
          tel_id_detal_telefono:rowf[6]===' '?null:rowf[6].toString()
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'telefono', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
      let datosactualizados:number=0;
      let datosnoinsertados:number=0;
      this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 2 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
    }
    if (this.valorSelecEntidad === '7') {
      for (const rowf of this.data) {
        let ocD: any = {
          cli_identificacion:rowf[0],
          tra_ruc:rowf[1],
          tra_descripcion:rowf[2]===' '?null:rowf[2].toUpperCase(),
          tra_direccion:rowf[3]===' '?null:rowf[3].toUpperCase(),
          tra_telefono:rowf[4]===' '?null:rowf[4],
          tra_correo:rowf[5]===' '?null:rowf[5].toString(),
          tra_observacion:rowf[6]===' '?null:rowf[6].toUpperCase(),
          tra_id_tipo_trabajo:rowf[7],
        };
        this.CargaMasivaPost.push(ocD);
      }
      let om: cargaMasiva = {
        entidad: 'trabajo', listado: this.CargaMasivaPost
      };
      let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          let listaDNoInsertados:any[]=[];
          this.isLoading=true;
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
    }
  if (this.valorSelecEntidad === '8') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_correo:rowf[0],
        corr_tip_descripcion: rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoCorreo', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      listaDNoInsertados=row['data'];
                      datosnoinsertados=row['data'].length;
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '9') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_telefono:rowf[0],
        tel_tip_descripcion: rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoTelefono', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '10') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_direccion:rowf[0],
        dir_tip_descripcion: rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoDireccion', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '11') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_detalle_telefono:rowf[0],
        tel_detal_descripcion: rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'detalleTelefono', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '12') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_trabajo:rowf[0],
        trab_tip_descripcion: rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoTrabajo', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '13') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_contactabilidad:rowf[0],
        contac_descripcion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'contactibilidad', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '14') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_conectividad:rowf[0],
        conec_descripcion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'conectividad', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '15') {
    for (const rowf of this.data) {
      let ocD: any = {
        cuent_nombre:(rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : rowf[0].toUpperCase(),
        cuent_numero:(rowf[2]==='0'||rowf[2]==='VACIO'||rowf[2]==='vacio'||rowf[2]===''||rowf[2]===' ')?null:rowf[2].toString(),
        cuent_entidadfinanciera:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'cuenta', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '16') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_gestion:rowf[0],
        gestion_tip_descripcion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoGestion', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '17') {
    for (const rowf of this.data) {
      let ocD: any = {
        cart_descripcion:(rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : rowf[0].toUpperCase(),
        cart_observacion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
        id_tipo_cartera:rowf[2]
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'cartera', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '18') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_cartera:rowf[0],
        cart_tip_descripcion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoCartera', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '19') {
    for (const rowf of this.data) {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDaten = new Date(rowf[4]).toISOString().split('T')[0];
      const minDatesa = new Date(rowf[5]).toISOString().split('T')[0];
      let ocD: any = {
        ges_nombres: (rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : rowf[0].toUpperCase(),
        ges_apellidos: (rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
        ges_esgestor: (rowf[2].toString() === '' || rowf[2].toString() === 'VACIO'||rowf[2].toString() === 'vacio'||rowf[2].toString() === ' '||rowf[2].toString() === '0') ? null : rowf[2].toString(),
        ges_observacion:(rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3].toUpperCase(),
        ges_fecha_entrada:
          this.solucionarFecha(rowf[4]) === '' ? minDate : minDaten,
        ges_fecha_salida:
          this.solucionarFecha(rowf[5]) === '' ? minDate : minDatesa,
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'gestor', listado: this.CargaMasivaPost
    };
    let datosMantienen:number=0;
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      datosMantienen=row['data'].length;
                      listaMantienen=row['data'];
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + datosMantienen + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '20') {
    for (const rowf of this.data) {
      let ocD: any = {
        cli_identificacion: rowf[0],
        id_gestor: rowf[1].toString(),
        id_cartera:this.filtroCartera.value,
        cgc_observacion: (rowf[2] === '' || rowf[2] === 'VACIO'||rowf[2] === 'vacio'||rowf[2] === ' ') ? null : rowf[2].toUpperCase(),
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'asignacion', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          let listaDNoInsertados:any[]=[];
          this.isLoading=true;
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }

                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '21') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_cuenta: (rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : rowf[0],
        id_cartera:Number(this.filtroCartera.value),
        ctipcar_observacion:(rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
      };
      this.CargaMasivaPost.push(ocD);
    }
    console.log(this.CargaMasivaPost);
    let om: cargaMasiva = {
      entidad: 'cuentaCartera', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'].length;
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '22') {
    for (const rowf of this.data) {
      let ocD: any = {
        id_tipo_gestion: rowf[0].toString(),
        id_conectividad: rowf[1].toString(),
        id_contactabilidad: rowf[2].toString(),
        tipges_per_edi:rowf[3].toString()
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'tipoGCC', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosactualizados:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      listaMantienen.push(row);
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'];
                    }
                    if (row['exito'] === 2) {
                      datosactualizados=row['data'];
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'];
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + listaMantienen.length + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + datosactualizados + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '23') {
    for (const rowf of this.data) {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDate1 = new Date(rowf[10]).toISOString().split('T')[0];
      const minDate2 = new Date(rowf[11]).toISOString().split('T')[0];
      const minDate3 = new Date(rowf[12]).toISOString().split('T')[0];
      const minDate4 = new Date(rowf[21]).toISOString().split('T')[0];
      const minDate5 = new Date(rowf[22]).toISOString().split('T')[0];
      let ocD: any = {
        id_gestor: (rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : Number(rowf[0]),
        cli_identificacion: (rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1].toUpperCase(),
        ope_cod_credito: (rowf[2].toString() === '' || rowf[2].toString() === 'VACIO'||rowf[2].toString() === 'vacio'||rowf[2].toString() === ' '||rowf[2].toString() === '0') ? null : rowf[2].toString(),
        gest_id_gestor_asign:(rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3],
        gest_id_tipo_gestion:(rowf[4] === '' || rowf[4] === 'VACIO'||rowf[4] === 'vacio'||rowf[4] === ' ') ? null : rowf[4],
        gest_id_contactabilidad:(rowf[5] === '' || rowf[5] === 'VACIO'||rowf[5] === 'vacio'||rowf[5] === ' ') ? null : rowf[5],
        gest_id_conectividad:(rowf[6] === '' || rowf[6] === 'VACIO'||rowf[6] === 'vacio'||rowf[6] === ' ') ? null : rowf[6],
        gest_id_contacto:(rowf[7] === '' || rowf[7] === 'VACIO'||rowf[7] === 'vacio'||rowf[7] === ' ') ? null : rowf[7],
        gest_num_contacto:(rowf[8] === '' || rowf[8] === 'VACIO'||rowf[8] === 'vacio'||rowf[8] === ' ') ? null : rowf[8].toString(),
        gest_gestion_mediante:(rowf[9] === '' || rowf[9] === 'VACIO'||rowf[9] === 'vacio'||rowf[9] === ' ') ? null : rowf[9].toUpperCase(),
        gest_fecha_compromiso:this.solucionarFecha(rowf[10]) === '' ? minDate : minDate1,
        gest_fecha_incumplido:this.solucionarFecha(rowf[11]) === '' ? minDate : minDate2,
        gest_descripcion:(rowf[12] === '' || rowf[12] === 'VACIO'||rowf[12] === 'vacio'||rowf[12] === ' ') ? null : rowf[12].toUpperCase(),
        gest_valor_comp:(rowf[13] === '' || rowf[13] === 'VACIO'||rowf[13] === 'vacio'||rowf[13] === ' ') ? null : rowf[13].toString(),
        gest_abonos:(rowf[14] === '' || rowf[14] === 'VACIO'||rowf[14] === 'vacio'||rowf[14] === ' ') ? null : rowf[14].toString(),
        gest_num_coutas:(rowf[14] === '' || rowf[15] === 'VACIO'||rowf[15] === 'vacio'||rowf[15] === ' ') ? null : rowf[15].toString(),
        gest_num_coutas_res:(rowf[16] === '' || rowf[16] === 'VACIO'||rowf[16] === 'vacio'||rowf[16] === ' ') ? null : rowf[16].toString(),
        gest_couta:(rowf[17] === '' || rowf[17] === 'VACIO'||rowf[17] === 'vacio'||rowf[17] === ' ') ? null : rowf[17].toString(),
        gest_valor_a_cobrar:(rowf[18] === '' || rowf[18] === 'VACIO'||rowf[18] === 'vacio'||rowf[18] === ' ') ? null : rowf[18].toString(),
        gest_valor_incumplido:(rowf[19] === '' || rowf[19] === 'VACIO'||rowf[19] === 'vacio'||rowf[19] === ' ') ? null : rowf[19].toString(),
        gest_fecha_prox_pago:this.solucionarFecha(rowf[20]) === '' ? minDate : minDate3,
        gest_fecha_conv:this.solucionarFecha(rowf[21]) === '' ? minDate : minDate4,
        gest_observacion:(rowf[22] === '' || rowf[22] === 'VACIO'||rowf[22] === 'vacio'||rowf[22] === ' ') ? null : rowf[22].toUpperCase(),
        gest_certificado:(rowf[23] === '' || rowf[23] === 'VACIO'||rowf[23] === 'vacio'||rowf[23] === ' ') ? null : rowf[23].toString(),
        gest_volver_llamar:(rowf[24] === '' || rowf[24] === 'VACIO'||rowf[24] === 'vacio'||rowf[24] === ' ') ? null : rowf[24].toString(),
        gest_fecha_volver_llamar:this.solucionarFecha(rowf[25]) === '' ? minDate : minDate5,
        gest_hora_volver_llamar:(rowf[26] === '' || rowf[26] === 'VACIO'||rowf[26] === 'vacio'||rowf[26] === ' ') ? null : rowf[26].toString(),
        gest_perdio_contacto:(rowf[27] === '' || rowf[27] === 'VACIO'||rowf[27] === 'vacio'||rowf[27] === ' ') ? null : rowf[27].toString(),
        gest_id_cartera:Number(this.filtroCartera.value)
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'gestion', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosMantienen:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          let listaDNoInsertados:any[]=[];
          this.isLoading=true;
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      datosMantienen=row['data'].length;
                      listaMantienen=row['data'];
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + datosMantienen + ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + 0 + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  if (this.valorSelecEntidad === '24') {
    for (const rowf of this.data) {
      const minDate = new Date('1969-12-31').toISOString().split('T')[0];
      const minDaten = new Date(rowf[14]).toISOString().split('T')[0];
      const minDatesa = new Date(rowf[15]).toISOString().split('T')[0];
      let ocD: any = {
        cli_identificacion: (rowf[0] === '' || rowf[0] === 'VACIO'||rowf[0] === 'vacio'||rowf[0] === ' ') ? null : rowf[0],
        id_gestor: (rowf[1] === '' || rowf[1] === 'VACIO'||rowf[1] === 'vacio'||rowf[1] === ' ') ? null : rowf[1],
        ope_cod_credito: (rowf[2].toString() === '' || rowf[2].toString() === 'VACIO'||rowf[2].toString() === 'vacio'||rowf[2].toString() === ' '||rowf[2].toString() === '0') ? null : rowf[2].toString(),
        id_cuenta:(rowf[3] === '' || rowf[3] === 'VACIO'||rowf[3] === 'vacio'||rowf[3] === ' ') ? null : rowf[3],
        pag_pago:(rowf[4] === '' || rowf[4] === 'VACIO'||rowf[4] === 'vacio'||rowf[4] === ' ') ? null : rowf[4].toString(),
        pag_valor_total_comprobante:(rowf[5] === '' || rowf[5] === 'VACIO'||rowf[5] === 'vacio'||rowf[5] === ' ') ? null : rowf[5].toString(),
        pag_observacion_pago:(rowf[6] === '' || rowf[6] === 'VACIO'||rowf[6] === 'vacio'||rowf[6] === ' ') ? null : rowf[6].toUpperCase(),
        pag_codigo_comprobante:(rowf[7] === '' || rowf[7] === 'VACIO'||rowf[7] === 'vacio'||rowf[7] === ' ') ? null : rowf[7].toString(),
        pag_url_comprobante:(rowf[8] === '' || rowf[8] === 'VACIO'||rowf[8] === 'vacio'||rowf[8] === ' ') ? null : rowf[8].toString(),
        pag_observ_comprobante:(rowf[9] === '' || rowf[9] === 'VACIO'||rowf[9] === 'vacio'||rowf[9] === ' ') ? null : rowf[9].toUpperCase(),
        pag_pago_verificado:(rowf[10] === '' || rowf[10] === 'VACIO'||rowf[10] === 'vacio'||rowf[10] === ' ') ? null : rowf[10].toString(),
        pag_id_gestor_ingresa:(rowf[11] === '' || rowf[11] === 'VACIO'||rowf[11] === 'vacio'||rowf[11] === ' ') ? null : rowf[11],
        pag_id_gestor_verifica:(rowf[12] === '' || rowf[12] === 'VACIO'||rowf[12] === 'vacio'||rowf[12] === ' ') ? null : rowf[12],
        pag_mes_pago:(rowf[13] === '' || rowf[13] === 'VACIO'||rowf[13] === 'vacio'||rowf[13] === ' ') ? null : rowf[13].toUpperCase(),
        pag_fecha_pago:this.solucionarFecha(rowf[14]) === '' ? minDate : minDaten,
        pag_fecha_verificacion:this.solucionarFecha(rowf[15]) === '' ? minDate : minDatesa,
        pag_medio_contacto:(rowf[16] === '' || rowf[16] === 'VACIO'||rowf[16] === 'vacio'||rowf[16] === ' ') ? null : rowf[16].toUpperCase(),
        id_cartera:Number(this.filtroCartera.value)
      };
      this.CargaMasivaPost.push(ocD);
    }
    let om: cargaMasiva = {
      entidad: 'pagos', listado: this.CargaMasivaPost
    };
    let datosinsertados:number=0;
    let datosmantienen:number=0;
    let datosnoinsertados:number=0;
    this.alerta.AlertaProcesadosBien('!Esperar por lo menos de 1 a 3 min, luego de este tiempo se podra apreciar las otras alertas informativas que saben aparecer cuando este proceso de carga finalice!!').then((result) => {
        if (result) {
          this.isLoading=true;
          let listaDNoInsertados:any[]=[];
          const start = performance.now();
          this.api
            .PostCargaMasiva(om)
            .pipe(
              map((tracks) => {
                let cont: number = 0;
                const exito = tracks['exito'];
                if (exito == 1) {
                  for (const row of tracks['data']) {
                    if (row['exito'] === 4) {
                      datosmantienen=row['data'].length;
                      listaMantienen=row['data'];
                    }
                    if (row['exito'] === 3) {
                      datosnoinsertados=row['data'].length;
                      listaDNoInsertados=row['data'];
                    }
                    if (row['exito'] === 1) {
                      datosinsertados=row['data'].length;
                    }
                    cont += 1;
                  }//fin del for
                  const end = performance.now();
                  const inSeconds = (end - start) / 1000;
                  const rounded = Number(inSeconds).toFixed(3);
                  console.log(rounded + ' en segundos');
                  /******************************************************************************/
                  const msg1M = 'Se han Mantenido  ' + datosmantienen+ ' ' + 'datos';
                  const msg2M = 'Se han Actualizado ' + 0 + ' ' + 'datos';
                  const msg3M = 'Se han Registrado ' + datosinsertados + ' ' + 'datos';
                  const msg4M = 'No se han Registrado ' + datosnoinsertados + ' ' + 'datos';
                  this.mostrar4Alertas(msg1M, msg2M, msg3M, msg4M);
                  if(listaDNoInsertados.length>0)
                    {
                      const wb = XLSX.utils.book_new();
                      const wsTelefono = XLSX.utils.json_to_sheet(listaDNoInsertados);
                      XLSX.utils.book_append_sheet(wb, wsTelefono, 'DatosInexistentes');
                      XLSX.writeFile(wb, 'informeDatosInexistentes.xlsx');
                    }
                  this.data.filter((elemento): any => {
                    if (elemento[0] === tracks['data']['data']) {
                      this.eliminarObjeto(elemento);
                    }
                  });
                } else {
                  this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
                }
                this.isLoading = false;
              }),
              catchError((error) => {
                this.alerta.ErrorEnLaOperacion();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      });
  }
  }
}

