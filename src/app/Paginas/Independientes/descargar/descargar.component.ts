import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Alertas } from 'src/app/Control/Alerts';
import { ApiService } from 'src/app/service/api.service';
import { Fechas } from 'src/app/Control/Fechas';
import { ResultadoCarteraI, ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs';
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
  ResetClienteForms() {
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
  Usuario: ResultadoGestorI = this.permisos.gestor;
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  ContadorDatosGeneral: number = 0;

  /****************************Obtener la pagina Actual */
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'descargar';
  }) as ResultadoMenuI;
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  /*****Formulario************************************** */
  DescargaForms = new FormGroup({
    seleccion_base: new FormControl(0, Validators.required),
    seleccion_entidad: new FormControl('', Validators.required)
  });

  ListarDatos(opcionLlamado:string) 
  {
    if (opcionLlamado === 'Base-General Telefono') {
      this.aux == opcionLlamado;
      this.banderaTelefono=true;
      this.banderaCorreo=false;
      this.banderaDireccion=false;
      console.log('Entro1');
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGeneralTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
            console.log("---------------------------------------------------------------------");
            this.DatosTemporalesBusqueda = tracks['data'];
            console.log("---------------------------------------------------------------------");
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
    if (opcionLlamado === 'Base-General Correo') {
      console.log('Entro2');
      this.banderaCorreo=true;
      this.banderaDireccion=false;
      this.banderaTelefono=false;
      this.aux == opcionLlamado;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGeneralCorreoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-General Direccion') {
      console.log('Entro3');
      this.aux == opcionLlamado;
      this.banderaDireccion=true;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGeneralDireccionFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Gestionada Telefono') {
      console.log('Entro4');
      this.banderaViewFiltro=true;
      this.aux == opcionLlamado;
      this.banderaBGestionadaTelefono=true;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.banderaBGestionadaDireccion=false;
      this.banderaBGestionadaCorreo=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGestionadaTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Gestionada Correo') {
      console.log('Entro5');
      this.aux == opcionLlamado;
      this.banderaViewFiltro=true;
      this.banderaBGestionadaCorreo=true;
      this.banderaBGestionadaTelefono=false;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.banderaBGestionadaDireccion=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGestionadaCorreoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Gestionada Direccion') {
      console.log('Entro6');
      this.banderaViewFiltro=true;
      this.aux == opcionLlamado;
      this.banderaBGestionadaDireccion=true;
      this.banderaBGestionadaCorreo=false;
      this.banderaBGestionadaTelefono=false;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseGestionadaDireccionFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Sin-Gestionar Telefono') {
      console.log('Entro7');
      this.aux == opcionLlamado;
      this.banderaBaseSinGestionarTelefono=true;
      this.banderaBGestionadaDireccion=false;
      this.banderaBGestionadaCorreo=false;
      this.banderaBGestionadaTelefono=false;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseSinGestionarTelefonoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Sin-Gestionar Correo') {
      console.log('Entro8');
      this.banderaBaseSinGestionarCorreo=true;
      this.banderaBaseSinGestionarTelefono=false;
      this.banderaBGestionadaDireccion=false;
      this.banderaBGestionadaCorreo=false;
      this.banderaBGestionadaTelefono=false;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseSinGestionarCorreoFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
    if (opcionLlamado === 'Base-Sin-Gestionar Direccion') {
      console.log('Entro9');
      this.banderaBaseSinGestionarDireccion=true;
      this.banderaBaseSinGestionarCorreo=false;
      this.banderaBaseSinGestionarTelefono=false;
      this.banderaBGestionadaDireccion=false;
      this.banderaBGestionadaCorreo=false;
      this.banderaBGestionadaTelefono=false;
      this.banderaCorreo=false;
      this.banderaTelefono=false;
      this.banderaTelefono=false;
      this.ListaResultado = [];
      this.api
        .GetDescargaBaseSinGestionarDireccionFracionado(this.FraccionDatos, this.RangoDatos)
        .pipe(
          map((tracks) => {
            this.ListaResultado = tracks['data'];
            this.Cabecera=this.getKeys(this.ListaResultado);
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
  seleccion()
  {
    this.valorAux1=this.DescargaForms.value.seleccion_base!.toString();
    this.valorAux2 =this.DescargaForms.value.seleccion_entidad!.toString();
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
 

  // ****************************************** PAGINACION *****************************************************************
  DatosCargaMasiva!: any[];
  DatosTemporales: any[] = [];
  ContadorDatos: number = 0;
  RangoPaginacion: number = 0;
  InicioPaginacion: number = 0;
  FinalPaginacion: number = 0;
  FraccionarValores(datos?: any, rango?: number ){
    console.log(datos);
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
        const resultado = this.ListaResultado.filter((elemento) => {
          return elemento.ges_nombres.includes(nombre.toUpperCase());
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
        const resultado = this.ListaResultado.filter((elemento) => {
          return elemento.ges_apellidos.includes(nombre.toUpperCase());
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
  getKeys(valor:any[]): string[] {
    if (this.ListaResultado.length > 0) { // Checks if ListaResultado array has elements
      return Object.keys(valor[0]); // Returns the keys of the first object in ListaResultado array
  }
  return []; // Returns an empty array if ListaResultado is empty
}
  descargarExcel(entidad:any) {
    console.log('entro');
    const valor:string=entidad['seleccion_entidad'];
    let array:any[]=[];
    if(valor==='Telefono')
      {
        array = this.ListaResultado.map((item: any) => ({
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
      if(valor==='Correo')
        {
          array = this.ListaResultado.map((item: any) => ({
            cli_identificacion: item['cli_identificacion'],
            cli_nombres: item['cli_nombres'],
            cor_email: item['cor_email'],
            corr_tip_descripcion: item['corr_tip_descripcion'],
            cli_estado_contacta: item['cli_estado_contacta'],
            ope_cod_credito: item['ope_cod_credito'],
            cor_descripcion: item['cor_descripcion']
          }));
        }
        if(valor==='Direccion')
          {
            array = this.ListaResultado.map((item: any) => ({
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
    
    const wb = XLSX.utils.book_new();
    // Agregar la lista de tipos de correo a una pestaña
    const wsTelefono = XLSX.utils.json_to_sheet(array);
    XLSX.utils.book_append_sheet(wb, wsTelefono, valor);
    // Agregar la lista de tipos de teléfono a otra pestaña
    // Escribir el archivo Excel
    XLSX.writeFile(wb, valor + '.xlsx');
  }
  buscarFiltro(dato:any)
  {
    this.ListaResultado=[];
    this.banderaBGestionadaTelefono=false;//agregar para no se duplique las filas y columnas
    this.banderaBGestionadaCorreo=false;
    this.banderaBGestionadaDireccion=false;
    this.DatosTemporalesBusqueda=[];
    this.Cabecera=[];
    this.DatosTemporales=[];
    console.log(this.valorBandera)
    let filtro:FiltroDescarga=
    {
      tipo:1,identificacion:(dato.identificacion.trim()===''?'0':dato.identificacion.trim())!,
      nombres_cliente:(dato.nombres_cliente.trim()===''?'0':dato.nombres_cliente.trim())!,
      cartera: dato.cartera == '0' ? 0 : Number(dato.cartera),
      estado_contactibilidad:(dato.estado_contactibilidad==='Todas'?'0':dato.estado_contactibilidad),
      fecha_inicial_gestion:dato.fecha_inicial_gestion,
      fecha_final_gestion:dato.fecha_final_gestion,
      fecha_inicial_pp:dato.fecha_inicial_pp,
      fecha_final_pp:dato.fecha_final_pp
    }
    if(this.valorBandera==='Base-Gestionada Telefono')
      {
        console.log('entro1')
        this.banderaBGestionadaTelefonoFiltro=true;
        const cabTelefono=['Cedula','Nombres','Telefono','Tipo','Detalle','Estado','Credito','Cartera','Fecha_Gestion','Valor','Fecha_Proximo_Pago'];
        this.Cabecera=cabTelefono;
        this.api.GetDescargaBaseGestionadaTelefonoFracionadoFiltro(filtro)
      .pipe(
        map((tracks) => {
          console.log(tracks['data']);
          this.ListaResultado = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
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
    if(this.valorBandera==='Base-Gestionada Correo')
      {
        console.log('entro2')
        this.banderaBGestionadaCorreoFiltro=true;
        const cabTelefono=['Cedula','Nombres','Email','Tipo','Observacion','Estado','Credito','Cartera','Fecha_Gestion','Valor','Fecha_Proximo_Pago'];
        this.Cabecera=cabTelefono;
      this.api.GetDescargaBaseGestionadaCorreoFracionadoFiltro(filtro)
        .pipe(
          map((tracks) => {
            console.log(tracks['data']);
            this.ListaResultado = tracks['data'];
            this.DatosTemporalesBusqueda = tracks['data'];
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
      if(this.valorBandera==='Base-Gestionada Direccion')
        {
          console.log('entro3')
          this.banderaBGestionadaDireccionFiltro=true;
          const cabTelefono=['Cedula','Nombres','Direccion','Tipo','Observacion','Estado','Credito','Cartera','Fecha_Gestion','Valor','Fecha_Proximo_Pago'];
          this.Cabecera=cabTelefono;
        this.api.GetDescargaBaseGestionadaDireccionFracionadoFiltro(filtro)
          .pipe(
            map((tracks) => {
              console.log(tracks['data']);
              this.ListaResultado = tracks['data'];
              this.DatosTemporalesBusqueda = tracks['data'];
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
}
