import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Alertas } from 'src/app/Control/Alerts';
import { ApiService } from 'src/app/service/api.service';
import { Fechas } from 'src/app/Control/Fechas';
import { ResultadoCarteraI, ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map, throwError } from 'rxjs';
import { ContactabilidadI, FiltroDescarga, FiltroGestion, GestorI } from 'src/app/Modelos/response.interface';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-descargar',
  templateUrl: './descargar.component.html',
  styleUrls: ['./descargar.component.css']
})
export class DescargarComponent implements OnInit{
  ngOnInit()
  {
    this.CarterasGestor();
    this.banderaViewFiltro=false;
    this.banderaBarrido=false;
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
  constructor(private api: ApiService,private alerta: Alertas,public Fechas: Fechas,private router: Router) {}
  BuscarForms = new FormGroup({
    identificacion: new FormControl('', Validators.required),
    nombres_cliente: new FormControl('', Validators.required),
    cartera: new FormControl('', Validators.required),
    estado_contactibilidad: new FormControl('', Validators.required),
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

  });
  datosIniciales:any = {
    cartera: '',
    estado_contactibilidad: '',
    fecha_final_gestion: '2024-10-09',
    fecha_final_pp: '2024-10-09',
    fecha_inicial_gestion: '2024-10-09',
    fecha_inicial_pp: '2024-10-09',
    identificacion: '',
    nombres_cliente: '',
  };
  cambiosDetectados: boolean = false;
  banderaBarrido:boolean=false;
  ResetClienteForms() {
    console.log('Se ejecuto')
    //this.banderaBarrido=true;
    this.DatosCargaMasiva=[];
    this.BuscarForms.reset({
      identificacion: '',
      nombres_cliente: '',
      cartera: '',
      estado_contactibilidad: '',
      fecha_inicial_pp:this.Fechas.fechaActualCorta(),
      fecha_final_pp:this.Fechas.fechaActualCorta(),
      fecha_inicial_gestion: this.Fechas.fechaActualCorta(),
      fecha_final_gestion: this.Fechas.fechaActualCorta(),
    });
  }
  loading: boolean = false;
  banderaViewFiltro:boolean=false;
  valorAux1:string='';
  valorAux2:string='';
  aux:string='';
  banderaTelefono=false;
  banderaCorreo=false;
  banderaDireccion=false;
  TodasCarteras: number[] = [];
  Cabecera:string[]=[];
  CarteraGestor: any[] = [];
  ListaContactabilidad: ContactabilidadI[] = [];
  /****banderasBaseGestionada */
  banderaBGestionadaTelefono=false;
  banderaBGestionadaCorreo=false;
  banderaBGestionadaDireccion=false;
  /*******banderasBasSinGestionar */
  banderaBaseSinGestionarTelefono=false;
  banderaBaseSinGestionarCorreo=false;
  banderaBaseSinGestionarDireccion=false;
  /************* */
  /**************banderasPara Aplicar el filtro******** */
  banderaBGestionadaTelefonoFiltro=false;
  banderaBGestionadaCorreoFiltro=false;
  banderaBGestionadaDireccionFiltro=false;
  valorBandera:string='';
  /*********************** */
  ListaResultado:any[]=[];
  seleccionBase: any[] = [
    { id: 1, name: 'Base-General', value:'1' },
    { id: 2, name: 'Base-Gestionada', value:'2' },
    { id: 3, name: 'Base-Sin-Gestionar', value:'3' }
  ];
  seleccionEntidad: any[] = [
    { id: 1, name: 'Telefono', value:'1' },
    { id: 2, name: 'Correo', value:'2' },
    { id: 3, name: 'Direccion', value:'3' }
  ];
  FraccionDatos: number = 0;
  DatosTemporalesBusqueda: any[] = [];
  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Cartera: ResultadoCarteraI[] = this.permisos.cartera;
  vRespaldo!:string;
  
  Usuario: ResultadoGestorI = this.permisos.gestor;
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  ContadorDatosGeneral: number = 0;

  /****************************Obtener la pagina Actual */
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'descargas';
  }) as ResultadoMenuI;
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  selecBase = new FormControl('', [Validators.required]);
  selecEntidad = new FormControl('', [Validators.required]);
  ListaDescargas:any[]=[];
  ListarDatos(opcionLlamado: string) {
        console.log(this.BuscarForms.value);
        this.loading = true; // Activa el estado de carga
        this.banderaTelefono = false;
        this.banderaCorreo = false;
        this.banderaDireccion = false;
        this.banderaBGestionadaTelefono = false;
        this.banderaBGestionadaCorreo = false;
        this.banderaBGestionadaDireccion = false;
        this.banderaBaseSinGestionarTelefono = false;
        this.banderaBaseSinGestionarCorreo = false;
        this.banderaBaseSinGestionarDireccion = false;
        this.aux = opcionLlamado;  // Aquí usas '=' para la asignación correcta
        if (opcionLlamado === 'Base-General Telefono') {
          this.ListaDescargas=[];
          this.DatosTemporales=[];
          this.DatosTemporalesBusqueda=[];
            this.banderaTelefono = true;
            console.log(this.banderaTelefono);
            console.log('entro');
            this.api.GetDescargaBaseGeneralTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
                .pipe(
                    map((tracks) => this.handleTracks(tracks)),
                    catchError((error) => this.handleError(error))
                )
                .subscribe();
        }
        if (opcionLlamado === 'Base-General Correo') {
          this.ListaDescargas=[];
          this.DatosTemporales=[];
          this.DatosTemporalesBusqueda=[];
            this.banderaCorreo = true;
            console.log(this.banderaCorreo);
            console.log('entro');
            this.api.GetDescargaBaseGeneralCorreoFracionado(this.FraccionDatos, this.RangoDatos)
                .pipe(
                    map((tracks) => this.handleTracks(tracks)),
                    catchError((error) => this.handleError(error))
                )
                .subscribe();
        }
        if (opcionLlamado === 'Base-General Direccion') {
          this.ListaDescargas=[];
          this.DatosTemporales=[];
          this.DatosTemporalesBusqueda=[];
          this.banderaDireccion = true;
          console.log(this.banderaDireccion);
            console.log('entro');
          this.api.GetDescargaBaseGeneralDireccionFracionado(this.FraccionDatos, this.RangoDatos)
              .pipe(
                  map((tracks) => this.handleTracks(tracks)),
                  catchError((error) => this.handleError(error))
              )
              .subscribe();
      }
      if (opcionLlamado === 'Base-Gestionada Telefono') {
        this.banderaBGestionadaTelefono = true;
        this.banderaViewFiltro=true;
        if(this.banderaBarrido===true)
          {
            console.log('entro bandera')
            this.ListaDescargas=[];
            //this.onCleanSelect();
          }else
          {
            console.log('entro bandera')
            this.api.GetDescargaBaseGestionadaTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
            .pipe(
                map((tracks) => this.handleTracks(tracks)),
                catchError((error) => this.handleError(error))
            ).subscribe();
          }
        console.log(this.BuscarForms.value);
    }
    if (opcionLlamado === 'Base-Gestionada Correo') {
      this.banderaBGestionadaCorreo = true;
      this.banderaViewFiltro=true;
      this.api.GetDescargaBaseGestionadaCorreoFracionado(this.FraccionDatos, this.RangoDatos)
          .pipe(
              map((tracks) => this.handleTracks(tracks)),
              catchError((error) => this.handleError(error))
          )
          .subscribe();
    }
    if (opcionLlamado === 'Base-Gestionada Direccion') {
      this.banderaBGestionadaDireccion = true;
      this.banderaViewFiltro=true;
      console.log(this.BuscarForms.value);
      this.api.GetDescargaBaseGestionadaDireccionFracionado(this.FraccionDatos, this.RangoDatos)
          .pipe(
              map((tracks) => this.handleTracks(tracks)),
              catchError((error) => this.handleError(error))
          )
          .subscribe();
    }
    /***Base-Sin-Gestionar */
    if (opcionLlamado === 'Base-Sin-Gestionar Telefono') {
      this.banderaBaseSinGestionarTelefono = true;
      //this.banderaViewFiltro=true;
      this.api.GetDescargaBaseSinGestionarTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
          .pipe(
              map((tracks) => this.handleTracks(tracks)),
              catchError((error) => this.handleError(error))
          )
          .subscribe();
    }
    if (opcionLlamado === 'Base-Sin-Gestionar Correo') {
      this.banderaBaseSinGestionarCorreo = true;
      //this.banderaViewFiltro=true;
      this.api.GetDescargaBaseSinGestionarCorreoFracionado(this.FraccionDatos, this.RangoDatos)
          .pipe(
              map((tracks) => this.handleTracks(tracks)),
              catchError((error) => this.handleError(error))
          )
          .subscribe();
    }
    if (opcionLlamado === 'Base-Sin-Gestionar Direccion') {
      this.banderaBaseSinGestionarDireccion = true;
      this.api.GetDescargaBaseSinGestionarDireccionFracionado(this.FraccionDatos, this.RangoDatos)
          .pipe(
              map((tracks) => this.handleTracks(tracks)),
              catchError((error) => this.handleError(error))
          )
          .subscribe();
    }
       
}
async handleTracks(tracks: any) {
  this.ListaDescargas=tracks['data'];
  this.Cabecera=this.getKeys(this.ListaDescargas);
  this.DatosTemporalesBusqueda = tracks['data'];
  if (this.ListaDescargas.length === 0) {
      this.loading = false;
      this.alerta.NoExistenDatos();
      await this.onCleanSelect();
  } else {
    //this.ListaResultado=tracks['data'];
      this.loading = false;
      this.ContadorDatosGeneral = this.ListaDescargas.length;
      this.FraccionarValores(this.ListaDescargas, this.ConstanteFraccion);
  }
}
async handleError(error: any) {
  this.loading = false;
  this.alerta.ErrorAlRecuperarElementos();
  throw new Error(error);
}

