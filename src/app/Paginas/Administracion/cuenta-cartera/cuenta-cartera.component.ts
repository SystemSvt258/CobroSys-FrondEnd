import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Cartera } from 'src/app/Clases/Cartera';
import { Cuenta } from 'src/app/Clases/Cuenta';
import { CuentaCartera } from 'src/app/Clases/CuentaCartera';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { PermisosAcceso } from 'src/app/Control/Permisos';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { CarteraI, CuentaCarteraI, generarPDF } from 'src/app/Modelos/response.interface';

@Component({
  selector: 'app-cuenta-cartera',
  templateUrl: './cuenta-cartera.component.html',
  styleUrls: ['./cuenta-cartera.component.css'],
})
export class CuentaCarteraComponent implements OnInit {
  constructor(
    private P_Acceso: PermisosAcceso,
    private CuentaCarteraM: CuentaCartera,
    private CarteraM: Cartera,
    private CuentaM: Cuenta,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,
    public validar: TipoDeTexto,public reporte:GeneradorReporte
  ) {}
  PaginaActual: any;
  ngOnInit(): void {
    this.PaginaActual = this.P_Acceso.checkLocal('cuentacartera');
    this.ListarElementos(1);
  }
  TituloFormulario: string = '';

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = ['', 'Cartera', 'Cuenta', 'Estado'];
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
  ListaCuentas: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gCuentaC!:generarPDF;

  ListarElementos(num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaCuentas = [];
      this.FraccionDatos = 0;
    }

