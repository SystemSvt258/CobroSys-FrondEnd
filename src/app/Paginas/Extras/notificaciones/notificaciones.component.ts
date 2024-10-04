import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, forkJoin, map } from 'rxjs';
import { CargaMasiva } from 'src/app/Clases/CargaMasiva';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { PermisosAcceso } from 'src/app/Control/Permisos';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import {
  clsCartera,
  clsCliente,
  clsClienteGestorCartera,
  clsConectividad,
  clsContactabilidad,
  clsCorreo,
  clsCuenta,
  clsCuentaCartera,
  clsCxcOperacion,
  clsDetalle_TelefonoC,
  clsDireccion,
  clsGarante,
  clsGestor,
  clsItemI,
  clsTelefono,
  clsTipoGestion_Conectividad_Contactivilidad,
  clsTipo_Cartera,
  clsTipo_Correo,
  clsTipo_Direccion,
  clsTipo_Gestion,
  clsTipo_Telefono,
  clsTipo_Trabajo,
  clsTrabajo,
} from 'src/app/Modelos/clases.interface';
import {
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import {
  ConectividadI,
  ContactabilidadI,
  DetalleTelefonoI,
  Tipo_GestionI,
} from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
})
export class NotificacionesComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiService,
    private cookeService: CookieService,
    private alerta: Alertas,
    private alertaCarga: Alertas,
    private Fechas: Fechas,
    private P_Acceso: PermisosAcceso,
    private Carga_Masiva: CargaMasiva,
    private ValidarTipoTexto: TipoDeTexto
  ) {}

  PaginaActual: any;
  // Menu: ResultadoMenuI[] = this.permisos.menu;
  // Cartera: ResultadoCarteraI[] = this.permisos.cartera;
  // ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  // RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  // LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  // PaginaNombre: string = this.PaginaActual.men_descripcion;
  ngOnInit() {
    this.PaginaActual = this.P_Acceso.checkLocal('notificaciones');
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  TipoEntidad: any[] = [
    {
      id: 1,
      name: 'ASIGNACION',
      valor: 1,
      campos: [
        'id_cliente_gestor_cartera',
        'id_carter',
        'cli_identificacion',
        'id_gestor',
        'cgc_observacion',
      ],
      validador: [
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'alfanumerico',
      ],
    },
    {
      id: 4,
      name: 'CONECTIVIDAD',
      valor: 4,
      campos: ['id_conectividad', 'conec_descripcion'],
      validador: ['numerico', 'alfanumerico'],
    },
    {
      id: 5,
      name: 'CONTACTABILIDAD',
      valor: 5,
      campos: ['id_contactabilidad', 'contac_descripcion'],
      validador: ['numerico', 'alfanumerico'],
    },
    {
      id: 2,
      name: 'CARTERA',
      valor: 2,
      campos: [
        'id_cartera',
        'id_tipo_cartera',
        'cart_descripcion',
        'cart_observacion',
      ],
    },
    {
      id: 3,
      name: 'CLIENTES',
      valor: 3,
      campos: [
        'cli_identificacion',
        'cli_nombres',
        'cli_tipo_identificacion',
        'cli_genero',
        'cli_estado_civil',
        'cli_ocupacion',
        'cli_fecha_nacimiento',
        'cli_score',
        'cli_fallecido',
        'cli_fecha_fallecido',
        'cli_observacion',
        'cli_provincia',
        'cli_canton',
        'cli_parroquia',
      ],
      validador: [
        'numerico',
        'alfanumerico',
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'numerico',
        'alfanumerico',
        'alfanumerico',
        'alfanumerico',
        'alfanumerico',
      ],
    },
    {
      id: 6,
      name: 'CORREOS',
      valor: 6,
      campos: [
        'id_correo',
        'cli_identificacion',
        'cor_descripcion',
        'cor_email',
        'cor_id_tipo_correo',
      ],
    },
    {
      id: 7,
      name: 'CREDITOS',
      valor: 7,
      campos: [
        'id_cxc_operacion',
        'ope_cod_credito',
        'cli_identificacion',
        'id_cartera',
        'ope_descripcion',
        'ope_linea',
        'ope_producto',
        'ope_dias_mora',
        'ope_interes_mora',
        'ope_gastos_cobranzas',
        'ope_saldo_cxc_actual',
        'ope_saldo_cuota_actual',
        'ope_saldo_capital_venc',
        'ope_poner_aldia',
        'ope_liquidar',
        'ope_fecha_venc',
        'ope_fecha_pagada',
        'ope_fecha_compra',
        'ope_observacion',
        'ope_abono_realizado',
        'ope_valor_total_pag',
        'ope_tipo_actualizacion',
        'ope_total_vencido',
        'ope_nom_segm_vencido',
        'ope_categoria_cliente',
        'ope_segmentacion',
        'ope_promo_cuotas_gratis',
        'ope_deuda_actual',
        'ope_saldo_interes',
        'ope_saldo_amortizacion',
        'ope_int_cobra',
        'ope_saldo_cobra_mora',
        'ope_descu_campa_saldo_capit',
        'ope_valor_descu_saldo_capit',
        'ope_descrip_unidad_gestion',
      ],
    },
    {
      id: 8,
      name: 'CUENTA CARTERA',
      valor: 8,
      campos: ['id_cartera', 'id_cuenta', 'ctipcar_observacion'],
    },
    {
      id: 9,
      name: 'CUENTAS',
      valor: 9,
      campos: ['cuent_nombre', 'cuent_numero', 'cuent_entidadfinanciera'],
    },
    {
      id: 10,
      name: 'DETALLE TELEFONO',
      valor: 10,
      campos: ['id_detalle_telefono', 'tel_detal_descripcion'],
    },
    {
      id: 11,
      name: 'DIRECCIONES',
      valor: 11,
      campos: [
        'id_direccion',
        'cli_identificacion',
        'dir_completa',
        'dir_calle_principal',
        'dir_calle_secundaria',
        'dir_numero_casa',
        'dir_referencia',
        'dir_provincia',
        'dir_canton',
        'dir_parroquia',
      ],
    },
    {
      id: 12,
      name: 'GARANTES',
      valor: 12,
      campos: [
        'id_garante',
        'cli_identificacion',
        'gar_identificacion',
        'gar_nombres',
        'gar_trabajo',
        'gar_direccion_dom',
        'gar_direccion_trabajo',
        'gar_telefono_domicilio',
        'gar_telefono_trabajo',
        'gar_telefono_adicional',
        'gar_observacion',
      ],
    },
    {
      id: 13,
      name: 'GESTOR',
      valor: 13,
      campos: [
        'ges_nombres',
        'ges_apellidos',
        'ges_esgestor',
        'ges_observacion',
        'ges_fecha_entrada',
        'ges_fecha_salida',
      ],
    },
    {
      id: 14,
      name: 'TELEFONOS',
      valor: 14,
      campos: [
        'id_telefono',
        'cli_identificacion',
        'tel_numero',
        'tel_observacion',
        'tel_operadora',
        'tel_tipo_operadora',
      ],
    },
    {
      id: 15,
      name: 'TIPO CARTERA',
      valor: 15,
      campos: ['id_tipo_cartera', 'cart_tip_descripcion'],
    },
    {
      id: 16,
      name: 'TIPO CORREO',
      valor: 16,
      campos: ['id_tipo_correo', 'corr_tip_descripcion'],
    },
    {
      id: 17,
      name: 'TIPO DIRECCION',
      valor: 17,
      campos: ['id_tipo_direccion', 'dir_tip_descripcion'],
    },
    {
      id: 18,
      name: 'TIPO GESTION',
      valor: 18,
      campos: ['id_tipo_gestion', 'gestion_tip_descripcion'],
    },
    {
      id: 19,
      name: 'TIPO GESTION CONECTIVIDAD CONTACTABILIDAD',
      valor: 19,
      campos: [
        'id_tipges_conect_contac',
        'id_tipo_gestion',
        'id_conectividad',
        'id_contactabilidad',
      ],
    },
    {
      id: 20,
      name: 'TIPO TELEFONO',
      valor: 20,
      campos: ['id_tipo_telefono', 'tel_tip_descripcion'],
    },
    {
      id: 21,
      name: 'TIPO TRABAJO',
      valor: 21,
      campos: ['id_tipo_trabajo', 'trab_tip_descripcion'],
    },
    {
      id: 22,
      name: 'TRABAJOS',
      valor: 22,
      campos: ['id_tipo_gestion', 'gestion_tip_descripcion'],
    },
  ];

  TituloPagina: string = 'ARCHIVOS';
  SelecionFuncional(tipo: number) {
    if (tipo == 1) this.TituloPagina = 'ARCHIVOS';
    if (tipo == 2) this.TituloPagina = 'ELEMENTOS';
    if (tipo == 3) this.TituloPagina = 'ESPECIAL';
  }

  ////////////////////////////////////////  SELECCIONAR ENTIDAD /////////////////////////////////////////////////////////////////////////////

  SeleccionEntidad = new FormGroup({
    tipo_entidad: new FormControl(0, Validators.required),
    archivo_lectura: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    hoja_selecionada: new FormControl('', Validators.required),
    cli_identificacion: new FormControl(''),
    ope_cod_credito: new FormControl(''),
  });
  ResetSeleccionEntidad() {
    this.SeleccionEntidad.reset({
      tipo_entidad: 0,
      archivo_lectura: '',
      hoja_selecionada: '',
      cli_identificacion: '',
      ope_cod_credito: '',
    });
    this.SeleccionEntidad.get('archivo_lectura')?.disable();
    this.archivo = null;
    this.DatosHojaSeleccionada = [];
  }

  SeleccionarEntidad() {
    this.SeleccionEntidad.get('archivo_lectura')?.enable();
    this.SeleccionEntidad.patchValue({
      archivo_lectura: '',
      hoja_selecionada: '',
      cli_identificacion: '',
      ope_cod_credito: '',
    });
    this.archivo = null;
    this.DatosHojaSeleccionada = [];
    // let entidadSeleccionada = this.TipoEntidad.sort((a, b) => {
    //   if (a.name.toLowerCase() < b.name.toLowerCase()) {
    //     return -1;
    //   }
    //   if (a.name.toLowerCase() > b.name.toLowerCase()) {
    //     return 1;
    //   }
    //   return 0;
    // });
    // console.log(entidadSeleccionada);

    let Select_Entidad = this.SeleccionEntidad.get('tipo_entidad')?.value;
    if (Select_Entidad == 1) this.entidad = new clsClienteGestorCartera();
    if (Select_Entidad == 2) this.entidad = new clsCartera();
    if (Select_Entidad == 3) this.entidad = new clsCliente();
    if (Select_Entidad == 4) this.entidad = new clsConectividad();
    if (Select_Entidad == 5) this.entidad = new clsContactabilidad();
    if (Select_Entidad == 6) this.entidad = new clsCorreo();
    if (Select_Entidad == 7) this.entidad = new clsCxcOperacion();
    if (Select_Entidad == 8) this.entidad = new clsCuentaCartera();
    if (Select_Entidad == 9) this.entidad = new clsCuenta();
    if (Select_Entidad == 10) this.entidad = new clsDetalle_TelefonoC();
    if (Select_Entidad == 11) this.entidad = new clsDireccion();
    if (Select_Entidad == 12) this.entidad = new clsGarante();
    if (Select_Entidad == 13) this.entidad = new clsGestor();
    if (Select_Entidad == 14) this.entidad = new clsTelefono();
    if (Select_Entidad == 15) this.entidad = new clsTipo_Cartera();
    if (Select_Entidad == 16) this.entidad = new clsTipo_Correo();
    if (Select_Entidad == 17) this.entidad = new clsTipo_Direccion();
    if (Select_Entidad == 18) this.entidad = new clsTipo_Gestion();
    if (Select_Entidad == 19)
      this.entidad = new clsTipoGestion_Conectividad_Contactivilidad();
    if (Select_Entidad == 20) this.entidad = new clsTipo_Telefono();
    if (Select_Entidad == 21) this.entidad = new clsTipo_Trabajo();
    if (Select_Entidad == 22) this.entidad = new clsTrabajo();
  }

  entidad!:
    | clsClienteGestorCartera
    | clsCartera
    | clsCliente
    | ContactabilidadI
    | ConectividadI
    | clsCorreo
    | clsCxcOperacion
    | clsCuentaCartera
    | clsCuenta
    | clsDetalle_TelefonoC
    | clsDireccion
    | clsGarante
    | clsGestor
    | clsTelefono
    | clsTipo_Cartera
    | clsTipo_Correo
    | clsTipo_Direccion
    | clsTipo_Gestion
    | clsTipoGestion_Conectividad_Contactivilidad
    | clsTipo_Telefono
    | clsTipo_Trabajo
    | clsTrabajo;

  ///////////////////////////////////////// BUSCAR REGISTROS EXISTENTES Y DESCARGAR ////////////////////////////////////////////////////////////////////////////
  async DescargarModelo() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    let Select_Entidad = this.SeleccionEntidad.get('tipo_entidad')?.value;
    if (Select_Entidad != 0) {
      let entidadSeleccionada = this.TipoEntidad.find(
        (element) => element.valor == Select_Entidad
      );

      let confirm = await this.alertaCarga.AlertaConfirmacion(
        entidadSeleccionada.name,
        '¿Desea descargar un archivo de Excel como modelo de la entidad de'
      );
      if (confirm == true) {
        CargandoLoad.classList.add('modal--show');
        await this.DescargarArchivoExcel(entidadSeleccionada.valor);
      }
    } else {
      this.alertaCarga.ErrorInesperado('Antes deberia seleccionar una entidad');
    }
  }
  DescargarArchivoExcel(entidad_select: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    let entidadSeleccionada = this.TipoEntidad.find(
      (element) => element.valor == entidad_select
    );

    let valorUrl;
    switch (entidad_select) {
      case 1:
        valorUrl = this.api.GetClienteGestorCarteraFracionadoFiltro('1', 0);
        break;
      case 2:
        valorUrl = this.api.GetCarteraFracionadoFiltro('1', 0);
        break;
      case 3:
        valorUrl = this.api.GetClienteFracionadoFiltro('1', 0);
        break;
      case 4:
        valorUrl = this.api.GetConectividadFracionadoFiltro('1', 0);
        break;
      case 5:
        valorUrl = this.api.GetContactabilidadFracionadoFiltro('1', 0);
        break;
      case 6:
        valorUrl = this.api.GetCorreosFracionadoFiltro('1', 0);
        break;
      case 7:
        valorUrl = this.api.GetCxcOperacionFracionadoFiltro('1', 0);
        break;
      case 8:
        valorUrl = this.api.GetCuentaCarteraFracionadoFiltro('1', 0);
        break;
      case 9:
        valorUrl = this.api.GetCuentasFracionadoFiltro('1', 0);
        break;
      case 10:
        valorUrl = this.api.GetDetTelefonoFracionadoFiltro('1', 0);
        break;
      case 11:
        valorUrl = this.api.GetDireccionesFracionadoFiltro('1', 0);
        break;
      case 12:
        valorUrl = this.api.GetGarantesFracionadoFiltro('1', 0);
        break;
      case 13:
        valorUrl = this.api.GetGestoresFracionadoFiltro('1', 0);
        break;
      case 14:
        valorUrl = this.api.GetTelefonosFracionadoFiltro('1', 0);
        break;
      case 15:
        valorUrl = this.api.GetT_C_FracionadoFiltro('1', 0);
        break;
      case 16:
        valorUrl = this.api.GetTipoCorreoFracionadoFiltro('1', 0);
        break;
      case 17:
        valorUrl = this.api.GetTipoDireccionFracionadoFiltro('1', 0);
        break;
      case 18:
        valorUrl = this.api.GetTipoGestionFracionadoFiltro('1', 0);
        break;
      // case 19:
      //   valorUrl = this.api.g('1', 0);
      //   break;
      case 20:
        valorUrl = this.api.GetTipoTelefonoFracionadoFiltro('1', 0);
        break;
      case 21:
        valorUrl = this.api.GetTipoTrabajoFracionadoFiltro('1', 0);
        break;
      case 22:
        valorUrl = this.api.GetTrabajosFracionadoFiltro('1', 0);
        break;
      default:
        this.alerta.ErrorEnLaPeticion('No se encontro la entidad');
    }

    if (valorUrl != undefined) {
      forkJoin({
        entidad: valorUrl.pipe(
          catchError((error) => {
            this.alerta.ErrorEnLaPeticion(
              'Error al obtener datos de ' + entidadSeleccionada.name
            );
            CargandoLoad.classList.remove('modal--show');
            return [];
          })
        ),
      }).subscribe((tracks) => {
        let datos = tracks.entidad['data'];

        console.log(datos);
        let selectedColumns: string[] = [];
        selectedColumns = entidadSeleccionada.campos;
        if (datos.length > 1) {
          const workbook = this.CrearExcel(
            datos,
            selectedColumns,
            entidadSeleccionada.name
          );
          XLSX.writeFile(workbook, entidadSeleccionada.name + '.xlsx');
          CargandoLoad.classList.remove('modal--show');
        } else {
          // this.alerta.ErrorEnLaPeticion(
          //   'No se puede obtener el modelo de '+entidadSeleccionada.name +', debido a que no cuenta con datos'
          // );
          const workbook = this.CrearExcel(
            this.Carga_Masiva.ValoresPorDefecto(entidad_select),
            selectedColumns,
            entidadSeleccionada.name
          );
          XLSX.writeFile(workbook, entidadSeleccionada.name + '.xlsx');
          CargandoLoad.classList.remove('modal--show');
        }
      });
    }
  }

  CrearExcel(
    datos: any[],
    selectedColumns: string[],
    tabla: string
  ): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Función para filtrar columnas y convertir valores a texto
    const filtrarYConvertirColumnas = (item: any) => {
      const newItem: any = {};
      selectedColumns.forEach((col) => {
        newItem[col] = item[col] !== undefined ? String(item[col]) : '';
      });
      return newItem;
    };

    const filtrarColumns = datos.map(filtrarYConvertirColumnas);

    const definiciones = [
      { Definición: '1. Verificar el formato de la columna' },
      {
        Definición:
          '2. Los valores calculables deben ser separados por un punto decimal',
      },
      { Definición: '3. Las fechas tienen un formato predefinido dis/mes/año' },
    ];
    const HojaPrerequisitos = XLSX.utils.json_to_sheet(definiciones);
    XLSX.utils.book_append_sheet(workbook, HojaPrerequisitos, 'REQUISITOS');

    const ElementoFiltrado = XLSX.utils.json_to_sheet(filtrarColumns);
    const range = XLSX.utils.decode_range(ElementoFiltrado['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ElementoFiltrado[cell_address])
          ElementoFiltrado[cell_address] = { t: 's', v: '' };
        ElementoFiltrado[cell_address].z = '@';
      }
    }
    XLSX.utils.book_append_sheet(workbook, ElementoFiltrado, tabla);

    return workbook;
  }

  // CrearExcel(
  //   datos: any[],
  //   selectedColumns: string[],
  //   tabla: string
  // ): XLSX.WorkBook {
  //   const workbook = XLSX.utils.book_new();
  //   const filtrarColumns = datos.map((item) =>
  //     this.filtrarColumnas(item, selectedColumns)
  //   );
  //   const ElementoFiltrado = XLSX.utils.json_to_sheet(filtrarColumns);
  //   XLSX.utils.book_append_sheet(workbook, ElementoFiltrado, tabla);

  //   return workbook;
  // }

  /////////////////////////////////////////// LEER EXCEL  //////////////////////////////////////////////////////////////////////////

  archivo: File | null = null;

  HojasExcelLectura: string[] = [];
  DatosHojaSeleccionada: any[] = [];
  DatosValidados: any[] = [];
  headers: string[] = [];

  SeleccionarArchivo(event: any): void {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.SeleccionEntidad.patchValue({ hoja_selecionada: '' });
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        this.HojasExcelLectura = workbook.SheetNames;
        this.archivo = file;
        setTimeout(() => {
          CargandoLoad.classList.remove('modal--show');
        }, 100);
      };
      reader.readAsArrayBuffer(file);
    } else {
      CargandoLoad.classList.remove('modal--show');
    }
  }

  SeleccionarHoja() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');

    let entidadSeleccionada = this.TipoEntidad.find(
      (element) =>
        element.valor == this.SeleccionEntidad.get('tipo_entidad')?.value
    ).campos;

    const hojaSeleccionada =
      this.SeleccionEntidad.get('hoja_selecionada')?.value;
    const file = this.archivo;

    if (file && hojaSeleccionada && entidadSeleccionada) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[hojaSeleccionada];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (sheetData.length > 0) {
          let CabeceraSinVerificar = sheetData[0] as string[];
          const rows = sheetData.slice(1) as any[][];

          let DatosSinValidar = rows.map((row) => {
            const cliente: any = {};
            CabeceraSinVerificar.forEach((header, index) => {
              cliente[header] = row[index] || '';
            });
            return cliente;
          });

          this.headers = CabeceraSinVerificar.filter((header) =>
            entidadSeleccionada.includes(header)
          );

          if (this.headers.length == entidadSeleccionada.length) {
            this.DatosHojaSeleccionada = DatosSinValidar.map((objeto) => {
              const nuevoObjeto: any = {};
              entidadSeleccionada.forEach((campo: string) => {
                nuevoObjeto[campo] = objeto[campo];
              });
              return nuevoObjeto;
            });

            // Calcular y mostrar el número de filas
            // const numRows = this.DatosHojaSeleccionada.length;
            // const col = this.headers.length;
            // console.log('Número de filas:', numRows,'Número de columnas:', col);
            // console.log(this.DatosHojaSeleccionada)
          } else {
            this.DatosHojaSeleccionada = [];
            this.alertaCarga.ErrorInesperado(
              'Los campos de la hoja seleccionada no cumplen con los requeridos'
            );
          }
        }

        setTimeout(() => {
          CargandoLoad.classList.remove('modal--show');
        }, sheetData.length);
      };
      reader.readAsArrayBuffer(file);
    } else {
      CargandoLoad.classList.remove('modal--show');
    }
  }

  ValidarElementos() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');

    let Validador = this.TipoEntidad.find(
      (element) =>
        element.valor == this.SeleccionEntidad.get('tipo_entidad')?.value
    );
    if (!Validador.validador) {
      this.alertaCarga.ErrorInesperado(
        'No se encontró un validador para la entidad seleccionada.'
      );
      CargandoLoad.classList.remove('modal--show');
      return;
    }
    setTimeout(() => {
      this.DatosHojaSeleccionada.forEach((element) => {
        const keys = Object.keys(element);
        if (keys.every((key) => Validador!.campos.includes(key))) {
          let camposInvalidos: any[] = [];

          let validaciones = keys.map((key) => {
            const campoIndex = Validador!.campos.indexOf(key);
            const validador = Validador!.validador
              ? Validador!.validador[campoIndex]
              : 'No definido';
            const valor = element[key]; // Obtener el valor del atributo
            const resultado = this.ValidarTipoTexto.V_ValidadorGeneral(
              validador,
              valor
            );

            if (!resultado) {
              camposInvalidos.push(key);
            }

            return resultado;
          });

          let resultadoValidacion = validaciones.every(
            (resultado) => resultado === true
          );
          let nuevoElemento = {
            ...element,
            validacion: resultadoValidacion,
            camposInvalidos,
          };
          this.DatosValidados.push(nuevoElemento);
        }
      });
      console.log(this.DatosValidados);
      this.DatosHojaSeleccionada = this.DatosValidados;
      CargandoLoad.classList.remove('modal--show');
    }, 100);
  }
  isFieldInvalid(cliente: any, field: string): boolean {
    return cliente.camposInvalidos && cliente.camposInvalidos.includes(field);
}

