import {
  AfterViewInit,
  Component,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent,
  ApexStroke,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexAxisChartSeries,
  ApexTooltip,
  ApexGrid,
  ApexMarkers,
  ApexResponsive,
} from 'ng-apexcharts';
import { AUTO_STYLE } from '@angular/animations';
import {
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { Fechas } from 'src/app/Control/Fechas';
import { Alertas } from 'src/app/Control/Alerts';
import { ApiService } from 'src/app/service/api.service';
import { catchError, map, timeout } from 'rxjs';
import { auto } from '@popperjs/core';
import { Reportes } from 'src/app/Clases/Reportes';
import { CxcOperacion } from 'src/app/Clases/CxcOperacion';
import { PermisosAcceso } from 'src/app/Control/Permisos';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ContactabilidadI,
  FiltroCompuesto,
  GestorI,
} from 'src/app/Modelos/response.interface';
import { Operaciones } from 'src/app/Clases/Operaciones';
import { Cartera } from 'src/app/Clases/Cartera';
import Swal from 'sweetalert2';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke | any;
  /////////////////////////////////
  series1: ApexAxisChartSeries;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
  grid: ApexGrid;

  //////////////////////////////////
  // series: ApexAxisChartSeries;
  // chart: ApexChart;
  // xaxis: ApexXAxis;
  markers: any | ApexMarkers;
  yaxis: ApexYAxis | ApexYAxis[];
  colors: string[];
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};
declare global {
  interface Window {
    Apex: any;
  }
}

