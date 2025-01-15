import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Alertas } from 'src/app/Control/Alerts';
import { ApiService } from 'src/app/service/api.service';
import { Fechas } from 'src/app/Control/Fechas';
import { ResultadoCarteraI, ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, catchError, map } from 'rxjs';
import { ContactabilidadI, FiltroGestion2, generarPDF, GestionCG, GestorI } from 'src/app/Modelos/response.interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { ngxCsv } from 'ngx-csv';
import autotable from 'jspdf-autotable';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {
  
  ListaGestion: any[] = [];
  ListaGestionAuxiliar: any[] = [];
	FraccionDatos: number = 0;
	ContadorDatosGeneral: number = 0;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  banderaDescargar:boolean=false;
  banderaFiltro:boolean=false;
  banderaTodad:boolean=false;
  valor:number=0;
  ngOnInit() 
  {
    this.CarterasGestor();
    this.getContactabilidad().subscribe((result: any[]) => {
      this.ListaContactabilidad = result;
      for (let datos of this.ListaContactabilidad) {
        let c: any = {
          id_contactabilidad: Number(datos.id_contactabilidad),
          contac_descripcion: datos.contac_descripcion
        };
        this.contac.push(c);
        this.TodasContactabilidades.push(c.id_contactabilidad);
      }  
    });
    this.getElementosSinGestionar2();
    
    
  }
  @ViewChild('contenido',{static:false})el!:ElementRef
  constructor(private api: ApiService,private alerta: Alertas,public Fechas: Fechas,private router: Router,public reporte:GeneradorReporte) {}
  BuscarForms = new FormGroup({
    identificacion: new FormControl('', Validators.required),
    nombres_cliente: new FormControl('', Validators.required),
    cartera: new FormControl('0', Validators.required),
    gestor: new FormControl('0', Validators.required),
    contactabilidad: new FormControl('0', Validators.required),
    fecha_inicial_pp: new FormControl(
      this.Fechas.fechaActualCorta(),
      Validators.required
    ),
    fecha_final_pp: new FormControl(
      this.Fechas.fechaActualCorta(),
      Validators.required
    ),
    fecha_inicial_gestion: new FormControl(
      this.Fechas.fechaActualCorta(),
      Validators.required
    ),
    fecha_final_gestion: new FormControl(
      this.Fechas.fechaActualCorta(),
      Validators.required
    ),


    ultima_gestion: new FormControl(true, Validators.required),
  });
  ResetClienteForms() {
    this.BuscarForms.reset({
      identificacion: '',
      nombres_cliente: '',
      cartera: '0',
      gestor: '0',
      contactabilidad: '0',
      fecha_inicial_pp: this.Fechas.fechaActualCorta(),
      fecha_final_pp: this.Fechas.fechaActualCorta(),
      fecha_inicial_gestion: this.Fechas.fechaActualCorta(),
      fecha_final_gestion: this.Fechas.fechaActualCorta(),
      ultima_gestion: true,
    });
  }
/***********************************************/
 ListaCarteras: any[] = [
    { number: '1', name: 'Marcinex', icon: 'bi bi-list' },
    { number: '2', name: 'Pacifico', icon: 'bi bi-cake2' },
    { number: '3', name: 'Jep', icon: 'bi bi-building' },
    { number: '4', name: 'RM', icon: 'bi bi-battery-half' },
    { number: '5', name: 'Jaher', icon: 'bi bi-bank' },
  ];
  valorD:number=0;

  EstadoCliente: any[] = [
    { number: '1', name: 'Contactado', icon: 'bi bi-list' },
    { number: '2', name: 'No Contactado', icon: 'bi bi-cake2' },
    { number: '3', name: 'Compromiso de pago', icon: 'bi bi-building' },
    { number: '4', name: 'Compromiso de incumplido', icon: 'bi bi-battery-half' },
    { number: '5', name: 'Combenio de pago', icon: 'bi bi-bank' },
  ];
  Gestores: any[] = [
    { number: '1', name: 'Juan Perez', icon: 'bi bi-list' },
    { number: '2', name: 'Pedro Perez', icon: 'bi bi-cake2' },
    { number: '3', name: 'Carlos Perez', icon: 'bi bi-building' },
    { number: '4', name: 'Marco Perez', icon: 'bi bi-battery-half' },
    { number: '5', name: 'Maria Perez', icon: 'bi bi-bank' },
  ];

  getCurrentDate() {
    const startDate = document.getElementById('startDate') as HTMLInputElement;
    const endDate = document.getElementById('endDate') as HTMLInputElement;
    const today = new Date();
    const year = today.getFullYear();
    let month = (today.getMonth() + 1).toString();
    let day = today.getDate().toString();
    month = (Number(month) < 10 ? `0${month}` : month).toString();
    day = (Number(day) < 10 ? `0${day}` : day).toString();

    startDate.value = `${year}-${month}-${day}`;
    endDate.value = `${year}-${month}-${day}`;

    // return `${year}-${month}-${day}`;
  }
  ListaGestionar: any[] = [];
  DatosTemporalesBusqueda: any[] = [];
  CarteraGestor: any[] = [];
  contac:any[] =[];
  TodasCarteras: number[] = [];
  TodasContactabilidades: number[] = [];
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Cartera: ResultadoCarteraI[] = this.permisos.cartera;
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'reporte-general';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  gReporteG!:generarPDF;
  // ****************************************** PAGINACION *****************************************************************
  DatosCargaMasiva!: any[];
  DatosTemporales: any[] = [];
  ContadorDatos: number = 0;
  RangoPaginacion: number = 0;
  InicioPaginacion: number = 0;
  FinalPaginacion: number = 0;
  FraccionarValores(datos?: any, rango?: number ){
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
  EncerarVariablesPaginacion() {
    this.ContadorDatos = 0;
    this.RangoPaginacion = 0;
    this.InicioPaginacion = 0;
    this.FinalPaginacion = 0;
    this.DatosTemporales = [];
  }
  ListarElementos(num: number) {
    this.banderaTodad=true;
    this.banderaFiltro=false;
    // this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaGestion = [];
      this.FraccionDatos = 0;
    }

    this.ListaGestion = [];
    this.loading = true;
    this.api
      .GetGestionFracionado2(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.banderaDescargar=true;
          this.ListaGestion = tracks['data'];
          //console.log(this.ListaGestion)
          this.valorD=this.getKeys2(this.ListaGestion).length;
          const o:any[] =this.getProductData2(this.valorD);
          console.log(o)
          let om: generarPDF = {
            entidad: 'ReporteGeneral', listado:o
          };
          this.gReporteG=om;
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaGestion.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaGestion.length;
            this.FraccionarValores(this.ListaGestion, this.ConstanteFraccion);
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
  buscarFiltro(dato:any)
  {
    this.banderaFiltro=true;
    this.banderaTodad=false;
    let filtro:FiltroGestion2=
    {
      tipo:1,identificacion:(dato.identificacion.trim()===''?'0':dato.identificacion.trim())!,
      nombres_cliente:(dato.nombres_cliente.trim()===''?'0':dato.nombres_cliente.trim())!,
      cartera:dato.cartera=='0'?this.TodasCarteras:[Number(dato.cartera)],
      gestor:dato.gestor,
      contactabilidad:dato.contactabilidad=='0'?this.TodasContactabilidades:[Number(dato.contactabilidad)],
      fecha_inicial_pp:dato.fecha_inicial_pp,
      fecha_final_pp:dato.fecha_final_pp,
      fecha_inicial_gestion:dato.fecha_inicial_gestion,
      fecha_final_gestion:dato.fecha_final_gestion,
      ultima_gestion:dato.ultima_gestion==true?'1':'0'
    }
    console.log(filtro);
    this.ListaGestion = [];
    this.loading = true;
    this.api
      .GetGestionFracionadoSecondFiltro(filtro)
      .pipe(
        map((tracks) => {
          console.log(tracks['data']);
          this.ListaGestion = tracks['data'];
          this.banderaDescargar=true;
          this.valorD=this.getKeys2(this.ListaGestion).length;
          const o:any[] =this.getProductData2(this.valorD);
          console.log(o)
          let om: generarPDF = {
            entidad: 'ReporteGeneralFiltro', listado:o
          };
          this.gReporteG=om;
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaGestion.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaGestion.length;
            this.FraccionarValores(this.ListaGestion, this.ConstanteFraccion);
          }
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
      const auxA:any[] =this.getProductData2(this.valorD);
      

    // if(this.BuscarForms.value.identificacion===''&&this.BuscarForms.value.nombres_cliente===''&&this.BuscarForms.value.cartera==='0'&&this.BuscarForms.value.gestor==='0'&&this.BuscarForms.value.contactabilidad==='0'&&this.BuscarForms.value.fecha_inicial===this.Fechas.fechaActualCorta()&&this.BuscarForms.value.fecha_final===this.Fechas.fechaActualCorta())
    //   {
    //      this.ListarElementos(1);
    //   }
    // if(this.BuscarForms.value.identificacion!='')
    //   {
    //     console.log('entro');
    //     console.log(this.BuscarForms.value.identificacion)
    //     const resultado = this.ListaGestion.filter((elemento) => {
    //       return elemento['cli_identificacion']===this.BuscarForms.value.identificacion?.trim();
    //     });
    //     this.FraccionarValores(resultado, this.ConstanteFraccion);
    //   }
    // if(this.BuscarForms.value.cartera!=='0')
    //   {
    //     console.log(typeof this.BuscarForms.value.cartera)
    //     const resultado = this.ListaGestion.filter((elemento) => {
    //       return elemento['gest_id_cartera']===Number(this.BuscarForms.value.cartera?.toString());
    //     });
    //     this.FraccionarValores(resultado, this.ConstanteFraccion);
    //   }
    //   if(this.BuscarForms.value.contactabilidad!=='0')
    //     {
    //       console.log(typeof this.BuscarForms.value.cartera)
    //       const resultado = this.ListaGestion.filter((elemento) => {
    //         return elemento['gest_id_contactabilidad']===Number(this.BuscarForms.value.contactabilidad?.toString());
    //       });
    //       this.FraccionarValores(resultado, this.ConstanteFraccion);
    //     }
    //     if(this.BuscarForms.value.gestor!=='0')
    //       {
    //         console.log(typeof this.BuscarForms.value.cartera)
    //         const resultado = this.ListaGestion.filter((elemento) => {
    //           return elemento['id_gestor']===Number(this.BuscarForms.value.gestor?.toString());
    //         });
    //         this.FraccionarValores(resultado, this.ConstanteFraccion);
    //       }
    //       if(this.BuscarForms.value.fecha_inicial!=this.Fechas.fechaActualCorta()&&this.BuscarForms.value.fecha_final!=this.Fechas.fechaActualCorta())
    //         {
              
    //           const fInicial= this.getFecha(this.BuscarForms.value.fecha_inicial!);
    //           fInicial.setHours(0,0,0,0);
    //           const fFinal= this.getFecha(this.BuscarForms.value.fecha_final!);
    //           fFinal.setHours(23, 59, 59, 999);
    //           const fechaIForm= fInicial.toISOString();
    //           const fechaFForm = fFinal.toISOString();
    //           const resultado = this.ListaGestion.filter((elemento) => {
    //             return elemento['gest_fecha_gestion']>=fechaIForm && elemento['gest_fecha_gestion']<=fechaFForm
    //           });
    //           this.FraccionarValores(resultado, this.ConstanteFraccion);
    //         }
    
  }
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
  ListaContactabilidad: any[] =[];
  ListaGestores: GestorI[] = [];
  ListarGestores() {
    console.log('aqui');
    this.ListaGestores = [];
    this.api
      .GetGestoresFracionadoFiltro('g', 20)
      .pipe(
        map((tracks) => {
          console.log(tracks['data']);
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
  getContactabilidad(): Observable<any[]> {
    return this.api.GetContactabilidadFracionado(0, 0).pipe(
      map((tracks) => {
          return tracks['data'].map((item: any) => ({
            id_contactabilidad: item['id_contactabilidad'],
            contac_descripcion: item['contac_descripcion']
          }));
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
  /*********************  FILTRO MODO GENERAL *********************** */
  FirltroPor: string = '';
  TextoFiltro = new FormControl({ value: '', disabled:true}, [
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
    // const ThApellido = document.getElementById(
    //   'ThApellido'
    // ) as HTMLInputElement;

    //ThApellido.style.color = '';
    ThDescripcion.style.color = '';
    inputElement.disabled = false;
    inputElement.focus();
  }

  FiltrarLista(num: number) {
    const contador = this.TextoFiltro.value!.trim().length!;
    this.EncerarVariablesPaginacion();
    this.TextoFiltro.patchValue(this.TextoFiltro.value!);
    const ThNombres = document.getElementById(
      'ThNombres'
    ) as HTMLInputElement;
    const ThCartera = document.getElementById(
      'ThCartera'
    ) as HTMLInputElement;
    const ThCXC = document.getElementById(
      'ThCXC'
    ) as HTMLInputElement;
    const ThCedula = document.getElementById(
      'ThCedula'
    ) as HTMLInputElement;
    const ThConectividad = document.getElementById(
      'ThConectividad'
    ) as HTMLInputElement;
    const ThGestor = document.getElementById(
      'ThGestor'
    ) as HTMLInputElement;
    const ThTipoGestion = document.getElementById(
      'ThTipoGestion'
    ) as HTMLInputElement;
    const ThGestionMediante = document.getElementById(
      'ThGestionMediante'
    ) as HTMLInputElement;
    const ThContactabilidad = document.getElementById(
      'ThContactabilidad'
    ) as HTMLInputElement;
    if(this.banderaTodad===true&&this.banderaFiltro===false)
      {
        if (this.FirltroPor === 'Nombre') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['cli_nombres'].includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThNombres.style.color = 'red';
          } else {
            ThNombres.style.color = '';
          }
        }
        if (this.FirltroPor === 'Cartera') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['cart_descripcion'].includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThCartera.style.color = 'red';
          } else {
            ThCartera.style.color = '';
          }
        }
        if (this.FirltroPor === 'Cedula') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['cli_identificacion'].includes(nombre.trim());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThCedula.style.color = 'red';
          } else {
            ThCedula.style.color = '';
          }
        }
        if (this.FirltroPor === 'Credito') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['ope_cod_credito'].includes(nombre.trim());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThCXC.style.color = 'red';
          } else {
            ThCXC.style.color = '';
          }
        }
        if (this.FirltroPor === 'Gestor') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['nombreGest'].includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThGestor.style.color = 'red';
          } else {
            ThGestor.style.color = '';
          }
        }
        if (this.FirltroPor === 'Conectividad') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['conec_descripcion'].includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThConectividad.style.color = 'red';
          } else {
            ThConectividad.style.color = '';
          }
        }
        if (this.FirltroPor === 'TipoGestion') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['gestion_tip_descripcion'].includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThTipoGestion.style.color = 'red';
          } else {
            ThTipoGestion.style.color = '';
          }
        }
        if (this.FirltroPor === 'GestionMediante') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['gest_num_contacto'].includes(nombre);
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThGestionMediante.style.color = 'red';
          } else {
            ThGestionMediante.style.color = '';
          }
        }
        if (this.FirltroPor === 'Contactabilidad') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaGestion.filter((elemento) => {
              return elemento['cli_estado_contacta'].includes(nombre);
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
            const j=resultado.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
              }));
              let om: generarPDF = {
                entidad: 'ReporteGeneral', listado:j
              };
              this.gReporteG=om;
          }
           
          if (contador != 0) {
            ThContactabilidad.style.color = 'red';
          } else {
            ThContactabilidad.style.color = '';
          }
        }
      }
      if(this.banderaFiltro===true&&this.banderaTodad===false)
        {
          if (this.FirltroPor === 'Nombre') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Gestion.Cliente['cli_nombres'].includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              console.log(resultado);
            }
      
            if (contador != 0) {
              ThNombres.style.color = 'red';
            } else {
              ThNombres.style.color = '';
            }
          }
          if (this.FirltroPor === 'Cartera') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Cartera.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
               const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
            if (contador != 0) {
              ThCartera.style.color = 'red';
            } else {
              ThCartera.style.color = '';
            }
          }
          if (this.FirltroPor === 'Cedula') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Gestion.Cliente['cli_identificacion'].includes(nombre.trim());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThCedula.style.color = 'red';
            } else {
              ThCedula.style.color = '';
            }
          }
          if (this.FirltroPor === 'Credito') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Gestion['ope_cod_credito'].includes(nombre.trim());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThCXC.style.color = 'red';
            } else {
              ThCXC.style.color = '';
            }
          }
          if (this.FirltroPor === 'Gestor') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento['GestorAsignado'].includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThGestor.style.color = 'red';
            } else {
              ThGestor.style.color = '';
            }
          }
          if (this.FirltroPor === 'Conectividad') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento['Conectividad'].includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThConectividad.style.color = 'red';
            } else {
              ThConectividad.style.color = '';
            }
          }
          if (this.FirltroPor === 'Contactabilidad') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Gestion.Cliente['cli_estado_contacta'].includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThContactabilidad.style.color = 'red';
            } else {
              ThContactabilidad.style.color = '';
            }
          }
          if (this.FirltroPor === 'TipoGestion') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento['TipoGestion'].includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThTipoGestion.style.color = 'red';
            } else {
              ThTipoGestion.style.color = '';
            }
          }
          if (this.FirltroPor === 'GestionMediante') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaGestion.filter((elemento) => {
                return elemento.Gestion['gest_num_contacto'].includes(nombre);
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
              const j=resultado.map((item: any) => ({
                cartera:item.Cartera,
                cedula:item.Gestion.Cliente.cli_identificacion,
                ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
                ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
                ope_producto: item.Gestion.CXC_Operacion.ope_producto,
                cli_nombres:item.Gestion.Cliente.cli_nombres,
                tipo_gestion: item.TipoGestion,
                cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
                Conectividad: item.Conectividad,
                gest_num_contacto:item.Gestion.gest_num_contacto,
                ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
                ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
                ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
                ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
                ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
                gest_couta:item.Gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
                Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
                volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:item.Contactabilidad.contac_descripcion,
                GestorAsignado:item.GestorAsignado
              }));
                let om: generarPDF = {
                  entidad: 'ReporteGeneralFiltro', listado:j
                };
                this.gReporteG=om;
            }
             
            if (contador != 0) {
              ThGestionMediante.style.color = 'red';
            } else {
              ThGestionMediante.style.color = '';
            }
          }
        }
  }
  VaciarFiltro() {
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    const ThNombres = document.getElementById(
      'ThNombres'
    ) as HTMLInputElement;
    const ThCartera = document.getElementById(
      'ThCartera'
    ) as HTMLInputElement;
    const ThCXC = document.getElementById(
      'ThCXC'
    ) as HTMLInputElement;
    const ThCedula = document.getElementById(
      'ThCedula'
    ) as HTMLInputElement;
    const ThConectividad = document.getElementById(
      'ThConectividad'
    ) as HTMLInputElement;
    const ThGestor = document.getElementById(
      'ThGestor'
    ) as HTMLInputElement;
    const ThTipoGestion = document.getElementById(
      'ThTipoGestion'
    ) as HTMLInputElement;
    const ThGestionMediante = document.getElementById(
      'ThGestionMediante'
    ) as HTMLInputElement;
    const ThContactabilidad = document.getElementById(
      'ThContactabilidad'
    ) as HTMLInputElement;
    ThNombres.style.color = '';
    ThCartera.style.color = '';
    ThCXC.style.color = '';
    ThCedula.style.color = '';
    ThConectividad.style.color = '';
    ThGestor.style.color = '';
    ThTipoGestion.style.color = '';
    ThGestionMediante.style.color = '';
    ThContactabilidad.style.color = '';

    inputElement.disabled = true;
    this.FirltroPor = '';
    this.TextoFiltro.patchValue('');
    this.FraccionarValores(
      this.DatosTemporalesBusqueda,
      this.ConstanteFraccion
    );
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
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gReporteG);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gReporteG);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gReporteG);
    }
  }
  csv() {
   console.log('csv');
   var opciones=
  {
    title:this.PaginaNombre,
    fieldSeparator:',',
    quoteStrings:'"',
    showLabels:false,
    noDownload:false,
    useBom:false,
    headers:this.getKeys()
  };
  new ngxCsv(this.ListaGestion,"reporte",opciones);
  }
  excel() {
    const fechaActual = new Date();
    const opciones = { timeZone: 'America/Guayaquil' };
    const fecha = fechaActual.toLocaleString('es-EC', opciones);
    let filename: string = `${fecha.substring(0, fecha.length - 3)}_reporte.xlsx`;
    let array:any[]=[];
    if (this.valorD=== 48) 
      {
        array=this.ListaGestion;
      }else
      {
        array = this.ListaGestion.map((item: any) => ({
          id_cartera:item.Gestion.CXC_Operacion.id_cartera,
          cartera:item.Cartera,
          cedula:item.Gestion.Cliente.cli_identificacion,
          ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
          ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
          ope_producto: item.Gestion.CXC_Operacion.ope_producto,
          cli_nombres:item.Gestion.Cliente.cli_nombres,
          tipo_gestion: item.TipoGestion,
          cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
          Conectividad: item.Conectividad,
          gest_num_contacto:item.Gestion.gest_num_contacto,
          ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
          ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
          ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
          ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
          ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar,
          gest_fecha_in: this.Fechas.fechaCorta(item.Gestion.gest_fecha_in),
          gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
          gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
          gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
          gest_couta:item.Gestion.gest_couta,
          gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
          gest_fecha_incumplido:this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido),
          gest_valor_incumplido:item.Gestion.gest_valor_incumplido,
          Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
          gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
          gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
          volver_llamar:item.Gestion.gest_volver_llamar == '1'?'Si':'No',
          contac_descripcion:item.Contactabilidad.contac_descripcion,
          GestorAsignado:item.GestorAsignado
        }));
      }
    const ws = XLSX.utils.json_to_sheet(array);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.PaginaNombre);
    XLSX.writeFile(wb, filename);
  }
  descargarPDF() {
    console.log('pdf')
    const fechaActual = new Date();
    const opciones = { timeZone: 'America/Guayaquil' };
    const fecha = fechaActual.toLocaleString('es-EC', opciones);
    const DATA = document.getElementById('contenido');
    const doc = new jsPDF('p', 'pt', 'a4');
    
    const options = {
      background: 'white',
      scale: 3
    };
    html2canvas(DATA!, options).then((canvas) => {

      const img = canvas.toDataURL('image/PNG');
      const bufferX = 60;
      const bufferY = 60;
      const imgProps = (doc as any).getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
      const textX = 60;
      const textY = 45;
     doc.text(this.PaginaNombre, textX, textY);
     doc.text(fecha.substring(0,fecha.length-3),textX+350,textY);

      return doc;
    }).then((docResult) => {
      docResult.save(`${fecha.substring(0,fecha.length-3)}_reporte.pdf`);
    });

  }
  headersTable:string[]=[
    'Id.Cartera',
    'Cartera',
    'Cedula',
    'CxC',
    'Descripcion',
    'Producto',
    'Nombres',
    'T.Gestion',
    'Estado',
    'Conectividad',
    'Numero',
    'S.S-CXC',
    'D.Mora',
    'G.Cobranzas',
    'I.Mora',
    'Liquidar', 'S.CxC', 'F.Origen', 'F.Gestion', 'F.Compromiso', 'V.Cobrar', 'Couta', 'F.ProxPago', 'F.Incumplido', 'V.Incumplido', 'Gestor', 'FV.Llamar', 'HV.Llamar', 'V.Llamar', 'Contactabilidad', 'Asignado'
  ];
  getCabeceraTable()
  {
    if(this.valorD===48)
      {
        return this.headersTable;
      }else
      {
        const array= this.ListaGestion.map((item: any) => ({
          IdCartera:item.Gestion.CXC_Operacion.id_cartera,
          Cartera:item.Cartera,
          Cedula:item.Gestion.Cliente.cli_identificacion,
          CXC:item.Gestion.CXC_Operacion.ope_cod_credito,
          Descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
          Producto: item.Gestion.CXC_Operacion.ope_producto,
          Nombres:item.Gestion.Cliente.cli_nombres,
          TipGestion: item.TipoGestion,
          Estado: item.Gestion.Cliente.cli_estado_contacta,
          Conectividad: item.Conectividad,
          Numero:item.Gestion.gest_num_contacto,
          SSCXCA:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
          DMora:item.Gestion.CXC_Operacion.ope_dias_mora,
          GCobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
          InteresMora: item.Gestion.CXC_Operacion.ope_interes_mora,
          Liquidar:item.Gestion.CXC_Operacion.ope_liquidar,
          FOrigen: this.Fechas.fechaCorta(item.Gestion.gest_fecha_in),
          FGestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
          FCompromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
          ValCobrar:item.Gestion.gest_valor_a_cobrar,
          Couta:item.Gestion.gest_couta,
          FProxPag:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
          FIncumplido:this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido),
          ValorIncumplido:item.Gestion.gest_valor_incumplido,
          GestorG:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
          FVLlamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
          HVLlamar:item.Gestion.gest_hora_volver_llamar,
          VLlamar:item.Gestion.gest_volver_llamar == '1'?'Si':'No',
          Contactabilidad:item.Contactabilidad.contac_descripcion,
          GestorA:item.GestorAsignado
        }));
        return this.getKeys2(array);
      }
  }
  getProductData() {
    if(this.valorD===48)
    {
      return this.ListaGestion.map(gestion => [gestion.gest_id_cartera,gestion.cart_descripcion,gestion.cli_identificacion,gestion.ope_cod_credito,gestion.ope_descripcion,
        gestion.ope_producto,gestion.cli_nombres,gestion.gestion_tip_descripcion,gestion.cli_estado_contacta,gestion.conec_descripcion,gestion.gest_num_contacto,gestion.ope_saldo_cxc_actual,
        gestion.ope_dias_mora,gestion.ope_gastos_cobranzas,gestion.ope_interes_mora,gestion.ope_liquidar,gestion.ope_saldo_cxc_actual,
        this.Fechas.fechaCorta(gestion.gest_fecha_in),this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
        this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
        gestion.gest_valor_a_cobrar,gestion.gest_couta,this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
        this.Fechas.fechaCorta(gestion.gest_fecha_incumplido)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_incumplido),
        gestion.gest_valor_incumplido,gestion.nombreGest,this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
        gestion.gest_hora_volver_llamar,gestion.gest_volver_llamar == '1'?'Si':'No',gestion.contac_descripcion,gestion.nombreGestorAsig]);
    }else
    {
      const val=this.ListaGestion.map((item: any) => ({
        id_cartera:item.Gestion.CXC_Operacion.id_cartera,
        cartera:item.Cartera,
        cedula:item.Gestion.Cliente.cli_identificacion,
        ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
        ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
        ope_producto: item.Gestion.CXC_Operacion.ope_producto,
        cli_nombres:item.Gestion.Cliente.cli_nombres,
        tipo_gestion: item.TipoGestion,
        cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
        Conectividad: item.Conectividad,
        gest_num_contacto:item.Gestion.gest_num_contacto,
        ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
        ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
        ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
        ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
        ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar,
        gest_fecha_in: this.Fechas.fechaCorta(item.Gestion.gest_fecha_in),
        gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
        gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
        gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
        gest_couta:item.Gestion.gest_couta,
        gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
        gest_fecha_incumplido:this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_incumplido),
        gest_valor_incumplido:item.Gestion.gest_valor_incumplido,
        Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
        gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
        gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
        volver_llamar:item.Gestion.gest_volver_llamar == '1'?'Si':'No',
        contac_descripcion:item.Contactabilidad.contac_descripcion,
        GestorAsignado:item.GestorAsignado
      }));
      return val.map(gestion=>[gestion.id_cartera,gestion.cartera,gestion.cedula,gestion.ope_cod_credito,
        gestion.ope_descripcion,gestion.ope_producto,gestion.cli_nombres,gestion.tipo_gestion,gestion.cli_estado_contacta,
        gestion.Conectividad,gestion.gest_num_contacto,gestion.ope_saldo_cxc_actual,gestion.ope_dias_mora,
        gestion.ope_gastos_cobranzas,gestion.ope_interes_mora,gestion.ope_liquidar,gestion.gest_fecha_in,
        gestion.gest_fecha_gestion,gestion.gest_fecha_compromiso,gestion.gest_valor_a_cobrar,gestion.gest_couta,
        gestion.gest_fecha_prox_pago,gestion.gest_fecha_incumplido,gestion.gest_valor_incumplido,gestion.Gestionado,
        gestion.gest_fecha_volver_llamar,gestion.gest_hora_volver_llamar,gestion.volver_llamar,gestion.contac_descripcion,gestion.GestorAsignado]);
    }
    
  }
  getProductData2(valor:number):any[] {
    if(valor===48)
    {
      return this.ListaGestion.map((gestion:any) => (
              {
                cartera:gestion.cart_descripcion,
                cedula:gestion.cli_identificacion,
                ope_cod_credito:gestion.ope_cod_credito,
                ope_descripcion:gestion.ope_descripcion,
                ope_producto:gestion.ope_producto,
                cli_nombres:gestion.cli_nombres,
                tipo_gestion:gestion.gestion_tip_descripcion,
                cli_estado_contacta:gestion.cli_estado_contacta,
                Conectividad:gestion.conec_descripcion,
                gest_num_contacto:gestion.gest_num_contacto,
                ope_saldo_cxc_actual:gestion.ope_saldo_cxc_actual,
                ope_dias_mora:gestion.ope_dias_mora,
                ope_gastos_cobranzas:gestion.ope_gastos_cobranzas,
                ope_interes_mora:gestion.ope_interes_mora,
                ope_liquidar:gestion.ope_liquidar=== '1'?'Si':'No',
                gest_fecha_gestion:this.Fechas.fechaCorta(gestion.gest_fecha_gestion),
                gest_fecha_compromiso:this.Fechas.fechaCorta(gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_compromiso),
                gest_valor_a_cobrar:gestion.gest_valor_a_cobrar,
                gest_couta:gestion.gest_couta,
                gest_fecha_prox_pago:this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_prox_pago),
                Gestionado:gestion.nombreGest,
                gest_fecha_volver_llamar:this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(gestion.gest_fecha_volver_llamar),
                gest_hora_volver_llamar:gestion.gest_hora_volver_llamar,
                volver_llamar:gestion.gest_volver_llamar === '1'?'Si':'No',
                contac_descripcion:gestion.contac_descripcion,
                GestorAsignado:gestion.nombreGestorAsig
      }));
    }else
    {
      return this.ListaGestion.map((item: any) => ({
        cartera:item.Cartera,
        cedula:item.Gestion.Cliente.cli_identificacion,
        ope_cod_credito:item.Gestion.CXC_Operacion.ope_cod_credito,
        ope_descripcion:item.Gestion.CXC_Operacion.ope_descripcion,
        ope_producto: item.Gestion.CXC_Operacion.ope_producto,
        cli_nombres:item.Gestion.Cliente.cli_nombres,
        tipo_gestion: item.TipoGestion,
        cli_estado_contacta: item.Gestion.Cliente.cli_estado_contacta,
        Conectividad: item.Conectividad,
        gest_num_contacto:item.Gestion.gest_num_contacto,
        ope_saldo_cxc_actual:item.Gestion.CXC_Operacion.ope_saldo_cxc_actual,
        ope_dias_mora:item.Gestion.CXC_Operacion.ope_dias_mora,
        ope_gastos_cobranzas:item.Gestion.CXC_Operacion.ope_gastos_cobranzas,
        ope_interes_mora: item.Gestion.CXC_Operacion.ope_interes_mora,
        ope_liquidar:item.Gestion.CXC_Operacion.ope_liquidar=== '1'?'Si':'No',
        gest_fecha_gestion: this.Fechas.fechaCorta(item.Gestion.gest_fecha_gestion),
        gest_fecha_compromiso:this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_compromiso),
        gest_valor_a_cobrar:item.Gestion.gest_valor_a_cobrar,
        gest_couta:item.Gestion.gest_couta,
        gest_fecha_prox_pago:this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_prox_pago),
        Gestionado:item.Gestion.Gestor.ges_nombres+' '+item.Gestion.Gestor.ges_apellidos,
        gest_fecha_volver_llamar:this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar)==='31-12-1969' ? ' ' :this.Fechas.fechaCorta(item.Gestion.gest_fecha_volver_llamar),
        gest_hora_volver_llamar:item.Gestion.gest_hora_volver_llamar,
        volver_llamar:item.Gestion.gest_volver_llamar === '1'?'Si':'No',
        contac_descripcion:item.Contactabilidad.contac_descripcion,
        GestorAsignado:item.GestorAsignado
      }));
    }
  }


  generarPDF() {
    const fechaActual = new Date();
    const opciones = { timeZone: 'America/Guayaquil' };
    const fecha = fechaActual.toLocaleString('es-EC', opciones);
    const doc = new jsPDF('l', 'pt', 'a3');
    const imageUrl = './assets/Imagenes/LogoSistema.png';
    const imgWidth = 50; 
    const imgHeight = 50;
    doc.text(this.PaginaNombre, 0, 20);
    doc.text(fecha.substring(0,fecha.length-3), 260, 20);
    doc.addImage(imageUrl, 'PNG', 700, 0, imgWidth, imgHeight, '', 'FAST');
    autotable(doc, {
      head: [this.getCabeceraTable()],
      margin:{top: 60,left: 0},
      body: this.getProductData(), // empty body for now, you can add data later
      theme: 'grid',
      tableWidth:'auto',
      styles: {
        fontSize:7.5,
        fontStyle: 'normal',
        textColor: 'black',
        cellPadding: 3,
      },
      rowPageBreak: 'avoid', // Configuración para evitar dividir filas
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text('Header Text', data.settings.margin.left, 50);

        const pageCount = doc.internal.pages.length-1;
        doc.setPage(pageCount);
        doc.text(`Pagina ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      },
      startY:60,
    });
    //const imag= File();
    const pdf = doc.output('blob');
    const url = window.URL.createObjectURL(pdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fecha.substring(0,fecha.length-3)}_reporte.pdf`;
    a.click();
  }
  
  
  getKeys(): string[] {
    if (this.ListaGestion.length > 0) {
      return Object.keys(this.ListaGestion[0]);
    }
    return [];
  }
  getFecha(valor:string) :Date
{
   let fecha!:Date;
   fecha=new Date(valor+'T00:00:00');
   fecha.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });
   return fecha;
}
getGestionesDiarias(valor:any[]):number
{
  let val:number=0;
  if ((this.getKeys2(valor)).length === 48) {
    valor.filter(elemento => {
      if (this.Fechas.fechaCorta(elemento['gest_fecha_gestion']) === this.Fechas.fechaActualCorta2()) {
        val += 1;
      }

    });
  }else
  {
    valor.filter(elemento => {
      if (this.Fechas.fechaCorta(elemento.Gestion['gest_fecha_gestion']) === this.Fechas.fechaActualCorta2()) {
        val += 1;
      }

    });
  }
  return val;
}
getGestionesMes(valor:any[]):number
{
  let val:number=0;
  if((this.getKeys2(valor)).length === 48){
  valor.filter(elemento=>
    {
      if(this.obtenerMesAnio(this.Fechas.fechaCorta(elemento['gest_fecha_gestion']),'MES')===this.obtenerMesAnio(this.Fechas.fechaActualCorta2(),'MES'))
        {
          val+=1;
        }
    });
  }else
  {
    valor.filter(elemento => {
      if (this.obtenerMesAnio(this.Fechas.fechaCorta(elemento.Gestion['gest_fecha_gestion']),'MES') === this.obtenerMesAnio(this.Fechas.fechaActualCorta2(),'MES')) {

        val += 1;
      }

    });
  }
  return val;
}
getGestionesYear(valor:any[]):number
{
  let val:number=0;
  if((this.getKeys2(valor)).length === 48){
  valor.filter(elemento=>
    {
      if(this.obtenerMesAnio(this.Fechas.fechaCorta(elemento['gest_fecha_gestion']),'ANIO')===this.obtenerMesAnio(this.Fechas.fechaActualCorta2(),'ANIO'))
        {
          val+=1;
        }

    });
  }else
  {
    valor.filter(elemento => {
      if (this.obtenerMesAnio(this.Fechas.fechaCorta(elemento.Gestion['gest_fecha_gestion']),'ANIO') === this.obtenerMesAnio(this.Fechas.fechaActualCorta2(),'ANIO')) {
        val += 1;
      }
    });
  }
  return val;
}
obtenerMesAnio(valor:string,parametro:string):string
{
  let val:string='';
  const partes = valor.split('-');
  if (parametro.toUpperCase() === 'MES') {
    val = partes[1];
  }
  if (parametro.toUpperCase() === 'ANIO') {
    val = partes[2];
  }

  return val;
}
/****************************Listar Listado sin gestionar****************************** */
ListarElementosSinGestionar() {
  let filtro: GestionCG = {
    identificacion:'0',
    nombres_cliente:'0',
    cartera:this.TodasCarteras,
    // cartera: [7,10],
    gestor: Number(this.Usuario.id_gestor),
    contactabilidad:0,
    pago:'0',
    prioridad:'0',
    monto_min:'0',
    monto_max:'0',
    meses:0,
    tipo: 0,
    rango:0,
    codigo:0
  };
  this.loading = true;
  this.ListaGestionar = [];
  this.api
    .GetGestionarFracionado(filtro)
    .pipe(
      map((tracks) => {
        this.ListaGestionar = tracks['data'];
        console.log(this.ListaGestionar);
        if (this.ListaGestionar.length === 0) {
          this.loading = false;
          this.alerta.NoExistenDatos();
        } else {
         
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
getElementosSinGestionar2()
{
  this.api
      .GetNotificacionFracionado(10)
      .pipe(
        map((tracks) => {
          this.valor= tracks['data']['clientes']-tracks['data']['con_gestion'];
        }),
        catchError((error) => {
          
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      ).subscribe();
}
/************************************************************** */
getKeys2(valor:any[]): string[] {
  if (this.ListaGestion.length > 0) { // Checks if ListaResultado array has elements
    return Object.keys(valor[0]); // Returns the keys of the first object in ListaResultado array
}
return []; // Returns an empty array if ListaResultado is empty
}
}
