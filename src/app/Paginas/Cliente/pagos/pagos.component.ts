import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import {
  ResultadoCarteraI,
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import {
  ContactabilidadI,
  CuentaI,
  CxcOperacionI,
  DetalleTelefonoI,
  FiltroGestion,
  FiltroPagos,
  generarPDF,
  GestorI,
  PagosI,
  TelefonoI,
  Tipo_TelefonoI,
} from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService,
    private router: Router,
    public validar: TipoDeTexto,
    public reporte:GeneradorReporte
  ) {}

  ngOnInit(): void {
    this.CarterasGestor();
    // this.BuscarForms.patchValue({ cartera: this.TodasCarteras[0] });
    this.ListarYears();
    this.GetFiltrarElemento(this.BuscarForms.value);
    // this.BuscarForms.patchValue({ year: this.ListaYear[0] });
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
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  GeneradorReporte!:GeneradorReporte;
  gPago!:generarPDF;
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Rol: string = this.Usuario.ges_rol;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'pagos';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;

  CarteraGestor: any[] = [];
  TodasCarteras: number[] = [];
  Cartera: ResultadoCarteraI[] = this.permisos.cartera;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  // Obtener la fecha actual
  fechaActual = new Date();
  mesActual = this.fechaActual.getMonth() + 1;
  yearActual = this.fechaActual.getFullYear();

  BuscarForms = new FormGroup({
    tipo: new FormControl(1, Validators.required),
    identificacion: new FormControl('', Validators.required),
    nombres_cliente: new FormControl('', Validators.required),
    cartera: new FormControl(0, Validators.required),
    gestor: new FormControl(0, Validators.required),
    cuenta: new FormControl(0, Validators.required),
    mes: new FormControl(
      this.fechas.ExtraerMes(this.fechaActual),
      Validators.required
    ),
    year: new FormControl(this.yearActual, Validators.required),
  });

  ResetBuscarForms() {
    this.BuscarForms.reset({
      tipo: 1,
      identificacion: '',
      nombres_cliente: '',
      cartera: 0,
      gestor: 0,
      cuenta: 0,
      mes: this.fechas.ExtraerMes(this.fechaActual),
      year: this.yearActual,
    });
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gPago);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gPago);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gPago);
    }
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

  ListaMeses: { nombre: string }[] = [
    { nombre: 'Enero' },
    { nombre: 'Febrero' },
    { nombre: 'Marzo' },
    { nombre: 'Abril' },
    { nombre: 'Mayo' },
    { nombre: 'Junio' },
    { nombre: 'Julio' },
    { nombre: 'Agosto' },
    { nombre: 'Septiembre' },
    { nombre: 'Octubre' },
    { nombre: 'Noviembre' },
    { nombre: 'Diciembre' },
  ];

  // ListarMeses() {
  //   this.ListaMeses = [];
  //   const nombresMeses: string[] = [
  //     'Enero',
  //     'Febrero',
  //     'Marzo',
  //     'Abril',
  //     'Mayo',
  //     'Junio',
  //     'Julio',
  //     'Agosto',
  //     'Septiembre',
  //     'Octubre',
  //     'Noviembre',
  //     'Diciembre',
  //   ];

  //   this.ListaMeses = nombresMeses.map((nombre, index) => {
  //     return (this.ListaMeses = nombresMeses);
  //   });
  // }

  ListaYear: { valor: number }[] = [];

  ListarYears() {
    this.ListaYear = [];
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i > anioActual - 10; i--) {
      this.ListaYear.push({ valor: i });
    }
  }

  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaPagos: any[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    // this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaPagos = [];
      this.FraccionDatos = 0;
    }

    this.ListaPagos = [];
    this.loading = true;
    this.api
      .GetPagosFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaPagos = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          if (this.ListaPagos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaPagos.length;
            this.FraccionarValores(this.ListaPagos, this.ConstanteFraccion);
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

  // FiltrarElemento() {
  //   const valor: any = this.txtBusqueda.value?.toString();
  //   let tipo: number;
  //   if (this.itemBusqueda.value === 'Estado') {
  //     tipo = 0;
  //     this.GetFiltrarElemento(valor, tipo);
  //   }
  //   if (this.itemBusqueda.value === 'Descripción') {
  //     tipo = 1;
  //     this.GetFiltrarElemento(valor, tipo);
  //   }
  //   if (this.itemBusqueda.value === 'Descripción Incompleta') {
  //     tipo = 3;
  //     this.GetFiltrarElemento(valor, tipo);
  //   }
  // }

  GetFiltrarElemento(datos: any) {
    // let datos = this.BuscarForms.value;
    let filtro: FiltroPagos = {
      tipo: datos.tipo,
      identificacion: datos.identificacion,
      nombres_cliente: datos.nombres_cliente,
      cartera:
        datos.cartera == '0' ? this.TodasCarteras : [Number(datos.cartera)],
      gestor: datos.gestor,
      cuenta: datos.cuenta,
      mes: datos.mes,
      year: datos.year,
      codigo: this.FraccionDatos,
      rango: this.RangoDatos,
    };
    this.ListaPagos = [];
    this.loading = true;
    let listadoObjeto: any[]=[];
    this.api
      .GetPagosFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          let datos = tracks['data'];
          this.ListaPagos = datos;
          for (const pago of this.ListaPagos)
            {
              let ocD: any = {
                Cedula:pago.Pagos.Cliente.cli_identificacion,
                Nombre:pago.Pagos.Cliente.cli_nombres,
                Cartera:pago.Pagos.Cartera.cart_descripcion,
                CodComprobante:pago.Pagos.pag_codigo_comprobante,
                Abono:pago.Pagos.pag_pago,
                Cuenta:pago.Pagos.Cuenta.cuent_nombre,
                Credito:pago.Pagos.Credito.ope_cod_credito,
                Producto:pago.Pagos.Credito.ope_producto,
                FechaPago:pago.Pagos.pag_fecha_pago==null?'':this.fechas.fechaCortaAbt(pago.Pagos.pag_fecha_pago),
                GestorIng:pago.ingresa,
                FechaVerificacion:pago.Pagos.pag_fecha_verificacion ==null?null:this.fechas.fechaCortaAbt(pago.Pagos.pag_fecha_verificacion),
                GestorVer:pago.verifica,
                GestorAsig:pago.Pagos.Gestor.ges_nombres+' '+pago.Pagos.Gestor.ges_apellidos,
                FechaIngreso:pago.Pagos.pag_fecha_in==null?'':this.fechas.fechaCortaAbtF1(pago.Pagos.pag_fecha_in),
                Estado:pago.Pagos.Credito.ope_estado_contacta
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Pagos', listado: listadoObjeto
            };
            this.gPago=om;
          this.DatosTemporalesBusqueda = datos;
          if (datos.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaPagos.length;
            this.FraccionarValores(this.ListaPagos, this.ConstanteFraccion);
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
    // ListaPagos
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
  }
  /**************************************   BUSCAR INFORMACION Y VER IMAGEN  ******************************************************** */
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
              this.Cliente.patchValue(datos.Cliente.cli_nombres);
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
      this.Cliente.patchValue('');
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
    // this.api
    //   .GetCuentasFracionado(0, 0)
    //   .pipe(
    //     map((tracks) => {
    //       this.ListaCuentas = tracks['data'];
    //     }),
    //     catchError((error) => {
    //       this.loading = false;
    //       this.alerta.ErrorAlRecuperarElementos();
    //       throw new Error(error);
    //     })
    //   )
    //   .subscribe();
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
            this.ListaCreditos = tracks['data'];
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

  // verImagen() {
  //   let file = this.selectedFile;

  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       Swal.fire({
  //         imageUrl: e.target!.result!.toString(),
  //         showCloseButton: true,
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

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

  /************************************** AGREGAR ELEMENTO  ******************************************************** */
  TituloFormulario = '';
  Cliente = new FormControl({ value: '', disabled: true }, Validators.required);

  PagosForms = new FormGroup({
    id_pagos: new FormControl(0, Validators.required),
    id_gestor: new FormControl(0, Validators.required),
    cli_identificacion: new FormControl('', Validators.required),
    ope_cod_credito: new FormControl('', Validators.required),
    id_cuenta: new FormControl('', [
      Validators.required,
      this.validar.VFN_NumDiferDeCero(),
    ]),
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

  ActDesControles(num: number) {
    if (num === 0) {
      this.PagosForms.get('id_pagos')?.disable();
      this.PagosForms.get('id_gestor')?.disable();
      this.PagosForms.get('cli_identificacion')?.disable();
      this.PagosForms.get('ope_cod_credito')?.disable();
      this.PagosForms.get('id_cuenta')?.disable();
      this.PagosForms.get('id_cartera')?.disable();
      this.PagosForms.get('pag_medio_contacto')?.disable();
      this.PagosForms.get('pag_pago')?.disable();
      this.PagosForms.get('pag_valor_total_comprobante')?.disable();
      this.PagosForms.get('pag_observacion_pago')?.disable();
      this.PagosForms.get('pag_codigo_comprobante')?.disable();
      this.PagosForms.get('pag_url_comprobante')?.disable();
      this.PagosForms.get('pag_observ_comprobante')?.disable();
      this.PagosForms.get('pag_pago_verificado')?.disable();
      this.PagosForms.get('pag_id_gestor_ingresa')?.disable();
      this.PagosForms.get('pag_id_gestor_verifica')?.disable();
      this.PagosForms.get('pag_mes_pago')?.disable();
      this.PagosForms.get('pag_fecha_pago')?.disable();
      this.PagosForms.get('pag_fecha_verificacion')?.disable();
      this.PagosForms.get('pag_fecha_act')?.disable();
      this.PagosForms.get('pag_fecha_desact')?.disable();
      this.PagosForms.get('pag_fecha_in')?.disable();
      this.PagosForms.get('pag_fecha_up')?.disable();
      this.PagosForms.get('pag_esactivo')?.disable();
    }
    if (num === 1) {
      //Activos
      this.PagosForms.get('id_pagos')?.enable();
      this.PagosForms.get('id_gestor')?.enable();
      this.PagosForms.get('cli_identificacion')?.enable();
      this.PagosForms.get('ope_cod_credito')?.enable();
      this.PagosForms.get('id_cuenta')?.enable();
      this.PagosForms.get('id_cartera')?.enable();
      this.PagosForms.get('pag_medio_contacto')?.enable();
      this.PagosForms.get('pag_pago')?.enable();
      this.PagosForms.get('pag_valor_total_comprobante')?.enable();
      this.PagosForms.get('pag_observacion_pago')?.enable();
      this.PagosForms.get('pag_codigo_comprobante')?.enable();
      this.PagosForms.get('pag_url_comprobante')?.enable();
      this.PagosForms.get('pag_observ_comprobante')?.enable();
      this.PagosForms.get('pag_pago_verificado')?.enable();
      this.PagosForms.get('pag_id_gestor_ingresa')?.enable();
      this.PagosForms.get('pag_id_gestor_verifica')?.enable();
      this.PagosForms.get('pag_mes_pago')?.enable();
      this.PagosForms.get('pag_fecha_pago')?.enable();
      this.PagosForms.get('pag_fecha_verificacion')?.enable();
      this.PagosForms.get('pag_fecha_act')?.enable();
      this.PagosForms.get('pag_fecha_desact')?.enable();
      this.PagosForms.get('pag_fecha_in')?.enable();
      this.PagosForms.get('pag_fecha_up')?.enable();
      this.PagosForms.get('pag_esactivo')?.enable();
    }
    if (num === 2) {
      this.PagosForms.get('id_pagos')?.enable();
      this.PagosForms.get('id_gestor')?.enable();
      this.PagosForms.get('cli_identificacion')?.enable();
      this.PagosForms.get('ope_cod_credito')?.enable();
      this.PagosForms.get('id_cuenta')?.enable();
      this.PagosForms.get('id_cartera')?.enable();
      this.PagosForms.get('pag_medio_contacto')?.enable();
      this.PagosForms.get('pag_pago')?.enable();
      this.PagosForms.get('pag_valor_total_comprobante')?.enable();
      this.PagosForms.get('pag_observacion_pago')?.enable();
      this.PagosForms.get('pag_codigo_comprobante')?.enable();
      this.PagosForms.get('pag_url_comprobante')?.enable();
      this.PagosForms.get('pag_observ_comprobante')?.enable();
      this.PagosForms.get('pag_pago_verificado')?.enable();
      this.PagosForms.get('pag_id_gestor_ingresa')?.enable();
      this.PagosForms.get('pag_id_gestor_verifica')?.enable();
      this.PagosForms.get('pag_mes_pago')?.enable();
      this.PagosForms.get('pag_fecha_pago')?.enable();
      this.PagosForms.get('pag_fecha_verificacion')?.enable();
      this.PagosForms.get('pag_fecha_act')?.enable();
      this.PagosForms.get('pag_fecha_desact')?.enable();
      this.PagosForms.get('pag_fecha_in')?.enable();
      this.PagosForms.get('pag_fecha_up')?.enable();
      this.PagosForms.get('pag_esactivo')?.enable();
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
    const minDate = new Date('1969-12-31T00:00:00.000Z');

    datos.id_cuenta = Number(datos.id_cuenta);
    datos.pag_pago_verificado =
      datos.pag_pago_verificado.toString() == 'true' ? '1' : '0';
    datos.pag_esactivo = datos.pag_esactivo.toString() == 'true' ? '1' : '0';
    datos.pag_fecha_verificacion == null
      ? minDate
      : datos.pag_fecha_verificacion;
    datos.pag_mes_pago = this.fechas.ExtraerMes(datos.pag_fecha_pago);

    let imagen = this.selectedFile!;
    if (imagen!) {
      this.api
        .PotsSubirImagen(imagen)
        .pipe(
          map((tracks) => {
            let exito = tracks['exito'];
            let DirResult = tracks['data'];
            if (exito == 1) {
              datos.pag_url_comprobante = DirResult;

              if (this.TituloFormulario === 'Editar') {
                this.api
                  .PutPagos(datos)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.ListarElementos(1);
                        this.CerrarAgregarEditarElemento();
                        this.EncerarComponentes();
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
                datos.pag_id_gestor_ingresa = Number(this.Usuario.id_gestor);
                this.api
                  .PostPagos(datos)
                  .pipe(
                    map((tracks) => {
                      const exito = tracks['exito'];
                      if (exito == 1) {
                        this.ListarElementos(1);
                        this.CerrarAgregarEditarElemento();
                        this.EncerarComponentes();
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
            if (this.TituloFormulario === 'Editar') {
              this.api
                .PutPagos(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.ListarElementos(1);
                      this.CerrarAgregarEditarElemento();
                      this.EncerarComponentes();
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
              datos.pag_id_gestor_ingresa = Number(this.Usuario.id_gestor);
              this.api
                .PostPagos(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.ListarElementos(1);
                      this.CerrarAgregarEditarElemento();
                      this.EncerarComponentes();
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
          } else {
            this.alerta.ErrorEnLaPeticion(
              'Error al subir la imagen al servidor'
            );
          }
        });
    }
  }

  // ************************************** EDITAR ELEMENTO  ******************************************************** */
  VerificarElemento(elemento: PagosI) {
    elemento.pag_pago_verificado = (
      elemento.pag_pago_verificado == '0' ? 1 : 1
    ).toString();
    elemento.pag_id_gestor_verifica = Number(this.Usuario.id_gestor);
    elemento.pag_fecha_verificacion = new Date();
    this.api
      .PutPagos(elemento)
      .pipe(
        map((tracks) => {
          let exito = tracks['exito'];
          let mensaje = tracks['mensaje'];
          if (exito == 1) {
            this.ListarElementos(1);
            this.alerta.PagoVerificado();
          } else {
            this.alerta.ErrorEnLaPeticion(mensaje);
            this.ListarElementos(1);
          }
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorEnLaPeticion('Error inesperado');
          throw new Error(error);
        })
      )
      .subscribe((x) => this.ListarElementos(1));
  }

  EliminarElemento(elemento: PagosI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.pag_esactivo = '3';
        this.api
          .PutPagos(elemento)
          .pipe(
            map((tracks) => {
              let exito = tracks['exito'];
              let mensaje = tracks['mensaje'];
              if (exito == 1) {
                this.ListarElementos(1);
                this.alerta.RegistroEliminado();
              } else {
                this.alerta.ErrorEnLaPeticion(mensaje);
                this.ListarElementos(1);
              }
            }),
            catchError((error) => {
              this.loading = false;
              this.alerta.ErrorEnLaPeticion('Error inesperado');
              throw new Error(error);
            })
          )
          .subscribe();
      }
    });
  }

  CargarElemento(datos: any, num: number) {
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
    this.AgregarEditarElemento(num);
  }
  YaVerificado() {
    this.alerta.AlertaEnLaPeticion('El pago ya fue verificado');
  }

  VerElemento(datos: any) {
    let inicio = datos.Pagos.pag_url_comprobante.indexOf('Images/');
    let fin = datos.Pagos.pag_url_comprobante.indexOf('.');
    let NameFile = datos.Pagos.pag_url_comprobante.substring(inicio + 7);
    let typefile = datos.Pagos.pag_url_comprobante.substring(fin + 1);

    const imageUrl = datos.Pagos.pag_url_comprobante;
    const fileName = NameFile;
    const fileType = 'image/' + typefile;
    console.log(imageUrl);
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
        this.alerta.ErrorInesperado(
          'La imagen no esta disponible en el servidor'
        );
        console.error('Error recreating file from URL:', error);
      });

    // this.RecrearImagenDesdeUrl(imageUrl, fileName, fileType);
    // let file = this.selectedFile;
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    this.loading = false;
    this.Cliente.patchValue('');
    this.ResetPagosForms();
    this.ListaContacto = [];
    this.ListaCreditos = [];
    this.ListaCuentas = [];
    this.selectedFile = null;
    this.previewUrl = null;

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
        const resultado = this.ListaPagos.filter((elemento) => {
          return elemento.cli_identificacion.includes(nombre.toUpperCase());
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
        const resultado = this.ListaPagos.filter((elemento) => {
          return elemento.cli_identificacion.includes(nombre.toUpperCase());
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

  // ****************************************** MODAL AGREGAR TELEFONOS *****************************************************************
  //  ClienteInf!: ClienteI | null;
  // TipoVistaInfCliente: number = 0;

  // BuscarInfCliente(dato: any, tipo: number) {
  //   this.TipoVistaInfCliente = tipo;
  //   this.TituloFormulario = 'Gestionar';
  //   this.ActDesControles(1);
  //   let filtro: GestionarPropio = {
  //     tipo: 0,
  //     identificacion: (dato.identificacion == '' ? '0' : dato.identificacion)!,
  //     cartera: dato.id_cartera,
  //   };

  //   this.api
  //     .GetGestionarFracionadoFiltro(filtro)
  //     .pipe(
  //       map((tracks) => {
  //         const datos = tracks['data'];
  //         if (!datos) {
  //           this.alerta.NoExistenDatos();
  //         } else {
  //           this.ClienteInf = datos.cliente;
  //           this.Cliente = this.ClienteInf!.cli_nombres;
  //           this.ListaCorreos = datos.correos;
  //           this.ListaDirecciones = datos.direcciones;
  //           this.ListaGarantes = datos.garantes;
  //           this.ListaTelefonos = datos.telefonos;
  //           this.ListaTrabajos = datos.trabajos;
  //           this.ListaProductos = datos.credito;
  //           this.ListaGestionesAnt = datos.gestiones_realizadas;
  //           this.ListaPagos = datos.pagos;
  //           // this.BuscarTelefonosCliente();
  //           this.ListaCorreosCount = datos.correos.length;
  //           this.ListaDireccionesCount = datos.direcciones.length;
  //           this.ListaGarantesCount = datos.garantes.length;
  //           this.ListaTelefonosCount = datos.telefonos.length;
  //           this.ListaTrabajosCount = datos.trabajos.length;
  //           this.ListaProductosCount = datos.credito.length;
  //           this.ListaGestionesAntCount = datos.gestiones_realizadas.length;
  //           this.ListaPagosCount = datos.pagos.length;

  //           const produ = datos.credito[0];
  //           // this.ProductoSeleccionado = produ.ope_producto;
  //           // this.Producto = produ;
  //           this.GestionForms.patchValue({
  //             cli_identificacion: datos.cliente.cli_identificacion,
  //             // id_gestor: datos.cliente.id_gestor,
  //           });
  //           this.SeleccionarProducto(produ.ope_producto, 1);
  //         }
  //       }),
  //       catchError((error) => {
  //         this.alerta.ErrorAlRecuperarElementos();
  //         throw new Error(error);
  //       })
  //     )
  //     .subscribe();
  // }

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
              this.ListaContacto = [];
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
              this.ListaContacto = [];
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
    if (num == 0) {
      this.TituloFormularioAgregarTelefonos = 'Agregar';
    } else {
      this.TituloFormularioAgregarTelefonos = 'Editar';
    }

    this.TelefonosForms.patchValue({
      cli_identificacion: this.PagosForms.get('cli_identificacion')?.value,
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
          //  this.BuscarTelefonosCliente();
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
}
