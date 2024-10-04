import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, timeout } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { ContactabilidadI, generarPDF } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contactabilidad',
  templateUrl: './contactabilidad.component.html',
  styleUrls: ['./contactabilidad.component.css']
})
export class ContactabilidadComponent implements OnInit {
  constructor(
    private api: ApiService, 
    private alerta: Alertas, 
    public Fechas: Fechas,
    private cookeService: CookieService,public reporte:GeneradorReporte
    ) {}
  ngOnInit(): void {
    this.ListarElementos(1);
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;  
  Menu: ResultadoMenuI[] = this.permisos.menu;  
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'contactabilidad';
}) as ResultadoMenuI;


  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gContactabilidad!:generarPDF;


  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;

  // ****************************************** CONTROLES DE BUSQUEDA *****************************************************************
  ParametrosDeBusqueda: Array<string> = [
    '',
    'Descripción',
    'Descripción Incompleta',
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
      this.txtBusqueda.patchValue(
        this.txtBusqueda.value!.toUpperCase()
      );
  }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaContactabilidad: ContactabilidadI[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaContactabilidad = [];
      this.FraccionDatos = 0;
    }

    this.ListaContactabilidad = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetContactabilidadFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaContactabilidad = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaContactabilidad)
            {
              let ocD: any = {
                id:tipoT.id_contactabilidad,
                Descripcion:tipoT.contac_descripcion,
                FIngreso:tipoT.contac_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.contac_fecha_in.toString()),
                Estado:tipoT.contac_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Contactabilidad', listado: listadoObjeto
            };
            this.gContactabilidad=om;
          if (this.ListaContactabilidad.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaContactabilidad.length;
            this.FraccionarValores(
              this.ListaContactabilidad,
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
    if (this.itemBusqueda.value === 'Descripción') {
      tipo = 1;
      this.GetFiltrarElemento(valor, tipo);
    }
    if (this.itemBusqueda.value === 'Descripción Incompleta') {
      tipo = 3;
      this.GetFiltrarElemento(valor, tipo);
    }
  }

  GetFiltrarElemento(valor: string, tipo: number){
    this.ListaContactabilidad = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetContactabilidadFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaContactabilidad = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaContactabilidad)
            {
              let ocD: any = {
                id:tipoT.id_contactabilidad,
                Descripcion:tipoT.contac_descripcion,
                FIngreso:tipoT.contac_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.contac_fecha_in.toString()),
                Estado:tipoT.contac_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Contactabilidad', listado: listadoObjeto
            };
            this.gContactabilidad=om;
          if (this.ListaContactabilidad.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaContactabilidad.length;
            this.FraccionarValores(
              this.ListaContactabilidad,
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
  ContactabilidadForms = new FormGroup({
    id_contactabilidad: new FormControl( 0, Validators.required),
    contac_descripcion: new FormControl('', Validators.required),
    contac_fecha_act: new FormControl(this.Fechas.fecha()),
    contac_fecha_desact: new FormControl(this.Fechas.fecha()),
    contac_fecha_in: new FormControl(this.Fechas.fecha()),
    contac_fecha_up: new FormControl(this.Fechas.fecha()),
    contac_esactivo: new FormControl(true),
  });
  ResetContactabilidadForms() {
    this.ContactabilidadForms.reset({
      id_contactabilidad: 0,
      contac_descripcion: '',
      contac_fecha_act: this.Fechas.fecha(),
      contac_fecha_desact: this.Fechas.fecha(),
      contac_fecha_in: this.Fechas.fecha(),
      contac_fecha_up: this.Fechas.fecha(),
      contac_esactivo: true,
    });
  }
  ActDesControles(num:number){
    if(num === 0){ //inactivos
      this.ContactabilidadForms.get('id_contactabilidad')?.disable()
      this.ContactabilidadForms.get('contac_descripcion')?.disable()
      this.ContactabilidadForms.get('contac_fecha_act')?.disable()
      this.ContactabilidadForms.get('contac_fecha_desact')?.disable()
      this.ContactabilidadForms.get('contac_fecha_in')?.disable()
      this.ContactabilidadForms.get('contac_fecha_up')?.disable()
      this.ContactabilidadForms.get('contac_esactivo')?.disable()
    }
    if(num === 1){ //activos
      this.ContactabilidadForms.get('id_contactabilidad')?.enable()
      this.ContactabilidadForms.get('contac_descripcion')?.enable()
      this.ContactabilidadForms.get('contac_fecha_act')?.enable()
      this.ContactabilidadForms.get('contac_fecha_desact')?.enable()
      this.ContactabilidadForms.get('contac_fecha_in')?.enable()
      this.ContactabilidadForms.get('contac_fecha_up')?.enable()
      this.ContactabilidadForms.get('contac_esactivo')?.enable()
    }
    if(num === 2){ //edicion
      this.ContactabilidadForms.get('contac_descripcion')?.enable()
      this.ContactabilidadForms.get('contac_esactivo')?.enable()
  
    }

    
  }

  AgregarEditarElemento(num: number) {
    if (num === 1) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Agregar';
      this.ActDesControles(2)
    }
    if (num === 2) {
      this.ActDesControles(0);
      this.TituloFormulario = 'Editar';
      this.ActDesControles(2)
      
    }
    if (num === 3) {
      this.TituloFormulario = 'Visualizar';
      this.ActDesControles(0)
    }
   
  }

  CerrarAgregarEditarElemento() {
      this.EncerarComponentes();
  }

  GuardarObjeto(datos:any) {
    
    datos.contac_esactivo =
      datos.contac_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutContactabilidad(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if(exito == 1){
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroActualizado();
            }
            else{
              
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
        .PostContactabilidad(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if(exito == 1){
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
              this.alerta.RegistroAgregado();
            }
            else{
              
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
  ActualizaEstado(elemento: ContactabilidadI) {
    elemento.contac_esactivo = (
      elemento.contac_esactivo == '1' ? 0 : 1
    ).toString();
    this.api.PutContactabilidad(elemento).subscribe((x) => this.ListarElementos(1));
  }
  EliminarElemento(elemento: ContactabilidadI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.contac_esactivo = '3';
        this.api.PutContactabilidad(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  CargarElemento(datos: any, num: number) {
    this.ContactabilidadForms.patchValue({
      id_contactabilidad: datos.id_contactabilidad,
      contac_descripcion: datos.contac_descripcion,
      contac_fecha_act: this.Fechas.fechaFormato(datos.contac_fecha_act),
      contac_fecha_desact: this.Fechas.fechaFormato(datos.contac_fecha_desact),
      contac_fecha_in: this.Fechas.fechaFormato(datos.contac_fecha_in),
      contac_fecha_up: this.Fechas.fechaFormato(datos.contac_fecha_up),
      contac_esactivo: datos.contac_esactivo === '1' ? true : false,
    });

    this.AgregarEditarElemento(num);
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.ResetContactabilidadForms();
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
    if (this.FirltroPor === 'Descripcion') {
      let nombre = this.TextoFiltro.value!;
      if (num === 0) {
        const resultado = this.ListaContactabilidad.filter((elemento) => {
          return elemento.contac_descripcion.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(resultado, this.ConstanteFraccion);
      }

      if (contador != 0) {
        ThDescripcion.style.color = 'red';
      } else {
        ThDescripcion.style.color = '';
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
    ThDescripcion.style.color = '';
    inputElement.disabled = true;
    this.FirltroPor = '';
    this.TextoFiltro.patchValue('');
    this.FraccionarValores(
      this.DatosTemporalesBusqueda,
      this.ConstanteFraccion
    );
  }
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gContactabilidad);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gContactabilidad);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gContactabilidad);
    }
  }
}
