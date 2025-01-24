import { Token } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Encriptacion } from 'src/app/Control/EncryptDescrypt';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import {
  LoginISD,
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import {
  ClienteI,
  ConectividadI,
  ContactabilidadI,
  CorreoI,
  CuentaI,
  CxcOperacionI,
  DetalleTelefonoI,
  DireccionI,
  FiltroGestion,
  FiltroPagos,
  GaranteI,
  GestionCG,
  GestionarPropio,
  GestorI,
  NotificacionI,
  TelefonoI,
  Tipo_CorreoI,
  Tipo_DireccionI,
  Tipo_GestionI,
  Tipo_TelefonoI,
  Tipo_TrabajoI,
  TrabajoI,
  generarPDF,
} from 'src/app/Modelos/response.interface';
import { PersonasI } from 'src/app/Modelos/servidata.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';
// @Injectable({providedIn:'root'})

@Component({
  selector: 'app-gestionar',
  templateUrl: './gestionar.component.html',
  styleUrls: ['./gestionar.component.css'],
})
export class GestionarComponent implements OnInit {


  // ============================================================ DOCUMENTOS  ============================================================================

  DocumentosItem = [
    { id: 1, name: 'Cargar', label: 'CARGAR', icon1:'fa-solid fa-envelopes-bulk', icon2:'fa-solid fa-upload', type: 'number', required: true },
    { id: 2, name: 'Descargar', label: 'DESCARGAR', icon1:'fa-solid fa-file-lines', icon2:'fa-solid fa-download', type: 'text', required: true },
  ];

  form: FormGroup;

  onFormReady(form: FormGroup) {
    this.form = form; // Recibir el formulario dinámico
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Formulario válido:', this.form.value);
    } else {
      console.log('Formulario inválido');
    }
  }













  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService,
    private route: ActivatedRoute,
    public validar: TipoDeTexto,
    private router: Router,public reporte:GeneradorReporte
  ) {}

  PaginaEstilo: string = '';
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gGestion!:generarPDF;

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    let cli = this.route.snapshot.paramMap.get('cli');
    let car = this.route.snapshot.paramMap.get('car');
    let ges = this.route.snapshot.paramMap.get('ges');
    if (this.cookeService.get('token')) {
      this.SesionServiData = true;
    }
    if (id == 'O') {
      this.PaginaEstilo = id;
    } else {
      if (cli && car && ges) {
        let varin = {
          identificacion: cli,
          id_cartera: Number(car),
        };
        this.BuscarInfCliente(varin, 0);
        if (ges != '0') {
          let filtro: FiltroGestion = {
            tipo: 10,
            identificacion: '0',
            nombres_cliente: '0',
            cartera: [0],
            gestor: Number(ges),
            contactabilidad: 0,
            fecha_inicial: this.fechas.fecha(),
            fecha_final: this.fechas.fecha(),
            ultima_gestion: '1',
          };
          this.api
            .GetGestionFracionadoFiltro(filtro)
            .pipe(
              map((tracks) => {
                let datos = tracks['data'];
                this.CargarElemento(datos, 0);
              }),
              catchError((error) => {
                this.loading = false;
                this.alerta.ErrorAlRecuperarElementos();
                throw new Error(error);
              })
            )
            .subscribe();
        }
      } else {
        this.CarterasGestor();
        if (this.Rol == 'ADMINISTRADOR' || this.Rol == 'SUPERVISOR') {
          this.BuscarForms.patchValue({
            cartera: this.TodasCarteras[this.TodasCarteras.length - 1],
          });
        } else {
          this.ListarElementos(1);
        }
      }
    }
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gGestion);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gGestion);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gGestion);
    }
  }
  Animacion() {}

  CarteraGestor: any[] = [];
  TodasCarteras: number[] = [];
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Rol: string = this.Usuario.ges_rol;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  Cartera: ResultadoCarteraI[] = this.permisos.cartera;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'gestionar';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;

  CarterasGestor() {
    for (let datos of this.Cartera) {
      let cartera: any = {
        cart_id: Number(datos.cart_id),
        cart_descripcion: datos.cart_descripcion,
        cart_tip_descripcion: datos.cart_tip_descripcion,
      };
      this.CarteraGestor.push(cartera);
      this.TodasCarteras.push(cartera.cart_id);
    }
  }

  // ****************************************** CONTROLADORES PARA BUSQUEDA *****************************************************************
  OpcionesBusqueda: any[] = [
    { id: 1, name: 'Identificación', value: 1 },
    { id: 2, name: 'Nombre', value: 2 },
    { id: 3, name: 'Teléfono', value: 3 },
    { id: 4, name: 'Email', value: 4 },
    // { id: 5, name: 'CLI_ID', value: 5 },
  ];
  // ****************************************** CONTROLES *****************************************************************
  OpcionesPagos: any[] = [
    { id: 0, name: 'Todos', value: '0' },
    { id: 1, name: 'SI', value: '1' },
    { id: 2, name: 'NO', value: '2' },
  ];
  OpcionesPrioridades: any[] = [
    { id: 0, name: 'Ninguno', value: '0' },
    { id: 1, name: 'SI', value: '1' },
    { id: 2, name: 'NO', value: '2' },
  ];
  BuscarForms = new FormGroup({
    identificacion: new FormControl('', Validators.required),
    nombres_cliente: new FormControl('', Validators.required),
    cartera: new FormControl(0, Validators.required),
    gestor: new FormControl(0, Validators.required),
    contactabilidad: new FormControl('0', Validators.required),
    pago: new FormControl('0'),
    prioridad: new FormControl('0', Validators.required),
    monto_min: new FormControl(''),
    monto_max: new FormControl('', Validators.required),
    meses: new FormControl('', Validators.required),
  });

  ResetClienteForms() {
    this.BuscarForms.reset({
      identificacion: '',
      nombres_cliente: '',
      cartera: 0,
      gestor: 0,
      contactabilidad: '0',
      pago: '0',
      prioridad: '0',
      monto_min: '',
      monto_max: '',
      meses: '',
    });
  }

  ListaContactabilidad: ContactabilidadI[] = [];

  ListarContactabilidad() {
    this.ListaContactabilidad = [];
    this.api
      .GetContactabilidadFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.ListaContactabilidad = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  ListaGestores: GestorI[] = [];

  ListarGestores() {
    this.ListaGestores = [];
    this.api
      .GetGestoresFracionadoFiltro('g', 20)
      .pipe(
        map((tracks) => {
          this.ListaGestores = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  // ParametrosDeBusqueda: Array<string> = [
  //   '',
  //   'Descripción',
  //   'Descripción Incompleta',
  //   'Estado',
  // ];
  // ParametrosEstado: any[] = [
  //   { name: 'Activo', value: 1 },
  //   { name: 'Inactivo', value: 0 },
  //   // { name: 'Eliminados', value: 3 },
  // ];

  // itemBusqueda = new FormControl('', [Validators.required]);
  // txtBusqueda = new FormControl('', [Validators.required]);

  // GetBusquedaPor(item: string) {
  //   this.itemBusqueda.patchValue(item);
  //   this.txtBusqueda.patchValue('');
  //   const inputElement = document.getElementById(
  //     'txtValorBusqueda'
  //   ) as HTMLInputElement;

  //   if (item.length > 0 && inputElement != null) {
  //     inputElement.focus();
  //   }
  // }

  // ConvertirMayusculas() {
  //   this.txtBusqueda.patchValue(this.txtBusqueda.value!.toUpperCase());
  // }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaGestionar: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    if (num === 1) {
      this.FraccionDatos = 0;
    }
    let datos = this.BuscarForms.value;

    let filtro: GestionCG = {
      identificacion: (datos.identificacion == ''
        ? '0'
        : datos.identificacion)!,
      nombres_cliente: (datos.nombres_cliente == ''
        ? '0'
        : datos.nombres_cliente)!,
      cartera:
        datos.cartera == 0 ? this.TodasCarteras : [Number(datos.cartera)],
      // cartera: [7,10],
      gestor: datos.gestor!,
      contactabilidad: (datos.nombres_cliente == '0'
        ? 0
        : Number(datos.contactabilidad))!,
      pago: (datos.pago == '0' ? '0' : datos.pago)!,
      prioridad: (datos.prioridad == '0' ? '0' : datos.prioridad)!,
      monto_min: (datos.monto_min == '' ? '0' : datos.monto_min)!,
      monto_max: (datos.monto_max == '' ? '0' : datos.monto_max)!,
      meses: Number(datos.meses),
      tipo: 0,
      codigo: this.FraccionDatos,
      rango: this.RangoDatos,
    };
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.ListaGestionar = [];
    this.api
      .GetGestionarFracionado(filtro)
      .pipe(
        map((tracks) => {
          this.ListaGestionar = tracks['data'];
          for (const objeto of this.ListaGestionar)
            {
              let ocD: any = {
                Cedula:objeto.identificacion,
                Nombre:objeto.nombres_cli,
                Estado:objeto.estado_cli,
                SaldoTC:objeto.saldo_t,
                SaldoCXC:objeto.saldo_cxc,
                PagoActual:objeto.pago_actual,
                Gestor:objeto.gestor,
                Cartera:objeto.cartera,
                Provincia:objeto.provincia_cli,
                Certificado:(objeto.certificado===null||objeto.certificado==='0')?'NO':'SI',
                Ultimagestion:objeto.ultima_gestion==null?null:this.fechas.fechaCortaAbt(objeto.ultima_gestion),
                RangoEdad:objeto.edad_cli,
                Creditos:objeto.creditos
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'misClientes', listado: listadoObjeto
            };
            this.gGestion=om;
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaGestionar.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
            this.ContadorDatosGeneral = 0;
            this.ContadorDatos = 0;
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaGestionar.length;
            this.FraccionarValores(this.ListaGestionar, this.ConstanteFraccion);
          }
          CargandoLoad.classList.remove('modal--show');
        }),
        catchError((error) => {
          this.loading = false;
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  /************************************** AGREGAR ELEMENTO  ******************************************************** */
  TituloFormulario = '';
  Cliente: string = '';

  GestionForms = new FormGroup(
    {
      id_gestion: new FormControl(0, Validators.required),
      id_gestor: new FormControl(0, Validators.required),
      cli_identificacion: new FormControl(''),
      ope_cod_credito: new FormControl(''),
      gest_id_cartera: new FormControl(0, Validators.required),
      gest_id_gestor_asign: new FormControl(0, Validators.required),
      gest_id_tipo_gestion: new FormControl(0, [
        Validators.required,
        this.validar.VFN_SoloNumeros(),
      ]),
      gest_id_contactabilidad: new FormControl(0, [
        Validators.required,
        this.validar.VFN_SoloNumeros(),
      ]),
      gest_id_conectividad: new FormControl(0, [
        Validators.required,
        this.validar.VFN_SoloNumeros(),
      ]),
      gest_id_contacto: new FormControl(0, [
        Validators.required,
        this.validar.VFN_NumDiferDeCero(),
      ]),
      gest_num_contacto: new FormControl(''),
      gest_gestion_mediante: new FormControl(''),
      gest_fecha_gestion: new FormControl(''),
      gest_hora_gestion: new FormControl(''),
      gest_fecha_compromiso: new FormControl(''),
      gest_fecha_incumplido: new FormControl(''),
      gest_descripcion: new FormControl('', Validators.required),
      gest_valor_comp: new FormControl('', [
        this.validar.VFN_NumerosDesimales(),
      ]),
      gest_abonos: new FormControl('', [this.validar.VFN_NumerosDesimales()]),
      gest_num_coutas: new FormControl('', [this.validar.VFN_SoloNumeros()]),
      gest_num_coutas_res: new FormControl('', [
        this.validar.VFN_SoloNumeros(),
      ]),
      gest_couta: new FormControl('', [this.validar.VFN_NumerosDesimales()]),
      gest_valor_a_cobrar: new FormControl('', [
        this.validar.VFN_NumerosDesimales(),
      ]),
      gest_valor_incumplido: new FormControl(''),
      gest_fecha_prox_pago: new FormControl(''),
      gets_fecha_conv: new FormControl(''),
      gest_observacion: new FormControl(''),
      gest_certificado: new FormControl(false),
      gest_volver_llamar: new FormControl(false),
      gest_fecha_volver_llamar: new FormControl(''),
      gest_hora_volver_llamar: new FormControl(''),
      gest_perdio_contacto: new FormControl(false),
      gest_esgestion_real: new FormControl(true),
      gest_fecha_in: new FormControl(this.fechas.fecha()),
      gest_fecha_up: new FormControl(this.fechas.fecha()),
      gest_esactivo: new FormControl(true),
      editable: new FormControl(0),
    },
    {
      validators: [
        this.validar.ValidatorCamposDependientes2(
          'editable',
          'gest_fecha_incumplido'
        ),
        this.validar.ValidatorCamposDependientes2(
          'editable',
          'gest_valor_incumplido'
        ),
        this.validar.ValidatorCamposDependientes(
          'editable',
          'gest_fecha_compromiso'
        ),
        this.validar.ValidatorCamposDependientes(
          'editable',
          'gest_fecha_prox_pago'
        ),
        this.validar.ValidatorCamposDependientes('editable', 'gest_valor_comp'),
        this.validar.ValidatorCamposDependientes('editable', 'gest_abonos'),
        this.validar.ValidatorCamposDependientes('editable', 'gest_num_coutas'),
        this.validar.ValidatorCamposDependientes(
          'editable',
          'gest_num_coutas_res'
        ),
        this.validar.ValidatorCamposDependientes('editable', 'gest_couta'),
        this.validar.ValidatorCamposDependientes(
          'editable',
          'gest_valor_a_cobrar'
        ),

        this.validar.validarVolverLlamar(),
      ],
    }
  );

  ResetGestionForms() {
    this.GestionForms.reset({
      id_gestion: 0,
      id_gestor: 0,
      cli_identificacion: '',
      ope_cod_credito: '',
      gest_id_cartera: 0,
      gest_id_gestor_asign: 0,
      gest_id_tipo_gestion: 0,
      gest_id_contactabilidad: 0,
      gest_id_conectividad: 0,
      gest_id_contacto: 0,
      gest_num_contacto: '',
      gest_gestion_mediante: '',
      gest_fecha_gestion: '',
      gest_hora_gestion: '',
      gest_fecha_compromiso: '',
      gest_fecha_incumplido: '',
      gest_descripcion: '',
      gest_valor_comp: '',
      gest_abonos: '',
      gest_num_coutas: '',
      gest_num_coutas_res: '',
      gest_couta: '',
      gest_valor_a_cobrar: '',
      gest_valor_incumplido: '',
      gest_fecha_prox_pago: '',
      gets_fecha_conv: '',
      gest_observacion: '',
      gest_certificado: false,
      gest_volver_llamar: false,
      gest_fecha_volver_llamar: '',
      gest_hora_volver_llamar: '',
      gest_perdio_contacto: false,
      gest_esgestion_real: true,
      gest_fecha_in: this.fechas.fecha(),
      gest_fecha_up: this.fechas.fecha(),
      gest_esactivo: true,
      editable: 0,
    });
    this.CamposVisuales.patchValue(0);
  }

  ResetGestionFormsEspecificos() {
    this.GestionForms.patchValue({
      gest_valor_comp: '',
      gest_abonos: '',
      gest_num_coutas: '',
      gest_num_coutas_res: '',
      gest_couta: '',
      gest_valor_a_cobrar: '',
      gest_valor_incumplido: '',
      gest_fecha_compromiso: '',
      gest_fecha_prox_pago: '',
      gets_fecha_conv: '',
      gest_fecha_incumplido: '',
      gest_certificado: false,
      gest_volver_llamar: false,
      gest_fecha_volver_llamar: '',
      gest_hora_volver_llamar: '',
      gest_perdio_contacto: false,
    });
  }

  ResetGestionFormsLimpiar() {
    this.TituloFormulario = 'Gestionar';
    this.CamposVisuales.patchValue(0);
    this.ListaTipoGestion = [];
    this.ListaConectividad = [];
    this.ListaContactabilidadGestion = [];
    this.ListaConectividad = [];
    this.GestionForms.patchValue({
      id_gestion: 0,
      gest_id_tipo_gestion: 0,
      gest_id_conectividad: 0,
      gest_id_contactabilidad: 0,
      gest_id_contacto: 0,
      gest_num_contacto: '',
      gest_gestion_mediante: '',
      gest_fecha_gestion: '',
      gest_hora_gestion: '',
      gest_fecha_compromiso: '',
      gest_fecha_incumplido: '',
      gest_descripcion: '',
      gest_valor_comp: '',
      gest_abonos: '',
      gest_num_coutas: '',
      gest_num_coutas_res: '',
      gest_couta: '',
      gest_valor_a_cobrar: '',
      gest_valor_incumplido: '',
      gest_fecha_prox_pago: '',
      gets_fecha_conv: '',
      gest_observacion: '',
      gest_certificado: false,
      gest_volver_llamar: false,
      gest_fecha_volver_llamar: '',
      gest_hora_volver_llamar: '',
      gest_perdio_contacto: false,
      editable: 0,
    });
  }

  ResetGestionFormsNoContactado() {
    this.ListarTG_Cone_Contac(0);

    let tipo = 0;
    this.api
      .GetTG_Predeterminados(tipo)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'][0];
          if (datos.length == 0) {
            this.alerta.NoExistenDatos();
          } else {
            this.GestionForms.patchValue({
              id_gestion: 0,
              gest_id_tipo_gestion: datos.id_tipo_gestion,
              gest_id_conectividad: datos.id_conectividad,
              gest_id_contactabilidad: datos.id_contactabilidad,
              gest_id_contacto: 0,
              gest_num_contacto: '',
              gest_descripcion: 'NO CONTESTA NUMEROS REGISTRADOS',
            });
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

  VolverLlamarCheck() {
    this.GestionForms.patchValue({
      gest_fecha_volver_llamar: '',
      gest_hora_volver_llamar: '',
    });
  }

  UltimaGestion() {
    let filtro: FiltroGestion = {
      tipo: 11,
      identificacion: this.GestionForms.get('cli_identificacion')?.value!,
      nombres_cliente: this.GestionForms.get('ope_cod_credito')?.value!,
      cartera: [0],
      gestor: Number(this.Usuario.id_gestor),
      contactabilidad: 0,
      fecha_inicial: this.fechas.fecha(),
      fecha_final: this.fechas.fecha(),
      ultima_gestion: '1',
    };
    this.api
      .GetGestionFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          if (datos == null) {
            this.alerta.NoExistenDatos();
          } else {
            this.CargarElemento(datos, 0);
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

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.GestionForms.get('id_gestion')?.disable();
      this.GestionForms.get('id_gestor')?.disable();
      this.GestionForms.get('cli_identificacion')?.disable();
      this.GestionForms.get('ope_cod_credito')?.disable();
      this.GestionForms.get('gest_id_cartera')?.disable();
      this.GestionForms.get('gest_id_gestor_asign')?.disable();
      this.GestionForms.get('gest_id_tipo_gestion')?.disable();
      this.GestionForms.get('gest_id_contactabilidad')?.disable();
      this.GestionForms.get('gest_id_conectividad')?.disable();
      this.GestionForms.get('gest_id_contacto')?.disable();
      this.GestionForms.get('gest_num_contacto')?.disable();
      this.GestionForms.get('gest_gestion_mediante')?.disable();
      this.GestionForms.get('gest_fecha_gestion')?.disable();
      this.GestionForms.get('gest_hora_gestion')?.disable();
      this.GestionForms.get('gest_fecha_compromiso')?.disable();
      this.GestionForms.get('gest_fecha_incumplido')?.disable();
      this.GestionForms.get('gest_descripcion')?.disable();
      this.GestionForms.get('gest_valor_comp')?.disable();
      this.GestionForms.get('gest_abonos')?.disable();
      this.GestionForms.get('gest_num_coutas')?.disable();
      this.GestionForms.get('gest_num_coutas_res')?.disable();
      this.GestionForms.get('gest_couta')?.disable();
      this.GestionForms.get('gest_valor_a_cobrar')?.disable();
      this.GestionForms.get('gest_valor_incumplido')?.disable();
      this.GestionForms.get('gest_fecha_prox_pago')?.disable();
      this.GestionForms.get('gets_fecha_conv')?.disable();
      this.GestionForms.get('gest_observacion')?.disable();
      this.GestionForms.get('gest_certificado')?.disable();
      this.GestionForms.get('gest_volver_llamar')?.disable();
      this.GestionForms.get('gest_fecha_volver_llamar')?.disable();
      this.GestionForms.get('gest_hora_volver_llamar')?.disable();
      this.GestionForms.get('gest_perdio_contacto')?.disable();
      this.GestionForms.get('gest_esgestion_real')?.disable();
      this.GestionForms.get('gest_fecha_act')?.disable();
      this.GestionForms.get('gest_fecha_desact')?.disable();
      this.GestionForms.get('gest_fecha_in')?.disable();
      this.GestionForms.get('gest_fecha_up')?.disable();
      this.GestionForms.get('gest_esactivo')?.disable();
    }
    if (num === 1) {
      //activos
      this.GestionForms.get('id_gestion')?.enable();
      this.GestionForms.get('id_gestor')?.enable();
      this.GestionForms.get('cli_identificacion')?.enable();
      this.GestionForms.get('ope_cod_credito')?.enable();
      this.GestionForms.get('gest_id_cartera')?.enable();
      this.GestionForms.get('gest_id_gestor_asign')?.enable();
      this.GestionForms.get('gest_id_tipo_gestion')?.enable();
      this.GestionForms.get('gest_id_contactabilidad')?.enable();
      this.GestionForms.get('gest_id_conectividad')?.enable();
      this.GestionForms.get('gest_id_contacto')?.enable();
      this.GestionForms.get('gest_num_contacto')?.enable();
      this.GestionForms.get('gest_gestion_mediante')?.enable();
      this.GestionForms.get('gest_fecha_gestion')?.enable();
      this.GestionForms.get('gest_hora_gestion')?.enable();
      this.GestionForms.get('gest_fecha_compromiso')?.enable();
      this.GestionForms.get('gest_fecha_incumplido')?.enable();
      this.GestionForms.get('gest_descripcion')?.enable();
      this.GestionForms.get('gest_valor_comp')?.enable();
      this.GestionForms.get('gest_abonos')?.enable();
      this.GestionForms.get('gest_num_coutas')?.enable();
      this.GestionForms.get('gest_num_coutas_res')?.enable();
      this.GestionForms.get('gest_couta')?.enable();
      this.GestionForms.get('gest_valor_a_cobrar')?.enable();
      this.GestionForms.get('gest_valor_incumplido')?.enable();
      this.GestionForms.get('gest_fecha_prox_pago')?.enable();
      this.GestionForms.get('gets_fecha_conv')?.enable();
      this.GestionForms.get('gest_observacion')?.enable();
      this.GestionForms.get('gest_certificado')?.enable();
      this.GestionForms.get('gest_volver_llamar')?.enable();
      this.GestionForms.get('gest_fecha_volver_llamar')?.enable();
      this.GestionForms.get('gest_hora_volver_llamar')?.enable();
      this.GestionForms.get('gest_perdio_contacto')?.enable();
      this.GestionForms.get('gest_esgestion_real')?.enable();
      this.GestionForms.get('gest_fecha_act')?.enable();
      this.GestionForms.get('gest_fecha_desact')?.enable();
      this.GestionForms.get('gest_fecha_in')?.enable();
      this.GestionForms.get('gest_fecha_up')?.enable();
      this.GestionForms.get('gest_esactivo')?.enable();
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
      this.ActDesControles(0);
      this.TituloFormulario = 'Visualizar';
      this.ActDesControles(0);
    }
  }

  CerrarAgregarEditarElemento() {
    let cli = this.route.snapshot.paramMap.get('cli');
    let car = this.route.snapshot.paramMap.get('car');
    let ges = this.route.snapshot.paramMap.get('ges');

    if (cli && car && ges) {
      this.router.navigate(['/gestionar']);
    } else {
      if (this.PaginaEstilo.trim() != '') {
        this.EncerarComponentes();
      } else {
        this.EncerarComponentes();
        this.ListarElementos(1);
      }
    }
  }

  GuardarObjeto(datos: any) {
    const minDate = new Date('1969-12-31').toISOString().split('T')[0];
    datos.gest_id_cartera = Number(datos.gest_id_cartera);
    datos.gest_valor_comp = datos.gest_valor_comp.toString();
    datos.gest_abonos = datos.gest_abonos.toString();
    datos.gest_num_coutas = datos.gest_num_coutas.toString();
    datos.gest_num_coutas_res = datos.gest_num_coutas_res.toString();
    datos.gest_couta = datos.gest_couta.toString();
    datos.gest_valor_a_cobrar = datos.gest_valor_a_cobrar.toString();
    datos.gest_id_gestor_asign = Number(datos.gest_id_gestor_asign);
    datos.gest_id_tipo_gestion = Number(datos.gest_id_tipo_gestion);
    datos.gest_id_contactabilidad = Number(datos.gest_id_contactabilidad);
    datos.gest_id_conectividad = Number(datos.gest_id_conectividad);
    datos.gest_id_contacto = Number(datos.gest_id_contacto);
    datos.gest_certificado =
      datos.gest_certificado.toString() === 'true' ? '1' : '0';
    datos.gest_volver_llamar =
      datos.gest_volver_llamar.toString() === 'true' ? '1' : '0';
    datos.gest_esgestion_real =
      datos.gest_esgestion_real.toString() === 'true' ? '1' : '0';
    datos.gest_perdio_contacto =
      datos.gest_perdio_contacto.toString() === 'true' ? '1' : '0';
    datos.gest_esactivo = datos.gest_esactivo.toString() === 'true' ? '1' : '0';

    datos.gest_fecha_compromiso =
      datos.gest_fecha_compromiso == '' ? minDate : datos.gest_fecha_compromiso;
    datos.gest_fecha_incumplido =
      datos.gest_fecha_incumplido == '' ? minDate : datos.gest_fecha_incumplido;
    datos.gest_fecha_prox_pago =
      datos.gest_fecha_prox_pago == '' ? minDate : datos.gest_fecha_prox_pago;
    datos.gets_fecha_conv =
      datos.gets_fecha_conv == '' ? minDate : datos.gets_fecha_conv;
    datos.gest_fecha_volver_llamar =
      datos.gest_fecha_volver_llamar == ''
        ? minDate
        : datos.gest_fecha_volver_llamar;

    datos.gest_fecha_gestion = this.fechas.fechaActualCorta();
    datos.gest_hora_gestion = this.fechas.HoraActual();
    datos.gest_hora_volver_llamar =
      datos.gest_hora_volver_llamar == ''
        ? '00:00:00'
        : datos.gest_hora_volver_llamar + ':00';
    datos.id_gestor = Number(datos.id_gestor);
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutGestionar(datos)
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
      console.log(datos);
      this.api
        .PostGestionar(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarAgregarEditarElemento();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroAgregado();
            } else {
              this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
              this.ActDesControles(1);
            }
          }),
          catchError((error) => {
            this.alerta.ErrorEnLaOperacion();
            this.ActDesControles(1);
            throw new Error(error);
          })
        )
        .subscribe();
    }
  }

  /************************************** EDITAR ELEMENTO  ******************************************************** */

  CargarElemento(datos: any, num: number) {
    const minDate = new Date('1969-12-31').toISOString().split('T')[0];
    this.ListarTG_Cone_Contac(0);
    this.GestionForms.patchValue({
      id_gestion: 0,
      id_gestor: datos.id_gestor,
      cli_identificacion: datos.cli_identificacion,
      ope_cod_credito: datos.ope_cod_credito,
      gest_id_cartera: datos.gest_id_cartera,
      gest_id_gestor_asign: datos.gest_id_gestor_asign,
      gest_id_tipo_gestion: datos.gest_id_tipo_gestion,
      gest_id_conectividad: datos.gest_id_conectividad,
      gest_id_contactabilidad: datos.gest_id_contactabilidad,
      gest_id_contacto: datos.gest_id_contacto,
      gest_num_contacto: datos.gest_num_contacto,
      gest_gestion_mediante: datos.gest_gestion_mediante,
      gest_fecha_gestion: datos.gest_fecha_gestion == null ? '' : '',
      gest_hora_gestion: datos.gest_hora_gestion == null ? '' : '',
      gest_fecha_compromiso:
        datos.gest_fecha_compromiso == null
          ? ''
          : this.fechas.fechaCortaFormato(datos.gest_fecha_compromiso),
      gest_fecha_incumplido:
        datos.gest_fecha_incumplido == null ? '' : datos.gest_fecha_incumplido,
      gest_descripcion: datos.gest_descripcion,
      gest_valor_comp: datos.gest_valor_comp,
      gest_abonos: datos.gest_abonos,
      gest_num_coutas: datos.gest_num_coutas,
      gest_num_coutas_res: datos.gest_num_coutas_res,
      gest_couta: datos.gest_couta,
      gest_valor_a_cobrar: datos.gest_valor_a_cobrar,
      gest_valor_incumplido: datos.gest_valor_incumplido,
      gest_fecha_prox_pago:
        datos.gest_fecha_prox_pago == null
          ? ''
          : this.fechas.fechaCortaFormato(datos.gest_fecha_prox_pago),
      gets_fecha_conv:
        datos.gets_fecha_conv == null ? '' : datos.gets_fecha_conv,
      gest_observacion: datos.gest_observacion,
      gest_certificado: datos.gest_certificado == '1' ? true : false,
      gest_volver_llamar: datos.gest_volver_llamar == '1' ? true : false,
      gest_fecha_volver_llamar:
        datos.gest_volver_llamar == '0'
          ? ''
          : this.fechas.fechaCortaFormato(datos.gest_fecha_volver_llamar),
      gest_hora_volver_llamar:
        datos.gest_volver_llamar == '0'
          ? ''
          : datos.gest_hora_volver_llamar.substring(0, 5),
      gest_perdio_contacto: datos.gest_perdio_contacto == '1' ? true : false,
      gest_esgestion_real: datos.gest_esgestion_real == '1' ? true : false,
      gest_fecha_in: this.fechas.fechaFormato(datos.gest_fecha_in),
      gest_fecha_up: this.fechas.fechaFormato(datos.gest_fecha_up),
      gest_esactivo: datos.gest_esactivo == '1' ? true : false,
    });

    setTimeout(() => {
      this.ListarcontactoPorTipoSeleccion();
      this.MostrarCamposGestionar();
      this.ValorDelContactar();
    }, 100);
    this.TituloFormulario = 'Gestionar';
    // this.AgregarEditarElemento(num);
  }

  // ****************************************** ENVIO DE NOTIFICACIONES  *****************************************************************
  NotificarCliente(dato: any, tipo: number) {
    this.NotificacionForms.patchValue({
      cli_identificacion: dato.identificacion,
      ope_cod_credito: '',
    });
    this.BuscarInfCliente(dato, tipo);
  }
  NotificacionForms = new FormGroup({
    id_notificacion: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    ope_cod_credito: new FormControl('', Validators.required),
    not_id_gestor_env: new FormControl(0, Validators.required),
    not_id_gestor_rec: new FormControl(0, Validators.required),
    not_id_cartera: new FormControl(0, Validators.required),
    not_mensaje: new FormControl('', Validators.required),
    not_visto: new FormControl(false, Validators.required),
    not_fecha_env: new FormControl(''),
    not_hora_env: new FormControl(''),
    not_fecha_vis: new FormControl(''),
    not_hora_vis: new FormControl(''),
    not_esactivo: new FormControl(true, Validators.required),
  });

  ResetNotificacionForms() {
    this.NotificacionForms.reset({
      id_notificacion: 0,
      cli_identificacion: '',
      ope_cod_credito: '',
      not_id_gestor_env: 0,
      not_id_gestor_rec: 0,
      not_id_cartera: 0,
      not_mensaje: '',
      not_visto: false,
      not_fecha_env: '',
      not_hora_env: '',
      not_fecha_vis: '',
      not_hora_vis: '',
      not_esactivo: true,
    });
    this.CamposVisuales.patchValue(0);
  }
  EnviarNotificacion(datos: any) {
    datos.not_fecha_env = this.fechas.fechaActualCorta();
    datos.not_hora_env = this.fechas.HoraActual();
    datos.not_fecha_vis = this.fechas.fechaMinDate();
    datos.not_hora_vis = this.fechas.HoraMinima();
    datos.not_visto = datos.not_visto.toString() === 'true' ? '1' : '0';
    datos.not_esactivo = datos.not_esactivo.toString() === 'true' ? '1' : '0';
    this.api
      .PostNotificacion(datos)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            this.CerrarAgregarEditarElemento();
            this.TextoFiltro.patchValue('');
            this.alerta.NotificacionEnviada();
          } else {
            this.alerta.ErrorEnLaPeticion(tracks['mensaje']);
            this.ActDesControles(1);
          }
        }),
        catchError((error) => {
          this.alerta.ErrorEnLaOperacion();
          this.ActDesControles(1);
          throw new Error(error);
        })
      )
      .subscribe();
  }
  // ****************************************** INFORMACION DEL CLIENTE  *****************************************************************

  ClienteInf!: ClienteI | null;
  TipoVistaInfCliente: number = 0;

  BuscarInfCliente(dato: any, tipo: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.TipoVistaInfCliente = tipo;
    this.TituloFormulario = 'Gestionar';
    this.ActDesControles(1);
    let filtro: GestionarPropio = {
      tipo: 0,
      identificacion: (dato.identificacion == '' ? '0' : dato.identificacion)!,
      cartera: dato.id_cartera,
    };

    this.api
      .GetGestionarFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          const datos = tracks['data'];
          if (!datos) {
            this.alerta.NoExistenDatos();
          } else {
            this.ClienteInf = datos.cliente;
            this.Cliente = this.ClienteInf!.cli_nombres;
            this.ListaProductos = datos.credito;
            this.ListaProductosCount = datos.credito.length;
            const produ = datos.credito[0];
            // this.Producto = produ;
            this.GestionForms.patchValue({
              cli_identificacion: datos.cliente.cli_identificacion,
              // id_gestor: datos.cliente.id_gestor,
            });
            this.SeleccionarProducto(produ.ope_producto, 1);
            this.GetFiltrarElementoPagos();

            this.BuscarComplementos(filtro);
          }

          CargandoLoad.classList.remove('modal--show');
        }),
        catchError((error) => {
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  BuscarComplementos(dato: any) {
    (dato.tipo = 1),
      this.api
        .GetGestionarFracionadoFiltro(dato)
        .pipe(
          map((tracks) => {
            const datos = tracks['data'];
            if (!datos) {
              this.alerta.NoExistenDatos();
            } else {
              this.ListaCorreos = datos.correos;
              this.ListaDirecciones = datos.direcciones;
              this.ListaGarantes = datos.garantes;
              this.ListaTelefonos = datos.telefonos;
              this.ListaTrabajos = datos.trabajos;

              // this.ListaCorreosCount = datos.correos.length;
              // this.ListaDireccionesCount = datos.direcciones.length;
              // this.ListaGarantesCount = datos.garantes.length;
              // this.ListaTelefonosCount = datos.telefonos.length;
              // this.ListaTrabajosCount = datos.trabajos.length;
            }
          }),
          catchError((error) => {
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
  }

  ProductoSeleccionado: any | null;
  PorcentajeRecuperacion: number = 0;

  SeleccionarProducto(event: any, tipo: number) {
    this.ProductoSeleccionado = null;
    if (tipo == 0) {
      let producto: string = event.target.value;
      const resultado = this.ListaProductos.find(
        (elemento: any, index: any) => {
          return elemento.ope_producto === producto;
        }
      );

      this.ProductoSeleccionado = resultado;

      this.GestionForms.patchValue({
        ope_cod_credito: resultado.ope_cod_credito,
        gest_id_cartera: resultado.id_cartera,
        gest_id_gestor_asign: resultado.id_asignado,
        id_gestor: Number(this.Usuario.id_gestor),
      });
      this.NotificacionForms.patchValue({
        ope_cod_credito: resultado.ope_cod_credito,
        not_id_cartera: resultado.id_cartera,
        not_id_gestor_rec: resultado.id_asignado,
        not_id_gestor_env: Number(this.Usuario.id_gestor),
      });
      this.GetFiltrarElementoPagos();
    } else {
      let producto: string = event;
      const resultado = this.ListaProductos.find(
        (elemento: any, index: any) => {
          return elemento.ope_producto === producto;
        }
      );

      this.ProductoSeleccionado = resultado;

      this.GestionForms.patchValue({
        ope_cod_credito: resultado.ope_cod_credito,
        gest_id_cartera: resultado.id_cartera,
        gest_id_gestor_asign: resultado.id_asignado,
        id_gestor: Number(this.Usuario.id_gestor),
      });
      this.NotificacionForms.patchValue({
        ope_cod_credito: resultado.ope_cod_credito,
        not_id_cartera: resultado.id_cartera,
        not_id_gestor_rec: resultado.id_asignado,
        not_id_gestor_env: Number(this.Usuario.id_gestor),
      });
      this.GetFiltrarElementoPagos();
    }
  }

  ListaCorreos: any[] = [];
  ListaDirecciones: any[] = [];
  ListaGarantes: any[] = [];
  ListaTelefonos: any[] = [];
  ListaTrabajos: any[] = [];
  BuscarInfAdicional(tipo: number) {
    let filtro: GestionarPropio = {
      tipo: tipo,
      identificacion: (this.ClienteInf!.cli_identificacion == ''
        ? '0'
        : this.ClienteInf!.cli_identificacion)!,
      cartera: 0,
    };
    if (tipo == 9 || tipo == 8 || tipo == 7) {
      filtro.cartera = this.ProductoSeleccionado.ope_cod_credito;
    }
    this.api
      .GetGestionarFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          const datos = tracks['data'];
          if (!datos || datos.length == 0) {
            this.alerta.NoExistenDatos();
            if (tipo == 7) {
              (<HTMLElement>(
                document.getElementById('ModalGestionesAnteriores')
              )).classList.remove('modal--show');
            }
          } else {
            if (tipo == 2) {
              this.ListaCorreos = datos;
            }
            if (tipo == 3) {
              this.ListaDirecciones = datos;
            }
            if (tipo == 4) {
              this.ListaGarantes = datos;
            }
            if (tipo == 5) {
              this.ListaTelefonos = datos;
            }
            if (tipo == 6) {
              this.ListaTrabajos = datos;
            }
            if (tipo == 7) {
              this.ListaGestionesAnt = datos;
            }
            if (tipo == 8) {
              this.ValoresOriginales = datos;
            }
            if (tipo == 9) {
              this.ListaActualizacionesCredito = datos;
            }
          }
        }),
        catchError((error) => {
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  ListaProductos: any[] = [];
  ListaProductosCount: number = 0;
  ListarProductos() {
    this.ListaProductos = [];
    this.api
      .GetContactabilidadFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.ListaProductos = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  ListaPagos: any[] = [];
  ListaPagosCount: number = 0;
  fechaActual = new Date();
  mesActual = this.fechaActual.getMonth() + 1;
  yearActual = this.fechaActual.getFullYear();

  GetFiltrarElementoPagos() {
    this.PorcentajeRecuperacion = 0;
    let datos = this.GestionForms.value;
    let filtro: FiltroPagos = {
      tipo: 2,
      identificacion: this.GestionForms.get('cli_identificacion')?.value!,
      nombres_cliente: this.GestionForms.get('ope_cod_credito')?.value!,
      cartera: [this.GestionForms.get('gest_id_cartera')?.value!],
      gestor: this.GestionForms.get('gest_id_gestor_asign')?.value!,
      cuenta: 0,
      mes: this.fechas.ExtraerMes(this.fechaActual),
      year: this.yearActual.toString(),
      codigo: 0,
      rango: 0,
    };

    this.ListaPagos = [];
    this.loading = true;
    this.api
      .GetPagosFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          this.ListaPagos = tracks['data'];
          if (this.ListaPagos.length === 0) {
            this.loading = false;
            this.ListaPagosCount = 0;
          } else {
            this.loading = false;
            this.ListaPagosCount = tracks['data'].length;
            this.ObtenerValoresDePagos();
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
  PagosTotal: number = 0;
  PagosVerificados: number = 0;
  PagosSinVerificados: number = 0;

  ObtenerValoresDePagos() {
    const PagosVerificados = this.ListaPagos.filter((elemento) => {
      return elemento.Pagos.pag_pago_verificado == '1';
    });
    const PagosSinVerificados = this.ListaPagos.filter((elemento) => {
      return elemento.Pagos.pag_pago_verificado == '0';
    });
    let valorTotal: number = 0;
    for (let pago of this.ListaPagos) {
      valorTotal += parseFloat(pago.Pagos.pag_pago.replace(',', '.'));
    }
    let valorTotalVerificados: number = 0;
    for (let pago of PagosVerificados) {
      valorTotalVerificados += parseFloat(
        pago.Pagos.pag_pago.replace(',', '.')
      );
    }
    let valorTotalSinVerificados: number = 0;
    for (let pago of PagosSinVerificados) {
      valorTotalSinVerificados += parseFloat(
        pago.Pagos.pag_pago.replace(',', '.')
      );
    }

    this.PagosTotal = valorTotal;
    this.PagosVerificados = valorTotalVerificados;
    this.PagosSinVerificados = valorTotalSinVerificados;

    let division = (
      (valorTotal / this.ProductoSeleccionado.ope_saldo_cxc_actual) *
      100
    ).toFixed(2);
    this.PorcentajeRecuperacion = Number(division);
  }

  ListaContactoPorTipo: any[] = [];
  ListaContactoPorTipoCount: number = 0;
  ListarcontactoPorTipoSeleccion() {
    this.ListaContactoPorTipo = [];
    this.ListaContactoPorTipoCount = 0;
    let datos = this.GestionForms.get('gest_id_tipo_gestion')!.value;
    if (datos != 0) {
      let valores = this.ListaTipoGestion.find((elemento: any, index: any) => {
        return elemento.id_tipo_gestion == datos;
      });
      if (valores!) {
        if (
          valores.gestion_tip_descripcion === 'LLAMADA' ||
          valores.gestion_tip_descripcion === 'WHATSAPP'
        ) {
          let nuevaLista = this.ListaTelefonos.map(
            ({ id_telefono: id, tel_numero: descripcion }) => ({
              id,
              descripcion,
            })
          );
          this.ListaContactoPorTipo = nuevaLista;
          this.ListaContactoPorTipoCount = nuevaLista.length;
        }
        if (valores.gestion_tip_descripcion === 'CORREO') {
          let nuevaLista = this.ListaCorreos.map(
            ({ id_correo: id, cor_email: descripcion }) => ({ id, descripcion })
          );
          this.ListaContactoPorTipo = nuevaLista;
          this.ListaContactoPorTipoCount = nuevaLista.length;
        }
        if (valores.gestion_tip_descripcion === 'VISITA') {
          let nuevaLista = this.ListaDirecciones.map(
            ({ id_direccion: id, dir_completa: descripcion }) => ({
              id,
              descripcion,
            })
          );
          this.ListaContactoPorTipo = nuevaLista;
          this.ListaContactoPorTipoCount = nuevaLista.length;
        }
        this.ValorDelContactar();
      }
    }
  }

  // ****************************************** LLAMADA A METODOS PARA LA GESTION *****************************************************************
  ListaTipoGestion: Tipo_GestionI[] = [];
  // ListaTipoGestionCount: number = 0;
  // ListarTipoGestion() {
  //   this.ListaTipoGestion = [];
  //   this.api
  //     .GetTipoGestionFracionado(0, 0)
  //     .pipe(
  //       map((tracks) => {
  //         this.ListaTipoGestion = tracks['data'];
  //       }),
  //       catchError((error) => {
  //         this.loading = false;
  //         this.alerta.ErrorAlRecuperarElementos();
  //         throw new Error(error);
  //       })
  //     )
  //     .subscribe();
  // }

  ListaConectividad: ConectividadI[] = [];
  ListaConectividadCount: number = 0;
  ListarConectividad() {
    this.ListaConectividad = [];
    this.api
      .GetConectividadFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.ListaConectividad = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  ListaContactabilidadGestion: any[] = [];
  ListaContactabilidadGestionCount: number = 0;
  ListarContactabilidadGestion() {
    this.ListaContactabilidadGestion = [];
    this.api
      .GetContactabilidadFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.ListaContactabilidadGestion = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  ListarTG_Cone_Contac(tipo: number) {
    if (tipo == 1) {
      this.ListaConectividad = [];
      this.ListaContactabilidadGestion = [];
      this.GestionForms.patchValue({
        gest_id_conectividad: 0,
        gest_id_contactabilidad: 0,
        gest_id_contacto: 0,
        gest_num_contacto: '',
      });
    }
    if (tipo == 2) {
      this.ListaContactabilidadGestion = [];
      this.GestionForms.patchValue({ gest_id_contactabilidad: 0 });
    }
    this.CamposVisuales.patchValue(0);
    let Tipo_gestion = this.GestionForms.get('gest_id_tipo_gestion')?.value;
    let Conectividad = this.GestionForms.get('gest_id_conectividad')?.value;

    let TG = Tipo_gestion == 0 ? 0 : Number(Tipo_gestion);
    let Conec = Conectividad == 0 ? 0 : Number(Conectividad);

    this.api
      .GetTG_Conec_Contac(TG, Conec)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          if (tipo == 0) {
            this.ListaTipoGestion = datos;
          }
          if (tipo == 1) {
            this.ListaConectividad = datos;
          }
          if (tipo == 2) {
            this.ListaContactabilidadGestion = datos;
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

  CamposVisuales = new FormControl<number>(0);
  MostrarCamposGestionar() {
    let datos = this.GestionForms.get('gest_id_contactabilidad')!.value;
    let valores = this.ListaContactabilidadGestion.find(
      (elemento: any, index: any) => {
        return elemento.id_contactabilidad == datos;
      }
    );
    if (valores != undefined) {
      this.CamposVisuales.patchValue(valores.editable);
      this.GestionForms.patchValue({ editable: valores.editable });
    }
  }

  ValorDelContactar() {
    this.GestionForms.patchValue({ gest_num_contacto: '' });
    let gest_id_contacto = this.GestionForms.get('gest_id_contacto')!.value;
    if (gest_id_contacto != 0) {
      let valores = this.ListaContactoPorTipo.find(
        (elemento: any, index: any) => {
          return elemento.id == gest_id_contacto;
        }
      );
      this.GestionForms.patchValue({ gest_num_contacto: valores.descripcion });
    }
  }

  chkTodosProductos = new FormControl(false);

  ListarProductosGestionTodos() {}

  // ****************************************** MODAL AGREGAR CORREOS *****************************************************************
  TituloFormularioAgregarCorreos = '';
  CorreosForms = new FormGroup({
    id_correo: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    cor_descripcion: new FormControl(''),
    cor_email: new FormControl('', Validators.required),
    cor_fecha_up: new FormControl(this.fechas.fecha()),
    cor_esactivo: new FormControl(true),
    cor_id_tipo_correo: new FormControl('', Validators.required),
    cor_origendatos: new FormControl('Sistema_CobroSys'),
  });
  ResetCorreosForms() {
    this.CorreosForms.reset({
      id_correo: 0,
      cli_identificacion: '',
      cor_descripcion: '',
      cor_email: '',
      cor_fecha_up: this.fechas.fecha(),
      cor_esactivo: true,
      cor_id_tipo_correo: '',
      cor_origendatos: 'Sistema_CobroSys',
    });
  }
  TipoCorreoList: Tipo_CorreoI[] = [];

  ListarTipoCorreos() {
    this.api
      .GetTipoCorreoFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.TipoCorreoList = tracks['data'];
        })
      )
      .subscribe();
  }
  GuardarObjetoCorreo(datos: any) {
    datos.cor_esactivo = datos.cor_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormularioAgregarCorreos === 'Editar') {
      datos.cor_origendatos =
        datos.cor_origendatos +
        ' UP/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PutCorreos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarCorreos();
              this.alerta.RegistroActualizado();
              this.BuscarInfAdicional(2);
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
      datos.cor_origendatos =
        'Sistema_CobroSys IN/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PostCorreos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarCorreos();
              this.alerta.RegistroAgregado();
              this.BuscarInfAdicional(2);
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

  AbrirModalAgregarCorreos(num: number) {
    if (num == 0) {
      this.TituloFormularioAgregarCorreos = 'Agregar';
    } else {
      this.TituloFormularioAgregarCorreos = 'Editar';
    }

    this.CorreosForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });

    (<HTMLElement>document.getElementById('ModalAgregarCorreos')).classList.add(
      'modal--show'
    );
  }
  CerrarModalAgregarCorreos() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarCorreos')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarCorreos = '';
    this.ResetCorreosForms();
  }
  CargarElementoAgregarCorreos(datos: any) {
    this.CorreosForms.patchValue({
      id_correo: datos.id_correo,
      cli_identificacion: datos.cli_identificacion,
      cor_descripcion: datos.cor_descripcion,
      cor_email: datos.cor_email,
      cor_fecha_up: this.fechas.fechaFormato(datos.cor_fecha_up),
      cor_esactivo: datos.cor_esactivo === '1' ? true : false,
      cor_id_tipo_correo: datos.cor_id_tipo_correo,
      cor_origendatos: datos.cor_origendatos,
    });
    this.ListarTipoCorreos();
    this.AbrirModalAgregarCorreos(1);
  }
  EliminarElementoCorreos(elemento: CorreoI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cor_esactivo = '3';
        this.api.PutCorreos(elemento).subscribe((x) => {
          this.BuscarInfAdicional(2);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  // ****************************************** MODAL AGREGAR DIRECCIONES *****************************************************************
  TituloFormularioAgregarDirecciones = '';
  DireccionesForms = new FormGroup({
    id_direccion: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    dir_completa: new FormControl('', Validators.required),
    dir_calle_principal: new FormControl(''),
    dir_calle_secundaria: new FormControl(''),
    dir_numero_casa: new FormControl(''),
    dir_referencia: new FormControl(''),
    dir_provincia: new FormControl(''),
    dir_canton: new FormControl(''),
    dir_parroquia: new FormControl(''),
    dir_fecha_up: new FormControl(this.fechas.fecha()),
    dir_esactivo: new FormControl(true),
    dir_id_tipo_direccion: new FormControl('', Validators.required),
    dir_origendatos: new FormControl('Sistema_CobroSys'),
  });

  ResetDireccionesForms() {
    this.DireccionesForms.reset({
      id_direccion: 0,
      cli_identificacion: '',
      dir_completa: '',
      dir_calle_principal: '',
      dir_calle_secundaria: '',
      dir_numero_casa: '',
      dir_referencia: '',
      dir_provincia: '',
      dir_canton: '',
      dir_parroquia: '',
      dir_fecha_up: this.fechas.fecha(),
      dir_esactivo: true,
      dir_id_tipo_direccion: '',
      dir_origendatos: 'Sistema_CobroSys',
    });
  }

  TipoDireccionList: Tipo_DireccionI[] = [];

  ListarTipoDirecciones() {
    this.api
      .GetTipoDireccionFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.TipoDireccionList = tracks['data'];
        })
      )
      .subscribe();
  }

  GuardarObjetoDirecciones(datos: any) {
    datos.dir_esactivo = datos.dir_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormularioAgregarDirecciones === 'Editar') {
      datos.dir_origendatos =
        datos.dir_origendatos +
        ' UP/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PutDirecciones(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarDirecciones();
              this.alerta.RegistroActualizado();
              this.BuscarInfAdicional(3);
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
      datos.dir_origendatos =
        'Sistema_CobroSys IN/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PostDirecciones(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarDirecciones();
              this.alerta.RegistroAgregado();
              this.BuscarInfAdicional(3);
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

  AbrirModalAgregarDirecciones(num: number) {
    if (num == 0) {
      this.TituloFormularioAgregarDirecciones = 'Agregar';
    } else {
      this.TituloFormularioAgregarDirecciones = 'Editar';
    }

    this.DireccionesForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });

    (<HTMLElement>(
      document.getElementById('ModalAgregarDereccion')
    )).classList.add('modal--show');
  }
  CerrarModalAgregarDirecciones() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarDereccion')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarDirecciones = '';
    this.ResetDireccionesForms();
  }
  CargarElementoAgregarDirecciones(datos: any) {
    this.DireccionesForms.patchValue({
      id_direccion: datos.id_direccion,
      cli_identificacion: datos.cli_identificacion,
      dir_completa: datos.dir_completa,
      dir_calle_principal: datos.dir_calle_principal,
      dir_calle_secundaria: datos.dir_calle_secundaria,
      dir_numero_casa: datos.dir_numero_casa,
      dir_referencia: datos.dir_referencia,
      dir_provincia: datos.dir_provincia,
      dir_canton: datos.dir_canton,
      dir_parroquia: datos.dir_parroquia,
      dir_fecha_up: this.fechas.fechaFormato(datos.dir_fecha_up),
      dir_esactivo: datos.dir_esactivo === '1' ? true : false,
      dir_id_tipo_direccion: datos.dir_id_tipo_direccion,
      dir_origendatos: datos.dir_origendatos,
    });
    this.ListarTipoDirecciones();
    this.AbrirModalAgregarDirecciones(1);
  }
  EliminarElementoDirecciones(elemento: DireccionI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.dir_esactivo = '3';
        this.api.PutDirecciones(elemento).subscribe((x) => {
          this.BuscarInfAdicional(3);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  // ****************************************** MODAL AGREGAR GARANTE *****************************************************************
  TituloFormularioAgregarGarante = '';
  GarantesForms = new FormGroup({
    id_garante: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    gar_identificacion: new FormControl('', Validators.required),
    gar_nombres: new FormControl('', Validators.required),
    gar_trabajo: new FormControl(true),
    gar_direccion_dom: new FormControl(''),
    gar_direccion_trabajo: new FormControl(''),
    gar_telefono_domicilio: new FormControl(''),
    gar_telefono_trabajo: new FormControl(''),
    gar_telefono_adicional: new FormControl(''),
    gar_observacion: new FormControl(''),
    gar_fecha_up: new FormControl(this.fechas.fecha()),
    gar_esactivo: new FormControl(true),
  });

  ResetGarantesForms() {
    this.GarantesForms.reset({
      id_garante: 0,
      cli_identificacion: '',
      gar_identificacion: '',
      gar_nombres: '',
      gar_trabajo: true,
      gar_direccion_dom: '',
      gar_direccion_trabajo: '',
      gar_telefono_domicilio: '',
      gar_telefono_trabajo: '',
      gar_telefono_adicional: '',
      gar_observacion: '',
      gar_fecha_up: this.fechas.fecha(),
      gar_esactivo: true,
    });
  }

  GuardarObjetoGarante(datos: any) {
    datos.gar_trabajo = datos.gar_trabajo.toString() === 'true' ? '1' : '0';
    datos.gar_esactivo = datos.gar_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormularioAgregarGarante === 'Editar') {
      datos.gar_origendatos =
        datos.gar_origendatos +
        ' UP/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PutGarantes(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarGarante();
              this.alerta.RegistroActualizado();
              this.BuscarInfAdicional(4);
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
      datos.gar_origendatos =
        'Sistema_CobroSys IN/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PostGarantes(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarGarante();
              this.alerta.RegistroAgregado();
              this.BuscarInfAdicional(4);
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
  AbrirModalAgregarGarante(num: number) {
    if (num == 0) {
      this.TituloFormularioAgregarGarante = 'Agregar';
    } else {
      this.TituloFormularioAgregarGarante = 'Editar';
    }

    this.GarantesForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });

    (<HTMLElement>document.getElementById('ModalAgregarGarante')).classList.add(
      'modal--show'
    );
  }
  CerrarModalAgregarGarante() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarGarante')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarGarante = '';
    this.ResetGarantesForms();
  }
  CargarElementoAgregarGarante(datos: any) {
    this.GarantesForms.patchValue({
      id_garante: datos.id_garante,
      cli_identificacion: datos.cli_identificacion,
      gar_identificacion: datos.gar_identificacion,
      gar_nombres: datos.gar_nombres,
      gar_trabajo: datos.gar_trabajo === '1' ? true : false,
      gar_direccion_dom: datos.gar_direccion_dom,
      gar_direccion_trabajo: datos.gar_direccion_trabajo,
      gar_telefono_domicilio: datos.gar_telefono_domicilio,
      gar_telefono_trabajo: datos.gar_telefono_trabajo,
      gar_telefono_adicional: datos.gar_telefono_adicional,
      gar_observacion: datos.gar_observacion,
      gar_fecha_up: this.fechas.fechaFormato(datos.gar_fecha_up),
      gar_esactivo: datos.gar_esactivo === '1' ? true : false,
    });

    this.AbrirModalAgregarGarante(1);
  }
  EliminarElementoGarantes(elemento: GaranteI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.gar_esactivo = '3';
        this.api.PutGarantes(elemento).subscribe((x) => {
          this.BuscarInfAdicional(4);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  // ****************************************** MODAL AGREGAR TELEFONOS *****************************************************************
  TituloFormularioAgregarTelefonos = '';

  TelefonosForms = new FormGroup({
    id_telefono: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    tel_numero: new FormControl('', Validators.required),
    tel_observacion: new FormControl(''),
    tel_operadora: new FormControl(''),
    tel_tipo_operadora: new FormControl(true),
    tel_fecha_up: new FormControl(this.fechas.fecha()),
    tel_esactivo: new FormControl(true),
    tel_id_tipo_telefono: new FormControl('', Validators.required),
    tel_id_detal_telefono: new FormControl(''),
    tel_origendatos: new FormControl('Sistema_CobroSys'),
  });

  ResetTelefonosForms() {
    this.TelefonosForms.reset({
      id_telefono: 0,
      cli_identificacion: '',
      tel_numero: '',
      tel_observacion: '',
      tel_operadora: '',
      tel_tipo_operadora: true,
      tel_fecha_up: this.fechas.fecha(),
      tel_esactivo: true,
      tel_id_tipo_telefono: '',
      tel_id_detal_telefono: '',
      tel_origendatos: 'Sistema_CobroSys',
    });
  }

  TipoTelefonoList: Tipo_TelefonoI[] = [];

  ListarTipoTelefonos() {
    this.api
      .GetTipoTelefonoFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.TipoTelefonoList = tracks['data'];
        })
      )
      .subscribe();
  }
  DetalleTelefonoList: DetalleTelefonoI[] = [];

  ListarDetTelefono() {
    this.api
      .GetDetTelefonoFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.DetalleTelefonoList = tracks['data'];
        })
      )
      .subscribe();
  }
  Operadora: any[] = [
    { id: 1, name: 'MOVISTAR', value: 'MOVISTAR' },
    { id: 2, name: 'CLARO', value: 'CLARO' },
    { id: 3, name: 'CNT', value: 'CNT' },
    { id: 4, name: 'TUENTI', value: 'TUENTI' },
    { id: 5, name: 'OTRO', value: 'OTRO' },
  ];

  GuardarObjetoTelefonos(datos: any) {
    datos.tel_esactivo = datos.tel_esactivo.toString() === 'true' ? '1' : '0';
    datos.tel_tipo_operadora =
      datos.tel_tipo_operadora.toString() === 'true' ? 'MOVIL' : 'FIJO';
    if (this.TituloFormularioAgregarTelefonos === 'Editar') {
      datos.tel_origendatos =
        datos.tel_origendatos +
        ' UP/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PutTelefonos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarTelefonos();
              this.alerta.RegistroActualizado();
              this.BuscarInfAdicional(5);
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
      datos.tel_origendatos =
        'Sistema_CobroSys IN/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PostTelefonos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarTelefonos();
              this.alerta.RegistroAgregado();
              this.BuscarInfAdicional(5);
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

  AbrirModalAgregarTelefono(num: number) {
    this.ListaContacto = [];
    if (num == 0) {
      this.TituloFormularioAgregarTelefonos = 'Agregar';
    } else {
      this.TituloFormularioAgregarTelefonos = 'Editar';
    }

    this.TelefonosForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });

    (<HTMLElement>(
      document.getElementById('ModalAgregarTelefono')
    )).classList.add('modal--show');
  }
  CerrarModalAgregarTelefonos() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarTelefono')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarTelefonos = '';
    this.ResetTelefonosForms();
  }
  CargarElementoAgregarTelefonos(datos: any) {
    this.TelefonosForms.patchValue({
      id_telefono: datos.id_telefono,
      cli_identificacion: datos.cli_identificacion,
      tel_numero: datos.tel_numero,
      tel_observacion: datos.tel_observacion,
      tel_operadora: datos.tel_operadora,
      tel_tipo_operadora: datos.tel_tipo_operadora === 'MOVIL' ? true : false,
      tel_fecha_up: this.fechas.fechaFormato(datos.tel_fecha_up),
      tel_esactivo: datos.tel_esactivo === '1' ? true : false,
      tel_id_tipo_telefono: datos.tel_id_tipo_telefono,
      tel_id_detal_telefono: datos.tel_id_detal_telefono,
      tel_origendatos: datos.tel_origendatos,
    });
    this.ListarTipoTelefonos();
    this.ListarDetTelefono();
    this.AbrirModalAgregarTelefono(1);
  }
  EliminarElementoTelefonos(elemento: TelefonoI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.tel_esactivo = '3';
        this.api.PutTelefonos(elemento).subscribe((x) => {
          this.BuscarInfAdicional(5);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  // ****************************************** MODAL AGREGAR TRABAJOS *****************************************************************
  TituloFormularioAgregarTrabajos = '';

  TrabajosForms = new FormGroup({
    id_trabajo: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    tra_ruc: new FormControl('', Validators.required),
    tra_descripcion: new FormControl(''),
    tra_direccion: new FormControl(''),
    tra_telefono: new FormControl(''),
    tra_correo: new FormControl(''),
    tra_observacion: new FormControl(''),
    tra_fecha_up: new FormControl(this.fechas.fecha()),
    tra_esactivo: new FormControl(true),
    tra_id_tipo_trabajo: new FormControl('', Validators.required),
    tra_origendatos: new FormControl('Sistema_CobroSys'),
  });

  ResetTrabajosForms() {
    this.TrabajosForms.reset({
      id_trabajo: 0,
      cli_identificacion: '',
      tra_ruc: '',
      tra_descripcion: '',
      tra_direccion: '',
      tra_telefono: '',
      tra_correo: '',
      tra_observacion: '',
      tra_fecha_up: this.fechas.fecha(),
      tra_esactivo: true,
      tra_id_tipo_trabajo: '',
      tra_origendatos: 'Sistema_CobroSys',
    });
  }
  TipoTrabajoList: Tipo_TrabajoI[] = [];

  ListarTipoTrabajo() {
    this.api
      .GetTipoTrabajoFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.TipoTrabajoList = tracks['data'];
        })
      )
      .subscribe();
  }

  GuardarObjetoTrabajos(datos: any) {
    datos.tra_esactivo = datos.tra_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormularioAgregarTrabajos === 'Editar') {
      datos.tra_origendatos =
        datos.tra_origendatos +
        ' UP/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PutTrabajos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarTrabajos();
              this.alerta.RegistroActualizado();
              this.BuscarInfAdicional(6);
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
      datos.tra_origendatos =
        'Sistema_CobroSys IN/' +
        this.Usuario.ges_nombres +
        ' ' +
        this.Usuario.ges_apellidos;
      this.api
        .PostTrabajos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.CerrarModalAgregarTrabajos();
              this.alerta.RegistroAgregado();
              this.BuscarInfAdicional(6);
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

  AbrirModalAgregarTrabajos(num: number) {
    if (num == 0) {
      this.TituloFormularioAgregarTrabajos = 'Agregar';
    } else {
      this.TituloFormularioAgregarTrabajos = 'Editar';
    }

    this.TrabajosForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });

    (<HTMLElement>(
      document.getElementById('ModalAgregarTrabajos')
    )).classList.add('modal--show');
  }
  CerrarModalAgregarTrabajos() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarTrabajos')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarTrabajos = '';
    this.ResetTrabajosForms();
  }

  CargarElementoAgregarTrabajos(datos: any) {
    this.TrabajosForms.patchValue({
      id_trabajo: datos.id_trabajo,
      cli_identificacion: datos.cli_identificacion,
      tra_ruc: datos.tra_ruc,
      tra_descripcion: datos.tra_descripcion,
      tra_direccion: datos.tra_direccion,
      tra_telefono: datos.tra_telefono,
      tra_correo: datos.tra_correo,
      tra_observacion: datos.tra_observacion,
      tra_fecha_up: this.fechas.fechaFormato(datos.tra_fecha_up),
      tra_esactivo: datos.tra_esactivo === '1' ? true : false,
      tra_id_tipo_trabajo: datos.tra_id_tipo_trabajo,
      tra_origendatos: datos.tra_origendatos,
    });
    this.ListarTipoTrabajo();
    this.AbrirModalAgregarTrabajos(1);
  }
  EliminarElementoTrabajos(elemento: TrabajoI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.tra_esactivo = '3';
        this.api.PutTrabajos(elemento).subscribe((x) => {
          this.BuscarInfAdicional(6);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  // ****************************************** MODAL AGREGAR PAGOS *****************************************************************
  TituloFormularioAgregarPagos = '';
  ClientePago = new FormControl(
    { value: '', disabled: true },
    Validators.required
  );

  PagosForms = new FormGroup({
    id_pagos: new FormControl(0, Validators.required),
    id_gestor: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    ope_cod_credito: new FormControl('', Validators.required),
    id_cuenta: new FormControl('', Validators.required),
    id_cartera: new FormControl(0, Validators.required),
    pag_pago: new FormControl('', [
      Validators.required,
      this.validar.VFN_NumerosDesimales(),
      this.validar.VFN_MayorQue('pag_pago', 'pag_valor_total_comprobante'),
    ]),
    pag_valor_total_comprobante: new FormControl('', [
      Validators.required,
      this.validar.VFN_NumerosDesimales(),
      this.validar.VFN_MayorQue('pag_pago', 'pag_valor_total_comprobante'),
    ]),
    pag_medio_contacto: new FormControl('', Validators.required),
    pag_observacion_pago: new FormControl(''),
    pag_codigo_comprobante: new FormControl('', Validators.required),
    pag_url_comprobante: new FormControl(''),
    pag_observ_comprobante: new FormControl(''),
    pag_pago_verificado: new FormControl(false),
    pag_id_gestor_ingresa: new FormControl(0),
    pag_id_gestor_verifica: new FormControl(0),
    pag_mes_pago: new FormControl(''),
    pag_fecha_pago: new FormControl('', Validators.required),
    pag_fecha_verificacion: new FormControl(null),
    // pag_fecha_act: new FormControl('', Validators.required),
    // pag_fecha_desact: new FormControl('', Validators.required),
    // pag_fecha_in: new FormControl('', Validators.required),
    // pag_fecha_up: new FormControl('', Validators.required),
    pag_esactivo: new FormControl(true),
  });

  ResetPagosForms() {
    this.PagosForms.reset({
      id_pagos: 0,
      id_gestor: 0,
      cli_identificacion: '',
      ope_cod_credito: '',
      id_cuenta: '',
      id_cartera: 0,
      pag_pago: '',
      pag_medio_contacto: '',
      pag_valor_total_comprobante: '',
      pag_observacion_pago: '',
      pag_codigo_comprobante: '',
      pag_url_comprobante: '',
      pag_observ_comprobante: '',
      pag_pago_verificado: false,
      pag_id_gestor_ingresa: 0,
      pag_id_gestor_verifica: 0,
      pag_mes_pago: '',
      pag_fecha_pago: '',
      pag_fecha_verificacion: null,
      // pag_fecha_act: '',
      // pag_fecha_desact: '',
      // pag_fecha_in: '',
      // pag_fecha_up: '',
      pag_esactivo: true,
    });
  }

  AbrirModalAgregarPagos(num: number, pos?: string) {
    if (num == 1) {
      this.TituloFormularioAgregarPagos = 'Agregar';
    } else if (num == 2) {
      this.TituloFormularioAgregarPagos = 'Agregar';
      const CargandoLoad = document.getElementById(
        'Cargando'
      ) as HTMLInputElement;
      CargandoLoad.classList.add('modal--show');
      let filtro: GestionarPropio = {
        tipo: 10,
        identificacion: (pos == '' ? '0' : pos)!,
        cartera: 0,
      };

      this.api
        .GetGestionarFracionadoFiltro(filtro)
        .pipe(
          map((tracks) => {
            const datos = tracks['data'];
            if (!datos) {
              this.alerta.NoExistenDatos();
            } else {
              this.ClienteInf = datos.cliente;
            }

            CargandoLoad.classList.remove('modal--show');
          }),
          catchError((error) => {
            CargandoLoad.classList.remove('modal--show');
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.TituloFormularioAgregarPagos = 'Editar';
    }
    if (pos != '' && pos != undefined && pos != null) {
      this.PagosForms.patchValue({
        cli_identificacion: pos,
      });
    } else {
      this.PagosForms.patchValue({
        cli_identificacion: this.ClienteInf?.cli_identificacion,
      });
    }

    (<HTMLElement>document.getElementById('ModalAgregarPagos')).classList.add(
      'modal--show'
    );
  }
  CerrarModalAgregarPagos() {
    (<HTMLElement>(
      document.getElementById('ModalAgregarPagos')
    )).classList.remove('modal--show');
    this.TituloFormularioAgregarPagos = '';
    this.ResetPagosForms();
    this.GetFiltrarElementoPagos();
  }
  /*******************   BUSCAR INFORMACION Y VER IMAGEN  **************************** */
  BuscarCliente() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    let identificacion =
      this.PagosForms.get('cli_identificacion')?.value?.trim();
    if (identificacion?.length == 13 || identificacion?.length == 10) {
      CargandoLoad.classList.add('modal--show');
      this.api
        .GetClienteFracionadoFiltro(identificacion!, 20)
        .pipe(
          map((tracks) => {
            const datos = tracks['data'];
            CargandoLoad.classList.remove('modal--show');
            if (!datos) {
              this.alerta.NoExistenDatos();
            } else {
              this.ClientePago.patchValue(datos.Cliente.cli_nombres);
              this.PagosForms.patchValue({ id_gestor: datos.id_gestor });
            }
          }),
          catchError((error) => {
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.ClientePago.patchValue('');
      this.PagosForms.patchValue({
        ope_cod_credito: '',
        pag_medio_contacto: '',
      });
      this.ListaCreditos = [];
      this.ListaContacto = [];
    }
  }
  ListaCuentas: CuentaI[] = [];

  ListarCuentas() {
    this.ListaCuentas = [];
    let cuenta = this.PagosForms.get('id_cartera')?.value?.toString();
    this.ListaContacto = [];
    if (cuenta != '') {
      this.api
        .GetCuentasFracionadoFiltro(cuenta!, 10)
        .pipe(
          map((tracks) => {
            let datos = tracks['data'];
            if (datos.length == 0) {
              this.alerta.AlertaEnLaPeticion(
                'No se encontraron cuentas para esta cartera'
              );
            } else {
              this.ListaCuentas = datos;
            }
          }),
          catchError((error) => {
            this.loading = false;
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.alerta.AlertaEnLaPeticion('Verificar informacion del producto');
    }
  }
  ListaCreditos: CxcOperacionI[] = [];

  ListarCreditos() {
    let identificacion =
      this.PagosForms.get('cli_identificacion')?.value?.trim();
    this.ListaCreditos = [];
    if (identificacion != '') {
      this.api
        .GetCxcOperacionFracionadoFiltro(identificacion!, 10)
        .pipe(
          map((tracks) => {
            (this.ListaCreditos = tracks['data']);
          }),
          catchError((error) => {
            this.loading = false;
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.alerta.AlertaEnLaPeticion('Verificar informacion del cliente');
    }
  }
  ListaContacto: TelefonoI[] = [];

  ListarContacto() {
    let identificacion =
      this.PagosForms.get('cli_identificacion')?.value?.trim();
    this.ListaContacto = [];
    if (identificacion != '') {
      this.api
        .GetTelefonosFracionadoFiltro(identificacion!, 1)
        .pipe(
          map((tracks) => {
            this.ListaContacto = tracks['data'];
          }),
          catchError((error) => {
            this.loading = false;
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.alerta.AlertaEnLaPeticion('Verificar informacion del cliente');
    }
  }

  SeleccionProducto() {
    let datos = this.PagosForms.get('ope_cod_credito')!.value;
    if (datos != '') {
      let valores = this.ListaCreditos.find((elemento: any, index: any) => {
        return elemento.ope_cod_credito == datos;
      });
      this.PagosForms.patchValue({ id_cartera: valores?.id_cartera });
    }
  }

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.previewImage();
    }
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedFile as Blob);
  }
  verImagen() {
    let file = this.selectedFile;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        Swal.fire({
          imageUrl: e.target!.result!.toString(),
          showCloseButton: true,
          customClass: {
            popup: 'modal-tamano', // Clase CSS para definir el tamaño del modal
          },
          didOpen: () => {
            // Agregar un event listener al elemento de imagen dentro del cuadro de diálogo
            const imageElement = document.querySelector(
              '.swal2-image'
            ) as HTMLElement;
            imageElement.addEventListener('click', () => {
              this.ampliar(imageElement);
            });
          },
        });
      };
      reader.readAsDataURL(file);
    }
  }

  ampliar(imageElement: HTMLElement) {
    const originalWidth = imageElement.offsetWidth;
    const originalHeight = imageElement.offsetHeight;

    const aumento = 50;

    const newWidth = originalWidth + aumento;
    const newHeight = originalHeight + aumento;

    imageElement.style.width = `${newWidth}px`;
    imageElement.style.height = `${newHeight}px`;
  }

  RecrearImagenDesdeUrl(imageUrl: string, fileName: string, fileType: string) {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: fileType });
        this.selectedFile = file;
        this.previewImage();
      })
      .catch((error) => {
        console.error('Error recreating file from URL:', error);
      });
  }

  VerElemento(datos: any) {
    let inicio = datos.Pagos.pag_url_comprobante.indexOf('Images/');
    let fin = datos.Pagos.pag_url_comprobante.indexOf('.');
    let NameFile = datos.Pagos.pag_url_comprobante.substring(inicio + 7);
    let typefile = datos.Pagos.pag_url_comprobante.substring(fin + 1);

    const imageUrl = datos.Pagos.pag_url_comprobante;
    const fileName = NameFile;
    const fileType = 'image/' + typefile;

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: fileType });

        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const customContent = document.createElement('div');
            customContent.innerHTML = `
              <section class="container-fluid small">
              <div class="row small">
                  <div class="col-md-4 col-sm-6">
                          <label class="truncate-text"><i class="fa-regular fa-address-card"></i>:${
                            datos.Pagos.cli_identificacion
                          }</label>
                  </div>
                  <div class="col-md-8 col-sm-6">
                          <label class="truncate-text"><i class="fa-solid fa-user"></i>:${
                            datos.Pagos.Cliente.cli_nombres
                          }</label>
                  </div>
                  <div class="col-md-3 col-6">
                          <label class="truncate-text"><i class="fa-solid fa-sack-dollar"></i>:${
                            datos.Pagos.pag_pago
                          }</label>
                  </div>
                  <div class="col-md-4 col-6">
                          <label class="truncate-text"><i class="fa-solid fa-barcode"></i>:${
                            datos.Pagos.pag_codigo_comprobante
                          }</label>
                  </div>
                  <div class="col-md-3 col-6">
                          <label class="truncate-text"><i class="fa-solid fa-calendar-days"></i>:${this.fechas.fechaCortaAbt(
                            datos.Pagos.pag_fecha_pago
                          )}</label>
                  </div>
                  <div class="col-md-2 col-6">
                          <label class="truncate-text"><i class="fa-solid fa-clipboard-check"></i>:${
                            datos.Pagos.pag_pago_verificado == 1 ? 'Si' : 'No'
                          }</label>
                  </div>  
              </div>
            </section>
              <img src="${e.target!.result}" style="max-width: 100%;" />
          `;

            Swal.fire({
              title: ' ',
              html: customContent,
              showCloseButton: true,
              width: 800,
            });
          };
          reader.readAsDataURL(file);
        }
      })
      .catch((error) => {
        console.error('Error recreating file from URL:', error);
      });

    this.RecrearImagenDesdeUrl(imageUrl, fileName, fileType);
    let file = this.selectedFile;
  }

  GuardarObjetoPagos(datos: any) {
    const minDate = new Date('1969-12-31T00:00:00.000Z');

    datos.id_cuenta = Number(datos.id_cuenta);
    datos.pag_pago_verificado =
      datos.pag_pago_verificado.toString() === 'true' ? '1' : '0';
    datos.pag_esactivo = datos.pag_esactivo.toString() === 'true' ? '1' : '0';
    datos.pag_fecha_verificacion == null
      ? minDate
      : datos.pag_fecha_verificacion;
    datos.pag_mes_pago = this.fechas.ExtraerMes(datos.pag_fecha_pago);

    let imagen = this.selectedFile!;
    if (imagen.name != '') {
      this.api
        .PotsSubirImagen(imagen)
        .pipe(
          map((tracks) => {
            let exito = tracks['exito'];
            let DirResult = tracks['data'];
            if (exito == 1) {
              datos.pag_url_comprobante = DirResult;

              if (this.TituloFormularioAgregarPagos === 'Editar') {
                this.api
                  .PutPagos(datos)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                    if (exito == 1) {
                      this.CerrarModalAgregarPagos();
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
              } else {
                datos.pag_id_gestor_ingresa = Number(this.Usuario.id_gestor);
                this.api
                  .PostPagos(datos)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.CerrarModalAgregarPagos();
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
            } else {
              this.alerta.ErrorEnLaPeticion(
                'Error al subir la imagen al servidor'
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
    } else {
      // this.alerta.ErrorEnLaPeticion('Seleccione la imagen del pago');
      this.alerta
        .AlertaValidacion(
          '¿Está seguro de que desea ingresar un pago sin adjuntar una imagen del comprobante?'
        )
        .then((confirmado) => {
          if (confirmado) {
            if (this.TituloFormularioAgregarPagos === 'Editar') {
              this.api
                .PutPagos(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.CerrarModalAgregarPagos();
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
            } else {
              datos.pag_id_gestor_ingresa = Number(this.Usuario.id_gestor);
              this.api
                .PostPagos(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.CerrarModalAgregarPagos();
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
          } else {
            this.alerta.ErrorEnLaPeticion(
              'Error al subir la imagen al servidor'
            );
          }
        });
    }
  }
  CargarElementoPagos(datos: any, num: number) {
    this.PagosForms.patchValue({
      id_pagos: datos.Pagos.id_pagos,
      id_gestor: datos.Pagos.id_gestor,
      cli_identificacion: datos.Pagos.cli_identificacion,
      ope_cod_credito: datos.Pagos.ope_cod_credito,
      id_cuenta: datos.Pagos.id_cuenta,
      id_cartera: datos.Pagos.id_cartera,
      pag_pago: datos.Pagos.pag_pago,
      pag_valor_total_comprobante: datos.Pagos.pag_valor_total_comprobante,
      pag_medio_contacto: datos.Pagos.pag_medio_contacto,
      pag_observacion_pago: datos.Pagos.pag_observacion_pago,
      pag_codigo_comprobante: datos.Pagos.pag_codigo_comprobante,
      pag_url_comprobante: datos.Pagos.pag_url_comprobante,
      pag_observ_comprobante: datos.Pagos.pag_observ_comprobante,
      pag_pago_verificado:
        datos.Pagos.pag_pago_verificado === '1' ? true : false,
      pag_id_gestor_ingresa: datos.Pagos.pag_id_gestor_ingresa,
      pag_id_gestor_verifica: datos.Pagos.pag_id_gestor_verifica,
      pag_mes_pago: datos.Pagos.pag_mes_pago,
      pag_fecha_pago: this.fechas.fechaCortaFormato(datos.Pagos.pag_fecha_pago),
      pag_fecha_verificacion: datos.Pagos.pag_fecha_verificacion,
      pag_esactivo: datos.Pagos.pag_esactivo === '1' ? true : false,
    });

    let inicio = datos.Pagos.pag_url_comprobante.indexOf('Images/');
    let fin = datos.Pagos.pag_url_comprobante.indexOf('.');
    let NameFile = datos.Pagos.pag_url_comprobante.substring(inicio + 7);
    let typefile = datos.Pagos.pag_url_comprobante.substring(fin + 1);

    const imageUrl = datos.Pagos.pag_url_comprobante;
    const fileName = NameFile;
    const fileType = 'image/' + typefile;

    this.RecrearImagenDesdeUrl(imageUrl, fileName, fileType);

    this.previewUrl = datos.Pagos.pag_url_comprobante;
    if (num != 1) {
      this.ListarContacto();
      this.ListarCreditos();
      this.ListarCuentas();
      this.BuscarCliente();
    }
    this.AbrirModalAgregarPagos(num);
  }

  // ****************************************** MODAL VER FAMILIARES *****************************************************************
  TituloFormularioFamiliares = '';

  ResetFamiliaresForms() {
    this.DatosPersonas = [];
    this.DatosAbuelos = [];
    this.DatosPadres = [];
    this.DatosHijos = [];
    this.DatosConyuge = [];
    this.DatosHermanos = [];
    this.DatosTios = [];
    this.DatosPrimos = [];
    this.DatosSobrinos = [];
    this.DatosNietos = [];
    this.DatosSuegros = [];
    this.DatosCunados = [];
    this.DatosPadreDeHijo = [];
    this.DatosMadreDeHijo = [];
    this.DatosHijosPoliticos = [];
    this.DatosTiosPoliticos = [];
    this.DatosPrimosPoliticos = [];
    this.DatosSobrinosPoliticos = [];
    this.DatosConcunados = [];
  }

  AbrirModalFamiliares() {
    this.TrabajosForms.patchValue({
      cli_identificacion: this.ClienteInf?.cli_identificacion,
    });
    this.GetPersonas(this.ClienteInf?.cli_identificacion!);

    (<HTMLElement>document.getElementById('ModalFamiliares')).classList.add(
      'modal--show'
    );
  }

  CerrarModalFamiliares() {
    (<HTMLElement>document.getElementById('ModalFamiliares')).classList.remove(
      'modal--show'
    );
    this.TituloFormularioFamiliares = '';
    this.ResetFamiliaresForms();
  }

  DatosFamilia!: any;
  SesionServiData: boolean = false;

  GetPersonas(cedula: string) {
    if (this.SesionServiData) {
      this.api
        .GetFamiliares(cedula, 'funcionbuscarfamilia')
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == '1') {
              this.DatosFamilia = tracks['data'];
              // this.CerrarModalAgregarTrabajos();
              // this.alerta.RegistroActualizado();
              // this.BuscarTrabajosCliente();
              this.GetSegmentarFamiliares();
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
    }
  }

  txtParentezco: string = '';
  DatosPersonas: PersonasI[] = [];

  Vacio!: PersonasI;
  DatosVacio!: any[];

  DatosAbuelos: PersonasI[] = [];
  DatosPadres: PersonasI[] = [];
  DatosHijos: PersonasI[] = [];
  DatosConyuge: PersonasI[] = [];
  DatosHermanos: PersonasI[] = [];
  DatosTios: PersonasI[] = [];
  DatosPrimos: PersonasI[] = [];
  DatosSobrinos: PersonasI[] = [];
  DatosNietos: PersonasI[] = [];
  DatosSuegros: PersonasI[] = [];
  DatosCunados: PersonasI[] = [];
  DatosPadreDeHijo: PersonasI[] = [];
  DatosMadreDeHijo: PersonasI[] = [];
  DatosHijosPoliticos: PersonasI[] = [];
  DatosTiosPoliticos: PersonasI[] = [];
  DatosPrimosPoliticos: PersonasI[] = [];
  DatosSobrinosPoliticos: PersonasI[] = [];
  DatosConcunados: PersonasI[] = [];

  async GetSegmentarFamiliares() {
    this.DatosPersonas = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'TITULAR';
      }
    );
    this.DatosAbuelos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'ABUELO/A';
      }
    );
    this.DatosPadres = this.DatosFamilia.filter((elemento: any, index: any) => {
      return elemento.parentezco === 'MAMÁ' || elemento.parentezco === 'PAPÁ';
    });
    this.DatosHijos = this.DatosFamilia.filter((elemento: any, index: any) => {
      return elemento.parentezco === 'HIJO/A';
    });
    this.DatosConyuge = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'CONYUGE';
      }
    );
    this.DatosHermanos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'HERMANO/A';
      }
    );
    this.DatosTios = this.DatosFamilia.filter((elemento: any, index: any) => {
      return elemento.parentezco === 'TIO/A';
    });
    this.DatosPrimos = this.DatosFamilia.filter((elemento: any, index: any) => {
      return elemento.parentezco === 'PRIMO/A';
    });
    this.DatosSobrinos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'SOBRINO/A';
      }
    );
    this.DatosNietos = this.DatosFamilia.filter((elemento: any, index: any) => {
      return elemento.parentezco === 'ÑIETO/A';
    });
    this.DatosSuegros = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'SUEGRO/A';
      }
    );
    this.DatosCunados = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'CUÑADO/A';
      }
    );
    this.DatosHijosPoliticos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return (
          elemento.parentezco === 'YERNO' || elemento.parentezco === 'NUERA'
        );
      }
    );
    this.DatosTiosPoliticos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'TIOS POLITICOS';
      }
    );
    this.DatosPrimosPoliticos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'PRIMOS POLITICOS';
      }
    );
    this.DatosSobrinosPoliticos = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'SOBRINOS POLITICOS';
      }
    );
    this.DatosConcunados = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'CONCUÑADOS';
      }
    );
    this.DatosMadreDeHijo = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'MADRE HIJO/A';
      }
    );
    this.DatosPadreDeHijo = this.DatosFamilia.filter(
      (elemento: any, index: any) => {
        return elemento.parentezco === 'PADRE HIJO/A';
      }
    );

    this.CambiarParentezco(18);
  }
  CambiarParentezco(num: number) {
    this.FraccionDatosInicio = 0;
    this.FraccionDatosFinal = 5;
    this.ContadorDatosFamiliares = 0;
    if (num == 18) {
      this.FraccionarValoresFamilia(this.DatosPersonas);
      this.txtParentezco = 'TITULAR';
    }
    if (num == 6) {
      this.FraccionarValoresFamilia(this.DatosAbuelos);
      this.txtParentezco = 'ABUELOS';
    }
    if (num == 0) {
      this.FraccionarValoresFamilia(this.DatosPadres);
      this.txtParentezco = 'PADRES';
    }
    if (num == 4) {
      this.FraccionarValoresFamilia(this.DatosHijos);
      this.txtParentezco = 'HIJOS';
    }
    if (num == 1) {
      this.FraccionarValoresFamilia(this.DatosConyuge);
      this.txtParentezco = 'CONYUGUE';
    }
    if (num == 5) {
      this.FraccionarValoresFamilia(this.DatosHermanos);
      this.txtParentezco = 'HERMANOS';
    }
    if (num == 7) {
      this.FraccionarValoresFamilia(this.DatosTios);
      this.txtParentezco = 'TIOS';
    }
    if (num == 8) {
      this.FraccionarValoresFamilia(this.DatosPrimos);
      this.txtParentezco = 'PRIMOS';
    }
    if (num == 9) {
      this.FraccionarValoresFamilia(this.DatosSobrinos);
      this.txtParentezco = 'SOBRINOS';
    }
    if (num == 10) {
      this.FraccionarValoresFamilia(this.DatosNietos);
      this.txtParentezco = 'NIETOS';
    }
    if (num == 11) {
      this.FraccionarValoresFamilia(this.DatosSuegros);
      this.txtParentezco = 'SUEGROS';
    }
    if (num == 12) {
      this.FraccionarValoresFamilia(this.DatosCunados);
      this.txtParentezco = 'CUÑADOS';
    }
    if (num == 13) {
      this.FraccionarValoresFamilia(this.DatosHijosPoliticos);
      this.txtParentezco = 'YERNO/NUERA';
    }
    if (num == 14) {
      this.FraccionarValoresFamilia(this.DatosTiosPoliticos);
      this.txtParentezco = 'TIOS POLITICOS';
    }
    if (num == 15) {
      this.FraccionarValoresFamilia(this.DatosPrimosPoliticos);
      this.txtParentezco = 'PRIMOS POLITICOS';
    }
    if (num == 16) {
      this.FraccionarValoresFamilia(this.DatosSobrinosPoliticos);
      this.txtParentezco = 'SOBRINOS POLITICOS';
    }
    if (num == 17) {
      this.FraccionarValoresFamilia(this.DatosConcunados);
      this.txtParentezco = 'CONCUÑADOS';
    }
    if (num == 2) {
      this.FraccionarValoresFamilia(this.DatosPadreDeHijo);
      this.txtParentezco = 'PADRE HIJO/A';
    }
    if (num == 3) {
      this.FraccionarValoresFamilia(this.DatosMadreDeHijo);
      this.txtParentezco = 'MADRE HIJO/A';
    }
  }

  AbrirVentanaServiData(numero: string) {
    const token_SD = this.cookeService.get('token');
    const idusuario_SD = this.cookeService.get('usuario_sd');
    const whatsappUrl = `https://consulta.cobrosystem.com/#/sesion/${idusuario_SD}/${numero}/${token_SD}`;
    window.open(whatsappUrl, '_blank');
  }
  // ****************************************** MODAL GESTIONES ANTERIORES *****************************************************************
  ListaGestionesAnt: any[] = [];
  AbrirModalGestionesAnteriores() {
    this.BuscarInfAdicional(7);
    (<HTMLElement>(
      document.getElementById('ModalGestionesAnteriores')
    )).classList.add('modal--show');
  }
  CerrarModalGestionesAnteriores() {
    this.ListaGestionesAnt = [];
    (<HTMLElement>(
      document.getElementById('ModalGestionesAnteriores')
    )).classList.remove('modal--show');
    // this.ResetGestionForms();
  }
  // ****************************************** MODAL VER ACTUALIZACIONES *****************************************************************
  ListaActualizacionesCredito: any[] = [];
  AbrirModalActualizaciones() {
    this.BuscarInfAdicional(9);
    (<HTMLElement>(
      document.getElementById('ModalActualizaciones')
    )).classList.add('modal--show');
  }

  CerrarModalActualizaciones() {
    this.ListaActualizacionesCredito = [];
    (<HTMLElement>(
      document.getElementById('ModalActualizaciones')
    )).classList.remove('modal--show');
  }
  // ****************************************** MODAL VER DOCUMENTOS *****************************************************************

  AbrirModalDocumentos() {
    (<HTMLElement>document.getElementById('ModalDocumentos')).classList.add(
      'modal--show'
    );
  }

  CerrarModalDocumentos() {
    (<HTMLElement>document.getElementById('ModalDocumentos')).classList.remove(
      'modal--show'
    );
  }

  // ****************************************** MODAL VER VALOR ORIGINAL *****************************************************************
  ValoresOriginales: any | null = null;
  AbrirModalValorOriginal() {
    this.BuscarInfAdicional(8);
    (<HTMLElement>document.getElementById('ModalValorOriginal')).classList.add(
      'modal--show'
    );
  }

  CerrarModalValorOriginal() {
    this.ValoresOriginales = null;
    (<HTMLElement>(
      document.getElementById('ModalValorOriginal')
    )).classList.remove('modal--show');
  }

  /*********************  PAGINACION EXCLUSIVO PARA LA TABLA FAMILIARES *********************** */
  DatosFamiliares: PersonasI[] = [];
  ContadorDatosFamiliares: number = 0;
  FraccionDatosInicio: number = 0;
  FraccionDatosFinal: number = 5;
  DatosTemporalesFamilia: any[] = [];

  FraccionarValoresFamilia(datos: any) {
    this.ContadorDatosFamiliares = datos.length;
    this.DatosTemporalesFamilia = datos;
    this.DatosFamiliares = datos.slice(
      this.FraccionDatosInicio,
      this.FraccionDatosFinal
    );
  }
  BtnNextFamilia() {
    this.FraccionDatosInicio = this.FraccionDatosInicio + 5;
    this.FraccionDatosFinal = this.FraccionDatosFinal + 5;
    this.FraccionarValoresFamilia(this.DatosTemporalesFamilia);
  }

  BtnPreviousFamilia() {
    if (this.FraccionDatosInicio >= 5) {
      this.FraccionDatosInicio = this.FraccionDatosInicio - 5;
      this.FraccionDatosFinal = this.FraccionDatosFinal - 5;
      this.FraccionarValoresFamilia(this.DatosTemporalesFamilia);
    }
  }
  // ****************************************** BUSCAR CLIENTES GENERAL *****************************************************************
  TipoBusquedaGeneral = new FormControl(1);
  ValorBusquedaGeneral = new FormControl('', Validators.required);

  BuscarClienteGeneral() {
    let TipoBusqueda = this.TipoBusquedaGeneral.value;
    let ValorBusqueda = this.ValorBusquedaGeneral.value;

    let filtro: GestionCG = {
      identificacion: ValorBusqueda!,
      nombres_cliente: '',
      cartera: [0],
      gestor: 0,
      contactabilidad: 0,
      pago: '0',
      prioridad: '0',
      monto_min: '0',
      monto_max: '0',
      meses: 0,
      tipo: Number(TipoBusqueda),
      codigo: this.FraccionDatos,
      rango: this.RangoDatos,
    };

    this.loading = true;
    this.ListaGestionar = [];
    this.api
      .GetGestionarFracionado(filtro)
      .pipe(
        map((tracks) => {
          this.ListaGestionar = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaGestionar.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaGestionar.length;
            this.FraccionarValores(this.ListaGestionar, this.ConstanteFraccion);
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
  EncerarClienteGeneral() {
    this.TipoBusquedaGeneral.patchValue(1);
    this.ValorBusquedaGeneral.patchValue('');
  }
  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.ResetGestionForms();
    this.ResetNotificacionForms();
    /************ variables de Contenido ********** */
    this.loading = false;
    // this.itemBusqueda.patchValue('');
    // this.txtBusqueda.patchValue('');

    this.TituloFormulario = '';
    this.Cliente = '';
    this.ListaContactabilidad = [];
    this.ClienteInf = null;
    this.ListaCorreos = [];
    this.ListaDirecciones = [];
    this.ListaGarantes = [];
    this.ListaTelefonos = [];
    this.ListaTrabajos = [];
    this.ProductoSeleccionado = null;
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
  OpcionesFiltro: any[] = [
    { id: 0, name: 'Identificación', value: '0' },
    { id: 1, name: 'Nombre', value: '1' },
    { id: 2, name: 'Estado', value: '2' },
    { id: 3, name: 'Gestor', value: '3' },
    { id: 4, name: 'Cartera', value: '4' },
    { id: 5, name: 'Provincia', value: '5' },
    { id: 6, name: 'Ultima Gestion ', value: '6' },
    { id: 7, name: 'Pago Actual', value: '7' },
  ];

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
    const ThApellido = document.getElementById(
      'ThApellido'
    ) as HTMLInputElement;

    ThApellido.style.color = '';
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
    const ThApellido = document.getElementById(
      'ThApellido'
    ) as HTMLInputElement;
    if (this.FirltroPor === 'Nombre') {
      let nombre = this.TextoFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaGestionar.filter((elemento) => {
          return elemento.ges_nombres.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThDescripcion.style.color = 'red';
      } else {
        ThDescripcion.style.color = '';
      }
    }
    if (this.FirltroPor === 'Apellido') {
      let nombre = this.TextoFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaGestionar.filter((elemento) => {
          return elemento.ges_apellidos.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThApellido.style.color = 'red';
      } else {
        ThApellido.style.color = '';
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
    const ThApellido = document.getElementById(
      'ThApellido'
    ) as HTMLInputElement;
    ThDescripcion.style.color = '';
    ThApellido.style.color = '';
    inputElement.disabled = true;
    this.FirltroPor = '';
    this.TextoFiltro.patchValue('');
    this.FraccionarValores(
      this.DatosTemporalesBusqueda,
      this.ConstanteFraccion
    );
  }

  errorStatus: boolean = false;
  errorMsj: any = '';

  // constructor(
  //   private api: ApiService,
  //   private router: Router,
  //   private cookieService: CookieService
  // ) {}

  loginForm = new FormGroup({
    codUsuario: new FormControl('', Validators.required),
    passwordusuario: new FormControl('', Validators.required),
    cambio: new FormControl(),
  });

  // ngOnInit(): void {
  //   this.checkLocal();
  // }
  // checkLocal() {
  //   if (localStorage.getItem('token')) {
  //     this.router.navigate(['dashboard']);
  //   }
  // }

  onLoginPost(form: LoginISD) {
    // form.cambio = 0;
    this.api.PostIniciarSesionServiData(form).subscribe((respuest) => {
      const exito = respuest['exito'];
      const mensaje = respuest['mensaje'];
      const data = respuest['data'];

      if (exito == '1') {
        this.SesionServiData = true;
        this.cookeService.set('token', data.Token);
        this.cookeService.set('usuario_sd', data.secuencialUsuario);
        this.GetPersonas(this.ClienteInf?.cli_identificacion!);
      }

      if (exito == '0') {
        this.errorStatus = true;
        this.errorMsj = mensaje;
      }

      if (exito == '2') {
        this.showModal('usuario en sesión');
      }

      if (exito == '3') {
        Swal.fire('Usuario Inhabilitado!', '', 'error');
      }

      if (exito == '4') {
        Swal.fire('Empresa Inactiva!', '', 'error');
      }
    });
  }

  showModal(mensaje: string) {
    Swal.fire({
      title: mensaje,
      text: 'Desea Remplazarla',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Remplazar!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Swal.fire('Remplazado!', '', 'success');
        Swal.fire({
          // position: 'top-end',
          icon: 'success',
          title: 'Remplazado!',
          showConfirmButton: false,
          timer: 1000,
        });

        this.loginForm.value.cambio = 1;
        this.onLoginPost(this.loginForm.value);
      }
    });
  }




}