async onCleanSelect()
{
  this.DatosTemporalesBusqueda = [];
  this.selecEntidad.patchValue('')
  this.banderaViewFiltro = false;
  this.DatosCargaMasiva = [];
  this.Cabecera = [];
  this.ResetClienteForms();
  this.valorAux2 = '';
}
async iniciarBase()
{
  try
  {
    console.log(this.selecBase.value);
   if(this.selecBase.value==='0')
    {
      console.log('entroif');
      this.selecionarBase(this.selecBase.value);
      if(this.valorAux2==='')
        {
          console.log('ENtroif2');
        }
    }
    else
    {
      this.selecionarBase(this.selecBase.value);
      if(this.valorAux2==='')
        {
          this.ListaDescargas=[];
          this.onCleanSelect();
        }
    }
    
  }catch(error)
  {}
}
selecionarBase(valor:any)
{
  this.valorAux1='';
  this.valorAux1=valor;
  this.valorAux2='';
  this.DatosCargaMasiva=[];
}
  seleccion()
  {
    if(this.selecBase.value==='')
      {
        this.ListaDescargas=[];
        this.DatosCargaMasiva=[];
      }else
      {
        this.valorAux2 =this.selecEntidad.value!;
        if (this.valorAux1 === 'Base-General' && this.valorAux2 === 'Telefono') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
        }
        if (this.valorAux1 === 'Base-General' && this.valorAux2 === 'Correo') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
        }
        if (this.valorAux1 === 'Base-General' && this.valorAux2 === 'Direccion') {
          const llamar = this.valorAux1 +' ' +this.valorAux2;
          this.ListarDatos(llamar);
        }
        if (this.valorAux1 === 'Base-Gestionada' && this.valorAux2 === 'Telefono') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
          this.valorBandera=llamar;
          console.log(this.valorBandera);
        }
        if (this.valorAux1 === 'Base-Gestionada' && this.valorAux2 === 'Correo') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
          this.valorBandera=llamar;
          console.log(this.valorBandera);
        }
        if (this.valorAux1 === 'Base-Gestionada' && this.valorAux2 === 'Direccion') {
          const llamar = this.valorAux1 +' ' +this.valorAux2;
          this.ListarDatos(llamar);
          this.valorBandera=llamar;
          console.log(this.valorBandera);
        }
        if (this.valorAux1 === 'Base-Sin-Gestionar' && this.valorAux2 === 'Telefono') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
        }
        if (this.valorAux1 === 'Base-Sin-Gestionar' && this.valorAux2 === 'Correo') {
          const llamar = this.valorAux1 +' '+this.valorAux2;
          this.ListarDatos(llamar);
        }
        if (this.valorAux1 === 'Base-Sin-Gestionar' && this.valorAux2 === 'Direccion') {
          const llamar = this.valorAux1 +' ' +this.valorAux2;
          this.ListarDatos(llamar);
        }
      }
  }
  // ****************************************** PAGINACION *****************************************************************
  DatosCargaMasiva!: any[];
  DatosTemporales: any[] = [];
  ContadorDatos: number = 0;
  RangoPaginacion: number = 0;
  InicioPaginacion: number = 0;
  FinalPaginacion: number = 0;
  FraccionarValores(datos?: any, rango?: number ){
    //this.ListaResultado=[];
    //this.DatosCargaMasiva=[];
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
    // this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaResultado = [];
      this.FraccionDatos = 0;
    }
    if (this.aux === 'Base-General Telefono') {
      this.ListaResultado = [];
      this.loading = true;
      this.api
        .GetDescargaBaseGeneralTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            console.log("---------------------------------------------------------------------");
            this.DatosTemporalesBusqueda = tracks['data'];
            console.log("---------------------------------------------------------------------");
            console.log(this.DatosTemporalesBusqueda);
            if (this.ListaResultado.length === 0) {
              this.loading = false;
              this.alerta.NoExistenDatos();
            } else {
              this.loading = false;
              this.ContadorDatosGeneral = this.ListaResultado.length;
              this.FraccionarValores(this.ListaResultado, this.ConstanteFraccion);
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
    if (this.aux === 'Base-Gestionada Telefono') {
      this.ListaResultado = [];
      this.loading = true;
      this.api
        .GetDescargaBaseGestionadaTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            console.log("---------------------------------------------------------------------");
            this.DatosTemporalesBusqueda = tracks['data'];
            console.log("---------------------------------------------------------------------");
            console.log(this.DatosTemporalesBusqueda);
            if (this.ListaResultado.length === 0) {
              this.loading = false;
              this.alerta.NoExistenDatos();
            } else {
              this.loading = false;
              this.ContadorDatosGeneral = this.ListaResultado.length;
              this.FraccionarValores(this.ListaResultado, this.ConstanteFraccion);
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
    if (this.aux === 'Base-Sin-Gestionar Telefono') {
      this.ListaResultado = [];
      this.loading = true;
      this.api
        .GetDescargaBaseSinGestionarTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            console.log("---------------------------------------------------------------------");
            this.DatosTemporalesBusqueda = tracks['data'];
            console.log("---------------------------------------------------------------------");
            console.log(this.DatosTemporalesBusqueda);
            if (this.ListaResultado.length === 0) {
              this.loading = false;
              this.alerta.NoExistenDatos();
            } else {
              this.loading = false;
              this.ContadorDatosGeneral = this.ListaResultado.length;
              this.FraccionarValores(this.ListaResultado, this.ConstanteFraccion);
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
  /*********************  FILTRO MODO GENERAL *********************** */
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
    const Thcli_identificacion = document.getElementById(
      'Thcli_identificacion'
    ) as HTMLInputElement;
    const Thcli_nombres = document.getElementById(
      'Thcli_nombres'
    ) as HTMLInputElement;
    Thcli_identificacion.style.color = '';
    Thcli_nombres.style.color = '';
    inputElement.disabled = false;
    inputElement.focus();
  }
  FiltrarLista(num: number) {
    const contador = this.TextoFiltro.value!.trim().length!;
    this.EncerarVariablesPaginacion();
    this.TextoFiltro.patchValue(this.TextoFiltro.value!.toUpperCase());
    if(this.selecBase.value==='Base-General'||this.selecBase.value==='Base-Sin-Gestionar')
      {
        /*** */
        const Thcli_identificacion = document.getElementById(
          'Thcli_identificacion'
        ) as HTMLInputElement;
        const Thcli_nombres = document.getElementById(
          'Thcli_nombres'
        ) as HTMLInputElement;
        const Thcart_descripcion = document.getElementById(
          'Thcart_descripcion'
        ) as HTMLInputElement;
        const Thope_cod_credito = document.getElementById(
          'Thope_cod_credito'
        ) as HTMLInputElement;
        const Thcli_estado_contacta = document.getElementById(
          'Thcli_estado_contacta'
        ) as HTMLInputElement;
        if (this.FirltroPor === 'Cedula') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaDescargas.filter((elemento) => {
              return elemento.cli_identificacion.includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
          }
    
          if (contador != 0) {
            Thcli_identificacion.style.color = 'red';
          } else {
            Thcli_identificacion.style.color = '';
          }
        }
        if (this.FirltroPor === 'Nombres') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaDescargas.filter((elemento) => {
              return elemento.cli_nombres.includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
          }
    
          if (contador != 0) {
            Thcli_nombres.style.color = 'red';
          } else {
            Thcli_nombres.style.color = '';
          }
        }
        if (this.FirltroPor === 'Cartera') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaDescargas.filter((elemento) => {
              return elemento.cart_descripcion.includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
          }
          if (contador != 0) {
            Thcart_descripcion.style.color = 'red';
          } else {
            Thcart_descripcion.style.color = '';
          }
        }
        if (this.FirltroPor === 'Credito') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaDescargas.filter((elemento) => {
              return elemento.ope_cod_credito.includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
          }
          if (contador != 0) {
            Thope_cod_credito.style.color = 'red';
          } else {
            Thope_cod_credito.style.color = '';
          }
        }
        if (this.FirltroPor === 'Contactabilidad') {
          let nombre = this.TextoFiltro.value!;
          if (num === 0) {
            const resultado = this.ListaDescargas.filter((elemento) => {
              return elemento.cli_estado_contacta.includes(nombre.toUpperCase());
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
          }
          if (contador != 0) {
            Thcli_estado_contacta.style.color = 'red';
          } else {
            Thcli_estado_contacta.style.color = '';
          }
        }

      }
      if(this.selecBase.value==='Base-Gestionada')
        {
          /*** */
          const Thcli_identificacion = document.getElementById(
            'Thcli_identificacion'
          ) as HTMLInputElement;
          const Thcli_nombres = document.getElementById(
            'Thcli_nombres'
          ) as HTMLInputElement;
          const Thcart_descripcion = document.getElementById(
            'Thcart_descripcion'
          ) as HTMLInputElement;
          const Thope_cod_credito = document.getElementById(
            'Thope_cod_credito'
          ) as HTMLInputElement;
          const Thope_estado_contacta = document.getElementById(
            'Thope_estado_contacta'
          ) as HTMLInputElement;
          if (this.FirltroPor === 'Cedula') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaDescargas.filter((elemento) => {
                return elemento.cli_identificacion.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
            }
      
            if (contador != 0) {
              Thcli_identificacion.style.color = 'red';
            } else {
              Thcli_identificacion.style.color = '';
            }
          }
          if (this.FirltroPor === 'Nombres') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaDescargas.filter((elemento) => {
                return elemento.cli_nombres.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
            }
      
            if (contador != 0) {
              Thcli_nombres.style.color = 'red';
            } else {
              Thcli_nombres.style.color = '';
            }
          }
          if (this.FirltroPor === 'Cartera') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaDescargas.filter((elemento) => {
                return elemento.cart_descripcion.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
            }
            if (contador != 0) {
              Thcart_descripcion.style.color = 'red';
            } else {
              Thcart_descripcion.style.color = '';
            }
          }
          if (this.FirltroPor === 'Credito') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaDescargas.filter((elemento) => {
                return elemento.ope_cod_credito.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
            }
            if (contador != 0) {
              Thope_cod_credito.style.color = 'red';
            } else {
              Thope_cod_credito.style.color = '';
            }
          }
          if (this.FirltroPor === 'Contactabilidad') {
            let nombre = this.TextoFiltro.value!;
            if (num === 0) {
              const resultado = this.ListaDescargas.filter((elemento) => {
                return elemento.ope_estado_contacta.includes(nombre.toUpperCase());
              });
              this.FraccionarValores(resultado, this.ConstanteFraccion);
            }
            if (contador != 0) {
              Thope_estado_contacta.style.color = 'red';
            } else {
              Thope_estado_contacta.style.color = '';
            }
          }
  
        }
  }
  VaciarFiltro() {
    const inputElement = document.getElementById(
      'TxtFiltro'
    ) as HTMLInputElement;
    if(this.selecBase.value==='Base-General'||this.selecBase.value==='Base-Sin-Gestionar')
      {
        const Thcli_identificacion = document.getElementById(
          'Thcli_identificacion'
        ) as HTMLInputElement;
        const Thcli_nombres = document.getElementById(
          'Thcli_nombres'
        ) as HTMLInputElement;
        const Thcart_descripcion = document.getElementById(
          'Thcart_descripcion'
        ) as HTMLInputElement;
        const Thope_cod_credito = document.getElementById(
          'Thope_cod_credito'
        ) as HTMLInputElement;
        const Thcli_estado_contacta = document.getElementById(
          'Thcli_estado_contacta'
        ) as HTMLInputElement;
        Thcli_identificacion.style.color = '';
        Thcli_nombres.style.color = '';
        Thcart_descripcion.style.color = '';
        Thope_cod_credito.style.color = '';
        Thcli_estado_contacta.style.color='';
        inputElement.disabled = true;
        this.FirltroPor = '';
        this.TextoFiltro.patchValue('');
        this.FraccionarValores(
          this.DatosTemporalesBusqueda,
          this.ConstanteFraccion
        );
      }
      if(this.selecBase.value==='Base-Gestionada')
      {
        const Thcli_identificacion = document.getElementById(
          'Thcli_identificacion'
        ) as HTMLInputElement;
        const Thcli_nombres = document.getElementById(
          'Thcli_nombres'
        ) as HTMLInputElement;
        const Thcart_descripcion = document.getElementById(
          'Thcart_descripcion'
        ) as HTMLInputElement;
        const Thope_cod_credito = document.getElementById(
          'Thope_cod_credito'
        ) as HTMLInputElement;
        const Thope_estado_contacta = document.getElementById(
          'Thope_estado_contacta'
        ) as HTMLInputElement;
        Thcli_identificacion.style.color = '';
        Thcli_nombres.style.color = '';
        Thcart_descripcion.style.color = '';
        Thope_cod_credito.style.color = '';
        Thope_estado_contacta.style.color='';
        inputElement.disabled = true;
        this.FirltroPor = '';
        this.TextoFiltro.patchValue('');
        this.FraccionarValores(
          this.DatosTemporalesBusqueda,
          this.ConstanteFraccion
        );

      }
    
  }
  getKeys(valor:any[]): string[] {
    if (this.ListaDescargas.length > 0) { // Checks if ListaResultado array has elements
      return Object.keys(valor[0]); // Returns the keys of the first object in ListaResultado array
  }
  return []; // Returns an empty array if ListaResultado is empty
}
  async descargarExcel(entidad:any) {
    const valor:string=entidad;
    let array:any[]=[];
    if(valor==='Telefono')
      {
        if(this.selecBase.value==='Base-General')
          {
            array = this.ListaDescargas.map((item: any) => ({
              cli_identificacion: item['cli_identificacion'],
              cli_nombres: item['cli_nombres'],
              tel_numero: item['tel_numero'],
              tel_tip_descripcion: item['tel_tip_descripcion'],
              tel_detal_descripcion: item['tel_detal_descripcion'],
              cli_estado_contacta: item['cli_estado_contacta'],
              ope_cod_credito: item['ope_cod_credito'],
              tel_observacion: item['tel_observacion']
            }));
          }
        if(this.selecBase.value==='Base-Gestionada')
          {
            array = this.ListaDescargas.map((item: any) => ({
              cli_identificacion: item['cli_identificacion'],
              cli_nombres: item['cli_nombres'],
              tel_numero: item['tel_numero'],
              tel_tip_descripcion: item['tel_tip_descripcion'],
              tel_detal_descripcion: item['tel_detal_descripcion'],
              ope_estado_contacta: item['ope_estado_contacta'],
              ope_cod_credito: item['ope_cod_credito'],
              tel_observacion: item['tel_observacion']
            }));
          }
        if(this.selecBase.value==='Base-Sin-Gestionar')
          {
            array = this.ListaDescargas.map((item: any) => ({
              cli_identificacion: item['cli_identificacion'],
              cli_nombres: item['cli_nombres'],
              tel_numero: item['tel_numero'],
              tel_tip_descripcion: item['tel_tip_descripcion'],
              tel_detal_descripcion: item['tel_detal_descripcion'],
              ope_estado_contacta: item['ope_estado_contacta'],
              ope_cod_credito: item['ope_cod_credito'],
              tel_observacion: item['tel_observacion']
            }));
          }
      }
      if(valor==='Correo')
        {
          if(this.selecBase.value==='Base-General')
            {
              array = this.ListaDescargas.map((item: any) => ({
                cli_identificacion: item['cli_identificacion'],
                cli_nombres: item['cli_nombres'],
                cor_email: item['cor_email'],
                corr_tip_descripcion: item['corr_tip_descripcion'],
                cli_estado_contacta: item['cli_estado_contacta'],
                ope_cod_credito: item['ope_cod_credito'],
                cor_descripcion: item['cor_descripcion']
              }));

            }
          if(this.selecBase.value==='Base-Gestionada')
            {
              array = this.ListaDescargas.map((item: any) => ({
                cli_identificacion: item['cli_identificacion'],
                cli_nombres: item['cli_nombres'],
                cor_email: item['cor_email'],
                corr_tip_descripcion: item['corr_tip_descripcion'],
                ope_estado_contacta: item['ope_estado_contacta'],
                ope_cod_credito: item['ope_cod_credito'],
                cor_descripcion: item['cor_descripcion']
              }));
            }
          if(this.selecBase.value==='Base-Sin-Gestionar')
            {
              array = this.ListaDescargas.map((item: any) => ({
                cli_identificacion: item['cli_identificacion'],
                cli_nombres: item['cli_nombres'],
                cor_email: item['cor_email'],
                corr_tip_descripcion: item['corr_tip_descripcion'],
                cli_estado_contacta: item['cli_estado_contacta'],
                ope_cod_credito: item['ope_cod_credito'],
                cor_descripcion: item['cor_descripcion']
              }));
            }
        }
        if(valor==='Direccion')
          {
            if(this.selecBase.value==='Base-General')
              {
                array = this.ListaDescargas.map((item: any) => ({
                  cli_identificacion: item['cli_identificacion'],
                  cli_nombres: item['cli_nombres'],
                  dir_completa: item['dir_completa'],
                  dir_referencia:item['dir_referencia'],
                  dir_numero_casa:item['dir_numero_casa'],
                  dir_tip_descripcion: item['dir_tip_descripcion'],
                  cli_estado_contacta: item['cli_estado_contacta'],
                  ope_cod_credito: item['ope_cod_credito'],
                  dir_observacion: item['dir_observacion']
                }));
              }
              if(this.selecBase.value==='Base-Gestionada')
                {
                  array = this.ListaDescargas.map((item: any) => ({
                    cli_identificacion: item['cli_identificacion'],
                    cli_nombres: item['cli_nombres'],
                    dir_completa: item['dir_completa'],
                    dir_referencia:item['dir_referencia'],
                    dir_numero_casa:item['dir_numero_casa'],
                    dir_tip_descripcion: item['dir_tip_descripcion'],
                    ope_estado_contacta: item['ope_estado_contacta'],
                    ope_cod_credito: item['ope_cod_credito'],
                    dir_observacion: item['dir_observacion']
                  }));
                }
                if(this.selecBase.value==='Base-Sin-Gestionar')
                  {
                    array = this.ListaDescargas.map((item: any) => ({
                      cli_identificacion: item['cli_identificacion'],
                      cli_nombres: item['cli_nombres'],
                      dir_completa: item['dir_completa'],
                      dir_referencia:item['dir_referencia'],
                      dir_numero_casa:item['dir_numero_casa'],
                      dir_tip_descripcion: item['dir_tip_descripcion'],
                      cli_estado_contacta: item['cli_estado_contacta'],
                      ope_cod_credito: item['ope_cod_credito'],
                      dir_observacion: item['dir_observacion']
                    }));
                  }
          }
    const wb = XLSX.utils.book_new();
    // Agregar la lista de tipos de correo a una pestaña
    const wsTelefono = XLSX.utils.json_to_sheet(array);
    XLSX.utils.book_append_sheet(wb, wsTelefono, valor);
    XLSX.writeFile(wb, valor + '.xlsx');
    this.selecBase.patchValue('');
    await this.onCleanSelect()
  }
  buscarFiltro(dato:any)
  {
    this.banderaBGestionadaTelefono=false;//agregar para no se duplique las filas y columnas
    this.banderaBGestionadaCorreo=false;
    this.banderaBGestionadaDireccion=false;
    this.DatosTemporalesBusqueda=[];
    this.Cabecera=[];
    this.DatosTemporales=[];
    let array:any[]=[];
    console.log(this.valorBandera)
    let filtro:FiltroDescarga=
    {
      tipo:1,identificacion:(dato.identificacion.trim()===''?'0':dato.identificacion.trim())!,
      nombres_cliente:(dato.nombres_cliente.trim()===''?'0':dato.nombres_cliente.trim())!,
      cartera: dato.cartera=='0'?this.TodasCarteras:[Number(dato.cartera)],
      estado_contactibilidad:(dato.estado_contactibilidad==='Todas'?'0':dato.estado_contactibilidad),
      fecha_inicial_gestion:dato.fecha_inicial_gestion,
      fecha_final_gestion:dato.fecha_final_gestion,
      fecha_inicial_pp:dato.fecha_inicial_pp,
      fecha_final_pp:dato.fecha_final_pp
    }
    console.log(filtro);
    if(this.valorBandera==='Base-Gestionada Telefono')
      {this.ListaDescargas=[];
        console.log('entro1')
        this.banderaBGestionadaTelefonoFiltro=true;
        this.api.GetDescargaBaseGestionadaTelefonoFracionadoFiltro(filtro)
        .pipe(
          map((tracks) => {
            const array = tracks.data.map(({ 
              Inf_Gestion: { 
                cli_identificacion, 
                cli_nombres, 
                ope_estado_contacta, 
                ope_cod_credito, 
                cartera, 
                gest_fecha_gestion, 
                gest_valor_comp, 
                gest_fecha_prox_pago 
              }, 
              telefono: { 
                tel_numero, 
                tipo: tel_tip_descripcion, 
                detalle: tel_detal_descripcion 
              } 
            }: any) => ({
              cli_identificacion,
              cli_nombres,
              tel_numero,
              tel_tip_descripcion,
              tel_detal_descripcion,
              ope_estado_contacta,
              ope_cod_credito,
              cart_descripcion: cartera,
              gest_fecha_gestion,
              gest_valor_comp,
              gest_fecha_prox_pago
            }));
            const valor = { data: array };
            this.handleTracks(valor);
            this.DatosTemporalesBusqueda = tracks.data;
            this.loading = false;
      
            if (this.ListaDescargas.length === 0) {
              this.alerta.NoExistenDatos();
            } else {
              this.ContadorDatosGeneral = this.ListaDescargas.length;
              this.FraccionarValores(this.ListaDescargas, this.ConstanteFraccion);
            }
          }),
          catchError((error) => {
            this.loading = false;
            this.alerta.ErrorAlRecuperarElementos();
            console.error('Error retrieving elements:', error); // Log the error for debugging
            return throwError(error); // Return the error observable
          })
        )
        .subscribe();
      }
    if(this.valorBandera==='Base-Gestionada Correo')
      {
        this.ListaDescargas=[];
        console.log('entro2')
        this.banderaBGestionadaCorreoFiltro=true;
        this.api.GetDescargaBaseGestionadaCorreoFracionadoFiltro(filtro)
  .pipe(
    map((tracks) => {
      const array = tracks.data.map(({ 
        Inf_Gestion: { 
          cli_identificacion, 
          cli_nombres, 
          ope_estado_contacta, 
          ope_cod_credito, 
          cartera, 
          gest_fecha_gestion, 
          gest_valor_comp, 
          gest_fecha_prox_pago 
        }, 
        correo: { 
          cor_email, 
          tipo: corr_tip_descripcion, 
          cor_descripcion 
        } 
      }: any) => ({
        cli_identificacion,
        cli_nombres,
        cor_email,
        corr_tip_descripcion,
        ope_estado_contacta,
        ope_cod_credito,
        cart_descripcion: cartera,
        gest_fecha_gestion,
        gest_valor_comp,
        cor_descripcion,
        gest_fecha_prox_pago
      }));

      const valor = { data: array };
      this.handleTracks(valor);
      this.DatosTemporalesBusqueda = tracks.data;

      this.loading = false;

      if (this.ListaResultado.length === 0) {
        this.alerta.NoExistenDatos();
      } else {
        this.ContadorDatosGeneral = this.ListaResultado.length;
        this.FraccionarValores(this.ListaResultado, this.ConstanteFraccion);
      }
    }),
    catchError((error) => {
      this.loading = false;
      this.handleError(error); // Assuming you have a method for handling errors
      this.alerta.ErrorAlRecuperarElementos();
      console.error('Error retrieving elements:', error); // Log the error for debugging
      return throwError(error); // Return the error observable
    })
  )
  .subscribe();
      }
      if(this.valorBandera==='Base-Gestionada Direccion')
        {
          this.ListaDescargas=[];
          console.log('entro3')
          this.banderaBGestionadaDireccionFiltro=true;
          this.api.GetDescargaBaseGestionadaDireccionFracionadoFiltro(filtro)
  .pipe(
    map((tracks) => {
      const array = tracks.data.map(({
        Inf_Gestion: {
          cli_identificacion,
          cli_nombres,
          ope_estado_contacta,
          ope_cod_credito,
          cartera,
          gest_fecha_gestion,
          gest_valor_comp,
          gest_fecha_prox_pago
        },
        direccion: {
          dir_completa,
          tipo: dir_tip_descripcion,
          dir_observacion,
          dir_referencia
        }
      }: any) => ({
        cli_identificacion,
        cli_nombres,
        dir_completa,
        dir_tip_descripcion,
        ope_estado_contacta,
        ope_cod_credito,
        cart_descripcion: cartera,
        gest_fecha_gestion,
        gest_valor_comp,
        dir_observacion,
        dir_referencia,
        gest_fecha_prox_pago
      }));

      const valor = { data: array };
      this.handleTracks(valor);
      this.DatosTemporalesBusqueda = tracks.data;

      this.loading = false;

      if (this.ListaResultado.length === 0) {
        this.alerta.NoExistenDatos();
      } else {
        this.ContadorDatosGeneral = this.ListaResultado.length;
        this.FraccionarValores(this.ListaResultado, this.ConstanteFraccion);
      }
    }),
    catchError((error) => {
      this.loading = false;
      this.alerta.ErrorAlRecuperarElementos();
      console.error('Error retrieving elements:', error); // Log the error for debugging
      return throwError(error); // Return the error observable
    })
  )
  .subscribe();

        }
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
  GetFiltrarElemento(datos:any) 
{
  console.log(datos)
  let aux: string[] = [];
  let aux2: string[] = [];
  let c=0;
  for (let key in datos) {
    if (datos.hasOwnProperty(key)) {
        if(datos[key]!='0' && key==='cartera'||datos[key]!='0'&&key==='contactabilidad')
        {
            const v:string=this.atributoBusqueda(key);
            const resultado = this.ListaResultado.filter((elemento) => {
              return elemento[v].includes(datos[key]);
            });
            this.FraccionarValores(resultado, this.ConstanteFraccion);
        }
       
      if ((datos[key] !== this.Fechas.fechaActualCorta() && key === 'fechapp_inicial') ||
        (datos[key] !== this.Fechas.fechaActualCorta() && key === 'fechapp_final') ||
        (datos[key] !== this.Fechas.fechaActualCorta() && key === 'fecha_inicial') ||
        (datos[key] !== this.Fechas.fechaActualCorta() && key === 'fecha_final'))
          {
            aux.push(key);
            aux2.push(datos[key]);
          }
    }
}
  
}
  atributoBusqueda(valor:string):string
  {
    let val!:string;
    if(valor==='cartera')
      {
        val='cart_descripcion';
      }
    if(valor==='contactabilidad')
      {
        val='ope_estado_contacta';
      }
    if(valor==='fechapp_inicial')
      {
        val='gest_fecha_prox_pago';
      }
    if(valor==='fechapp_final')
      {
        val='gest_fecha_prox_pago';
      }
    if(valor==='fecha_inicial')
      {
        val='gest_fecha_gestion';
      }
      if(valor==='fecha_final')
        {
          val='gest_fecha_gestion';
        }
    return val;
  }
  compareObjects(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  obtenerObjetosValidos(lista:any, cabecera:any):any[] {
    return lista.filter((obj:any) => {
        return cabecera.every((attr:any) => attr in obj);
    });
}
vaciarTodo()
{
  this.ListaDescargas=[];
  this.DatosTemporalesBusqueda=[];
  this.DatosTemporales=[];
  this.selecBase.patchValue('');
  this.onCleanSelect()
}
}
