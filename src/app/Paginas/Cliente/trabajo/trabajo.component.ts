import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { ApiService } from 'src/app/service/api.service';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs';
import { ClienteI, DireccionI, generarPDF, Tipo_DireccionI, Tipo_TrabajoI, TrabajoI } from 'src/app/Modelos/response.interface';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Component({
  selector: 'app-trabajo',
  templateUrl: './trabajo.component.html',
  styleUrls: ['./trabajo.component.css']
})
export class TrabajoComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiService,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,    
    public validar: TipoDeTexto,public reporte:GeneradorReporte
  ) {}
  ngOnInit(): void {
    this.ListarElementos(1);
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'trabajo';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gTrabajo!:generarPDF;
  // visible: boolean = false;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = [
    '',
    'Identificación',
    'Nombre Completo',
    'Nombre Incompleto',
    'Ruc',
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
  ListaTrabajos: any[] = [];

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaTrabajos = [];
      this.FraccionDatos = 0;
    }

    this.ListaTrabajos = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetTrabajosFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaTrabajos = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tra of this.ListaTrabajos)
            {
              let ocD: any = {
                Cedula:tra.cli_identificacion,
                Nombres:tra.cli_nombres,
                Ruc:tra.tra_ruc,
                Descripcion:tra.tra_descripcion,
                FIngreso:tra.tra_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tra.tra_fecha_in.toString()),
                Estado:tra.tra_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Trabajo', listado: listadoObjeto
            };
            this.gTrabajo=om;
          if (this.ListaTrabajos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaTrabajos.length;
            this.FraccionarValores(
              0,
              this.ListaTrabajos,
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
    if (this.itemBusqueda.value === 'Identificación') {
      tipo = 1;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Nombre Completo') {
      tipo = 2;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Nombre Incompleto') {
      tipo = 3;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Ruc') {
      tipo = 4;
      this.GetFiltrarElemento(valor, tipo);
    }
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaTrabajos = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetTrabajosFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaTrabajos = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tra of this.ListaTrabajos)
            {
              let ocD: any = {
                Cedula:tra.cli_identificacion,
                Nombres:tra.cli_nombres,
                Ruc:tra.tra_ruc,
                Descripcion:tra.tra_descripcion,
                FIngreso:tra.tra_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tra.tra_fecha_in.toString()),
                Estado:tra.tra_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Trabajo', listado: listadoObjeto
            };
            this.gTrabajo=om;
          if (this.ListaTrabajos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaTrabajos.length;
            this.FraccionarValores(
              0,
              this.ListaTrabajos,
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
  Cliente = new FormControl({ value: '', disabled: true }, Validators.required);

  TrabajosForms = new FormGroup({
    id_trabajo: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    tra_ruc: new FormControl('', [Validators.required,this.validar.validarLongitudFija(13),this.validar.VFN_SoloNumeros()]),
    tra_descripcion: new FormControl('', Validators.required),
    tra_direccion: new FormControl(''),
    tra_telefono: new FormControl(''),
    tra_correo: new FormControl(''),
    tra_observacion: new FormControl(''),
    tra_fecha_act: new FormControl(this.Fechas.fecha()),
    tra_fecha_desact: new FormControl(this.Fechas.fecha()),
    tra_fecha_in: new FormControl(this.Fechas.fecha()),
    tra_fecha_up: new FormControl(this.Fechas.fecha()),
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
      tra_fecha_act: this.Fechas.fecha(),
      tra_fecha_desact: this.Fechas.fecha(),
      tra_fecha_in: this.Fechas.fecha(),
      tra_fecha_up: this.Fechas.fecha(),
      tra_esactivo: true,
      tra_id_tipo_trabajo: '',
      tra_origendatos: 'Sistema_CobroSys',
    });
  }

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.TrabajosForms.get('id_trabajo')?.disable();
      this.TrabajosForms.get('cli_identificacion')?.disable();
      this.TrabajosForms.get('tra_ruc')?.disable();
      this.TrabajosForms.get('tra_descripcion')?.disable();
      this.TrabajosForms.get('tra_direccion')?.disable();
      this.TrabajosForms.get('tra_telefono')?.disable();
      this.TrabajosForms.get('tra_correo')?.disable();
      this.TrabajosForms.get('tra_observacion')?.disable();
      this.TrabajosForms.get('tra_fecha_act')?.disable();
      this.TrabajosForms.get('tra_fecha_desact')?.disable();
      this.TrabajosForms.get('tra_fecha_in')?.disable();
      this.TrabajosForms.get('tra_fecha_up')?.disable();
      this.TrabajosForms.get('tra_esactivo')?.disable();
      this.TrabajosForms.get('tra_id_tipo_trabajo')?.disable();
      this.TrabajosForms.get('tra_origendatos')?.disable();
    }
    if (num === 1) {
      //activos
      this.TrabajosForms.get('id_trabajo')?.enable();
      this.TrabajosForms.get('cli_identificacion')?.enable();
      this.TrabajosForms.get('tra_ruc')?.enable();
      this.TrabajosForms.get('tra_descripcion')?.enable();
      this.TrabajosForms.get('tra_direccion')?.enable();
      this.TrabajosForms.get('tra_telefono')?.enable();
      this.TrabajosForms.get('tra_correo')?.enable();
      this.TrabajosForms.get('tra_observacion')?.enable();
      this.TrabajosForms.get('tra_fecha_act')?.enable();
      this.TrabajosForms.get('tra_fecha_desact')?.enable();
      this.TrabajosForms.get('tra_fecha_in')?.enable();
      this.TrabajosForms.get('tra_fecha_up')?.enable();
      this.TrabajosForms.get('tra_esactivo')?.enable();
      this.TrabajosForms.get('tra_id_tipo_trabajo')?.enable();
      this.TrabajosForms.get('tra_origendatos')?.enable();
      
    }
    if (num === 2) {
      //edicion
      this.TrabajosForms.get('cli_identificacion')?.enable();
      this.TrabajosForms.get('tra_ruc')?.enable();
      this.TrabajosForms.get('tra_descripcion')?.enable();
      this.TrabajosForms.get('tra_direccion')?.enable();
      this.TrabajosForms.get('tra_telefono')?.enable();
      this.TrabajosForms.get('tra_correo')?.enable();
      this.TrabajosForms.get('tra_observacion')?.enable();
      this.TrabajosForms.get('tra_esactivo')?.enable();
      this.TrabajosForms.get('tra_id_tipo_trabajo')?.enable();
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
    datos.tra_esactivo = datos.tra_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutTrabajos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              // this.TextoFiltro.patchValue('');
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
        .PostTrabajos(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              // this.TextoFiltro.patchValue('');
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
  ActualizaEstado(elemento: TrabajoI) {
    elemento.tra_esactivo = (elemento.tra_esactivo == '1' ? 0 : 1).toString();
    this.api.PutTrabajos(elemento).subscribe((x) => this.ListarElementos(1));
  }

  EliminarElemento(elemento: TrabajoI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.tra_esactivo = '3';
        this.api.PutTrabajos(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  CargarElemento(datos: any, num: number) {
    this.TrabajosForms.patchValue({
      id_trabajo: datos.id_trabajo,
      cli_identificacion: datos.cli_identificacion,
      tra_ruc: datos.tra_ruc,
      tra_descripcion: datos.tra_descripcion,
      tra_direccion: datos.tra_direccion,
      tra_telefono: datos.tra_telefono,
      tra_correo: datos.tra_correo,
      tra_observacion: datos.tra_observacion,
      tra_fecha_act: this.Fechas.fechaFormato(datos.tra_fecha_act),
      tra_fecha_desact: this.Fechas.fechaFormato(datos.tra_fecha_desact),
      tra_fecha_in: this.Fechas.fechaFormato(datos.tra_fecha_in),
      tra_fecha_up: this.Fechas.fechaFormato(datos.tra_fecha_up),
      tra_esactivo: datos.tra_esactivo === '1' ? true : false,
      tra_id_tipo_trabajo: datos.tra_id_tipo_trabajo,
      tra_origendatos: datos.tra_origendatos,
    });
    if (num != 1) {
      this.ListarTipoTrabajo();
      this.BuscarCliente(datos.cli_identificacion);
    }
    this.AgregarEditarElemento(num);
  }
  // ****************************************** OTROS ELEMENTOS *****************************************************************

  ClienteSeleccionado!: ClienteI | null;

  BuscarCliente(identificacion: string) {
    this.Cliente.patchValue('');
    if (identificacion == '') {
      this.alerta.ErrorEnLaPeticion(
        'No ingreso ningun identificador para su busqueda'
      );
    } else {
      this.api
        .GetClienteFracionadoFiltro(identificacion, 10)
        .pipe(
          map((tracks) => {
            const datos = tracks['data'];
            if (!datos) {
              this.alerta.NoExistenDatos();
            } else {
              this.ClienteSeleccionado = datos;
              this.Cliente.patchValue(datos.cli_nombres);
            }
          }),
          catchError((error) => {
            this.alerta.ErrorAlRecuperarElementos();
            throw new Error(error);
          })
        )
        .subscribe();
    }
  }
  ////////////////////////////////////////  CLIENTE   ////////////////////////////////////////////////
  TipoIdentificacion: any[] = [
    { id: 1, name: 'Cedula', value: '1' },
    { id: 2, name: 'Ruc', value: '2' },
    { id: 3, name: 'Pasaporte', value: '3' },
  ];
  Genero: any[] = [
    { id: 1, name: 'Hombre', value: 'M' },
    { id: 2, name: 'Mujer', value: 'F' },
    { id: 3, name: 'No responder', value: '0' },
  ];
  EstadoCivil: any[] = [
    { id: 1, name: 'Soltero/a', value: '1' },
    { id: 2, name: 'Casado/a', value: '2' },
    { id: 3, name: 'Divorciado/a', value: '3' },
    { id: 4, name: 'Viudo/a', value: '4' },
    { id: 5, name: 'Union-Libre', value: '5' },
    { id: 6, name: 'No especificado', value: '6' },
  ];

  ModoVistaCliente: boolean = false;
  ClienteForms = new FormGroup({
    id_cliente: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    cli_nombres: new FormControl('', Validators.required),
    cli_tipo_identificacion: new FormControl('',Validators.required),
    cli_genero: new FormControl('0'),
    cli_estado_civil: new FormControl('',Validators.required),
    cli_ocupacion: new FormControl(''),
    cli_fecha_nacimiento: new FormControl('',Validators.required),
    cli_score: new FormControl(''),
    cli_prioridad: new FormControl(''),
    cli_certificado: new FormControl(false),
    cli_certificado_url: new FormControl(''),
    cli_fallecido: new FormControl(false),
    cli_fecha_fallecido: new FormControl(''),
    cli_observacion: new FormControl(''),
    cli_provincia: new FormControl(''),
    cli_canton: new FormControl(''),
    cli_parroquia: new FormControl(''),
    cli_fecha_act: new FormControl(this.Fechas.fecha()),
    cli_fecha_desact: new FormControl(this.Fechas.fecha()),
    cli_fecha_in: new FormControl(this.Fechas.fecha()),
    cli_fecha_up: new FormControl(this.Fechas.fecha()),
    cli_esactivo: new FormControl(true),
    cli_estado_contacta: new FormControl(''),
    cli_id_ultima_gestion: new FormControl(''),
    cli_baseactual: new FormControl(true),
    cli_origendatos: new FormControl('Sistema_CobroSys'),
  }
  ,
  {
    validators: [
      this.validar.ValidatorTipo_Identificacion(
        'cli_identificacion',
        'cli_tipo_identificacion'
      ),
    ],
  }
);

  ResetClienteForms() {
    this.ClienteForms.reset({
      id_cliente: 0,
      cli_identificacion: '',
      cli_nombres: '',
      cli_tipo_identificacion: '',
      cli_genero: '0',
      cli_estado_civil: '',
      cli_ocupacion: '',
      cli_fecha_nacimiento: '',
      cli_score: '',
      cli_fallecido: false,
      cli_fecha_fallecido: '',
      cli_observacion: '',
      cli_provincia: '',
      cli_canton: '',
      cli_parroquia: '',
      cli_fecha_act: this.Fechas.fecha(),
      cli_fecha_desact: this.Fechas.fecha(),
      cli_fecha_in: this.Fechas.fecha(),
      cli_fecha_up: this.Fechas.fecha(),
      cli_esactivo: true,
      cli_estado_contacta: '',
      cli_id_ultima_gestion: '',
      cli_baseactual: true,
      cli_origendatos: 'Sistema_CobroSys',
    });
  }

  VerCliente() {
    this.ClienteForms.get('cli_identificacion')?.disable();
    this.ClienteForms.get('cli_nombres')?.disable();
    this.ClienteForms.get('cli_tipo_identificacion')?.disable();
    this.ClienteForms.get('cli_genero')?.disable();
    this.ClienteForms.get('cli_estado_civil')?.disable();
    this.ClienteForms.get('cli_ocupacion')?.disable();
    this.ClienteForms.get('cli_fecha_nacimiento')?.disable();
    this.ClienteForms.get('cli_score')?.disable();
    this.ClienteForms.get('cli_fallecido')?.disable();
    this.ClienteForms.get('cli_fecha_fallecido')?.disable();
    this.ClienteForms.get('cli_observacion')?.disable();
    this.ClienteForms.get('cli_provincia')?.disable();
    this.ClienteForms.get('cli_canton')?.disable();
    this.ClienteForms.get('cli_parroquia')?.disable();
    this.ClienteForms.get('cli_esactivo')?.disable();
    this.ModoVistaCliente = true;
    (<HTMLElement>document.getElementById('ModalCliente')).classList.add(
      'modal--show'
    );
    this.ClienteForms.patchValue({
      id_cliente: this.ClienteSeleccionado!.id_cliente,
      cli_identificacion: this.ClienteSeleccionado!.cli_identificacion,
      cli_nombres: this.ClienteSeleccionado!.cli_nombres,
      cli_tipo_identificacion:
        this.ClienteSeleccionado!.cli_tipo_identificacion.toString(),
      cli_genero: this.ClienteSeleccionado!.cli_genero,
      cli_estado_civil: this.ClienteSeleccionado!.cli_estado_civil,
      cli_ocupacion: this.ClienteSeleccionado!.cli_ocupacion,
      cli_fecha_nacimiento: this.Fechas.fechaCortaFormato(
        this.ClienteSeleccionado!.cli_fecha_nacimiento
      ),
      cli_score: this.ClienteSeleccionado!.cli_score,
      cli_fallecido:
        this.ClienteSeleccionado!.cli_fallecido === '1' ? true : false,
      cli_fecha_fallecido: this.Fechas.fechaCortaFormato(
        this.ClienteSeleccionado!.cli_fecha_fallecido
      ),
      cli_observacion: this.ClienteSeleccionado!.cli_observacion,
      cli_provincia: this.ClienteSeleccionado!.cli_provincia,
      cli_canton: this.ClienteSeleccionado!.cli_canton,
      cli_parroquia: this.ClienteSeleccionado!.cli_parroquia,
      cli_esactivo:
        this.ClienteSeleccionado!.cli_esactivo === '1' ? true : false,
      cli_estado_contacta: this.ClienteSeleccionado!.cli_estado_contacta,
      cli_id_ultima_gestion: this.ClienteSeleccionado!.cli_id_ultima_gestion,
      cli_baseactual:
        this.ClienteSeleccionado!.cli_baseactual === '1' ? true : false,
      cli_origendatos: this.ClienteSeleccionado!.cli_origendatos,
    });
  }

  AbrirModalCliente() {
    this.TrabajosForms.patchValue({ cli_identificacion: '' });
    this.Cliente.patchValue('');
    (<HTMLElement>document.getElementById('ModalCliente')).classList.add(
      'modal--show'
    );
  }

  CerrarModalCliente() {
    this.ClienteForms.get('cli_identificacion')?.enable();
    this.ClienteForms.get('cli_nombres')?.enable();
    this.ClienteForms.get('cli_tipo_identificacion')?.enable();
    this.ClienteForms.get('cli_genero')?.enable();
    this.ClienteForms.get('cli_estado_civil')?.enable();
    this.ClienteForms.get('cli_ocupacion')?.enable();
    this.ClienteForms.get('cli_fecha_nacimiento')?.enable();
    this.ClienteForms.get('cli_score')?.enable();
    this.ClienteForms.get('cli_fallecido')?.enable();
    this.ClienteForms.get('cli_fecha_fallecido')?.enable();
    this.ClienteForms.get('cli_observacion')?.enable();
    this.ClienteForms.get('cli_provincia')?.enable();
    this.ClienteForms.get('cli_canton')?.enable();
    this.ClienteForms.get('cli_parroquia')?.enable();
    this.ClienteForms.get('cli_esactivo')?.enable();
    this.ModoVistaCliente = false;
    (<HTMLElement>document.getElementById('ModalCliente')).classList.remove(
      'modal--show'
    );
    this.ResetClienteForms();
  }

  GuardarObjetoCliente(datos: any) {
    const minDate = new Date('1969-12-31').toISOString().split('T')[0];
    datos.cli_fecha_nacimiento = datos.cli_fecha_nacimiento == '' ? minDate : datos.cli_fecha_nacimiento;
    datos.cli_fecha_fallecido = datos.cli_fecha_fallecido == '' ? minDate : datos.cli_fecha_fallecido;
    datos.cli_prioridad = datos.cli_prioridad == '' ? minDate : datos.cli_prioridad;

    datos.id_cliente = Number(datos.id_cliente);
    datos.cli_tipo_identificacion = Number(datos.cli_tipo_identificacion);
    datos.cli_esactivo = datos.cli_esactivo.toString() === 'true' ? '1' : '0';
    datos.cli_certificado = datos.cli_certificado.toString() === 'true' ? '1' : '0';
    datos.cli_baseactual = datos.cli_baseactual.toString() === 'true' ? '1' : '0';
    datos.cli_fallecido = datos.cli_fallecido.toString() === 'true' ? '1' : '0';

    this.api
      .PostCliente(datos)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            this.CerrarModalCliente();
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

  //////////////////////////////////////////  TIPO TRABAJO   /////////////////////////////////////////////////////
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

  TipoTrabajoForms = new FormGroup({
    id_tipo_trabajo: new FormControl( 0, Validators.required),
    trab_tip_descripcion: new FormControl('', Validators.required),
    trab_tip_fecha_act: new FormControl(this.Fechas.fecha()),
    trab_tip_fecha_desact: new FormControl(this.Fechas.fecha()),
    trab_tip_fecha_in: new FormControl(this.Fechas.fecha()),
    trab_tip_fecha_up: new FormControl(this.Fechas.fecha()),
    trab_tip_esactivo: new FormControl(true),
  });
  ResetTipoTrabajoForms() {
    this.TipoTrabajoForms.reset({
      id_tipo_trabajo: 0,
      trab_tip_descripcion: '',
      trab_tip_fecha_act: this.Fechas.fecha(),
      trab_tip_fecha_desact: this.Fechas.fecha(),
      trab_tip_fecha_in: this.Fechas.fecha(),
      trab_tip_fecha_up: this.Fechas.fecha(),
      trab_tip_esactivo: true,
    });
  }

  AbrirModalTipoTrabajos() {
    this.TrabajosForms.patchValue({ tra_id_tipo_trabajo: '' });
    this.TipoTrabajoList = [];
    (<HTMLElement>document.getElementById('ModalTipoTrabajos')).classList.add(
      'modal--show'
    );
  }

  CerrarModalTipoTrabajos() {
    (<HTMLElement>document.getElementById('ModalTipoTrabajos')).classList.remove(
      'modal--show'
    );
    this.ResetTipoTrabajoForms();
  }

  GuardarObjetoTipoTrabajos(datos: any) {
    datos.trab_tip_esactivo =
      datos.trab_tip_esactivo.toString() === 'true' ? '1' : '0';

    this.api
      .PostTipoTrabajo(datos)
      .pipe(
        map((tracks) => {
          const exito = tracks['exito'];
          if (exito == 1) {
            this.CerrarModalTipoTrabajos();
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

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.TipoTrabajoList = [];
    this.Cliente.patchValue('');
    this.ClienteSeleccionado = null;
    this.ResetTrabajosForms();
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
        this.ListarElementos(2);
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
        this.ListarElementos(2);
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
  /*********************  FILTRO MODO GENERAL *********************** */
  DatosTemporalesBusqueda: any[] = [];
  FirltroPor: string = '';

  FiltrarPor(filtro: string, etiqueta: number) {
    const TxtFiltro = document.getElementById(
      'TxtFiltro' + etiqueta
    ) as HTMLInputElement;
    const ThDescripcion = document.getElementById(
      'ThDescripcion' + etiqueta
    ) as HTMLInputElement;
    const ThIdentificacion = document.getElementById(
      'ThIdentificacion' + etiqueta
    ) as HTMLInputElement;
    const ThDireccion = document.getElementById(
      'ThDireccion' + etiqueta
    ) as HTMLInputElement;

    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = filtro;
    ThDescripcion.style.color = '';
    ThIdentificacion.style.color = '';
    ThDireccion.style.color = '';
    TxtFiltro.value = '';
    TxtFiltro.disabled = false;
    TxtFiltro.focus();
  }
  FiltrarLista(num: number, etiqueta: number) {
    const TxtFiltro = document.getElementById(
      'TxtFiltro' + etiqueta
    ) as HTMLInputElement;
    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    const contador = TxtFiltro.value!.length;
    this.EncerarVariablesPaginacion(0);
    lblFiltro.textContent != 'Correo'
      ? (TxtFiltro.value = TxtFiltro.value!.toUpperCase())
      : (TxtFiltro.value = TxtFiltro.value!);
    const ThDescripcion = document.getElementById(
      'ThDescripcion' + etiqueta
    ) as HTMLInputElement;
    const ThIdentificacion = document.getElementById(
      'ThIdentificacion' + etiqueta
    ) as HTMLInputElement;
    const ThDireccion = document.getElementById(
      'ThDireccion' + etiqueta
    ) as HTMLInputElement;

    if (lblFiltro.textContent === 'Nombres') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaTrabajos.filter((elemento) => {
          return elemento.cli_nombres.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(0, resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThDescripcion.style.color = 'red';
      } else {
        ThDescripcion.style.color = '';
      }
    }
    if (lblFiltro.textContent === 'Identificacion') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaTrabajos.filter((elemento) => {
          return elemento.cli_identificacion.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(0, resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThIdentificacion.style.color = 'red';
      } else {
        ThIdentificacion.style.color = '';
      }
    }
    if (lblFiltro.textContent === 'Direccion') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaTrabajos.filter((elemento) => {
          return elemento.cor_email.includes(nombre);
        });
        this.FraccionarValores(0, resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThDireccion.style.color = 'red';
      } else {
        ThDireccion.style.color = '';
      }
    }
  }

  VaciarFiltro(etiqueta: number) {
    const TxtFiltro = document.getElementById(
      'TxtFiltro' + etiqueta
    ) as HTMLInputElement;
    const ThIdentificacion = document.getElementById(
      'ThIdentificacion' + etiqueta
    ) as HTMLInputElement;
    const ThDescripcion = document.getElementById(
      'ThDescripcion' + etiqueta
    ) as HTMLInputElement;
    const ThDireccion = document.getElementById(
      'ThDireccion' + etiqueta
    ) as HTMLInputElement;
    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = '';
    ThDescripcion.style.color = '';
    ThIdentificacion.style.color = '';
    ThDireccion.style.color = '';
    TxtFiltro.disabled = true;
    TxtFiltro.value = '';
    this.FirltroPor = '';
    if (etiqueta === 0) {
      this.FraccionarValores(
        0,
        this.DatosTemporalesBusqueda,
        this.ConstanteFraccion
      );
    }
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gTrabajo);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gTrabajo);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gTrabajo);
    }
  }
}