    this.ListaCuentas = [];
    let listadoObjeto:any[] = [];
    this.CuentaCarteraM.ListarElementos(
      this.FraccionDatos,
      Number(this.PaginaActual.Usuario.usr_rango_datos)
    )
      .pipe(
        map((datos) => {
          CargandoLoad.classList.remove('modal--show');
          if (datos!) {
            this.ListaCuentas = datos;
            this.DatosTemporalesBusqueda = datos;
            for (const c of this.ListaCuentas)
              {
                let ocD: any = {
                  Cuenta:c.cuenta.cuent_nombre,
                  Entidad:c.cuenta.cuent_entidadfinanciera,
                  Numero:c.cuenta.cuent_numero,
                  Cartera:c.cartera,
                  Fecha:c.ctipcar_fecha_in===null?null:this.Fechas.fechaCortaAbt(c.ctipcar_fecha_in.toString()),
                  Estado:c.ctipcar_esactivo==='1'?'ACTIVO':'INACTIVO'
                };
                listadoObjeto.push(ocD);
              }
            if (this.ListaCuentas.length > 0) {
              this.ContadorDatosGeneral = this.ListaCuentas.length;
              this.FraccionarValores(
                this.ListaCuentas,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
      let om: generarPDF = {
        entidad: 'CuentaCartera', listado:listadoObjeto
      };
      this.gCuentaC=om;

  }

  FiltrarElemento() {
    const valor: any = this.txtBusqueda.value?.toString();
    let tipo: number;
    if (this.itemBusqueda.value === 'Estado') {
      tipo = 5;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Cartera') {
      tipo = 6;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Cuenta') {
      tipo = 7;
      this.GetFiltrarElemento(valor, tipo);
    }
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaCuentas = [];
    let listadoObjeto:any[] = [];
    this.CuentaCarteraM.FiltrarElementos(valor, tipo)
      .pipe(
        map((datos) => {
          if (datos!) {
            this.ListaCuentas = datos;
            this.DatosTemporalesBusqueda = datos;
            for (const c of this.ListaCuentas)
              {
                let ocD: any = {
                  Cuenta:c.cuenta.cuent_nombre,
                  Entidad:c.cuenta.cuent_entidadfinanciera,
                  Numero:c.cuenta.cuent_numero,
                  Cartera:c.cartera,
                  Fecha:c.ctipcar_fecha_in===null?null:this.Fechas.fechaCortaAbt(c.ctipcar_fecha_in.toString()),
                  Estado:c.ctipcar_esactivo==='1'?'ACTIVO':'INACTIVO'
                };
                listadoObjeto.push(ocD);
              }
              let om: generarPDF = {
                entidad: 'CuentaCartera', listado: listadoObjeto
              };
              this.gCuentaC=om;
            if (this.ListaCuentas.length > 0) {
              this.ContadorDatosGeneral = this.ListaCuentas.length;
              this.FraccionarValores(
                this.ListaCuentas,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
  }
  // /************************************** AGREGAR ELEMENTO  ******************************************************** */

  CuentaCarteraForms = new FormGroup({
    id_cuenta_tipo_cartera: new FormControl(0, [Validators.required]),
    id_cartera: new FormControl('', [Validators.required]),
    id_cuenta: new FormControl('', [Validators.required]),
    ctipcar_observacion: new FormControl('', [
      Validators.required,
      this.validar.VFN_AlfaNumerico(),
    ]),
    ctipcar_fecha_act: new FormControl(this.Fechas.fecha()),
    ctipcar_fecha_desact: new FormControl(this.Fechas.fecha()),
    ctipcar_fecha_in: new FormControl(this.Fechas.fecha()),
    ctipcar_fecha_up: new FormControl(this.Fechas.fecha()),
    ctipcar_esactivo: new FormControl(true),
  });

  ResetCuentaCarteraForms() {
    this.CuentaCarteraForms.reset({
      id_cuenta_tipo_cartera: 0,
      id_cartera: '',
      id_cuenta: '',
      ctipcar_observacion: '',
      ctipcar_fecha_act: this.Fechas.fecha(),
      ctipcar_fecha_desact: this.Fechas.fecha(),
      ctipcar_fecha_in: this.Fechas.fecha(),
      ctipcar_fecha_up: this.Fechas.fecha(),
      ctipcar_esactivo: true,
    });
  }

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.CuentaCarteraForms.get('id_cuenta_tipo_cartera')?.disable();
      this.CuentaCarteraForms.get('id_cartera')?.disable();
      this.CuentaCarteraForms.get('id_cuenta')?.disable();
      this.CuentaCarteraForms.get('ctipcar_observacion')?.disable();
      this.CuentaCarteraForms.get('ctipcar_fecha_act')?.disable();
      this.CuentaCarteraForms.get('ctipcar_fecha_desact')?.disable();
      this.CuentaCarteraForms.get('ctipcar_fecha_in')?.disable();
      this.CuentaCarteraForms.get('ctipcar_fecha_up')?.disable();
      this.CuentaCarteraForms.get('ctipcar_esactivo')?.disable();
    }
    if (num === 1) {
      //activos
      this.CuentaCarteraForms.get('id_cuenta_tipo_cartera')?.enable();
      this.CuentaCarteraForms.get('id_cartera')?.enable();
      this.CuentaCarteraForms.get('id_cuenta')?.enable();
      this.CuentaCarteraForms.get('ctipcar_observacion')?.enable();
      this.CuentaCarteraForms.get('ctipcar_fecha_act')?.enable();
      this.CuentaCarteraForms.get('ctipcar_fecha_desact')?.enable();
      this.CuentaCarteraForms.get('ctipcar_fecha_in')?.enable();
      this.CuentaCarteraForms.get('ctipcar_fecha_up')?.enable();
      this.CuentaCarteraForms.get('ctipcar_esactivo')?.enable();
    }
    if (num === 2) {
      //edicion')?.enable()
      this.CuentaCarteraForms.get('id_cartera')?.enable();
      this.CuentaCarteraForms.get('id_cuenta')?.enable();
      this.CuentaCarteraForms.get('ctipcar_observacion')?.enable();
      this.CuentaCarteraForms.get('ctipcar_esactivo')?.enable();
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
    this.EncerarComponentes();
  }

  GuardarObjeto(datos: any) {
    datos.id_cuenta_tipo_cartera = Number(datos.id_cuenta_tipo_cartera);
    datos.id_cartera = Number(datos.id_cartera);
    datos.id_cuenta = Number(datos.id_cuenta);
    datos.ctipcar_esactivo =
      datos.ctipcar_esactivo.toString() === 'true' ? '1' : '0';
    this.CuentaCarteraM.GuardarElemento(datos)
      .pipe(
        map((x) => {
          if (x == 1) {
            if (datos.id_cuenta_tipo_cartera != 0) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroActualizado();
            } else {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
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
  ActualizaEstado(elemento: CuentaCarteraI) {
    elemento.ctipcar_esactivo = (
      elemento.ctipcar_esactivo == '1' ? 0 : 1
    ).toString();
    this.CuentaCarteraM.GuardarElemento(elemento).subscribe((x) => {
      if (x == 1) {
        this.alerta.RegistroActualizado();
      }
    });
  }

  EliminarElemento(elemento: CuentaCarteraI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.ctipcar_esactivo = '3';
        this.CuentaCarteraM.GuardarElemento(elemento).subscribe((x) => {
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
    this.ListarTipoCartera();
    this.ListarCuentas();
    this.CuentaCarteraForms.patchValue({
      id_cuenta_tipo_cartera: datos.id_cuenta_tipo_cartera.toString(),
      id_cartera: datos.id_cartera.toString(),
      id_cuenta: datos.id_cuenta.toString(),
      ctipcar_observacion:
        datos.ctipcar_observacion == null ? '' : datos.ctipcar_observacion,
      ctipcar_fecha_act: datos.ctipcar_fecha_act,
      ctipcar_fecha_desact: datos.ctipcar_fecha_desact,
      ctipcar_fecha_in: datos.ctipcar_fecha_in,
      ctipcar_fecha_up: datos.ctipcar_fecha_up,
      ctipcar_esactivo: datos.ctipcar_esactivo === '1' ? true : false,
    });
    this.AgregarEditarElemento(num);
    CargandoLoad.classList.remove('modal--show');
  }

  // // ****************************************** COMPLEMENTOS *****************************************************************
  CarteraList: any[] = [];
  ModoTipoCartera: Number = 0;
  ListarTipoCartera() {
    this.CarteraM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          this.CarteraList = datos;
        })
      )
      .subscribe();
  }

  CuentasList: any[] = [];
  ListarCuentas() {
    this.CuentaM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          this.CuentasList = datos;
        })
      )
      .subscribe();
  }

  // // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.ResetCuentaCarteraForms();
    this.itemBusqueda.patchValue('');
    this.txtBusqueda.patchValue('');
    this.TituloFormulario = '';
    this.ActDesControles(0);
    this.CarteraList = [];
    this.CuentasList = [];
  }

  // // ****************************************** PAGINACION *****************************************************************
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
      this.FraccionDatos =
        this.FraccionDatos + Number(this.PaginaActual.Usuario.usr_rango_datos);
      this.ListarElementos(2);
    }
    this.InicioPaginacion = this.InicioPaginacion + this.RangoPaginacion;
    this.FinalPaginacion = this.FinalPaginacion + this.RangoPaginacion;
    this.FraccionarValores();
  }

  BtnPreviousUser(rango?: number) {
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
  // /*********************  FILTRO MODO GENERAL *********************** */
  DatosTemporalesBusqueda: any[] = [];
  FirltroPor: string = '';
  TextoFiltro = new FormControl({ value: '', disabled: true }, [
    Validators.required,
  ]);
  ParametrosDeFiltro: any[] = [
    { etiqueta: '', texto: '', valor: '' },
    { etiqueta: 'ThF3', texto: 'Cartera', valor: '0' },
    { etiqueta: 'ThF0', texto: 'Cuenta', valor: '1' },
    { etiqueta: 'ThF1', texto: 'Entidad', valor: '2' },
    { etiqueta: 'ThF2', texto: 'Numero de cuenta', valor: '3' },
  ];
  FiltrarPor(filtro: string) {
    this.VaciarFiltro();
    const EtqFiltro = this.ParametrosDeFiltro.find((elemento) => {
      return elemento.valor == filtro;
    });
    this.FirltroPor = EtqFiltro.texto;
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    this.TextoFiltro.patchValue('');
    inputElement.disabled = false;
    inputElement.focus();
  }
  FiltrarLista() {
    const EtqFiltro = this.ParametrosDeFiltro.find((elemento) => {
      return elemento.texto == this.FirltroPor;
    });
    const contador = this.TextoFiltro.value!.trim().length!;
    this.EncerarVariablesPaginacion();
    this.TextoFiltro.patchValue(this.TextoFiltro.value!.toUpperCase());
    const ThEtiqueta = document.getElementById(
      EtqFiltro.etiqueta
    ) as HTMLInputElement;
    if (contador != 0) {
      ThEtiqueta.style.color = 'red';
    } else {
      ThEtiqueta.style.color = '';
    }
    if (EtqFiltro.texto == 'Cartera') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaCuentas.filter((elemento) => {
        return elemento.cartera.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
    }
    if (EtqFiltro.texto == 'Cuenta') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaCuentas.filter((elemento) => {
        return elemento.cuenta.cuent_nombre.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
      const o=resultado.map(c=>
        {
          return {
        Cuenta:c.cuenta.cuent_nombre,
                Entidad:c.cuenta.cuent_entidadfinanciera,
                Numero:c.cuenta.cuent_numero,
                Cartera:c.cartera,
                Fecha:c.ctipcar_fecha_in===null?null:this.Fechas.fechaCortaAbt(c.ctipcar_fecha_in.toString()),
                Estado:c.ctipcar_esactivo==='1'?'ACTIVO':'INACTIVO'
          };
      });
      let om: generarPDF = {
        entidad: 'CuentaCartera', listado:o
      };
      this.gCuentaC=om;
    }
    if (EtqFiltro.texto == 'Entidad') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaCuentas.filter((elemento) => {
        return elemento.cuenta.cuent_entidadfinanciera.includes(
          nombre.toUpperCase()
        );
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
      const o=resultado.map(c=>
        {
          return {
        Cuenta:c.cuenta.cuent_nombre,
                Entidad:c.cuenta.cuent_entidadfinanciera,
                Numero:c.cuenta.cuent_numero,
                Cartera:c.cartera,
                Fecha:c.ctipcar_fecha_in===null?null:this.Fechas.fechaCortaAbt(c.ctipcar_fecha_in.toString()),
                Estado:c.ctipcar_esactivo==='1'?'ACTIVO':'INACTIVO'
          };
      });
      let om: generarPDF = {
        entidad: 'CuentaCartera', listado:o
      };
      this.gCuentaC=om;
    }
    if (EtqFiltro.texto == 'Numero de cuenta') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaCuentas.filter((elemento) => {
        return elemento.cuenta.cuent_numero.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
      const o=resultado.map(c=>
        {
          return{
                 Cuenta:c.cuenta.cuent_nombre,
                Entidad:c.cuenta.cuent_entidadfinanciera,
                Numero:c.cuenta.cuent_numero,
                Cartera:c.cartera,
                Fecha:c.ctipcar_fecha_in===null?null:this.Fechas.fechaCortaAbt(c.ctipcar_fecha_in.toString()),
                Estado:c.ctipcar_esactivo==='1'?'ACTIVO':'INACTIVO'
          };
      });
      let om: generarPDF = {
        entidad: 'CuentaCartera', listado:o
      };
      this.gCuentaC=om;
    }
  }
  VaciarFiltro() {
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    inputElement.disabled = true;
    for (let datos of this.ParametrosDeFiltro) {
      const ThEtiqueta = document.getElementById(
        datos.etiqueta
      ) as HTMLInputElement;
      if (ThEtiqueta!) {
        ThEtiqueta.style.color = '';
      }
    }
    this.FirltroPor = '';
    this.TextoFiltro.patchValue('');
    this.FraccionarValores(
      this.DatosTemporalesBusqueda,
      Number(this.PaginaActual.Usuario.usr_fraccion_datos)
    );
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gCuentaC);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gCuentaC);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gCuentaC);
    }
  }
}
