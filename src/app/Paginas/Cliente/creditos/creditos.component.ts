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
import {
  CarteraI,
  ClienteI,
  CxcOperacionI,
  generarPDF,
  Tipo_CorreoI,
} from 'src/app/Modelos/response.interface';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Component({
  selector: 'app-creditos',
  templateUrl: './creditos.component.html',
  styleUrls: ['./creditos.component.css'],
})
export class CreditosComponent implements OnInit {
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
    return elemento.men_url === 'creditos';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gCredito!:generarPDF;
  // visible: boolean = false;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = [
    '',
    'Identificación',
    'Nombre Completo',
    'Nombre Incompleto',
    'Correo Completo',
    'Correo Incompleto',
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
    if (
      this.itemBusqueda.value != 'Correo Completo' &&
      this.itemBusqueda.value != 'Correo Incompleto'
    ) {
      this.txtBusqueda.patchValue(this.txtBusqueda.value!.toUpperCase());
    }
  }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaCreditos: any[] = [];

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaCreditos = [];
      this.FraccionDatos = 0;
    }

    this.ListaCreditos = [];
    let listadoObjeto:any[] = [];
    this.loading = true;
    this.api
      .GetCxcOperacionFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaCreditos = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const credito of this.ListaCreditos)
            {
              let ocD: any = {
                Cedula:credito.cli_identificacion,
                Nombres:credito.cli_nombres,
                CodigoCxc:credito.ope_cod_credito,
                Descripcion:credito.ope_descripcion,
                SaldoCXC:credito.ope_saldo_cxc_actual,
                FechaCompra:credito.ope_fecha_compra ===null?null:this.Fechas.fechaCortaAbt(credito.ope_fecha_compra.toString()),
                Cartera:credito.cart_descripcion,
                Estado:credito.ope_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Credito', listado: listadoObjeto
            };
            this.gCredito=om;
          if (this.ListaCreditos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCreditos.length;
            this.FraccionarValores(
              0,
              this.ListaCreditos,
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
    if (this.itemBusqueda.value === 'Correo Incompleto') {
      tipo = 4;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Correo Completo') {
      tipo = 5;
      this.GetFiltrarElemento(valor, tipo);
    }
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaCreditos = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetCxcOperacionFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaCreditos = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const credito of this.ListaCreditos)
            {
              let ocD: any = {
                Cedula:credito.cli_identificacion,
                Nombres:credito.cli_nombres,
                CodigoCxc:credito.ope_cod_credito,
                Descripcion:credito.ope_descripcion,
                SaldoCXC:credito.ope_saldo_cxc_actual,
                FechaCompra:credito.ope_fecha_compra ===null?null:this.Fechas.fechaCortaAbt(credito.ope_fecha_compra.toString()),
                Cartera:credito.cart_descripcion,
                Estado:credito.ope_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Credito', listado: listadoObjeto
            };
            this.gCredito=om;
          if (this.ListaCreditos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCreditos.length;
            this.FraccionarValores(
              0,
              this.ListaCreditos,
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
  ClienteInfo = new FormControl({ value: '', disabled: true }, Validators.required);

  CreditosForms = new FormGroup({
    id_cxc_operacion: new FormControl(0,Validators.required),
    ope_cod_credito: new FormControl('',[Validators.required,this.validar.VFN_AlfaNumerico()]),
    cli_identificacion: new FormControl('',Validators.required),
    id_cartera: new FormControl(0,[Validators.required, this.validar.VFN_NumDiferDeCero()]),
    ope_descripcion: new FormControl('',Validators.required),
    ope_linea: new FormControl('',Validators.required),
    ope_producto: new FormControl('',Validators.required),
    ope_dias_mora: new FormControl('',Validators.required),
    ope_interes_mora: new FormControl('',[Validators.required,this.validar.VFN_NumerosDesimales()]),
    ope_gastos_cobranzas: new FormControl('',[Validators.required,this.validar.VFN_NumerosDesimales()]),
    ope_saldo_cxc_actual: new FormControl('',[Validators.required,this.validar.VFN_NumerosDesimales()]),
    ope_saldo_cuota_actual: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_saldo_capital_venc: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_poner_aldia: new FormControl(false),
    ope_liquidar: new FormControl('',Validators.required),
    ope_fecha_venc: new FormControl(''),
    ope_plazo: new FormControl('',this.validar.VFN_SoloNumeros()),
    ope_liquidado: new FormControl(false),
    ope_deuda_pagada: new FormControl(false),
    ope_fecha_pagada: new FormControl(''),
    ope_provincia: new FormControl(''),
    ope_tiene_garante: new FormControl(false),
    ope_fecha_compra: new FormControl(''),
    ope_observacion: new FormControl(''),
    ope_abono_realizado: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_valor_total_pag: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_tipo_actualizacion: new FormControl(''),
    ope_total_vencido: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_nom_segm_vencido: new FormControl(''),
    ope_categoria_cliente: new FormControl(''),
    ope_segmentacion: new FormControl(''),
    ope_promo_cuotas_gratis: new FormControl(''),
    ope_deuda_actual: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_saldo_interes: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_saldo_amortizacion: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_int_cobra: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_saldo_cobra_mora: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_descu_campa_saldo_capit: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_valor_descu_saldo_capit: new FormControl('',this.validar.VFN_NumerosDesimales()),
    ope_descrip_unidad_gestion: new FormControl(''),
    ope_esactivo: new FormControl(true),
    ope_origendatos: new FormControl('Sistema_CobroSys'),
    ope_baseactual: new FormControl(true),
  });
  ResetCreditosForms() {
    this.CreditosForms.reset({
      id_cxc_operacion: 0,
      ope_cod_credito: '',
      cli_identificacion: '',
      id_cartera: 0,
      ope_descripcion: '',
      ope_linea: '',
      ope_producto: '',
      ope_dias_mora: '',
      ope_interes_mora: '',
      ope_gastos_cobranzas: '',
      ope_saldo_cxc_actual: '',
      ope_saldo_cuota_actual: '',
      ope_saldo_capital_venc: '',
      ope_poner_aldia: false,
      ope_liquidar: '',
      ope_fecha_venc: '',
      ope_plazo: '',
      ope_liquidado: false,
      ope_deuda_pagada: false,
      ope_fecha_pagada: '',
      ope_provincia: '',
      ope_tiene_garante: false,
      ope_fecha_compra: '',
      ope_observacion: '',
      ope_abono_realizado: '',
      ope_valor_total_pag: '',
      ope_tipo_actualizacion: '',
      ope_total_vencido: '',
      ope_nom_segm_vencido: '',
      ope_categoria_cliente: '',
      ope_segmentacion: '',
      ope_promo_cuotas_gratis: '',
      ope_deuda_actual: '',
      ope_saldo_interes: '',
      ope_saldo_amortizacion: '',
      ope_int_cobra: '',
      ope_saldo_cobra_mora: '',
      ope_descu_campa_saldo_capit: '',
      ope_valor_descu_saldo_capit: '',
      ope_descrip_unidad_gestion: '',
      ope_esactivo: true,
      ope_origendatos: 'Sistema_CobroSys',
      ope_baseactual: true,
    });
  }
  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.CreditosForms.get('id_cxc_operacion')?.disable();
      this.CreditosForms.get('ope_cod_credito')?.disable();
      this.CreditosForms.get('cli_identificacion')?.disable();
      this.CreditosForms.get('id_cartera')?.disable();
      this.CreditosForms.get('ope_descripcion')?.disable();
      this.CreditosForms.get('ope_linea')?.disable();
      this.CreditosForms.get('ope_producto')?.disable();
      this.CreditosForms.get('ope_dias_mora')?.disable();
      this.CreditosForms.get('ope_interes_mora')?.disable();
      this.CreditosForms.get('ope_gastos_cobranzas')?.disable();
      this.CreditosForms.get('ope_saldo_cxc_actual')?.disable();
      this.CreditosForms.get('ope_saldo_cuota_actual')?.disable();
      this.CreditosForms.get('ope_saldo_capital_venc')?.disable();
      this.CreditosForms.get('ope_poner_aldia')?.disable();
      this.CreditosForms.get('ope_liquidar')?.disable();
      this.CreditosForms.get('ope_fecha_venc')?.disable();
      this.CreditosForms.get('ope_plazo')?.disable();
      this.CreditosForms.get('ope_liquidado')?.disable();
      this.CreditosForms.get('ope_deuda_pagada')?.disable();
      this.CreditosForms.get('ope_fecha_pagada')?.disable();
      this.CreditosForms.get('ope_provincia')?.disable();
      this.CreditosForms.get('ope_tiene_garante')?.disable();
      this.CreditosForms.get('ope_fecha_compra')?.disable();
      this.CreditosForms.get('ope_observacion')?.disable();
      this.CreditosForms.get('ope_abono_realizado')?.disable();
      this.CreditosForms.get('ope_valor_total_pag')?.disable();
      this.CreditosForms.get('ope_tipo_actualizacion')?.disable();
      this.CreditosForms.get('ope_total_vencido')?.disable();
      this.CreditosForms.get('ope_nom_segm_vencido')?.disable();
      this.CreditosForms.get('ope_categoria_cliente')?.disable();
      this.CreditosForms.get('ope_segmentacion')?.disable();
      this.CreditosForms.get('ope_promo_cuotas_gratis')?.disable();
      this.CreditosForms.get('ope_deuda_actual')?.disable();
      this.CreditosForms.get('ope_saldo_interes')?.disable();
      this.CreditosForms.get('ope_saldo_amortizacion')?.disable();
      this.CreditosForms.get('ope_int_cobra')?.disable();
      this.CreditosForms.get('ope_saldo_cobra_mora')?.disable();
      this.CreditosForms.get('ope_descu_campa_saldo_capit')?.disable();
      this.CreditosForms.get('ope_valor_descu_saldo_capit')?.disable();
      this.CreditosForms.get('ope_descrip_unidad_gestion')?.disable();
      this.CreditosForms.get('ope_esactivo')?.disable();
      this.CreditosForms.get('ope_origendatos')?.disable();
      this.CreditosForms.get('ope_baseactual')?.disable();
    }
    if (num === 1) {
      //activos
      this.CreditosForms.get('id_cxc_operacion')?.enable();
      this.CreditosForms.get('ope_cod_credito')?.enable();
      this.CreditosForms.get('cli_identificacion')?.enable();
      this.CreditosForms.get('id_cartera')?.enable();
      this.CreditosForms.get('ope_descripcion')?.enable();
      this.CreditosForms.get('ope_linea')?.enable();
      this.CreditosForms.get('ope_producto')?.enable();
      this.CreditosForms.get('ope_dias_mora')?.enable();
      this.CreditosForms.get('ope_interes_mora')?.enable();
      this.CreditosForms.get('ope_gastos_cobranzas')?.enable();
      this.CreditosForms.get('ope_saldo_cxc_actual')?.enable();
      this.CreditosForms.get('ope_saldo_cuota_actual')?.enable();
      this.CreditosForms.get('ope_saldo_capital_venc')?.enable();
      this.CreditosForms.get('ope_poner_aldia')?.enable();
      this.CreditosForms.get('ope_liquidar')?.enable();
      this.CreditosForms.get('ope_fecha_venc')?.enable();
      this.CreditosForms.get('ope_plazo')?.enable();
      this.CreditosForms.get('ope_liquidado')?.enable();
      this.CreditosForms.get('ope_deuda_pagada')?.enable();
      this.CreditosForms.get('ope_fecha_pagada')?.enable();
      this.CreditosForms.get('ope_provincia')?.enable();
      this.CreditosForms.get('ope_tiene_garante')?.enable();
      this.CreditosForms.get('ope_fecha_compra')?.enable();
      this.CreditosForms.get('ope_observacion')?.enable();
      this.CreditosForms.get('ope_abono_realizado')?.enable();
      this.CreditosForms.get('ope_valor_total_pag')?.enable();
      this.CreditosForms.get('ope_tipo_actualizacion')?.enable();
      this.CreditosForms.get('ope_total_vencido')?.enable();
      this.CreditosForms.get('ope_nom_segm_vencido')?.enable();
      this.CreditosForms.get('ope_categoria_cliente')?.enable();
      this.CreditosForms.get('ope_segmentacion')?.enable();
      this.CreditosForms.get('ope_promo_cuotas_gratis')?.enable();
      this.CreditosForms.get('ope_deuda_actual')?.enable();
      this.CreditosForms.get('ope_saldo_interes')?.enable();
      this.CreditosForms.get('ope_saldo_amortizacion')?.enable();
      this.CreditosForms.get('ope_int_cobra')?.enable();
      this.CreditosForms.get('ope_saldo_cobra_mora')?.enable();
      this.CreditosForms.get('ope_descu_campa_saldo_capit')?.enable();
      this.CreditosForms.get('ope_valor_descu_saldo_capit')?.enable();
      this.CreditosForms.get('ope_descrip_unidad_gestion')?.enable();
      this.CreditosForms.get('ope_esactivo')?.enable();
      this.CreditosForms.get('ope_origendatos')?.enable();
      this.CreditosForms.get('ope_baseactual')?.enable();
    }
    if (num === 2) {
      //edicion
      this.CreditosForms.get('cli_identificacion')?.enable();
      this.CreditosForms.get('id_cartera')?.enable();
      this.CreditosForms.get('ope_descripcion')?.enable();
      this.CreditosForms.get('ope_linea')?.enable();
      this.CreditosForms.get('ope_producto')?.enable();
      this.CreditosForms.get('ope_dias_mora')?.enable();
      this.CreditosForms.get('ope_interes_mora')?.enable();
      this.CreditosForms.get('ope_gastos_cobranzas')?.enable();
      this.CreditosForms.get('ope_saldo_cxc_actual')?.enable();
      this.CreditosForms.get('ope_saldo_cuota_actual')?.enable();
      this.CreditosForms.get('ope_saldo_capital_venc')?.enable();
      this.CreditosForms.get('ope_poner_aldia')?.enable();
      this.CreditosForms.get('ope_liquidar')?.enable();
      this.CreditosForms.get('ope_fecha_venc')?.enable();
      this.CreditosForms.get('ope_plazo')?.enable();
      this.CreditosForms.get('ope_liquidado')?.enable();
      this.CreditosForms.get('ope_deuda_pagada')?.enable();
      this.CreditosForms.get('ope_fecha_pagada')?.enable();
      this.CreditosForms.get('ope_provincia')?.enable();
      this.CreditosForms.get('ope_tiene_garante')?.enable();
      this.CreditosForms.get('ope_fecha_compra')?.enable();
      this.CreditosForms.get('ope_observacion')?.enable();
      this.CreditosForms.get('ope_abono_realizado')?.enable();
      this.CreditosForms.get('ope_valor_total_pag')?.enable();
      this.CreditosForms.get('ope_tipo_actualizacion')?.enable();
      this.CreditosForms.get('ope_total_vencido')?.enable();
      this.CreditosForms.get('ope_nom_segm_vencido')?.enable();
      this.CreditosForms.get('ope_categoria_cliente')?.enable();
      this.CreditosForms.get('ope_segmentacion')?.enable();
      this.CreditosForms.get('ope_promo_cuotas_gratis')?.enable();
      this.CreditosForms.get('ope_deuda_actual')?.enable();
      this.CreditosForms.get('ope_saldo_interes')?.enable();
      this.CreditosForms.get('ope_saldo_amortizacion')?.enable();
      this.CreditosForms.get('ope_int_cobra')?.enable();
      this.CreditosForms.get('ope_saldo_cobra_mora')?.enable();
      this.CreditosForms.get('ope_descu_campa_saldo_capit')?.enable();
      this.CreditosForms.get('ope_valor_descu_saldo_capit')?.enable();
      this.CreditosForms.get('ope_descrip_unidad_gestion')?.enable();
      this.CreditosForms.get('ope_esactivo')?.enable();
      this.CreditosForms.get('ope_origendatos')?.enable();
      this.CreditosForms.get('ope_baseactual')?.enable();
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
    const minDate = new Date('1969-12-31T00:00:00.000Z');

    datos.ope_poner_aldia = datos.ope_poner_aldia.toString() === 'true' ? '1' : '0';
    datos.ope_liquidado = datos.ope_liquidado.toString() === 'true' ? '1' : '0';
    datos.ope_deuda_pagada = datos.ope_deuda_pagada.toString() === 'true' ? '1' : '0';
    datos.ope_tiene_garante = datos.ope_tiene_garante.toString() === 'true' ? '1' : '0';
    datos.ope_esactivo = datos.ope_esactivo.toString() === 'true' ? '1' : '0';
    datos.ope_baseactual = datos.ope_baseactual.toString() === 'true' ? '1' : '0';
    datos.id_cartera = Number(datos.id_cartera);
    datos.ope_fecha_venc = datos.ope_fecha_venc != ''? datos.ope_fecha_venc : this.Fechas.fechaMinDate();
    datos.ope_fecha_pagada = datos.ope_fecha_pagada != ''? datos.ope_fecha_pagada : this.Fechas.fechaMinDate();
    datos.ope_fecha_compra = datos.ope_fecha_compra != ''? datos.ope_fecha_compra : this.Fechas.fechaMinDate();
    

    console.log(datos);
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutCxcOperacion(datos)
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
        .PostCxcOperacion(datos)
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
  ActualizaEstado(elemento: CxcOperacionI) {
    elemento.ope_esactivo = (elemento.ope_esactivo == '1' ? 0 : 1).toString();
    this.api
      .PutCxcOperacion(elemento)
      .subscribe((x) => this.alerta.RegistroActualizado());
  }

  EliminarElemento(elemento: CxcOperacionI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.ope_esactivo = '3';
        this.api.PutCxcOperacion(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  CargarElemento(datos: any, num: number) {
    this.CreditosForms.patchValue({
      // id_correo: datos.id_correo,
      // cli_identificacion: datos.cli_identificacion,
      // cor_descripcion: datos.cor_descripcion,
      // cor_email: datos.cor_email,
      // cor_fecha_act: this.Fechas.fechaFormato(datos.cor_fecha_act),
      // cor_fecha_desact: this.Fechas.fechaFormato(datos.cor_fecha_desact),
      // cor_fecha_in: this.Fechas.fechaFormato(datos.cor_fecha_in),
      // cor_fecha_up: this.Fechas.fechaFormato(datos.cor_fecha_up),
      // cor_esactivo: datos.cor_esactivo === '1' ? true : false,
      // cor_id_tipo_correo: datos.cor_id_tipo_correo,
      // cor_origendatos: datos.cor_origendatos,

      id_cxc_operacion: datos.id_cxc_operacion,
      ope_cod_credito: datos.ope_cod_credito,
      cli_identificacion: datos.cli_identificacion,
      id_cartera: datos.id_cartera,
      ope_descripcion: datos.ope_descripcion,
      ope_linea: datos.ope_linea,
      ope_producto: datos.ope_producto,
      ope_dias_mora: datos.ope_dias_mora,
      ope_interes_mora: datos.ope_interes_mora,
      ope_gastos_cobranzas: datos.ope_gastos_cobranzas,
      ope_saldo_cxc_actual: datos.ope_saldo_cxc_actual,
      ope_saldo_cuota_actual: datos.ope_saldo_cuota_actual,
      ope_saldo_capital_venc: datos.ope_saldo_capital_venc,
      ope_poner_aldia: datos.ope_poner_aldia == '1'?true:false,
      ope_liquidar: datos.ope_liquidar,
      ope_fecha_venc: datos.ope_fecha_venc == null?'':this.Fechas.fechaCortaFormato(datos.ope_fecha_venc),
      ope_plazo: datos.ope_plazo,
      ope_liquidado: datos.ope_liquidado == '1'?true:false,
      ope_deuda_pagada: datos.ope_deuda_pagada == '1'?true:false,
      ope_fecha_pagada: datos.ope_fecha_pagada == null?'':this.Fechas.fechaCortaFormato(datos.ope_fecha_pagada),
      ope_provincia: datos.ope_provincia,
      ope_tiene_garante: datos.ope_tiene_garante == '1'?true:false,
      ope_fecha_compra: datos.ope_fecha_compra == null?'':this.Fechas.fechaCortaFormato(datos.ope_fecha_compra),
      ope_observacion: datos.ope_observacion,
      ope_abono_realizado: datos.ope_abono_realizado,
      ope_valor_total_pag: datos.ope_valor_total_pag,
      ope_tipo_actualizacion: datos.ope_tipo_actualizacion,
      ope_total_vencido: datos.ope_total_vencido,
      ope_nom_segm_vencido: datos.ope_nom_segm_vencido,
      ope_categoria_cliente: datos.ope_categoria_cliente,
      ope_segmentacion: datos.ope_segmentacion,
      ope_promo_cuotas_gratis: datos.ope_promo_cuotas_gratis,
      ope_deuda_actual: datos.ope_deuda_actual,
      ope_saldo_interes: datos.ope_saldo_interes,
      ope_saldo_amortizacion: datos.ope_saldo_amortizacion,
      ope_int_cobra: datos.ope_int_cobra,
      ope_saldo_cobra_mora: datos.ope_saldo_cobra_mora,
      ope_descu_campa_saldo_capit: datos.ope_descu_campa_saldo_capit,
      ope_valor_descu_saldo_capit: datos.ope_valor_descu_saldo_capit,
      ope_descrip_unidad_gestion: datos.ope_descrip_unidad_gestion,
      ope_esactivo: datos.ope_esactivo == '1'?true:false,
      ope_origendatos: datos.ope_origendatos,
      ope_baseactual: datos.ope_baseactual == '1'?true:false,
    });
    if (num != 1) {
      this.ListarCarteras();
      this.BuscarCliente(datos.cli_identificacion);
    }
    this.AgregarEditarElemento(num);
  }
  // ****************************************** OTROS ELEMENTOS *****************************************************************
  CarterasList: any[] = [];

  ListarCarteras() {
    this.api
      .GetCarteraFracionado(0, 0)
      .pipe(
        map((tracks) => {
          console.log(tracks['data'])
          this.CarterasList = tracks['data'];
        })
      )
      .subscribe();
  }

  ClienteSeleccionado!: ClienteI | null;

  BuscarCliente(identificacion: string) {
    this.ClienteInfo.patchValue('');
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
              this.ClienteInfo.patchValue(datos.cli_nombres);
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
    this.CreditosForms.patchValue({ cli_identificacion: '' });
    this.ClienteInfo.patchValue('');
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

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.CarterasList = [];
    this.ClienteInfo.patchValue('');
    this.ClienteSeleccionado = null;
    this.ResetCreditosForms();
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
    const ThCorreo = document.getElementById(
      'ThCorreo' + etiqueta
    ) as HTMLInputElement;

    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = filtro;
    ThDescripcion.style.color = '';
    ThIdentificacion.style.color = '';
    ThCorreo.style.color = '';
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
    const ThCorreo = document.getElementById(
      'ThCorreo' + etiqueta
    ) as HTMLInputElement;

    if (lblFiltro.textContent === 'Nombres') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaCreditos.filter((elemento) => {
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
        const resultado = this.ListaCreditos.filter((elemento) => {
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
    if (lblFiltro.textContent === 'Correo') {
      let nombre = TxtFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaCreditos.filter((elemento) => {
          return elemento.cor_email.includes(nombre);
        });
        this.FraccionarValores(0, resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThCorreo.style.color = 'red';
      } else {
        ThCorreo.style.color = '';
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
    const ThCorreo = document.getElementById(
      'ThCorreo' + etiqueta
    ) as HTMLInputElement;
    const lblFiltro = document.getElementById(
      'lblFiltro' + etiqueta
    ) as HTMLInputElement;
    lblFiltro.textContent = '';
    ThDescripcion.style.color = '';
    ThIdentificacion.style.color = '';
    ThCorreo.style.color = '';
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
      this.reporte.generarPDF(this.gCredito);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gCredito);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gCredito);
    }
  }
}
