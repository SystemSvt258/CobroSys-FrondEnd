import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listenToTriggers } from 'ngx-bootstrap/utils';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs';
import { Alertas } from 'src/app/Control/Alerts';
import { Fechas } from 'src/app/Control/Fechas';
import { ApiService } from 'src/app/service/api.service';
import { of, Observable } from 'rxjs';
import { cargaMasiva } from '../Modelos/response.interface';

@Injectable({
  providedIn: 'root',
})
export class CargaMasiva {
  constructor(
    private api: ApiService,
    private alerta: Alertas,
    public fechas: Fechas,
    private cookeService: CookieService
  ) {}

  ValoresPorDefecto(tipo: number): Array<any> {
    let defecto: Array<any>;

    switch (tipo) {
      case 1:
        defecto = [
          {
            id_cliente_gestor_cartera: 0,
            id_carter: 0,
            cli_identificacion: '0101020304',
            id_gestor: 0,
            cgc_observacion: 'Asignacion actual',
            cgc_gestor_in: '',
            cgc_gestor_up: '',
            cgc_gestor_rem: '',
            cgc_gestor_act: '',
            cgc_gestor_desact: '',
            cgc_fecha_act: '',
            cgc_fecha_desact: '',
            cgc_fecha_in: '',
            cgc_fecha_up: '',
            cgc_esactivo: '1',
            cgc_baseactual: '1',
          },
        ];
        break;
      case 2:
        defecto = [
          {
            id_cartera: 0,
            id_tipo_cartera: 0,
            cart_descripcion: 'Descripción',
            cart_observacion: 'Observación adicional',
            cart_fecha_act: this.fechas.fechaActualCorta(),
            cart_fecha_desact: this.fechas.fechaActualCorta(),
            cart_fecha_in: this.fechas.fechaActualCorta(),
            cart_fecha_up: this.fechas.fechaActualCorta(),
            cart_esactivo: '1',
          },
        ];
        break;
      case 3:
        defecto = [
          {
            id_cliente: 0,
            cli_identificacion: '0101020304',
            cli_nombres: 'JUAN PEREZ',
            cli_tipo_identificacion: 0,
            cli_genero: 'M',
            cli_estado_civil: '',
            cli_ocupacion: 'Ocupación',
            cli_sit_laboral: 'Situación laboral',
            cli_fecha_nacimiento: '12/07/1969',
            cli_id_prioridad: '',
            cli_fecha_prioridad: '',
            cli_certificado: '',
            cli_certificado_entregado: '',
            cli_certificado_url: '',
            cli_score: '',
            cli_fallecido: '',
            cli_fecha_fallecido: '',
            cli_observacion: 'Observación adicional',
            cli_carteras: '',
            cli_provincia: '',
            cli_canton: '',
            cli_parroquia: '',
            cli_trabajo: '',
            cli_vehiculo: '',
            cli_ruc: '',
            cli_fecha_act: this.fechas.fechaActualCorta(),
            cli_fecha_desact: this.fechas.fechaActualCorta(),
            cli_fecha_in: this.fechas.fechaActualCorta(),
            cli_fecha_up: this.fechas.fechaActualCorta(),
            cli_esactivo: '1',
            cli_estado_contacta: '',
            cli_id_ultima_gestion: '',
            cli_fecha_ultima_gest: '',
            cli_fecha_ultimo_pago: '',
            cli_fecha_asignacion: '',
            cli_baseactual: '1',
            cli_origendatos: 'Carga del sistema',
          },
        ];
        break;
      case 4:
        defecto = [
          {
            id_conectividad: 0,
            conec_descripcion: 'Descripción',
            conec_fecha_act: this.fechas.fechaActualCorta(),
            conec_fecha_desact: this.fechas.fechaActualCorta(),
            conec_fecha_in: this.fechas.fechaActualCorta(),
            conec_fecha_up: this.fechas.fechaActualCorta(),
            conec_esactivo: '1',
          },
        ];
        break;
      case 5:
        defecto = [
          {
            id_contactabilidad: 0,
            contac_descripcion: 'Descripción',
            contac_fecha_act: this.fechas.fechaActualCorta(),
            contac_fecha_desact: this.fechas.fechaActualCorta(),
            contac_fecha_in: this.fechas.fechaActualCorta(),
            contac_fecha_up: this.fechas.fechaActualCorta(),
            contac_esactivo: '1',
          },
        ];
        break;
      case 6:
        defecto = [
          {
            id_correo: 0,
            cli_identificacion: '0101020304',
            cor_descripcion: 'Descripción',
            cor_email: 'ejemplo@dominio.com',
            cor_fecha_act: this.fechas.fechaActualCorta(),
            cor_fecha_desact: this.fechas.fechaActualCorta(),
            cor_fecha_in: this.fechas.fechaActualCorta(),
            cor_fecha_up: this.fechas.fechaActualCorta(),
            cor_esactivo: '1',
            cor_id_tipo_correo: '1',
            cor_origendatos: 'Carga del sistema',
          },
        ];
        break;
      case 7:
        defecto = [
          {
            id_cxc_operacion: 0,
            ope_cod_credito: 'COD01credito',
            cli_identificacion: '0101020304',
            id_cartera: 0,
            ope_descripcion: 'Descripción',
            ope_linea: 'linea',
            ope_producto: 'Producto',
            ope_dias_mora: '0',
            ope_interes_mora: '0',
            ope_gastos_cobranzas: '0',
            ope_saldo_cxc_actual: '0',
            ope_saldo_cuota_actual: '0',
            ope_saldo_capital_venc: '0',
            ope_poner_aldia: '',
            ope_liquidar: '',
            ope_fecha_venc: this.fechas.fechaActualCorta(),
            ope_plazo: '',
            ope_liquidado: '',
            ope_deuda_pagada: '',
            ope_fecha_pagada: this.fechas.fechaActualCorta(),
            ope_provincia: '',
            ope_tiene_garante: '',
            ope_fecha_compra: this.fechas.fechaActualCorta(),
            ope_observacion: 'Observación adicional',
            ope_abono_realizado: '0',
            ope_valor_total_pag: '0',
            ope_tipo_actualizacion: '',
            ope_total_vencido: '0',
            ope_nom_segm_vencido: '',
            ope_categoria_cliente: '',
            ope_segmentacion: '',
            ope_promo_cuotas_gratis: '',
            ope_deuda_actual: '0',
            ope_saldo_interes: '0',
            ope_saldo_amortizacion: '0',
            ope_int_cobra: '0',
            ope_saldo_cobra_mora: '',
            ope_descu_campa_saldo_capit: '',
            ope_valor_descu_saldo_capit: '',
            ope_descrip_unidad_gestion: '',
            ope_gestor_in: '',
            ope_gestor_up: '',
            ope_gestor_rem: '',
            ope_gestor_act: '',
            ope_gestor_desact: '',
            ope_fecha_act: this.fechas.fechaActualCorta(),
            ope_fecha_desact: this.fechas.fechaActualCorta(),
            ope_fecha_in: this.fechas.fechaActualCorta(),
            ope_fecha_up: this.fechas.fechaActualCorta(),
            ope_esactivo: '1',
            ope_id_ultima_gestion: 0,
            ope_estado_contacta: '',
            ope_fecha_entrega: this.fechas.fechaActualCorta(),
            ope_origendatos: 'Carga del sistema',
            ope_baseactual: '1',
          },
        ];
        break;
      case 8:
        defecto = [
          {
            id_cuenta_tipo_cartera: 0,
            id_cartera: 0,
            id_cuenta: 0,
            ctipcar_observacion: 'Observación adicional',
            tipcar_fecha_act: this.fechas.fechaActualCorta(),
            ctipcar_fecha_desact: this.fechas.fechaActualCorta(),
            ctipcar_fecha_in: this.fechas.fechaActualCorta(),
            ctipcar_fecha_up: this.fechas.fechaActualCorta(),
            ctipcar_esactivo: '1',
          },
        ];
        break;
      case 9:
        defecto = [
          {
            id_cuenta: 0,
            cuent_nombre: 'Nombre de cuenta',
            cuent_numero: 'Numero de cuenta',
            cuent_entidadfinanciera: 'Entidad financiera',
            cuent_fecha_act: this.fechas.fechaActualCorta(),
            cuent_fecha_desact: this.fechas.fechaActualCorta(),
            cuent_fecha_in: this.fechas.fechaActualCorta(),
            cuent_fecha_up: this.fechas.fechaActualCorta(),
            cuent_esactivo: '1',
          },
        ];
        break;
      case 10:
        defecto = [
          {
            id_detalle_telefono: 0,
            tel_detal_descripcion: 'Descripción',
            tel_detal_fecha_act: this.fechas.fechaActualCorta(),
            tel_detal_fecha_desact: this.fechas.fechaActualCorta(),
            tel_detal_fecha_in: this.fechas.fechaActualCorta(),
            tel_detal_fecha_up: this.fechas.fechaActualCorta(),
            tel_detal_esactivo: '1',
          },
        ];
        break;
      case 11:
        defecto = [
          {
            id_direccion: 0,
            cli_identificacion: '0101020304',
            dir_completa: 'Dirección completa',
            dir_calle_principal: 'Calle principal',
            dir_calle_secundaria: 'Calle secundaria',
            dir_numero_casa: 'Numero casa',
            dir_referencia: 'Referencia',
            dir_provincia: 'Provincia',
            dir_canton: 'Cantón',
            dir_parroquia: 'Parroquia',
            dir_fecha_act: this.fechas.fechaActualCorta(),
            dir_fecha_desact: this.fechas.fechaActualCorta(),
            dir_fecha_in: this.fechas.fechaActualCorta(),
            dir_fecha_up: this.fechas.fechaActualCorta(),
            dir_esactivo: '1',
            dir_id_tipo_direccion: '1',
            dir_origendatos: 'Carga del sistema',
          },
        ];
        break;
      case 12:
        defecto = [
          {
            id_garante: 0,
            cli_identificacion: '0101020304',
            gar_identificacion: '0101020304',
            gar_nombres: 'JUAN PEREZ',
            gar_trabajo: '',
            gar_direccion_dom: 'Dirección domicilio',
            gar_direccion_trabajo: 'Dirección trabajo',
            gar_telefono_domicilio: 'Telefono domicilio',
            gar_telefono_trabajo: 'Telefono trabajo',
            gar_telefono_adicional: 'Telefono adicional',
            gar_observacion: 'Observación adicional',
            gar_fecha_act: this.fechas.fechaActualCorta(),
            gar_fecha_desact: this.fechas.fechaActualCorta(),
            gar_fecha_in: this.fechas.fechaActualCorta(),
            gar_fecha_up: this.fechas.fechaActualCorta(),
            gar_esactivo: '1',
          },
        ];
        break;
      case 13:
        defecto = [
          {
            id_gestor: 0,
            ges_nombres: 'Nombres',
            ges_apellidos: 'Apellidos',
            ges_esgestor: '1',
            ges_observacion: 'Observación adicional',
            ges_fecha_entrada: '',
            ges_fecha_salida: '',
            ges_fecha_act: this.fechas.fechaActualCorta(),
            ges_fecha_desact: this.fechas.fechaActualCorta(),
            ges_fecha_in: this.fechas.fechaActualCorta(),
            ges_fecha_up: this.fechas.fechaActualCorta(),
            ges_esactivo: '1',
          },
        ];
        break;
      case 14:
        defecto = [
          {
            id_telefono: 0,
            cli_identificacion: '0101020304',
            tel_numero: 'Numero',
            tel_observacion: 'Observación adicional',
            tel_operadora: 'Operadora',
            tel_tipo_operadora: 'Operadora',
            tel_fecha_act: this.fechas.fechaActualCorta(),
            tel_fecha_desact: this.fechas.fechaActualCorta(),
            tel_fecha_in: this.fechas.fechaActualCorta(),
            tel_fecha_up: this.fechas.fechaActualCorta(),
            tel_esactivo: '1',
            tel_tipo_telefono: '1',
            tel_detal_telefono: '1',
            tel_origendatos: 'Carga del sistema',
          },
        ];
        break;
      case 15:
        defecto = [
          {
            id_tipo_cartera: 0,
            cart_tip_descripcion: 'Descripción',
            cart_tip_fecha_act: this.fechas.fechaActualCorta(),
            cart_tip_fecha_desact: this.fechas.fechaActualCorta(),
            cart_tip_fecha_in: this.fechas.fechaActualCorta(),
            cart_tip_fecha_up: this.fechas.fechaActualCorta(),
            cart_tip_esactivo: '1',
          },
        ];
        break;
      case 16:
        defecto = [
          {
            id_tipo_correo: 0,
            corr_tip_descripcion: 'Descripción',
            corr_tip_fecha_act: this.fechas.fechaActualCorta(),
            corr_tip_fecha_desact: this.fechas.fechaActualCorta(),
            corr_tip_fecha_in: this.fechas.fechaActualCorta(),
            corr_tip_fecha_up: this.fechas.fechaActualCorta(),
            corr_tip_esactivo: '1',
          },
        ];
        break;
      case 17:
        defecto = [
          {
            id_tipo_direccion: 0,
            dir_tip_descripcion: 'Descripción',
            dir_tip_fecha_act: this.fechas.fechaActualCorta(),
            dir_tip_fecha_desact: this.fechas.fechaActualCorta(),
            dir_tip_fecha_in: this.fechas.fechaActualCorta(),
            dir_tip_fecha_up: this.fechas.fechaActualCorta(),
            dir_tip_esactivo: '1',
          },
        ];
        break;
      case 18:
        defecto = [
          {
            id_tipo_gestion: 0,
            gestion_tip_descripcion: 'Descripción',
            gestion_tip_fecha_act: this.fechas.fechaActualCorta(),
            gestion_tip_fecha_desact: this.fechas.fechaActualCorta(),
            gestion_tip_fecha_in: this.fechas.fechaActualCorta(),
            gestion_tip_fecha_up: this.fechas.fechaActualCorta(),
            gestion_tip_esactivo: '1',
          },
        ];
        break;
      case 19:
        defecto = [
          {
            id_tipges_conect_contac: 0,
            id_tipo_gestion: 0,
            id_conectividad: 0,
            id_contactabilidad: 0,
            tipges_gestor_desact: this.fechas.fechaActualCorta(),
            tipges_fecha_act: this.fechas.fechaActualCorta(),
            tipges_fecha_desact: this.fechas.fechaActualCorta(),
            tipges_fecha_in: this.fechas.fechaActualCorta(),
            tipges_fecha_up: this.fechas.fechaActualCorta(),
            tipges_esactivo: '1',
          },
        ];
        break;
      case 20:
        defecto = [
          {
            id_tipo_telefono: 0,
            tel_tip_descripcion: 'Descripción',
            tel_tip_fecha_act: this.fechas.fechaActualCorta(),
            tel_tip_fecha_desact: this.fechas.fechaActualCorta(),
            tel_tip_fecha_in: this.fechas.fechaActualCorta(),
            tel_tip_fecha_up: this.fechas.fechaActualCorta(),
            tel_tip_esactivo: '1',
          },
        ];
        break;
      case 21:
        defecto = [
          {
            id_tipo_trabajo: 0,
            trab_tip_descripcion: 'Descripción',
            trab_tip_fecha_act: this.fechas.fechaActualCorta(),
            trab_tip_fecha_desact: this.fechas.fechaActualCorta(),
            trab_tip_fecha_in: this.fechas.fechaActualCorta(),
            trab_tip_fecha_up: this.fechas.fechaActualCorta(),
            trab_tip_esactivo: '1',
          },
        ];
        break;
      case 22:
        defecto = [
          {
            id_trabajo: 0,
            cli_identificacion: '0101020304',
            tra_ruc: '0101020304001',
            tra_descripcion: 'Descripción',
            tra_direccion: 'Direccion',
            tra_telefono: 'Telefono',
            tra_correo: 'Correo',
            tra_observacion: 'Observación adicional',
            tra_fecha_act: this.fechas.fechaActualCorta(),
            tra_fecha_desact: this.fechas.fechaActualCorta(),
            tra_fecha_in: this.fechas.fechaActualCorta(),
            tra_fecha_up: this.fechas.fechaActualCorta(),
            tra_esactivo: '1',
            tra_tipo_trabajo: '1',
            tra_origendatos: 'Carga del sistema',
          },
        ];
        break;

      default:
        this.alerta.ErrorEnLaPeticion('No se encontraron valores por defecto');
        defecto = [];
    }

    return defecto;
  }
  GuardarListaElementos(ListaDatos: cargaMasiva) {
    return this.api.PostCargaMasivaList(ListaDatos).pipe(
      map((tracks) => {
        let exito = tracks['exito'];
        let mensaje = tracks['mensaje'];
        let datos = tracks['data'];
        if (exito == '1') {
          if (
            (Array.isArray(datos) && datos.length > 0) ||
            (typeof datos === 'object' && datos !== null)
          ) {
            return datos;
          } else {
            return null;
          }
        } else {
          return this.alerta.ErrorEnLaPeticion(mensaje);
        }
      }),
      catchError((error) => {
        console.log(error.status);
        throw this.alerta.ErrorEnLaOperacion();
        // throw new Error(error);
      })
    );
  }
}
