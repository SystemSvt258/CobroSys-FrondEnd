import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { ResultadoCarteraI, ResultadoGestorI, ResultadoMenuI, ResultadoPermisosI } from 'src/app/Modelos/login.interface';
import { generarPDF, RecargoI,Tipo_RecargoI } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-recargo',
  templateUrl: './recargo.component.html',
  styleUrls: ['./recargo.component.css']
})
export class RecargoComponent implements OnInit{
  ngOnInit(): void {
    //this.ListarElementos(1);
    this.CarterasGestor();
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
  return elemento.men_url === 'recargo';
}) as ResultadoMenuI;

ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
RangoDatos: number = Number(this.Usuario.usr_rango_datos);
LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
carteraTipoPropia:boolean=true;

PaginaNombre: string = this.PaginaActual.men_descripcion;
loading: boolean = false;
ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gRecargo!:generarPDF;

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
ListaRecargo: RecargoI[] = [];
ListaTipoRecargo:Tipo_RecargoI[]=[];
Cartera: ResultadoCarteraI[] = this.permisos.cartera;
TodasCarteras: number[] = [];
CarteraGestor: any[] = [];

CarterasGestor() {
  for (let datos of this.Cartera) {
    let cartera: any = {
      cart_id: Number(datos.cart_id),
      cart_descripcion: datos.cart_descripcion,
      cart_tip_descripcion: datos.cart_tip_descripcion,
    }
    ;
    this.CarteraGestor.push(cartera);
    this.TodasCarteras.push(cartera.cart_id);
  }
}


FraccionDatos: number = 0;
ContadorDatosGeneral: number = 0;

