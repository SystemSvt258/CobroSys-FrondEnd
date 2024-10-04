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
import { ClienteI, generarPDF, GestorI } from 'src/app/Modelos/response.interface';
import { catchError, map } from 'rxjs';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css'],
})
export class ClienteComponent implements OnInit {
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
    return elemento.men_url === 'cliente';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gCliente!:generarPDF;
  // visible: boolean = false;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = [
    '',
    'Identificacion',
    'Nombre Completo',
    'Nombre Incompleto',
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
  ListaClientes: ClienteI[] = [];

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaClientes = [];
      this.FraccionDatos = 0;
    }

    this.ListaClientes = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetClienteFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaClientes = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaClientes)
            {
              let ocD: any = {
                Cedula:tipoT.cli_identificacion,
                Nombres:tipoT.cli_nombres,
                Certificado:(tipoT.cli_certificado===null||tipoT.cli_certificado==='0')?'NO':'SI',
                FNacimiento:tipoT.cli_fecha_nacimiento ===null?null:this.Fechas.fechaCortaAbt(tipoT.cli_fecha_nacimiento.toString()),
                FIngreso:tipoT.cli_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.cli_fecha_in.toString()),
                Estado:tipoT.cli_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cliente', listado: listadoObjeto
            };
            this.gCliente=om;
          if (this.ListaClientes.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaClientes.length;
            this.FraccionarValores(
              0,
              this.ListaClientes,
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
    if (this.itemBusqueda.value === 'Identificacion') {
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
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaClientes = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetClienteFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaClientes = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaClientes)
            {
              let ocD: any = {
                Cedula:tipoT.cli_identificacion,
                Nombres:tipoT.cli_nombres,
                Certificado:(tipoT.cli_certificado===null||tipoT.cli_certificado==='0')?'NO':'SI',
                FNacimiento:tipoT.cli_fecha_nacimiento ===null?null:this.Fechas.fechaCortaAbt(tipoT.cli_fecha_nacimiento.toString()),
                FIngreso:tipoT.cli_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.cli_fecha_in.toString()),
                Estado:tipoT.cli_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cliente', listado: listadoObjeto
            };
            this.gCliente=om;
          if (this.ListaClientes.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaClientes.length;
            this.FraccionarValores(
              0,
              this.ListaClientes,
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
      cli_prioridad: '',
      cli_certificado: false,
      cli_certificado_url: '',
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
  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.ClienteForms.get('id_cliente')?.disable();
      this.ClienteForms.get('cli_identificacion')?.disable();
      this.ClienteForms.get('cli_nombres')?.disable();
      this.ClienteForms.get('cli_tipo_identificacion')?.disable();
      this.ClienteForms.get('cli_genero')?.disable();
      this.ClienteForms.get('cli_estado_civil')?.disable();
      this.ClienteForms.get('cli_ocupacion')?.disable();
      this.ClienteForms.get('cli_fecha_nacimiento')?.disable();
      this.ClienteForms.get('cli_prioridad')?.disable();
      this.ClienteForms.get('cli_certificado')?.disable();
      this.ClienteForms.get('cli_certificado_url')?.disable();
      this.ClienteForms.get('cli_score')?.disable();
      this.ClienteForms.get('cli_fallecido')?.disable();
      this.ClienteForms.get('cli_fecha_fallecido')?.disable();
      this.ClienteForms.get('cli_observacion')?.disable();
      this.ClienteForms.get('cli_provincia')?.disable();
      this.ClienteForms.get('cli_canton')?.disable();
      this.ClienteForms.get('cli_parroquia')?.disable();
      this.ClienteForms.get('cli_fecha_act')?.disable();
      this.ClienteForms.get('cli_fecha_desact')?.disable();
      this.ClienteForms.get('cli_fecha_in')?.disable();
      this.ClienteForms.get('cli_fecha_up')?.disable();
      this.ClienteForms.get('cli_esactivo')?.disable();
      this.ClienteForms.get('cli_estado_contacta')?.disable();
      this.ClienteForms.get('cli_id_ultima_gestion')?.disable();
      this.ClienteForms.get('cli_baseactual')?.disable();
      this.ClienteForms.get('cli_origendatos')?.disable();
    }
    if (num === 1) {
      //activos
      this.ClienteForms.get('id_cliente')?.enable();
      this.ClienteForms.get('cli_identificacion')?.enable();
      this.ClienteForms.get('cli_nombres')?.enable();
      this.ClienteForms.get('cli_tipo_identificacion')?.enable();
      this.ClienteForms.get('cli_genero')?.enable();
      this.ClienteForms.get('cli_estado_civil')?.enable();
      this.ClienteForms.get('cli_ocupacion')?.enable();
      this.ClienteForms.get('cli_fecha_nacimiento')?.enable();
      this.ClienteForms.get('cli_prioridad')?.enable();
      this.ClienteForms.get('cli_certificado')?.enable();
      this.ClienteForms.get('cli_certificado_url')?.enable();
      this.ClienteForms.get('cli_score')?.enable();
      this.ClienteForms.get('cli_fallecido')?.enable();
      this.ClienteForms.get('cli_fecha_fallecido')?.enable();
      this.ClienteForms.get('cli_observacion')?.enable();
      this.ClienteForms.get('cli_provincia')?.enable();
      this.ClienteForms.get('cli_canton')?.enable();
      this.ClienteForms.get('cli_parroquia')?.enable();
      this.ClienteForms.get('cli_fecha_act')?.enable();
      this.ClienteForms.get('cli_fecha_desact')?.enable();
      this.ClienteForms.get('cli_fecha_in')?.enable();
      this.ClienteForms.get('cli_fecha_up')?.enable();
      this.ClienteForms.get('cli_esactivo')?.enable();
      this.ClienteForms.get('cli_estado_contacta')?.enable();
      this.ClienteForms.get('cli_id_ultima_gestion')?.enable();
      this.ClienteForms.get('cli_baseactual')?.enable();
      this.ClienteForms.get('cli_origendatos')?.enable();
    }
    if (num === 2) {
      //edicion
      this.ClienteForms.get('cli_identificacion')?.enable();
      this.ClienteForms.get('cli_nombres')?.enable();
      this.ClienteForms.get('cli_tipo_identificacion')?.enable();
      this.ClienteForms.get('cli_genero')?.enable();
      this.ClienteForms.get('cli_estado_civil')?.enable();
      this.ClienteForms.get('cli_ocupacion')?.enable();
      this.ClienteForms.get('cli_fecha_nacimiento')?.enable();
      this.ClienteForms.get('cli_certificado')?.enable();
      this.ClienteForms.get('cli_score')?.enable();
      this.ClienteForms.get('cli_fallecido')?.enable();
      this.ClienteForms.get('cli_fecha_fallecido')?.enable();
      this.ClienteForms.get('cli_observacion')?.enable();
      this.ClienteForms.get('cli_provincia')?.enable();
      this.ClienteForms.get('cli_canton')?.enable();
      this.ClienteForms.get('cli_parroquia')?.enable();
      this.ClienteForms.get('cli_esactivo')?.enable();
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
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutCliente(datos)
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
              this.ActDesControles(2);
            }
          }),
          catchError((error) => {
            this.alerta.ErrorEnLaOperacion();
            this.ActDesControles(2);
            throw new Error(error);
          })
        )
        .subscribe();
    } else {
      this.api
        .PostCliente(datos)
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
  ActualizaEstado(elemento: ClienteI) {
    elemento.cli_esactivo = (elemento.cli_esactivo == '1' ? 0 : 1).toString();
    this.api.PutCliente(elemento).subscribe((x) => this.ListarElementos(1));
  }

  EliminarElemento(elemento: ClienteI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cli_esactivo = '3';
        this.api.PutCliente(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  CargarElemento(datos: any, num: number) {
    this.ClienteForms.patchValue({
      id_cliente: datos.id_cliente,
      cli_tipo_identificacion: datos.cli_tipo_identificacion.toString(),
      cli_identificacion: datos.cli_identificacion,
      cli_nombres: datos.cli_nombres,
      cli_genero: datos.cli_genero,
      cli_estado_civil: datos.cli_estado_civil,
      cli_ocupacion: datos.cli_ocupacion,
      cli_fecha_nacimiento: this.Fechas.fechaCortaFormato(datos.cli_fecha_nacimiento),
      cli_prioridad: this.Fechas.fechaCortaFormato(datos.cli_prioridad),
      cli_certificado_url: datos.cli_certificado_url,
      cli_score: datos.cli_score,
      cli_fallecido: datos.cli_fallecido === '1' ? true : false,
      cli_fecha_fallecido: this.Fechas.fechaCortaFormato(datos.cli_fecha_fallecido),
      cli_observacion: datos.cli_observacion,
      cli_provincia: datos.cli_provincia,
      cli_canton: datos.cli_canton,
      cli_parroquia: datos.cli_parroquia,
      cli_fecha_act: this.Fechas.fechaFormato(datos.cli_fecha_act),
      cli_fecha_desact: this.Fechas.fechaFormato(datos.cli_fecha_desact),
      cli_fecha_in: this.Fechas.fechaFormato(datos.cli_fecha_in),
      cli_fecha_up: this.Fechas.fechaFormato(datos.cli_fecha_up),
      cli_esactivo: datos.cli_esactivo === '1' ? true : false,
      cli_certificado: datos.cli_certificado === '1' ? true : false,
      cli_estado_contacta: datos.cli_estado_contacta,
      cli_id_ultima_gestion: datos.cli_id_ultima_gestion,
      cli_baseactual: datos.cli_baseactual === '1' ? true : false,
      cli_origendatos: datos.cli_origendatos,
    });;
    
    
    // if (num != 1) {
    //   this.ListarPermisos();
    // }
    this.AgregarEditarElemento(num);
  }
  // ****************************************** OTROS ELEMENTOS *****************************************************************
  TipoIdentificacion: any[] = [
    { id: 1, name: 'Cedula', value:'1'},
    { id: 2, name: 'Ruc', value:'2'},
    { id: 3, name: 'Pasaporte', value:'3'},
  ];
  Genero: any[] = [
    { id: 1, name: 'Hombre', value:'M' },
    { id: 2, name: 'Mujer', value:'F' },
    { id: 3, name: 'No responder', value:'0' },
  ];
  EstadoCivil: any[] = [
    { id: 1, name: 'Soltero/a', value:'1' },
    { id: 2, name: 'Casado/a', value:'2' },
    { id: 3, name: 'Divorciado/a', value:'3' },
    { id: 4, name: 'Viudo/a', value:'4' },
    { id: 5, name: 'Union-Libre', value:'5' },
    { id: 6, name: 'No especificado', value:'6' },
  ];
  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.ResetClienteForms();
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
    const ThIdentificacion = document.getElementById(
      'ThIdentificacion' + etiqueta
    ) as HTMLInputElement;
    const ThNombres = document.getElementById(
      'ThNombres' + etiqueta
    ) as HTMLInputElement;

    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = filtro;
    ThIdentificacion.style.color = '';
    ThNombres.style.color = '';
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
    TxtFiltro.value = TxtFiltro.value!.toUpperCase();
    const ThIdentificacion = document.getElementById(
      'ThIdentificacion' + etiqueta
    ) as HTMLInputElement;
    const ThNombres = document.getElementById(
      'ThNombres' + etiqueta
    ) as HTMLInputElement;
    if (lblFiltro.textContent === 'Identificación') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaClientes.filter((elemento) => {
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
    if (lblFiltro.textContent === 'Nombres') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaClientes.filter((elemento) => {
          return elemento.cli_nombres.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(0, resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThNombres.style.color = 'red';
      } else {
        ThNombres.style.color = '';
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
    const ThNombres = document.getElementById(
      'ThNombres' + etiqueta
    ) as HTMLInputElement;
    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = '';
    ThIdentificacion.style.color = '';
    ThNombres.style.color = '';
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
      this.reporte.generarPDF(this.gCliente);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gCliente);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gCliente);
    }
  }
}
