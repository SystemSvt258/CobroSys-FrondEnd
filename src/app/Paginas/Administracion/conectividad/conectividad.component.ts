import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, timeout } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { ConectividadI, generarPDF } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conectividad',
  templateUrl: './conectividad.component.html',
  styleUrls: ['./conectividad.component.css']
})
export class ConectividadComponent implements OnInit {
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
    return elemento.men_url === 'conectividad';
}) as ResultadoMenuI;


  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gConectividad!:generarPDF;


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
  ListaConectividad: ConectividadI[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaConectividad = [];
      this.FraccionDatos = 0;
    }

    this.ListaConectividad = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetConectividadFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaConectividad = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaConectividad)
            {
              let ocD: any = {
                id:tipoT.id_conectividad,
                Descripcion:tipoT.conec_descripcion,
                FIngreso:tipoT.conec_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.conec_fecha_in.toString()),
                Estado:tipoT.conec_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Conectividad', listado: listadoObjeto
            };
            this.gConectividad=om;
          if (this.ListaConectividad.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaConectividad.length;
            this.FraccionarValores(
              this.ListaConectividad,
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
    this.ListaConectividad = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetConectividadFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaConectividad = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const tipoT of this.ListaConectividad)
            {
              let ocD: any = {
                id:tipoT.id_conectividad,
                Descripcion:tipoT.conec_descripcion,
                FIngreso:tipoT.conec_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.conec_fecha_in.toString()),
                Estado:tipoT.conec_esactivo==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Conectividad', listado: listadoObjeto
            };
            this.gConectividad=om;
          if (this.ListaConectividad.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaConectividad.length;
            this.FraccionarValores(
              this.ListaConectividad,
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
  ConectividadForms = new FormGroup({
    id_conectividad: new FormControl( 0, Validators.required),
    conec_descripcion: new FormControl('', Validators.required),
    conec_fecha_act: new FormControl(this.Fechas.fecha()),
    conec_fecha_desact: new FormControl(this.Fechas.fecha()),
    conec_fecha_in: new FormControl(this.Fechas.fecha()),
    conec_fecha_up: new FormControl(this.Fechas.fecha()),
    conec_esactivo: new FormControl(true),
  });
  ResetConectividadForms() {
    this.ConectividadForms.reset({
      id_conectividad: 0,
      conec_descripcion: '',
      conec_fecha_act: this.Fechas.fecha(),
      conec_fecha_desact: this.Fechas.fecha(),
      conec_fecha_in: this.Fechas.fecha(),
      conec_fecha_up: this.Fechas.fecha(),
      conec_esactivo: true,
    });
  }
  ActDesControles(num:number){
    if(num === 0){ //inactivos
      this.ConectividadForms.get('id_conectividad')?.disable()
      this.ConectividadForms.get('conec_descripcion')?.disable()
      this.ConectividadForms.get('conec_fecha_act')?.disable()
      this.ConectividadForms.get('conec_fecha_desact')?.disable()
      this.ConectividadForms.get('conec_fecha_in')?.disable()
      this.ConectividadForms.get('conec_fecha_up')?.disable()
      this.ConectividadForms.get('conec_esactivo')?.disable()
    }
    if(num === 1){ //activos
      this.ConectividadForms.get('id_conectividad')?.enable()
      this.ConectividadForms.get('conec_descripcion')?.enable()
      this.ConectividadForms.get('conec_fecha_act')?.enable()
      this.ConectividadForms.get('conec_fecha_desact')?.enable()
      this.ConectividadForms.get('conec_fecha_in')?.enable()
      this.ConectividadForms.get('conec_fecha_up')?.enable()
      this.ConectividadForms.get('conec_esactivo')?.enable()
    }
    if(num === 2){ //edicion
      this.ConectividadForms.get('conec_descripcion')?.enable()
      this.ConectividadForms.get('conec_esactivo')?.enable()
  
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
    
    datos.conec_esactivo =
      datos.conec_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutConectividad(datos)
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
        .PostConectividad(datos)
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
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gConectividad);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gConectividad);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gConectividad);
    }
  }
  /************************************** EDITAR ELEMENTO  ******************************************************** */
  ActualizaEstado(elemento: ConectividadI) {
    elemento.conec_esactivo = (
      elemento.conec_esactivo == '1' ? 0 : 1
    ).toString();
    this.api.PutConectividad(elemento).subscribe((x) => this.ListarElementos(1));
  }
  EliminarElemento(elemento: ConectividadI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.conec_esactivo = '3';
        this.api.PutConectividad(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }
  CargarElemento(datos: any, num: number) {
    this.ConectividadForms.patchValue({
      id_conectividad: datos.id_conectividad,
      conec_descripcion: datos.conec_descripcion,
      conec_fecha_act: this.Fechas.fechaFormato(datos.conec_fecha_act),
      conec_fecha_desact: this.Fechas.fechaFormato(datos.conec_fecha_desact),
      conec_fecha_in: this.Fechas.fechaFormato(datos.conec_fecha_in),
      conec_fecha_up: this.Fechas.fechaFormato(datos.conec_fecha_up),
      conec_esactivo: datos.conec_esactivo === '1' ? true : false,
    });

    this.AgregarEditarElemento(num);
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.ResetConectividadForms();
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
        const resultado = this.ListaConectividad.filter((elemento) => {
          return elemento.conec_descripcion.includes(nombre.toUpperCase());
        });
        this.FraccionarValores(resultado, this.ConstanteFraccion);
        const o=resultado.map(c=>
          {
            return {
				id:c.id_conectividad,
                Descripcion:c.conec_descripcion,
                FIngreso:c.conec_fecha_in ===null?null:this.Fechas.fechaCortaAbt(c.conec_fecha_in.toString()),
                Estado:c.conec_esactivo==='1'?'ACTIVO':'INACTIVO'
            };
        });
        let om: generarPDF = {
          entidad: 'Conectividad', listado:o
        };
        this.gConectividad=om;
		
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
}
