import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs';
import { Conectividad } from 'src/app/Clases/Conectividad';
import { Contactabilidad } from 'src/app/Clases/Contactabilidad';
import { TipoGestion } from 'src/app/Clases/TipoGestion';
import { TG_Conec_Conta } from 'src/app/Clases/TipoGestion_Conectividad_Contactabilidad';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { PermisosAcceso } from 'src/app/Control/Permisos';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import { generarPDF, TipoGestion_Conectividad_ContactivilidadI } from 'src/app/Modelos/response.interface';

@Component({
  selector: 'app-tg-conec-conta',
  templateUrl: './tg-conec-conta.component.html',
  styleUrls: ['./tg-conec-conta.component.css'],
})
export class TgConecContaComponent implements OnInit {
  constructor(
    private P_Acceso: PermisosAcceso,
    private TG_Conec_contaM: TG_Conec_Conta,
    private TipoGestionM: TipoGestion,
    private ConectividadM: Conectividad,
    private ContactabilidadM: Contactabilidad,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,
    public validar: TipoDeTexto,public reporte:GeneradorReporte
  ) {}
  PaginaActual: any;
  ngOnInit(): void {
    this.PaginaActual = this.P_Acceso.checkLocal('tgconecconta');
    this.ListarElementos(1);
  }
  TituloFormulario: string = '';

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = ['', 'Tipo de Gestion', 'Conectividad', 'Contactabilidad', 'Estado'];
  ParametrosEstado: any[] = [
    { name: 'Activo', value: 1 },
    { name: 'Inactivo', value: 0 },
    // { name: 'Eliminados', value: 3 },
  ];