hasInvalidFields(cliente: any): boolean {
    return cliente.camposInvalidos && cliente.camposInvalidos.length > 0;
}
  SeleccionarHoja1() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    let entidadSeleccionada = this.TipoEntidad.find(
      (element) =>
        element.valor == this.SeleccionEntidad.get('tipo_entidad')?.value
    ).campos;
    const hojaSeleccionada =
      this.SeleccionEntidad.get('hoja_selecionada')?.value;
    const file = this.archivo;

    if (file && hojaSeleccionada) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[hojaSeleccionada];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });
        console.log(sheetData);
        // if (sheetData.length > 0) {

        //   this.headers = sheetData[0] as string[];
        //   entidadSeleccionada //variable a comparar

        //   const rows = sheetData.slice(1) as any[][];

        //   // Calcular y mostrar el número de columnas
        //   const numColumns = this.headers.length;
        //   console.log('Número de columnas:', numColumns);

        //   // Construir el objeto DatosHojaSeleccionada
        //   this.DatosHojaSeleccionada = rows.map((row) => {
        //     const cliente: any = {};
        //     this.headers.forEach((header, index) => {
        //       cliente[header] = row[index] || '';
        //     });
        //     return cliente;
        //   });

        //   // Calcular y mostrar el número de filas
        //   const numRows = this.DatosHojaSeleccionada.length;
        //   console.log('Número de filas:', numRows);
        // }
        if (sheetData.length > 0) {
          let Cabeceras = sheetData[0] as string[];
          this.headers = Cabeceras.filter((header) =>
            entidadSeleccionada.includes(header)
          );
          if (this.headers.length == entidadSeleccionada.length) {
            const rows = sheetData.slice(1) as any[][];

            // Construir el objeto DatosHojaSeleccionada filtrado
            this.DatosHojaSeleccionada = rows.map((row) => {
              const cliente: any = {};
              this.headers.forEach((header, index) => {
                if (entidadSeleccionada.includes(header)) {
                  cliente[header] = row[index] || '';
                }
              });
              return cliente;
            });

            // Filtrar objetos vacíos
            this.DatosHojaSeleccionada = this.DatosHojaSeleccionada.filter(
              (cliente) => Object.keys(cliente).length > 0
            );

            // Calcular y mostrar el número de columnas seleccionadas
            const numColumns = this.headers.length;
            console.log('Número de columnas seleccionadas:', numColumns);

            // Calcular y mostrar el número de filas
            const numRows = this.DatosHojaSeleccionada.length;
            console.log('Número de filas:', numRows);

            // Mostrar los datos filtrados
            console.log('Datos filtrados:', this.DatosHojaSeleccionada);
          } else {
            this.alertaCarga.ErrorInesperado(
              'Los campos de la hoja seleccionada no cumplen con los requeridos'
            );
          }
          // Extract rows starting from the second row
        }

        setTimeout(() => {
          CargandoLoad.classList.remove('modal--show');
        }, sheetData.length);
      };
      reader.readAsArrayBuffer(file);
    } else {
      CargandoLoad.classList.remove('modal--show');
    }
  }

  
  urlAbs!: string;
  url!: string;
  esImagen: boolean = false;
  esPdf: boolean = false;
  getUrl() {
    //const archivoControl = this.form.get('archivo');
    const valorArchivo = this.archivo;
    if (valorArchivo) {
      const lectura = new FileReader();
      lectura.onloadend = () => {
        this.urlAbs = lectura.result as string;
        this.url = this.urlAbs.split(',')[1];
        if (this.urlAbs.includes('image')) {
          this.esImagen = true;
          this.esPdf = false;
        } else {
          this.esImagen = false;
          this.esPdf = true;
        }
      };
      lectura.readAsDataURL(valorArchivo);
    }
  }
}