ListarElementos(num: number) {
  this.GetBusquedaPor('');
  if (num === 1) {
    this.ListaRecargo = [];
    this.FraccionDatos = 0;
  }

  this.ListaRecargo = [];
  this.loading = true;
  let listadoObjeto:any[] = [];
  this.api
    .GetRecargasFracionado(this.FraccionDatos, this.RangoDatos)
    .pipe(
      map((tracks) => {
        this.ListaRecargo = tracks['data'];
        this.DatosTemporalesBusqueda = tracks['data'];
        for (const tipoT of this.ListaRecargo)
          {
            let ocD: any = {
              Descripcion:tipoT.rec_descripcion,
              Valor:tipoT.rec_valor,
              idCartera:tipoT.rec_id_cartera,
              FIngreso:tipoT.rec_fecha_in ===null?null:this.Fechas.fechaCortaAbt(tipoT.rec_fecha_in.toString()),
              Estado:tipoT.rec_esactivo==='1'?'ACTIVO':'INACTIVO'
            };
            listadoObjeto.push(ocD);
          }
          let om: generarPDF = {
            entidad: 'Recargo', listado: listadoObjeto
          };
          this.gRecargo=om;
        if (this.ListaRecargo.length === 0) {
          this.loading = false;
          this.alerta.NoExistenDatos();
        } else {
          this.loading = false;
          this.ContadorDatosGeneral = this.ListaRecargo.length;
          this.FraccionarValores(
            this.ListaRecargo,
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
  this.ListaRecargo = [];
  this.loading = true;
  let listadoObjeto:any[] = [];
  this.api
    .GetRecargasFracionadoFiltro(valor, tipo)
    .pipe(
      map((tracks) => {
        this.ListaRecargo = tracks['data'];
        this.DatosTemporalesBusqueda = tracks['data'];
        console.log();
        if (this.ListaRecargo.length === 0) {
          this.loading = false;
          this.alerta.NoExistenDatos();
        } else {
          this.loading = false;
          this.ContadorDatosGeneral = this.ListaRecargo.length;
          this.FraccionarValores(
            this.ListaRecargo,
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
TipoCorreoForms = new FormGroup({
  id_recarga: new FormControl( 0, Validators.required),
  rec_descripcion: new FormControl('', Validators.required),
  rec_valor: new FormControl('', Validators.required),
  rec_id_cartera:new FormControl(0, Validators.required),
  rec_fecha_act: new FormControl(this.Fechas.fecha()),
  rec_fecha_desact: new FormControl(this.Fechas.fecha()),
  rec_fecha_in: new FormControl(this.Fechas.fecha()),
  rec_fecha_up: new FormControl(this.Fechas.fecha()),
  rec_esactivo: new FormControl(true),
});
ResetTipoCorreoForms() {
  this.TipoCorreoForms.reset({
    id_recarga: 0,
    rec_descripcion: '',
    rec_valor: '',
    rec_id_cartera:0,
    rec_fecha_act: this.Fechas.fecha(),
    rec_fecha_desact: this.Fechas.fecha(),
    rec_fecha_in: this.Fechas.fecha(),
    rec_fecha_up: this.Fechas.fecha(),
    rec_esactivo: true,
  });
}
ActDesControles(num:number){
  if(num === 0){ //inactivos
    this.TipoCorreoForms.get('id_recarga')?.disable()
    this.TipoCorreoForms.get('rec_descripcion')?.disable()
    this.TipoCorreoForms.get('rec_valor')?.disable()
    this.TipoCorreoForms.get('rec_id_cartera')?.disable()
    this.TipoCorreoForms.get('rec_fecha_act')?.disable()
    this.TipoCorreoForms.get('rec_fecha_desact')?.disable()
    this.TipoCorreoForms.get('rec_fecha_in')?.disable()
    this.TipoCorreoForms.get('rec_fecha_up')?.disable()
    this.TipoCorreoForms.get('rec_esactivo')?.disable()
  }
  if(num === 1){ //activos
    this.TipoCorreoForms.get('id_recarga')?.enable()
    this.TipoCorreoForms.get('rec_descripcion')?.enable()
    this.TipoCorreoForms.get('rec_valor')?.enable()
    this.TipoCorreoForms.get('rec_id_cartera')?.enable()
    this.TipoCorreoForms.get('rec_fecha_act')?.enable()
    this.TipoCorreoForms.get('rec_fecha_desact')?.enable()
    this.TipoCorreoForms.get('rec_fecha_in')?.enable()
    this.TipoCorreoForms.get('rec_fecha_up')?.enable()
    this.TipoCorreoForms.get('rec_esactivo')?.enable()
  }
  if(num === 2){ //edicion
    this.TipoCorreoForms.get('rec_descripcion')?.enable()
    this.TipoCorreoForms.get('rec_valor')?.enable()
    this.TipoCorreoForms.get('rec_id_cartera')?.enable()
    this.TipoCorreoForms.get('rec_esactivo')?.enable()
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
Lista: Tipo_RecargoI[] = [];
/*******************Tipo_Recargo*********************** */


/**************************************************** */
CerrarAgregarEditarElemento() {
    this.EncerarComponentes();
}

GuardarObjeto(datos:any) { 
  datos.rec_id_cartera=Number(datos.rec_id_cartera);
      datos.rec_esactivo =
        datos.rec_esactivo.toString() === 'true' ? '1' : '0';
      if (this.TituloFormulario === 'Editar') {
        for (const elemento of this.ListaRecargo) {
          if (elemento.id_recarga === datos['id_recarga'] && elemento.rec_descripcion === datos.rec_descripcion && elemento.rec_valor === datos.rec_valor) {
            if (elemento.rec_esactivo != datos['rec_esactivo']) {
              this.api
                .PutRecarga(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.CerrarAgregarEditarElemento();
                      this.EncerarComponentes();
                      this.TextoFiltro.patchValue('');
                      this.alerta.RegistroActualizado();
                      this.ListarElementos(1);
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
        if (this.ListaRecargo.length > 0) {
          for (const elemento of this.ListaRecargo) {
            if (elemento.rec_descripcion === datos.rec_descripcion && elemento.rec_valor === datos.rec_valor && elemento.rec_esactivo != '3') {
            } else {
              this.alerta.ErrorEnLaPeticion('Se procedera a ingresar');
              this.api
                .PostRecarga(datos)
                .pipe(
                  map((tracks) => {
                    const exito = tracks['exito'];
                    if (exito == 1) {
                      this.CerrarAgregarEditarElemento();
                      this.EncerarComponentes();
                      this.TextoFiltro.patchValue('');
                      this.alerta.RegistroAgregado();
                      this.ListarElementos(1);
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

        } else {
          this.api
            .PostRecarga(datos)
            .pipe(
              map((tracks) => {
                const exito = tracks['exito'];
                if (exito == 1) {
                  this.CerrarAgregarEditarElemento();
                  this.EncerarComponentes();
                  this.TextoFiltro.patchValue('');
                  this.alerta.RegistroAgregado();
                  this.ListarElementos(1);
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
activarCarteraPropia(valor:any)
{
  const idcartera:number=Number(valor.rec_id_cartera);
  let tipo: any = this.CarteraGestor.filter(elemento => {
    return elemento['cart_id'] === idcartera && elemento['cart_tip_descripcion'] === 'PROPIA';
});
if(tipo.length===0){
  this.alerta.ErrorEnLaPeticion('Seleccione otra Cartera que sea de Tipo Propia');
  this.carteraTipoPropia=true;
}else{
  this.alerta.ExitoEnLaPeticion('La opcion seleccionada si es de tipo de cartera Propia');
  this.carteraTipoPropia=false;
}
}

/************************************** EDITAR ELEMENTO  ******************************************************** */
ActualizaEstado(elemento: RecargoI) {
  elemento.rec_esactivo = (
    elemento.rec_esactivo == '1' ? 0 : 1
  ).toString();
  this.api.PutRecarga(elemento).subscribe((x) => this.ListarElementos(1));
}
EliminarElemento(elemento:RecargoI) {
  this.alerta.EliminarRegistro().then((confirmado) => {
    if (confirmado) {
      elemento.rec_esactivo = '3';
      this.api.PutRecarga(elemento).subscribe((x) => {
        this.ListarElementos(1);
        this.alerta.RegistroEliminado();
      });
    }
  });
}
CargarElemento(datos: any, num: number) {
  this.TipoCorreoForms.patchValue({
    id_recarga: datos.id_recarga,
    rec_descripcion: datos.rec_descripcion,
    rec_valor: datos.rec_valor,
    rec_id_cartera:datos.rec_id_cartera,
    rec_fecha_act: this.Fechas.fechaFormato(datos.rec_fecha_act),
    rec_fecha_desact: this.Fechas.fechaFormato(datos.rec_fecha_desact),
    rec_fecha_in: this.Fechas.fechaFormato(datos.rec_fecha_in),
    rec_fecha_up: this.Fechas.fechaFormato(datos.rec_fecha_up),
    rec_esactivo: datos.rec_esactivo === '1' ? true : false,
  });

  this.AgregarEditarElemento(num);
}

// ****************************************** ENCERAR COMPONENTES *****************************************************************
EncerarComponentes() {
  // this.UsuarioVista = null;
  this.ResetTipoCorreoForms();
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
  this.carteraTipoPropia=true;
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
      const resultado = this.ListaRecargo.filter((elemento) => {
        return elemento.rec_descripcion.includes(nombre.toUpperCase());
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
Listar()
{
  this.ListaTipoRecargo = [];
    this.api
      .GetTipoRecargoFracionado(0, 0)
      .pipe(
        map((tracks) => {
          this.ListaTipoRecargo = tracks['data'];
        }),
        catchError((error) => {
          this.loading = false;
          this.alerta.ErrorAlRecuperarElementos();
          throw new Error(error);
        })
      )
      .subscribe();
}
GetDescargaPor(val:string)
{
  if(val==='PDF')
  {
    this.reporte.generarPDF(this.gRecargo);
  }
  if(val==='EXCEL')
  {
    this.reporte.generarExcel(this.gRecargo);
  }
  if(val==='CSV')
  {
    this.reporte.generarCSV(this.gRecargo);
  }
}
}