  itemBusqueda = new FormControl('', [Validators.required]);
  txtBusqueda = new FormControl('', [Validators.required]);
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gTGCC!:generarPDF;

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
  ListaTG_conec_Conta: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaTG_conec_Conta = [];
      this.FraccionDatos = 0;
    }

    this.ListaTG_conec_Conta = [];
    let listadoObjeto:any[] = [];
    this.TG_Conec_contaM.ListarElementos(
      this.FraccionDatos,
      Number(this.PaginaActual.Usuario.usr_rango_datos)
    )
      .pipe(
        map((datos) => {
          CargandoLoad.classList.remove('modal--show');
          if (datos!) {
            this.ListaTG_conec_Conta = datos;
            this.DatosTemporalesBusqueda = datos;
            for (const r of this.ListaTG_conec_Conta)
              {
                let ocD: any = {
                  TipoGestion:r.gestion_tip_descripcion,
                  Contactabilidad:r.contac_descripcion,
                  Conectividad:r.conec_descripcion,
                  Fecha:r.tipges_fecha_in===null?null:this.Fechas.fechaCortaAbt(r.tipges_fecha_in.toString()),
                  Estado:r.tipges_esactivo==='1'?'ACTIVO':'INACTIVO'
                };
                listadoObjeto.push(ocD);
              }
              let om: generarPDF = {
                entidad: 'TGCC', listado: listadoObjeto
              };
              this.gTGCC=om;
            if (this.ListaTG_conec_Conta.length > 0) {
              this.ContadorDatosGeneral = this.ListaTG_conec_Conta.length;
              this.FraccionarValores(
                this.ListaTG_conec_Conta,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
  }

  FiltrarElemento() {
    const valor: any = this.txtBusqueda.value?.toString();
    let tipo: number;
    if (this.itemBusqueda.value === 'Estado') {
      tipo = 4;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Tipo de Gestion') {
      tipo = 5;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Conectividad') {
      tipo = 6;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Contactabilidad') {
      tipo = 7;
      this.GetFiltrarElemento(valor, tipo);
    }
  }

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaTG_conec_Conta = [];
    let listadoObjeto:any[] = [];
    this.TG_Conec_contaM.FiltrarElementos(valor, tipo)
      .pipe(
        map((datos) => {
          if (datos!) {
            this.ListaTG_conec_Conta = datos;
            this.DatosTemporalesBusqueda = datos;
            for (const r of this.ListaTG_conec_Conta)
              {
                let ocD: any = {
                  TipoGestion:r.gestion_tip_descripcion,
                  Contactabilidad:r.contac_descripcion,
                  Conectividad:r.conec_descripcion,
                  Fecha:r.tipges_fecha_in===null?null:this.Fechas.fechaCortaAbt(r.tipges_fecha_in.toString()),
                  Estado:r.tipges_esactivo==='1'?'ACTIVO':'INACTIVO'
                };
                listadoObjeto.push(ocD);
              }
              let om: generarPDF = {
                entidad: 'TGCC', listado: listadoObjeto
              };
              this.gTGCC=om;
            if (this.ListaTG_conec_Conta.length > 0) {
              this.ContadorDatosGeneral = this.ListaTG_conec_Conta.length;
              this.FraccionarValores(
                this.ListaTG_conec_Conta,
                Number(this.PaginaActual.Usuario.usr_fraccion_datos)
              );
            }
          }
        })
      )
      .subscribe();
  }
  // /************************************** AGREGAR ELEMENTO  ******************************************************** */

  TG_conec_ContaForms = new FormGroup({
    id_tipges_conect_contac: new FormControl(0, [Validators.required]),
    id_tipo_gestion: new FormControl('', [Validators.required]),
    id_conectividad: new FormControl('', [Validators.required]),
    id_contactabilidad: new FormControl('', [Validators.required]),
    tipges_fecha_act: new FormControl(this.Fechas.fecha()),
    tipges_fecha_desact: new FormControl(this.Fechas.fecha()),
    tipges_fecha_in: new FormControl(this.Fechas.fecha()),
    tipges_fecha_up: new FormControl(this.Fechas.fecha()),
    tipges_esactivo: new FormControl(true),
    tipges_per_edi: new FormControl('', [Validators.required]),
  });

  ResetTG_conec_ContaForms() {
    this.TG_conec_ContaForms.reset({
      id_tipges_conect_contac: 0,
      id_tipo_gestion: '',
      id_conectividad: '',
      id_contactabilidad: '',
      tipges_fecha_act: this.Fechas.fecha(),
      tipges_fecha_desact: this.Fechas.fecha(),
      tipges_fecha_in: this.Fechas.fecha(),
      tipges_fecha_up: this.Fechas.fecha(),
      tipges_esactivo: true,
      tipges_per_edi: '',
    });
  }

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.TG_conec_ContaForms.get('id_tipges_conect_contac')?.disable();
      this.TG_conec_ContaForms.get('id_tipo_gestion')?.disable();
      this.TG_conec_ContaForms.get('id_conectividad')?.disable();
      this.TG_conec_ContaForms.get('id_contactabilidad')?.disable();
      this.TG_conec_ContaForms.get('tipges_fecha_act')?.disable();
      this.TG_conec_ContaForms.get('tipges_fecha_desact')?.disable();
      this.TG_conec_ContaForms.get('tipges_fecha_in')?.disable();
      this.TG_conec_ContaForms.get('tipges_fecha_up')?.disable();
      this.TG_conec_ContaForms.get('tipges_esactivo')?.disable();
      this.TG_conec_ContaForms.get('tipges_per_edi')?.disable();
    }
    if (num === 1) {
      //activos
      this.TG_conec_ContaForms.get('id_tipges_conect_contac')?.enable();
      this.TG_conec_ContaForms.get('id_tipo_gestion')?.enable();
      this.TG_conec_ContaForms.get('id_conectividad')?.enable();
      this.TG_conec_ContaForms.get('id_contactabilidad')?.enable();
      this.TG_conec_ContaForms.get('tipges_fecha_act')?.enable();
      this.TG_conec_ContaForms.get('tipges_fecha_desact')?.enable();
      this.TG_conec_ContaForms.get('tipges_fecha_in')?.enable();
      this.TG_conec_ContaForms.get('tipges_fecha_up')?.enable();
      this.TG_conec_ContaForms.get('tipges_esactivo')?.enable();
      this.TG_conec_ContaForms.get('tipges_per_edi')?.enable();
    }
    if (num === 2) {
      //edicion')?.enable()
      this.TG_conec_ContaForms.get('id_tipo_gestion')?.enable();
      this.TG_conec_ContaForms.get('id_conectividad')?.enable();
      this.TG_conec_ContaForms.get('id_contactabilidad')?.enable();
      this.TG_conec_ContaForms.get('tipges_esactivo')?.enable();
      this.TG_conec_ContaForms.get('tipges_per_edi')?.enable();
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
    datos.id_tipges_conect_contac = Number(datos.id_tipges_conect_contac);
    datos.id_tipo_gestion = Number(datos.id_tipo_gestion);
    datos.id_conectividad = Number(datos.id_conectividad);
    datos.id_contactabilidad = Number(datos.id_contactabilidad);
    datos.tipges_esactivo =
      datos.tipges_esactivo.toString() === 'true' ? '1' : '0';
    this.TG_Conec_contaM.GuardarElemento(datos)
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
  ActualizaEstado(elemento: TipoGestion_Conectividad_ContactivilidadI) {
    elemento.tipges_esactivo = (
      elemento.tipges_esactivo == '1' ? 0 : 1
    ).toString();
    this.TG_Conec_contaM.GuardarElemento(elemento).subscribe((x) => {
      if (x == 1) {
        this.alerta.RegistroActualizado();
      }
    });
  }

  EliminarElemento(elemento: TipoGestion_Conectividad_ContactivilidadI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.tipges_esactivo = '3';
        this.TG_Conec_contaM.GuardarElemento(elemento).subscribe((x) => {
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
    this.ListarTipoGestion();
    this.ListarConectividad();
    this.ListarContactabilidad();
    this.TG_conec_ContaForms.patchValue({
      id_tipges_conect_contac: datos.id_tipges_conect_contac.toString(),
      id_tipo_gestion: datos.id_tipo_gestion.toString(),
      id_conectividad: datos.id_conectividad.toString(),
      id_contactabilidad: datos.id_contactabilidad.toString(),
      tipges_fecha_act: datos.tipges_fecha_act,
      tipges_fecha_desact: datos.tipges_fecha_desact,
      tipges_fecha_in: datos.tipges_fecha_in,
      tipges_fecha_up: datos.tipges_fecha_up,
      tipges_esactivo: datos.tipges_esactivo === '1' ? true : false,
      tipges_per_edi: datos.tipges_per_edi,
    });
    this.AgregarEditarElemento(num);
    CargandoLoad.classList.remove('modal--show');
    this.CamposEdicion();
  }

  // // ****************************************** COMPLEMENTOS *****************************************************************
  TipoGestionList: any[] = [];
  ListarTipoGestion() {
    this.TipoGestionM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          this.TipoGestionList = datos;
        })
      )
      .subscribe();
  }
  ConectividadList: any[] = [];
  ListarConectividad() {
    this.ConectividadM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          this.ConectividadList = datos;
        })
      )
      .subscribe();
  }
  ContactabilidadList: any[] = [];
  ListarContactabilidad() {
    this.ContactabilidadM.ListarElementos(0, 0)
      .pipe(
        map((datos) => {
          this.ContactabilidadList = datos;
        })
      )
      .subscribe();
  }
  PermisosEditables: any[] = [
    { campos: 'Detalle de gestión',texto: 'Sin Valores', valor: '0' },
    { campos: 'F. Compromiso, Valores de compromiso, F. prox pago, Sol. Certificado',texto: 'Con valores', valor: '1' },
    { campos: 'F. incumplido, Valor incumplido',texto: 'Incumplidos', valor: '2' },
  ];
  CamposVisibles: string = '';
  CamposEdicion(){
    let filtro = this.TG_conec_ContaForms.get('tipges_per_edi')!.value;
    const EtqFiltro = this.PermisosEditables.find((elemento) => {
      return elemento.valor == filtro;
    });
    this.CamposVisibles = EtqFiltro.campos;
  }
  // // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.ResetTG_conec_ContaForms();
    this.itemBusqueda.patchValue('');
    this.txtBusqueda.patchValue('');
    this.TituloFormulario = '';
    this.ActDesControles(0);
    this.TipoGestionList = [];
    this.ConectividadList = [];
    this.ContactabilidadList = [];
    this.CamposVisibles = '';
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
    { etiqueta: 'ThF0', texto: 'Tipo de Gestion', valor: '0' },
    { etiqueta: 'ThF1', texto: 'Conectividad', valor: '1' },
    { etiqueta: 'ThF2', texto: 'Contactabilidad', valor: '2' },
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
    if (EtqFiltro.texto == 'Tipo de Gestion') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaTG_conec_Conta.filter((elemento) => {
        return elemento.gestion_tip_descripcion.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
    }
    if (EtqFiltro.texto == 'Conectividad') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaTG_conec_Conta.filter((elemento) => {
        return elemento.conec_descripcion.includes(nombre.toUpperCase());
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
    }
    if (EtqFiltro.texto == 'Contactabilidad') {
      let nombre = this.TextoFiltro.value!;
      const resultado = this.ListaTG_conec_Conta.filter((elemento) => {
        return elemento.contac_descripcion.includes(
          nombre.toUpperCase()
        );
      });
      this.FraccionarValores(
        resultado,
        Number(this.PaginaActual.Usuario.usr_fraccion_datos)
      );
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
      this.reporte.generarPDF(this.gTGCC);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gTGCC);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gTGCC);
    }
  }
}