const sparkLineData = [
  47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61,
  27, 54, 43, 19, 46,
];
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  constructor(
    private api: ApiService,
    private P_Acceso: PermisosAcceso,
    private alerta: Alertas,
    public fechas: Fechas,
    private router: Router,
    private cookeService: CookieService,
    private ReportesM: Reportes,
    private CxcOperM: CxcOperacion,
    private OperacionesM: Operaciones,
    private route: ActivatedRoute
  ) {}
  PaginaActual: any;
  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    let val = this.route.snapshot.paramMap.get('val');

    this.PaginaActual = this.P_Acceso.checkLocal('inicio');

    if (id == null && val == null) {
      this.ListaCarteras = this.PaginaActual.Carteras;
      this.randomImageUrl = this.RandomImage();
      this.ConteoCreditos();
      this.selectToday();
    } else {
      let select = {
        IdCartera: id,
        Cartera: val,
      };
      this.SeleccionCartera(select);
    }
  }

  // permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  // Usuario: ResultadoGestorI = this.permisos.gestor;
  // Rol: string = this.Usuario.ges_rol;
  // Menu: ResultadoMenuI[] = this.permisos.menu;
  // PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
  //   return elemento.men_url === 'inicio';
  // }) as ResultadoMenuI;
  // ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  // RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  // LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  // PaginaNombre: string = this.PaginaActual.men_descripcion;
  // loading: boolean = false;
  ///////////////////////////////////////   ANIMACION IMAGEN    //////////////////////////////////////////////////
  imageUrls: string[] = [
    // 'home0.gif',
    // 'home1.gif',
    // 'home2.gif',
    'home3.gif',
    // 'home4.gif',
    'home5.gif',
    'home6.gif',
    'home7.gif',
    'home8.gif',
    // 'home9.gif',
    // 'home10.gif',
    // 'home11.gif',
    'home12.gif',
    // 'home13.gif',
    'home14.gif',
    'home15.gif',
    'home16.gif',
    'home17.gif',
    'home18.gif',
    'home19.gif',
    'home20.gif',
    'home21.gif',
    'home22.gif',
    'home23.gif',
  ];
  randomImageUrl: string = '';

  RandomImage(): string {
    const randomIndex = Math.floor(Math.random() * this.imageUrls.length);
    return this.imageUrls[randomIndex];
  }
  ///////////////////////////////////////  BARRA FILTROS      //////////////////////////////////////////////////
  hasItems(): boolean {
    return (
      this.ListaNotificaciones.length > 0 ||
      this.ListaVolverLLamar.length > 0 ||
      this.ListaCombeniosCompomisos.length > 0 ||
      this.ListaCombeniosCompomisosP.length > 0 ||
      this.ListaCCConPagos.length > 0
    );
  }

  BuscarForms = new FormGroup({
    gestor: new FormControl('0', Validators.required),
    contactabilidad: new FormControl('0', Validators.required),
    cartera: new FormControl('', Validators.required),
    fecha_inicial: new FormControl('', Validators.required),
    fecha_final: new FormControl('', Validators.required),
    todas: new FormControl(false, Validators.required),
  });
  ResetBuscarForms() {
    this.BuscarForms.reset({
      gestor: '0',
      contactabilidad: '0',
      cartera: '',
      fecha_inicial: '',
      fecha_final: '',
      todas: false,
    });
  }

  ListaGestores: GestorI[] = [];

  ListarGestores() {
    this.ListaGestores = [];
    this.OperacionesM.FiltrarElementos('Gestor/Filtro', '0', 21)
      .pipe(
        map((tracks) => {
          this.ListaGestores = tracks;
        })
      )
      .subscribe();
  }
  ListaCarteras: ResultadoCarteraI[] = [];

  ///////////////////////////////////////   CONTEO DE CARTERAS    //////////////////////////////////////////////////
  DatosGeneralAct: any[] = [];
  ConteoCreditos() {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.DatosGeneralAct = [];
    this.OperacionesM.FiltrarElementos('CxcOperacion/Filtro', 'A', 20)
      .pipe(
        map((tracks) => {
          CargandoLoad.classList.remove('modal--show');
          this.DatosGeneralAct = tracks;
        }),
        catchError((error) => {
          CargandoLoad.classList.remove('modal--show');
          this.alerta.ErrorEnLaPeticion(error);
          throw new Error(error);
        })
      )
      .subscribe();
  }
  ValoresMetas: any | null = null;
  GetFiltrarElemento(datos: any) {
    let select = {
      IdCartera: this.BuscarForms.get('cartera')?.value!,
      Cartera: this.CarteraSelect,
    };
    this.SeleccionCartera(select);
  }
  SeleccionCartera(selected: any) {
    console.log(selected);
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.BuscarForms.patchValue({ cartera: selected.IdCartera });
    this.CarteraSelect = selected.Cartera;

    let filtro: FiltroCompuesto = {
      tipo: 0,
      gestor: this.BuscarForms.get('gestor')?.value!,
      contactabilidad: this.BuscarForms.get('contactabilidad')?.value!,
      cartera: this.BuscarForms.get('cartera')?.value!,
      fecha_inicial: this.BuscarForms.get('fecha_inicial')?.value!,
      fecha_final: this.BuscarForms.get('fecha_final')?.value!,
      todas: this.BuscarForms.get('todas')?.value!,
    };

    this.OperacionesM.FiltrarElementosCompuesto(
      'Notificaciones/FiltroEspecial',
      filtro
    )
      .pipe(
        map((datos) => {
          console.log(datos);
          CargandoLoad.classList.remove('modal--show');
          this.ValoresMetas = datos;
          this.TotalNotificaciones();
          this.GraficoArea();
        }),
        catchError((error) => {
          this.EncerarVariables();
          CargandoLoad.classList.remove('modal--show');
          throw this.alerta.ErrorAlRecuperarElementos();
        })
      )
      .subscribe();
  }
  TotalNotificaciones() {
    let filtro: FiltroCompuesto = {
      tipo: 1,
      gestor: this.BuscarForms.get('gestor')?.value!,
      contactabilidad: this.BuscarForms.get('contactabilidad')?.value!,
      cartera: this.BuscarForms.get('cartera')?.value!,
      fecha_inicial: this.BuscarForms.get('fecha_inicial')?.value!,
      fecha_final: this.BuscarForms.get('fecha_final')?.value!,
      todas: this.BuscarForms.get('todas')?.value!,
    };
    this.ListaNotificaciones = [];
    this.ListaVolverLLamar = [];
    this.ListaCombeniosCompomisos = [];
    this.ListaCombeniosCompomisosP = [];
    this.ListaCCConPagos = [];

    this.OperacionesM.FiltrarElementosCompuesto(
      'Notificaciones/FiltroEspecial',
      filtro
    )
      .pipe(
        map((datos) => {
          this.ListaNotificaciones = datos.Notificacion;
          this.ListaVolverLLamar = datos.VolverLLamar;
          this.ListaCombeniosCompomisos = datos.compromisos.compromisosHoy;
          this.ListaCombeniosCompomisosP = datos.compromisos.compromisosAnt;
          this.ListaCCConPagos = datos.cambio_estado;
          // this.GraficoArea();
          // this.PorcentajeRecuperacion();
        }),
        catchError((error) => {
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  BuscarInfoReporte() {
    let filtro: FiltroCompuesto = {
      tipo: 2,
      gestor: this.BuscarForms.get('gestor')?.value!,
      contactabilidad: this.BuscarForms.get('contactabilidad')?.value!,
      cartera: this.BuscarForms.get('cartera')?.value!,
      fecha_inicial: this.BuscarForms.get('fecha_inicial')?.value!,
      fecha_final: this.BuscarForms.get('fecha_final')?.value!,
      todas: this.BuscarForms.get('todas')?.value!,
    };
    this.OperacionesM.FiltrarElementosCompuesto(
      'Notificaciones/FiltroEspecial',
      filtro
    )
      .pipe(
        map((datos) => {
          console.log(datos);
        }),
        catchError((error) => {
          //
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }

  Dia_de_la_semana(dateString: string): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const date = new Date(dateString);
    return days[date.getDay()];
  }

  AgruparDias(data: any[]): { [key: string]: any[] } {
    return data.reduce((acc, curr) => {
      const day = this.Dia_de_la_semana(curr.fecha);
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(curr);
      return acc;
    }, {});
  }
  SeleccionMesComparacion(year: number, mes: number) {
    const CargandoLoad = document.getElementById(
      'Cargando'
    ) as HTMLInputElement;
    CargandoLoad.classList.add('modal--show');
    this.EncerarGraficos();
    const resultado = this.ValoresMetas.Tpagos.filter((elemento) => {
      const elementoFecha = new Date(elemento.fecha);
      return (
        elementoFecha.getFullYear() === year &&
        elementoFecha.getMonth() === mes - 1
      );
    });

    this.ValoresMetas.pagos_mes_anterior = resultado;

    setTimeout(() => {
      this.GraficoArea();
      CargandoLoad.classList.remove('modal--show');
    }, 500);
  }

  ///////////////////////////////////////   GRAFICOS PRIMERA FILA    //////////////////////////////////////////////////
  public chartOptionsGraficoPie!: Partial<ChartOptions>;

  chartOptions1: Partial<ChartOptions> | null = null;
  chartOptions2: Partial<ChartOptions> | null = null;
  chartOptions3: Partial<ChartOptions> | null = null;
  chartOptions4: Partial<ChartOptions> | null = null;
  chartOptions5: Partial<ChartOptions> | null = null;
  chartOptions6: Partial<ChartOptions> | null = null;
  chartOptions7: Partial<ChartOptions> | null = null;
  chartOptions8: Partial<ChartOptions> | null = null;
  chartOptions9: Partial<ChartOptions> | null = null;
  chartOptions10: Partial<ChartOptions> | null = null;
  chartOptions11: Partial<ChartOptions> | null = null;
  EncerarGraficos() {
    this.chartOptions1 = null;
    this.chartOptions2 = null;
    this.chartOptions3 = null;
    this.chartOptions4 = null;
    this.chartOptions5 = null;
    this.chartOptions6 = null;
    this.chartOptions7 = null;
    this.chartOptions8 = null;
    this.chartOptions9 = null;
    this.chartOptions10 = null;
    this.chartOptions11 = null;
  }

  GraficoArea() {
    const orderedDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

    function recuperarValoresAgrupados(groupedData: any) {
      return orderedDays.map((day) => {
        const dayData = groupedData[day] || [];
        return {
          x: day,
          y: dayData.reduce((sum: any, item: any) => sum + item.valor, 0),
        };
      });
    }
    function ListarYears() {
      let ListaYear = [];
      const anioActual = new Date().getFullYear();
      for (let i = anioActual; i > anioActual - 10; i--) {
        ListaYear.push({ valor: i });
      }
      return ListaYear;
    }
    function ListarMonth() {
      let ListaMeses: { value: string; nombre: string }[] = [
        { value: '01', nombre: 'Enero' },
        { value: '02', nombre: 'Febrero' },
        { value: '03', nombre: 'Marzo' },
        { value: '04', nombre: 'Abril' },
        { value: '05', nombre: 'Mayo' },
        { value: '06', nombre: 'Junio' },
        { value: '07', nombre: 'Julio' },
        { value: '08', nombre: 'Agosto' },
        { value: '09', nombre: 'Septiembre' },
        { value: '10', nombre: 'Octubre' },
        { value: '11', nombre: 'Noviembre' },
        { value: '12', nombre: 'Diciembre' },
      ];

      return ListaMeses;
    }

    const series1 = {
      monthDataSeries1: {
        prices: [
          8107.85, 8128.0, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5, 8514.3,
          8481.85, 8487.7, 8506.9, 8626.2, 8668.95, 8602.3, 8607.55, 8512.9,
          8496.25, 8600.65, 8881.1, 9340.85,
        ],
        dates: [
          '13 Nov 2017',
          '14 Nov 2017',
          '15 Nov 2017',
          '16 Nov 2017',
          '17 Nov 2017',
          '20 Nov 2017',
          '21 Nov 2017',
          '22 Nov 2017',
          '23 Nov 2017',
          '24 Nov 2017',
          '27 Nov 2017',
          '28 Nov 2017',
          '29 Nov 2017',
          '30 Nov 2017',
          '01 Dec 2017',
          '04 Dec 2017',
          '05 Dec 2017',
          '06 Dec 2017',
          '07 Dec 2017',
          '08 Dec 2017',
        ],
      },
      monthDataSeries2: {
        prices: [
          8423.7, 8423.5, 8514.3, 8481.85, 8487.7, 8506.9, 8626.2, 8668.95,
          8602.3, 8607.55, 8512.9, 8496.25, 8600.65, 8881.1, 9040.85, 8340.7,
          8165.5, 8122.9, 8107.85, 8128.0,
        ],
        dates: [
          '13 Nov 2017',
          '14 Nov 2017',
          '15 Nov 2017',
          '16 Nov 2017',
          '17 Nov 2017',
          '20 Nov 2017',
          '21 Nov 2017',
          '22 Nov 2017',
          '23 Nov 2017',
          '24 Nov 2017',
          '27 Nov 2017',
          '28 Nov 2017',
          '29 Nov 2017',
          '30 Nov 2017',
          '01 Dec 2017',
          '04 Dec 2017',
          '05 Dec 2017',
          '06 Dec 2017',
          '07 Dec 2017',
          '08 Dec 2017',
        ],
      },
      monthDataSeries3: {
        prices: [
          7114.25, 7126.6, 7116.95, 7203.7, 7233.75, 7451.0, 7381.15, 7348.95,
          7347.75, 7311.25, 7266.4, 7253.25, 7215.45, 7266.35, 7315.25, 7237.2,
          7191.4, 7238.95, 7222.6, 7217.9, 7359.3, 7371.55, 7371.15, 7469.2,
          7429.25, 7434.65, 7451.1, 7475.25, 7566.25, 7556.8, 7525.55, 7555.45,
          7560.9, 7490.7, 7527.6, 7551.9, 7514.85, 7577.95, 7592.3, 7621.95,
          7707.95, 7859.1, 7815.7, 7739.0, 7778.7, 7839.45, 7756.45, 7669.2,
          7580.45, 7452.85, 7617.25, 7701.6, 7606.8, 7620.05, 7513.85, 7498.45,
          7575.45, 7601.95, 7589.1, 7525.85, 7569.5, 7702.5, 7812.7, 7803.75,
          7816.3, 7851.15, 7912.2, 7972.8, 8145.0, 8161.1, 8121.05, 8071.25,
          8088.2, 8154.45, 8148.3, 8122.05, 8132.65, 8074.55, 7952.8, 7885.55,
          7733.9, 7897.15, 7973.15, 7888.5, 7842.8, 7838.4, 7909.85, 7892.75,
          7897.75, 7820.05, 7904.4, 7872.2, 7847.5, 7849.55, 7789.6, 7736.35,
          7819.4, 7875.35, 7871.8, 8076.5, 8114.8, 8193.55, 8217.1, 8235.05,
          8215.3, 8216.4, 8301.55, 8235.25, 8229.75, 8201.95, 8164.95, 8107.85,
          8128.0, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5, 8514.3, 8481.85,
          8487.7, 8506.9, 8626.2,
        ],
        dates: [
          '02 Jun 2017',
          '05 Jun 2017',
          '06 Jun 2017',
          '07 Jun 2017',
          '08 Jun 2017',
          '09 Jun 2017',
          '12 Jun 2017',
          '13 Jun 2017',
          '14 Jun 2017',
          '15 Jun 2017',
          '16 Jun 2017',
          '19 Jun 2017',
          '20 Jun 2017',
          '21 Jun 2017',
          '22 Jun 2017',
          '23 Jun 2017',
          '27 Jun 2017',
          '28 Jun 2017',
          '29 Jun 2017',
          '30 Jun 2017',
          '03 Jul 2017',
          '04 Jul 2017',
          '05 Jul 2017',
          '06 Jul 2017',
          '07 Jul 2017',
          '10 Jul 2017',
          '11 Jul 2017',
          '12 Jul 2017',
          '13 Jul 2017',
          '14 Jul 2017',
          '17 Jul 2017',
          '18 Jul 2017',
          '19 Jul 2017',
          '20 Jul 2017',
          '21 Jul 2017',
          '24 Jul 2017',
          '25 Jul 2017',
          '26 Jul 2017',
          '27 Jul 2017',
          '28 Jul 2017',
          '31 Jul 2017',
          '01 Aug 2017',
          '02 Aug 2017',
          '03 Aug 2017',
          '04 Aug 2017',
          '07 Aug 2017',
          '08 Aug 2017',
          '09 Aug 2017',
          '10 Aug 2017',
          '11 Aug 2017',
          '14 Aug 2017',
          '16 Aug 2017',
          '17 Aug 2017',
          '18 Aug 2017',
          '21 Aug 2017',
          '22 Aug 2017',
          '23 Aug 2017',
          '24 Aug 2017',
          '28 Aug 2017',
          '29 Aug 2017',
          '30 Aug 2017',
          '31 Aug 2017',
          '01 Sep 2017',
          '04 Sep 2017',
          '05 Sep 2017',
          '06 Sep 2017',
          '07 Sep 2017',
          '08 Sep 2017',
          '11 Sep 2017',
          '12 Sep 2017',
          '13 Sep 2017',
          '14 Sep 2017',
          '15 Sep 2017',
          '18 Sep 2017',
          '19 Sep 2017',
          '20 Sep 2017',
          '21 Sep 2017',
          '22 Sep 2017',
          '25 Sep 2017',
          '26 Sep 2017',
          '27 Sep 2017',
          '28 Sep 2017',
          '29 Sep 2017',
          '03 Oct 2017',
          '04 Oct 2017',
          '05 Oct 2017',
          '06 Oct 2017',
          '09 Oct 2017',
          '10 Oct 2017',
          '11 Oct 2017',
          '12 Oct 2017',
          '13 Oct 2017',
          '16 Oct 2017',
          '17 Oct 2017',
          '18 Oct 2017',
          '19 Oct 2017',
          '23 Oct 2017',
          '24 Oct 2017',
          '25 Oct 2017',
          '26 Oct 2017',
          '27 Oct 2017',
          '30 Oct 2017',
          '31 Oct 2017',
          '01 Nov 2017',
          '02 Nov 2017',
          '03 Nov 2017',
          '06 Nov 2017',
          '07 Nov 2017',
          '08 Nov 2017',
          '09 Nov 2017',
          '10 Nov 2017',
          '13 Nov 2017',
          '14 Nov 2017',
          '15 Nov 2017',
          '16 Nov 2017',
          '17 Nov 2017',
          '20 Nov 2017',
          '21 Nov 2017',
          '22 Nov 2017',
          '23 Nov 2017',
          '24 Nov 2017',
          '27 Nov 2017',
          '28 Nov 2017',
        ],
      },
    };
    let fechas_pagos: any[] = [];
    let valor_pagos: any[] = [];
    for (let datos of this.ValoresMetas.pagos) {
      fechas_pagos.push(datos.fecha);
      valor_pagos.push(datos.valor);
    }

    this.chartOptions1 = {
      series1: [
        {
          name: 'Pago',
          data: valor_pagos,
        },
      ],
      chart: {
        type: 'line',
        height: auto,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        events: {
          click: function (event, chartContext, config) {
            if (
              config.seriesIndex === undefined ||
              config.dataPointIndex === -1 ||
              config.dataPointIndex === undefined
            )
              return;

            var Fecha = chartContext.w.config.labels[config.dataPointIndex];
            var Valor =
              chartContext.w.globals.series[config.seriesIndex][
                config.dataPointIndex
              ];

            console.log(Fecha);
            console.log(Valor);
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5],
      },

      title: {
        text: 'Recuperación - Rango',
        align: 'left',
      },
      labels: fechas_pagos,
      xaxis: {
        type: 'datetime',
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        reversed: false,
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      legend: {
        horizontalAlign: 'left',
      },
    };

    let mesAnterior = this.AgruparDias(this.ValoresMetas.pagos_mes_anterior);
    let mesActual = this.AgruparDias(this.ValoresMetas.pagos_mes_actual);

    this.chartOptions2 = {
      series1: [
        {
          name: 'Mes Anterior',
          data: recuperarValoresAgrupados(mesAnterior),
        },
        {
          name: 'Mes Actual',
          data: recuperarValoresAgrupados(mesActual),
        },
      ],
      chart: {
        type: 'bar',
        height: 'auto',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
          tools: {
            download: false,
            customIcons: [
              {
                icon: `<i class="fa-solid fa-calendar-days"></i>`,
                index: -1,
                title: 'Filtrar por un mes definido',
                click: async (chart, options, e) => {
                  let Years = ListarYears();
                  let Month = ListarMonth();

                  const { value } = await Swal.fire({
                    title: 'Seleccionar Año y Mes',
                    html: `
                     <select id="swal-year" class="swal2-select">
                            ${
                              Years && Years.length > 0
                                ? Years.map(
                                    (year) =>
                                      `<option value="${year.valor}">${year.valor}</option>`
                                  ).join('')
                                : '<option value="" disabled>No hay años disponibles</option>'
                            }
                     </select>
                     <select id="swal-month" class="swal2-select">
                            ${
                              Month && Month.length > 0
                                ? Month.map(
                                    (month) =>
                                      `<option value="${month.value}">${month.nombre}</option>`
                                  ).join('')
                                : '<option value="" disabled>No hay meses disponibles</option>'
                            }
                     </select>
                    `,
                    focusConfirm: false,
                    preConfirm: () => {
                      const year = (
                        document.getElementById('swal-year') as HTMLInputElement
                      ).value;
                      const month = (
                        document.getElementById(
                          'swal-month'
                        ) as HTMLInputElement
                      ).value;
                      const day = '01';
                      // return `${year.value}-${month.value}-${day}`;
                      return { year, month };
                    },
                  });
                  if (value) {
                    this.SeleccionMesComparacion(
                      Number(value.year),
                      Number(value.month)
                    );
                  }
                },
              },
            ],
          },
        },
      },
      title: {
        text: 'Recuperación por dia comparación',
        align: 'left',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'center',
          },
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
        dropShadow: {
          enabled: false,
        },
        offsetY: 0,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: orderedDays,
        position: 'top',
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      yaxis: {
        show: false,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '$ ' + val;
          },
        },
      },
    };

    this.chartOptions3 = {
      series: [this.ValoresMetas.clientes],
      chart: {
        height: auto,
        type: 'radialBar',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 225,
          hollow: {
            margin: 0,
            size: '70%',
            background: '#fff',
            image: undefined,
            position: 'front',
            dropShadow: {
              enabled: true,
              top: 3,
              left: 0,
              blur: 4,
              opacity: 0.24,
            },
          },
          track: {
            background: '#fff',
            strokeWidth: '67%',
            margin: 0,
            dropShadow: {
              enabled: true,
              top: -3,
              left: 0,
              blur: 4,
              opacity: 0.35,
            },
          },

          dataLabels: {
            show: true,
            name: {
              offsetY: -10,
              show: true,
              color: '#888',
              fontSize: '17px',
            },
            value: {
              formatter: function (val) {
                return parseInt(val.toString(), 10).toString();
              },
              color: '#111',
              fontSize: '36px',
              show: true,
            },
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#ABE5A1'],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      stroke: {
        lineCap: 'round',
      },
      labels: ['Clientes'],
    };

    let groupedData = this.AgruparDias(this.ValoresMetas.pagos);

    this.chartOptions4 = {
      series1: [
        {
          name: 'Valor:',
          data: recuperarValoresAgrupados(groupedData),
        },
      ],
      chart: {
        height: auto,
        type: 'bar',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: false,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },

      xaxis: {
        categories: orderedDays,
        position: 'top',
        // labels: {
        //   offsetY: -18
        // },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100],
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
        },
      },
      title: {
        text: 'Recuperación por dia mes actual',
        align: 'left',
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '$ ' + val;
          },
        },
      },
    };
    let fechas_pagos_mes_act: any[] = [];
    let valor_pagos_mes_act: any[] = [];
    for (let datos of this.ValoresMetas.pagos_mes_actual) {
      fechas_pagos_mes_act.push(datos.fecha);
      valor_pagos_mes_act.push(datos.valor);
    }

    this.chartOptions5 = {
      labels: fechas_pagos_mes_act,
      series1: [
        {
          name: 'Pago',
          data: valor_pagos_mes_act,
        },
      ],
      chart: {
        height: auto,
        type: 'line',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5],
      },
      title: {
        text: 'Recuperación mes actual',
        align: 'left',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        reversed: false,
      },
      legend: {
        horizontalAlign: 'left',
      },
    };
    let fechas_pagos_mes_ant: any[] = [];
    let valor_pagos_mes_ant: any[] = [];
    for (let datos of this.ValoresMetas.pagos_mes_anterior) {
      fechas_pagos_mes_ant.push(datos.fecha);
      valor_pagos_mes_ant.push(datos.valor);
    }
    this.chartOptions6 = {
      labels: fechas_pagos_mes_ant,
      series1: [
        {
          name: 'Pago',
          data: valor_pagos_mes_ant,
        },
      ],
      chart: {
        height: auto,
        type: 'line',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
          tools: {
            download: false,
            customIcons: [
              {
                icon: `<i class="fa-solid fa-calendar-days"></i>`,
                index: -1,
                title: 'Filtrar por un mes definido',
                click: async (chart, options, e) => {
                  let Years = ListarYears();
                  let Month = ListarMonth();

                  const { value } = await Swal.fire({
                    title: 'Seleccionar Año y Mes',
                    html: `
                     <select id="swal-year" class="swal2-select">
                            ${
                              Years && Years.length > 0
                                ? Years.map(
                                    (year) =>
                                      `<option value="${year.valor}">${year.valor}</option>`
                                  ).join('')
                                : '<option value="" disabled>No hay años disponibles</option>'
                            }
                     </select>
                     <select id="swal-month" class="swal2-select">
                            ${
                              Month && Month.length > 0
                                ? Month.map(
                                    (month) =>
                                      `<option value="${month.value}">${month.nombre}</option>`
                                  ).join('')
                                : '<option value="" disabled>No hay meses disponibles</option>'
                            }
                     </select>
                    `,
                    focusConfirm: false,
                    preConfirm: () => {
                      const year = (
                        document.getElementById('swal-year') as HTMLInputElement
                      ).value;
                      const month = (
                        document.getElementById(
                          'swal-month'
                        ) as HTMLInputElement
                      ).value;
                      const day = '01';
                      // return `${year.value}-${month.value}-${day}`;
                      return { year, month };
                    },
                  });
                  if (value) {
                    this.SeleccionMesComparacion(
                      Number(value.year),
                      Number(value.month)
                    );
                  }
                },
              },
            ],
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5],
      },
      title: {
        text: 'Recuperación men anterior',
        align: 'left',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        reversed: false,
      },
      legend: {
        horizontalAlign: 'left',
      },
    };
    this.chartOptions7 = {
      series: [67],
      chart: {
        height: auto,
        type: 'radialBar',
        offsetY: -10,
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: '16px',
              color: undefined,
              offsetY: 120,
            },
            value: {
              offsetY: 76,
              fontSize: '22px',
              color: undefined,
              formatter: function (val) {
                return val + '%';
              },
            },
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91],
        },
      },
      stroke: {
        dashArray: 6,
      },
      labels: ['Median Ratio'],
    };
    const porcentajeUsuarios = (
      this.ValoresMetas != undefined
        ? ((this.ValoresMetas.pagos_conf + this.ValoresMetas.pagos_sin_conf) /
            this.ValoresMetas.meta_planteada) *
          100
        : 0
    ).toFixed(1);

    const porcentajeComoNumero = isNaN(parseFloat(porcentajeUsuarios))
      ? 0
      : parseFloat(porcentajeUsuarios);

    const porcentajeUsuariosTotal = (
      this.ValoresMetas != undefined
        ? (this.ValoresMetas.total_pagos / this.ValoresMetas.tota_asignado) *
          100
        : 0
    ).toFixed(1);

    const porcentajeComoNumeroTotal = isNaN(parseFloat(porcentajeUsuariosTotal))
      ? 0
      : parseFloat(porcentajeUsuariosTotal);

    const gestionados = (
      this.ValoresMetas != undefined
        ? (this.ValoresMetas.con_gestion / this.ValoresMetas.clientes) * 100
        : 0
    ).toFixed(1);

    const porcentajeGestionados = isNaN(parseFloat(gestionados))
      ? 0
      : parseFloat(gestionados);

    this.chartOptions8 = {
      series: [
        porcentajeGestionados,
        porcentajeComoNumero,
        porcentajeComoNumeroTotal,
      ],
      chart: {
        height: 390,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
      labels: ['T. Gestionados', 'R. Mensual', 'R. Total A'],
      legend: {
        show: true,
        floating: true,
        fontSize: '16px',
        position: 'left',
        offsetX: 50,
        offsetY: 10,
        labels: {
          useSeriesColors: true,
        },
        formatter: function (seriesName, opts) {
          return (
            seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex] + ' %'
          );
        },
        itemMargin: {
          horizontal: 3,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false,
            },
          },
        },
      ],
    };

    const dates = [];
    const contactabilidadSeries = {};

    this.ValoresMetas.gestiones.forEach((entry) => {
      const fecha = entry.FechaGestion;
      dates.push(fecha);

      entry.ListaConectividad.forEach((conectividad) => {
        conectividad.ListaContactabilidad.forEach((contactabilidad) => {
          const contactName = contactabilidad.Contactabilidad;
          const conteo = contactabilidad.Conteo;

          if (!contactabilidadSeries[contactName]) {
            contactabilidadSeries[contactName] = Array(dates.length - 1).fill(
              0
            ); // Rellenar con ceros hasta la fecha actual
          }

          // Añadir el conteo a la serie correspondiente
          contactabilidadSeries[contactName].push(conteo);
        });
      });

      // Asegurar que todas las series tengan el mismo número de elementos
      Object.keys(contactabilidadSeries).forEach((key) => {
        if (contactabilidadSeries[key].length < dates.length) {
          contactabilidadSeries[key].push(0);
        }
      });
    });

    const series = Object.keys(contactabilidadSeries).map((name) => ({
      name,
      type: 'line', // Puedes ajustar el tipo según tus necesidades
      data: contactabilidadSeries[name],
    }));
    const formattedDates = dates.map((date) =>
      new Date(date).toISOString().slice(0, 10)
    );

    this.chartOptions9 = {
      series1: series,
      chart: {
        height: 450,
        type: 'line',
        stacked: false,
      },
      stroke: {
        width: [3, 3, 5],
        curve: 'smooth',
        dashArray: [0, 0, 5],
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
        },
      },
      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: 'vertical',
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100],
        },
      },
      labels: formattedDates,
      markers: {
        size: 0,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        show: false,
        title: {
          text: 'Count',
        },
        min: 0,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toFixed(0);
            }
            return y;
          },
        },
      },
    };
  }

  FechaCalendario: any;
  onDateSelection(date: NgbDateStruct) {
    console.log('Selected date:', date);
  }
  selectToday() {
    const today = new Date();
    this.FechaCalendario = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  public generateDayWiseTimeSeries(baseval: any, count: any, yrange: any) {
    var i = 0;
    var series = [];
    while (i < count) {
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push([baseval, y]);
      baseval += 86400000;
      i++;
    }
    return series;
  }
  PorcentajeRecuperacion() {
    this.chartOptionsGraficoPie = {
      series1: [
        {
          name: 'TEAM A',
          type: 'column',
          data: [
            23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 23, 11, 22, 27, 13, 22,
            37, 21, 44, 22, 30,
          ],
        },
        {
          name: 'TEAM B',
          type: 'area',
          data: [
            44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 23, 11, 22, 27, 13, 22,
            37, 21, 44, 22, 30,
          ],
        },
        {
          name: 'TEAM C',
          type: 'line',
          data: [
            30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 23, 11, 22, 27, 13, 22,
            37, 21, 44, 22, 30,
          ],
        },
        {
          name: 'TEAM D',
          type: 'line',
          data: [
            35, 64, 52, 59, 36, 39, 30, 25, 36, 30, 45, 23, 11, 22, 27, 13, 22,
            37, 21, 44, 22, 30,
          ],
        },
      ],
      chart: {
        width: '100%',
        height: '350',
        type: 'line',
        stacked: false,
      },
      stroke: {
        width: [0, 1, 1, 1],
        curve: 'smooth',
        dashArray: [0, 0, 0, 3],
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
        },
      },

      fill: {
        opacity: [0.85, 0.25, 1, 1],
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: 'vertical',
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100],
        },
      },
      labels: [
        '01/01/2003',
        '01/02/2003',
        '01/03/2003',
        '01/04/2003',
        '01/05/2003',
        '01/06/2003',
        '01/07/2003',
        '01/08/2003',
        '01/09/2003',
        '01/10/2003',
        '01/11/2003',
        '01/12/2003',
        '01/13/2003',
        '01/14/2003',
        '01/15/2003',
        '01/16/2003',
        '01/17/2003',
        '01/18/2003',
        '01/19/2003',
        '01/20/2003',
        '01/21/2003',
        '01/21/2003',
      ],
      markers: {
        size: 0,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        title: {
          text: 'Points',
        },
        min: 0,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toFixed(0) + ' points';
            }
            return y;
          },
        },
      },
    };
  }

  ///////////////////////////////////////   MANEJO DE NOTIFICACIONES Informacion Principal  //////////////////////////////////////////////////

  ///////////////////////////////////////   MANEJO DE NOTIFICACIONES DE GESTOR A GESTOR   //////////////////////////////////////////////////

  ListaNotificaciones: any[] = [];
  ListarNotificaciones() {
    this.ListaNotificaciones = [];

    this.api
      .GetNotificacionFracionado(0)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.ListaNotificaciones = datos;
        }),
        catchError((error) => {
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  Gestionar(datos: any) {
    this.alerta
      .MensajeConfirmacion('Mensaje asimilado', 'Gestionar cliente')
      .then((confirmado) => {
        if (confirmado) {
          this.router.navigate([
            '/gestionar',
            datos.Notificacion.cli_identificacion,
            datos.Notificacion.not_id_cartera,
            0,
          ]);
          this.NotificacionRevisada(datos);
        }
      });
  }
  NotificacionRevisada(datos: any) {
    let not = datos.Notificacion;
    not.not_visto = '1';
    not.not_fecha_vis = this.fechas.fechaActualCorta();
    not.not_hora_vis = this.fechas.HoraActual();
    this.api
      .PutNotificacion(not)
      .pipe(
        map((track) => {
          let exito = track['exito'];
          if (exito == 1) {
            this.alerta.MensajeSuperiorDerechaSuccess('Notificacion revisada');
            this.ListarNotificaciones();
          }
        })
      )
      .subscribe();
  }
  ///////////////////////////////////////   MANEJO DE NOTIFICACIONES VOLVER A LLAMAR   //////////////////////////////////////////////////
  ListaVolverLLamar: any[] = [];
  ListarVolverLlamar() {
    this.ListaVolverLLamar = [];

    this.api
      .GetNotificacionFracionado(1)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.ListaVolverLLamar = datos;
        }),
        catchError((error) => {
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
  }
  GestionarVL(datos: any) {
    this.alerta
      .MensajeConfirmacion('Mensaje asimilado', 'Gestionar cliente')
      .then((confirmado) => {
        if (confirmado) {
          this.router.navigate([
            '/gestionar',
            datos.cli_identificacion,
            datos.gest_id_cartera,
            0,
          ]);
          this.VolverLlamarOk(datos);
        }
      });
  }
  VolverLlamarOk(datos: any) {
    let gestion = datos.id_gestion;
    this.ReportesM.ReporteInicioX_Cartera(gestion, 0)
      .pipe(
        map((track) => {
          let exito = track['exito'];
          if (exito == '1') {
            this.alerta.MensajeSuperiorDerechaSuccess('Notificacion revisada');
            this.ListarVolverLlamar();
          }
        })
      )
      .subscribe();
  }
  ///////////////////////////////////////   REDIRECCION DESDE NOTIFICACIONES  //////////////////////////////////////////////////
  ListaCombeniosCompomisos: any[] = [];
  GestionarCC(datos: any) {
    this.router.navigate([
      '/gestionar',
      datos.cli_identificacion,
      datos.gest_id_cartera,
      0,
    ]);
  }
  ListaCombeniosCompomisosP: any[] = [];
  GestionarCCP(datos: any) {
    this.alerta;
    this.router.navigate([
      '/gestionar',
      datos.cli_identificacion,
      datos.gest_id_cartera,
      0,
    ]);
  }
  ListaCCConPagos: any[] = [];
  GestionarCCConPagos(datos: any) {
    this.router.navigate([
      '/gestionar',
      datos.cli_identificacion,
      datos.id_cartera,
      0,
    ]);
  }

  // ****************************************** ADMINISTRADORES  *****************************************************************
  CarteraSelect: string = '';

  // InicioDatosAdmin: any | null = null;

  EncerarVariables() {
    let id = this.route.snapshot.paramMap.get('id');
    let val = this.route.snapshot.paramMap.get('val');

    if (id == null && val == null) {
      this.CarteraSelect = '';
      this.ResetBuscarForms();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}
