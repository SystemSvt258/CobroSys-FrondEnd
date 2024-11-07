import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { ResultadoCarteraI, ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { CarteraI, generarPDF, RecargoI, Tipo_CorreoI, Tipo_RecargoI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-tipo-recargo',
  templateUrl: './tipo-recargo.component.html',
  styleUrls: ['./tipo-recargo.component.css']
})
export class TipoRecargoComponent implements OnInit{
  ngOnInit(): void {
    //this.ListarElementos(1);
  }
  constructor(
    private api: ApiService, 
    private alerta: Alertas, 
    public Fechas: Fechas,
    private cookeService: CookieService,public reporte:GeneradorReporte
    ) {}
 /**Cargar los permisos que tiene acceso */
 permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
 Usuario: ResultadoGestorI = this.permisos.gestor;  
 Menu: ResultadoMenuI[] = this.permisos.menu;  
 PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
   return elemento.men_url === 'tipo-recargo';
 }) as ResultadoMenuI;
 
 ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
 RangoDatos: number = Number(this.Usuario.usr_rango_datos);
 LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
 ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gTipoRecargo!:generarPDF;
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
 ListaTipoRecargo:Tipo_RecargoI[]=[];
 Cartera: ResultadoCarteraI[] = this.permisos.cartera;
 TodasCarteras: number[] = [];
 CarteraGestor: any[] = [];
 
 
 
 
 FraccionDatos: number = 0;
 ContadorDatosGeneral: number = 0;
 
 ListarTiposRecargosElementos(num: number) {
   this.GetBusquedaPor('');
   if (num === 1) {
     this.ListaTipoRecargo = [];
     this.FraccionDatos = 0;
   }
   this.ListaTipoRecargo = [];
   this.loading = true;
   let listadoObjeto:any[] = [];
   this.api
     .GetTipoRecargoFracionado(this.FraccionDatos, this.RangoDatos)
     .pipe(
       map((tracks) => {
        console.log(tracks['data']);
         this.ListaTipoRecargo = tracks['data'];
         this.DatosTemporalesBusqueda = tracks['data'];
         for (const tipoT of this.ListaTipoRecargo)
          {
            let ocD: any = {
              idTipo:tipoT.id_tipo_recargo,
              Descripcion:tipoT.rec_tip_descripcion,
              FIngreso:tipoT.rec_tip_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.rec_tip_fecha_in.toString()),
              Estado:tipoT.rec_tip_esactivo==='1'?'ACTIVO':'INACTIVO'
            };
            listadoObjeto.push(ocD);
          }
          let om: generarPDF = {
            entidad: 'tipoRecargo', listado: listadoObjeto
          };
          this.gTipoRecargo=om;
         if (this.ListaTipoRecargo.length === 0) {
           this.loading = false;
           this.alerta.NoExistenDatos();
         } else {
           this.loading = false;
           this.ContadorDatosGeneral = this.ListaTipoRecargo.length;
           this.FraccionarValores(
             this.ListaTipoRecargo,
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
   this.ListaTipoRecargo= [];
   this.loading = true;
 
   this.api
     .GetTipoRecargoFracionadoFiltro(valor, tipo)
     .pipe(
       map((tracks) => {
         this.ListaTipoRecargo = tracks['data'];
         this.DatosTemporalesBusqueda = tracks['data'];
         if (this.ListaTipoRecargo.length === 0) {
           this.loading = false;
           this.alerta.NoExistenDatos();
         } else {
           this.loading = false;
           this.ContadorDatosGeneral = this.ListaTipoRecargo.length;
           this.FraccionarValores(
             this.ListaTipoRecargo,
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
 TipoRecargoForms = new FormGroup({
  id_tipo_recargo: new FormControl( 0, Validators.required),
  rec_tip_descripcion: new FormControl('', Validators.required),
  rec_tip_fecha_act: new FormControl(this.Fechas.fecha()),
  rec_tip_fecha_desact: new FormControl(this.Fechas.fecha()),
  rec_tip_fecha_in: new FormControl(this.Fechas.fecha()),
  rec_tip_fecha_up: new FormControl(this.Fechas.fecha()),
  rec_tip_esactivo: new FormControl(true),
});
ResetTipoRecargoForms() {
  this.TipoRecargoForms.reset({
    id_tipo_recargo: 0,
    rec_tip_descripcion: '',
    rec_tip_fecha_act: this.Fechas.fecha(),
    rec_tip_fecha_desact: this.Fechas.fecha(),
    rec_tip_fecha_in: this.Fechas.fecha(),
    rec_tip_fecha_up: this.Fechas.fecha(),
    rec_tip_esactivo: true,
  });
}
 ActDesControles(num:number){
   if(num === 0){ //inactivos
     this.TipoRecargoForms.get('id_tipo_recargo')?.disable()
     this.TipoRecargoForms.get('rec_tip_descripcion')?.disable()
     this.TipoRecargoForms.get('rec_tip_fecha_act')?.disable()
     this.TipoRecargoForms.get('rec_tip_fecha_desact')?.disable()
     this.TipoRecargoForms.get('rec_tip_fecha_in')?.disable()
     this.TipoRecargoForms.get('rec_tip_fecha_up')?.disable()
     this.TipoRecargoForms.get('rec_tip_esactivo')?.disable()
   }
   if(num === 1){ //activos
     this.TipoRecargoForms.get('id_tipo_recargo')?.enable()
     this.TipoRecargoForms.get('rec_tip_descripcion')?.enable()
     this.TipoRecargoForms.get('rec_tip_fecha_act')?.enable()
     this.TipoRecargoForms.get('rec_tip_fecha_desact')?.enable()
     this.TipoRecargoForms.get('rec_tip_fecha_in')?.enable()
     this.TipoRecargoForms.get('rec_tip_fecha_up')?.enable()
     this.TipoRecargoForms.get('rec_tip_esactivo')?.enable()
   }
   if(num === 2){ //edicion
    this.TipoRecargoForms.get('rec_tip_descripcion')?.enable()
    this.TipoRecargoForms.get('rec_tip_esactivo')?.enable()
   }
 }
 
 AgregarEditarElemento(num: number) {
   console.log(num)
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
 GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gTipoRecargo);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gTipoRecargo);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gTipoRecargo);
    }
  }
 /*******************Tipo_Recargo*********************** */
 CerrarAgregarEditarElemento() {
     this.EncerarComponentes();
 }
 GuardarObjetoTipo(datos:any) { 
   datos.rec_tip_esactivo =
     datos.rec_tip_esactivo.toString() === 'true' ? '1' : '0';
   if (this.TituloFormulario === 'Editar') {
     for (const elemento of this.ListaTipoRecargo) 
       {
       if (elemento.id_tipo_recargo === datos['id_tipo_recargo']&& elemento.rec_tip_descripcion) {
         if (elemento.rec_tip_esactivo != datos['rec_tip_esactivo']) {
           this.api
             .PutTipoRecargo(datos)
             .pipe(
               map((tracks) => {
                 const exito = tracks['exito'];
                 if (exito == 1) {
                   this.CerrarAgregarEditarElemento();
                   this.EncerarComponentes();
                   this.TextoFiltro.patchValue('');
                   this.alerta.RegistroActualizado();
                   this.ListarTiposRecargosElementos(1);
                 }
                 else {
 
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
           this.alerta.ErrorEnLaPeticion('Los datos son identicos y se Matendra los datos recuperados de la BD');
           break; // Salir del bucle cuando se encuentra una coincidencia
         }
 
       }
   } 
   } else {
     console.log(datos)
     if(this.ListaTipoRecargo.length>0)
      {
        for (const elemento of this.ListaTipoRecargo) {
          console.log(elemento);
          if(elemento.rec_tip_descripcion===datos.rec_tip_descripcion&&elemento.rec_tip_esactivo!='3')
          {
            
          }else
          {
            this.alerta.ErrorEnLaPeticion('Se procedera a ingresar');
            this.api
              .PostTipoRecargo(datos)
              .pipe(
                map((tracks) => {
                  const exito = tracks['exito'];
                  if (exito == 1) {
                    this.CerrarAgregarEditarElemento();
                    this.EncerarComponentes();
                    this.TextoFiltro.patchValue('');
                    this.alerta.RegistroAgregado();
                    this.ListarTiposRecargosElementos(1);
                  }
                  else {
    
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
              break;
          }
        }
      }else{
        this.api
              .PostTipoRecargo(datos)
              .pipe(
                map((tracks) => {
                  const exito = tracks['exito'];
                  if (exito == 1) {
                    this.CerrarAgregarEditarElemento();
                    this.EncerarComponentes();
                    this.TextoFiltro.patchValue('');
                    this.alerta.RegistroAgregado();
                    this.ListarTiposRecargosElementos(1);
                  }
                  else {
    
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
 }
 /************************************** EDITAR ELEMENTO  ******************************************************** */
 ActualizaEstado(elemento: Tipo_RecargoI) {
   elemento.rec_tip_esactivo= (
     elemento.rec_tip_esactivo == '1' ? 0 : 1
   ).toString();
   this.api.PutTipoRecargo(elemento).subscribe((x) => this.ListarTiposRecargosElementos(1));
 }
 EliminarElemento(elemento:Tipo_RecargoI) {
   this.alerta.EliminarRegistro().then((confirmado) => {
     if (confirmado) {
       elemento.rec_tip_esactivo = '3';
       this.api.PutTipoRecargo(elemento).subscribe((x) => {
         this.ListarTiposRecargosElementos(1);
         this.alerta.RegistroEliminado();
       });
     }
   });
 }
 CargarElemento(datos: any, num: number) {
   this.TipoRecargoForms.patchValue({
    id_tipo_recargo: datos.id_tipo_recargo,
    rec_tip_descripcion: datos.rec_tip_descripcion,
    rec_tip_fecha_act: this.Fechas.fechaFormato(datos.rec_tip_fecha_act),
    rec_tip_fecha_desact: this.Fechas.fechaFormato(datos.rec_tip_fecha_desact),
    rec_tip_fecha_in: this.Fechas.fechaFormato(datos.rec_tip_fecha_in),
    rec_tip_fecha_up: this.Fechas.fechaFormato(datos.rec_tip_fecha_up),
    rec_tip_esactivo: datos.rec_tip_esactivo === '1' ? true : false,
   });
 
   this.AgregarEditarElemento(num);
 }
 
 // ****************************************** ENCERAR COMPONENTES *****************************************************************
 EncerarComponentes() {
   // this.UsuarioVista = null;
   this.ResetTipoRecargoForms();
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
     this.ListarTiposRecargosElementos(2);
   }
   this.InicioPaginacion = this.InicioPaginacion + this.RangoPaginacion;
   this.FinalPaginacion = this.FinalPaginacion + this.RangoPaginacion;
   this.FraccionarValores();
 }
 
 BtnPreviousUser(rango?: number) {
   if (rango != null) {
     this.FraccionDatos = this.FraccionDatos - this.RangoDatos;
     this.ListarTiposRecargosElementos(2);
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
       const resultado = this.ListaTipoRecargo.filter((elemento) => {
         return elemento.rec_tip_descripcion.includes(nombre.toUpperCase());
       });
       this.FraccionarValores(resultado, this.ConstanteFraccion);
       const o=resultado.map(tipoT=>
        {
          return {
      idTipo:tipoT.id_tipo_recargo,
            Descripcion:tipoT.rec_tip_descripcion,
            FIngreso:tipoT.rec_tip_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.rec_tip_fecha_in.toString()),
            Estado:tipoT.rec_tip_esactivo==='1'?'ACTIVO':'INACTIVO'
          };
      });
      let om: generarPDF = {
        entidad: 'tipoRecargo', listado:o
      };
      this.gTipoRecargo=om;
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
