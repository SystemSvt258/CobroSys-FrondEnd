import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { GeneradorReporte } from 'src/app/Control/GeneradoReporte';
import { TipoDeTexto } from 'src/app/Control/TipoDeTexto';
import {
  ResultadoGestorI,
  ResultadoMenuI,
  ResultadoPermisosI,
} from 'src/app/Modelos/login.interface';
import { CuentaI, generarPDF } from 'src/app/Modelos/response.interface';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css'],
})
export class CuentaComponent implements OnInit {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public Fechas: Fechas,
    private cookeService: CookieService,
    public validar: TipoDeTexto,public reporte:GeneradorReporte
  ) {}

  ngOnInit(): void {
    this.ListarElementos(1);
  }

  permisos: ResultadoPermisosI = JSON.parse(localStorage.getItem('usuario')!);
  Usuario: ResultadoGestorI = this.permisos.gestor;
  Menu: ResultadoMenuI[] = this.permisos.menu;
  PaginaActual: ResultadoMenuI = this.Menu.find((elemento) => {
    return elemento.men_url === 'cuenta';
  }) as ResultadoMenuI;
  ConstanteFraccion: number = Number(this.Usuario.usr_fraccion_datos);
  RangoDatos: number = Number(this.Usuario.usr_rango_datos);
  LecturaEscritura: number = Number(this.PaginaActual.men_lectura);
  PaginaNombre: string = this.PaginaActual.men_descripcion;
  loading: boolean = false;
  ParametrosDeDescarga: Array<string> = ['PDF', 'EXCEL', 'CSV'];
  gCuenta!:generarPDF;

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
    this.txtBusqueda.patchValue(this.txtBusqueda.value!.toUpperCase());
  }
  // ****************************************** LISTAR ELEMENTOS *****************************************************************
  ListaCuentas: CuentaI[] = [];
  FraccionDatos: number = 0;
  ContadorDatosGeneral: number = 0;

  ListarElementos(num: number) {
    this.GetBusquedaPor('');
    if (num === 1) {
      this.ListaCuentas = [];
      this.FraccionDatos = 0;
    }

    this.ListaCuentas = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetCuentasFracionado(this.FraccionDatos, this.RangoDatos)
      .pipe(
        map((tracks) => {
          this.ListaCuentas = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const c of this.ListaCuentas)
            {
              let ocD: any = {
                Nombre:c['cuent_nombre'],
                Entidad:c['cuent_entidadfinanciera'],
                Numero:c['cuent_numero'],
                Fecha:c['cuent_fecha_in'] ===null?null:this.Fechas.fechaCortaAbt(c['cuent_fecha_in'].toString()),
                Estado:c['cuent_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cuenta', listado: listadoObjeto
            };
            this.gCuenta=om;
          if (this.ListaCuentas.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCuentas.length;
            this.FraccionarValores(this.ListaCuentas, this.ConstanteFraccion);
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

  GetFiltrarElemento(valor: string, tipo: number) {
    this.ListaCuentas = [];
    this.loading = true;
    let listadoObjeto:any[] = [];
    this.api
      .GetCuentasFracionadoFiltro(valor, tipo)
      .pipe(
        map((tracks) => {
          this.ListaCuentas = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          this.DatosTemporalesBusqueda = tracks['data'];
          for (const c of this.ListaCuentas)
            {
              let ocD: any = {
                Nombre:c['cuent_nombre'],
                Entidad:c['cuent_entidadfinanciera'],
                Numero:c['cuent_numero'],
                Fecha:c['cuent_fecha_in'] ===null?null:this.Fechas.fechaCortaAbt(c['cuent_fecha_in'].toString()),
                Estado:c['cuent_esactivo']==='1'?'ACTIVO':'INACTIVO'
              };
              listadoObjeto.push(ocD);
            }
            let om: generarPDF = {
              entidad: 'Cuenta', listado: listadoObjeto
            };
            this.gCuenta=om;
          if (this.ListaCuentas.length === 0) {
            this.loading = false;
            this.alerta.NoExistenDatos();
          } else {
            this.loading = false;
            this.ContadorDatosGeneral = this.ListaCuentas.length;
            this.FraccionarValores(this.ListaCuentas, this.ConstanteFraccion);
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

  CuentaForms = new FormGroup({
    id_cuenta: new FormControl(0, [Validators.required]),
    cuent_nombre: new FormControl('', Validators.required),
    cuent_numero: new FormControl('', [Validators.required,this.validar.VFN_SoloNumeros()]),
    cuent_entidadfinanciera: new FormControl('', Validators.required),
    cuent_fecha_act: new FormControl(this.Fechas.fecha()),
    cuent_fecha_desact: new FormControl(this.Fechas.fecha()),
    cuent_fecha_in: new FormControl(this.Fechas.fecha()),
    cuent_fecha_up: new FormControl(this.Fechas.fecha()),
    cuent_esactivo: new FormControl(true),
  });

  ResetCuentaForms() {
    this.CuentaForms.reset({
      id_cuenta: 0,
      cuent_nombre: '',
      cuent_numero: '',
      cuent_entidadfinanciera: '',
      cuent_fecha_act: this.Fechas.fecha(),
      cuent_fecha_desact: this.Fechas.fecha(),
      cuent_fecha_in: this.Fechas.fecha(),
      cuent_fecha_up: this.Fechas.fecha(),
      cuent_esactivo: true,
    });
  }

  ActDesControles(num: number) {
    if (num === 0) {
      //inactivos
      this.CuentaForms.get('id_cuenta')?.disable();
      this.CuentaForms.get('cuent_nombre')?.disable();
      this.CuentaForms.get('cuent_numero')?.disable();
      this.CuentaForms.get('cuent_entidadfinanciera')?.disable();
      this.CuentaForms.get('cuent_fecha_act')?.disable();
      this.CuentaForms.get('cuent_fecha_desact')?.disable();
      this.CuentaForms.get('cuent_fecha_in')?.disable();
      this.CuentaForms.get('cuent_fecha_up')?.disable();
      this.CuentaForms.get('cuent_esactivo')?.disable();
    }
    if (num === 1) {
      //activos
      this.CuentaForms.get('id_cuenta')?.enable();
      this.CuentaForms.get('cuent_nombre')?.enable();
      this.CuentaForms.get('cuent_numero')?.enable();
      this.CuentaForms.get('cuent_entidadfinanciera')?.enable();
      this.CuentaForms.get('cuent_fecha_act')?.enable();
      this.CuentaForms.get('cuent_fecha_desact')?.enable();
      this.CuentaForms.get('cuent_fecha_in')?.enable();
      this.CuentaForms.get('cuent_fecha_up')?.enable();
      this.CuentaForms.get('cuent_esactivo')?.enable();
    }
    if (num === 2) {
      //edicion')?.enable()
      this.CuentaForms.get('cuent_nombre')?.enable();
      this.CuentaForms.get('cuent_numero')?.enable();
      this.CuentaForms.get('cuent_entidadfinanciera')?.enable();
      this.CuentaForms.get('cuent_esactivo')?.enable();
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
    datos.id_cuenta = Number(datos.id_cuenta);
    datos.cuent_esactivo =
      datos.cuent_esactivo.toString() === 'true' ? '1' : '0';
    if (this.TituloFormulario === 'Editar') {
      this.api
        .PutCuentas(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
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
      this.api
        .PostCuentas(datos)
        .pipe(
          map((tracks) => {
            const exito = tracks['exito'];
            if (exito == 1) {
              this.ListarElementos(1);
              this.CerrarAgregarEditarElemento();
              this.EncerarComponentes();
              this.TextoFiltro.patchValue('');
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
  }

  /************************************** EDITAR ELEMENTO  ******************************************************** */
  ActualizaEstado(elemento: CuentaI) {
    elemento.cuent_entidadfinanciera = (
      elemento.cuent_entidadfinanciera == '1' ? 0 : 1
    ).toString();
    elemento.cuent_esactivo = (
      elemento.cuent_esactivo == '1' ? 0 : 1
    ).toString();
    this.api.PutCuentas(elemento).subscribe((x) => this.ListarElementos(1));
  }

  EliminarElemento(elemento: CuentaI) {
    this.alerta.EliminarRegistro().then((confirmado) => {
      if (confirmado) {
        elemento.cuent_esactivo = '3';
        this.api.PutCuentas(elemento).subscribe((x) => {
          this.ListarElementos(1);
          this.alerta.RegistroEliminado();
        });
      }
    });
  }

  CargarElemento(datos: any, num: number) {
    this.CuentaForms.patchValue({
      id_cuenta: datos.id_cuenta.toString(),
      cuent_nombre: datos.cuent_nombre,
      cuent_numero: datos.cuent_numero,
      cuent_entidadfinanciera: datos.cuent_entidadfinanciera,
      cuent_fecha_act: this.Fechas.fechaFormato(datos.cuent_fecha_act),
      cuent_fecha_desact: this.Fechas.fechaFormato(datos.cuent_fecha_desact),
      cuent_fecha_in: this.Fechas.fechaFormato(datos.cuent_fecha_in),
      cuent_fecha_up: this.Fechas.fechaFormato(datos.cuent_fecha_up),
      cuent_esactivo: datos.cuent_esactivo === '1' ? true : false,
    });

    this.AgregarEditarElemento(num);
  }

  // ****************************************** ENCERAR COMPONENTES *****************************************************************
  EncerarComponentes() {
    // this.UsuarioVista = null;
    this.ResetCuentaForms();
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
        const resultado = this.ListaCuentas.filter((elemento) => {
          return elemento.cuent_nombre.includes(nombre.toUpperCase());
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
        const resultado = this.ListaCuentas.filter((elemento) => {
          return elemento.cuent_numero.includes(nombre.toUpperCase());
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
  GetDescargaPor(val:string)
  {
    if(val==='PDF')
    {
      this.reporte.generarPDF(this.gCuenta);
    }
    if(val==='EXCEL')
    {
      this.reporte.generarExcel(this.gCuenta);
    }
    if(val==='CSV')
    {
      this.reporte.generarCSV(this.gCuenta);
    }
  }
}
