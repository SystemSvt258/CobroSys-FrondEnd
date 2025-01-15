import { Validators } from '@angular/forms';
import {
  AsignacionIC,
  CXC_OperacionI,
  CarteraI,
  CarteraIC,
  ClienteCarteraI,
  ClienteGestorCarteraI,
  ClienteI,
  ConectividadI,
  ConectividadIC,
  ContactabilidadI,
  ContactabilidadIC,
  CorreoCargaI,
  CorreoI,
  CuentaCarteraI,
  CuentaCarteraIC,
  CuentaI,
  CuentaIC,
  CxC_OperacionIC,
  CxcOperacionI,
  DetalleTelefonoI,
  Detalle_TelefonoCI,
  DireccionCargaI,
  DireccionI,
  GaranteCargaI,
  GaranteI,
  GestionIC,
  GestionICC,
  GestorI,
  GestorIC,
  PagosIC,
  TelefonoCargaI,
  TelefonoI,
  TipoGestionConectividadContactivilidadIC,
  TipoGestion_Conectividad_ContactivilidadI,
  Tipo_CarteraI,
  Tipo_CarteraIC,
  Tipo_CorreoCI,
  Tipo_CorreoI,
  Tipo_DireccionCI,
  Tipo_DireccionI,
  Tipo_GestionI,
  Tipo_GestionIC,
  Tipo_TelefonoCI,
  Tipo_TelefonoI,
  Tipo_TrabajoI,
  Tipo_TrabajoIC,
  TrabajoI,
  TrabajoIC,
  PagosICU
} from './response.interface';

// export class ClienteClass implements ClienteI
// {
//   id_cliente: number=0;
//   cli_identificacion!: string;
//   cli_nombres!: string;
//   cli_tipo_identificacion!: number;
//   cli_genero!: string;
//   cli_estado_civil!: string;
//   cli_ocupacion!: string;
//   cli_fecha_nacimiento!: string;
//   cli_score!: string;
//   cli_fallecido!: string;
//   cli_fecha_fallecido!: string;
//   cli_observacion!: string;
//   cli_provincia!: string;
//   cli_canton!: string;
//   cli_parroquia!: string;
//   cli_fecha_act!: Date;
//   cli_fecha_desact!: Date;
//   cli_fecha_in!: Date;
//   cli_fecha_up!: Date;
//   cli_esactivo!: string;
//   cli_estado_contacta!: string;
//   cli_id_ultima_gestion!: string;
//   cli_baseactual!: string;
//   cli_origendatos!: string;

// }
// export class CorreosClass  {
//     id_correo!: number;
//     cli_identificacion!: string;
//     cor_descripcion!: string;
//     cor_email!: string;
//     cor_esactivo!: string;
//     cor_tipo_correo!: string;
//   }
/*********************************************** */
/***********************CLASES PARA LA UTILIZACION DEL PROCESO DE VERIFICACION DE LOS DATOS al cargarlos en EXCEL */
export class ClienteCarteraClass implements ClienteCarteraI {
  cli_identificacion: string = '';
  cli_nombres: string = '';
  cli_tipo_identificacion: number = 0;
  cli_genero: string = '';
  cli_estado_civil: string = '';
  cli_ocupacion: string = '';
  cli_fecha_nacimiento: string = '';
  cli_score: string = '';
  cli_fallecido: string = '';
  cli_fecha_fallecido: string = '';
  cli_observacion: string = '';
  cli_provincia: string = '';
  cli_canton: string = '';
  cli_parroquia: string = '';
}
export class TelefonoClass implements TelefonoCargaI {
  cli_identificacion: string = '';
  tel_numero: string = '';
  tel_observacion?: string = '';
  tel_operadora: string = '';
  tel_tipo_operadora: string = '';
  tel_id_tipo_telefono: string = '';
  tel_id_detal_telefono: string = '';
}
export class DireccionClass implements DireccionCargaI {
  cli_identificacion: string = '';
  dir_id_tipo_direccion: string = '';
  dir_completa: string = '';
  dir_calle_principal: string = '';
  dir_calle_secundaria: string = '';
  dir_numero_casa: string = '';
  dir_referencia: string = '';
  dir_provincia: string = '';
  dir_canton: string = '';
  dir_parroquia: string = '';
}
export class GaranteClass implements GaranteCargaI {
  cli_identificacion: string = '';
  gar_identificacion: string = '';
  gar_nombres: string = '';
  gar_trabajo: string = '';
  gar_direccion_dom: string = '';
  gar_direccion_trabajo: string = '';
  gar_telefono_domicilio: string = '';
  gar_telefono_trabajo: string = '';
  gar_telefono_adicional: string = '';
  gar_observacion: string = '';
}
export class CorreosClass implements CorreoCargaI {
  cli_identificacion: string = '';
  cor_descripcion: string = '';
  cor_id_tipo_correo: string = '';
  cor_email: string = '';
}
export class TipoCorreoCClass implements Tipo_CorreoCI {
  id_tipo_correo: string = '';
  corr_tip_descripcion: string = '';
}
export class TipoDireccionCClass implements Tipo_DireccionCI {
  id_tipo_direccion: string = '';
  dir_tip_descripcion: string = '';
}
export class TipoTelefonoCClass implements Tipo_TelefonoCI {
  id_tipo_telefono: string = '';
  tel_tip_descripcion: string = '';
}
export class DetalleTelefonoCClass implements Detalle_TelefonoCI {
  id_detalle_telefono: string = '';
  tel_detal_descripcion: string = '';
}
export class CxCOperacionClass implements CxC_OperacionIC {
  ope_cod_credito: string = '';
  cli_identificacion: string = '';
  ope_descripcion: string = '';
  ope_lineas: string = '';
  ope_producto: string = '';
  ope_dias_mora: string = '';
  ope_interes_mora: string = '';
  ope_gastos_cobranzas: string = '';
  ope_saldo_cxc_actual: string = '';
  ope_saldo_cuota_actual: string = '';
  ope_saldo_capital_venc: string = '';
  ope_poner_aldia: string = '';
  ope_liquidar: string = '';
  ope_fecha_venc: string = '';
  ope_plazo: string = '';
  ope_liquidado: string = '';
  ope_deuda_pagada: string = '';
  ope_fecha_pagada: string = '';
  ope_provincia: string = '';
  ope_tiene_garante: string = '';
  ope_fecha_compra: string = '';
  ope_observacion: string = '';
  ope_abono_realizado: string = '';
  ope_valor_total_pag: string = '';
  ope_tipo_actualizacion: string = '';
  ope_total_vencido: string = '';
  ope_nom_segm_vencido: string = '';
  ope_categoria_cliente: string = '';
  ope_segmentacion: string = '';
  ope_promo_cuotas_gratis: string = '';
  ope_deuda_actual: string = '';
  ope_saldo_interes: string = '';
  ope_saldo_amortizacion: string = '';
  ope_int_cobra: string = '';
  ope_saldo_cobra_mora: string = '';
  ope_descu_campa_saldo_capit: string = '';
  ope_valor_descu_saldo_capit: string = '';
  ope_descrip_unidad_gestion: string = '';
  ope_id_ultima_gestion: string = '';
  ope_estado_contacta: string = '';
  ope_fecha_entrega: string = '';
}
export class Tipo_Trabajo_Class implements Tipo_TrabajoIC {
  id_tipo_trabajo: string = '';
  trab_tip_descripcion: string = '';
}
export class Trabajo_Class implements TrabajoIC {
  cli_identificacion: string = '';
  tra_descripcion?: string = '';
  tra_correo?: string = '';
  tra_direccion?: string = '';
  tra_observacion?: string = '';
  tra_ruc?: string = '';
  tra_telefono?: string = '';
  tra_id_tipo_trabajo?: string = '';
}
export class Conectivilidad_Class implements ConectividadIC {
  id_conectividad: number = 0;
  conec_descripcion: string = '';
}
export class Contactabilidad_Class implements ContactabilidadIC {
  id_contactabilidad: number = 0;
  contac_descripcion: string = '';
}
export class GestionClass implements GestionIC {
  id_gestor: number = 0;
  cli_identificacion: string = '';
  gest_ope_cod_credito: string = '';
  gest_id_cartera: number = 0;
  gest_id_gestor_asign: number = 0;
  gest_id_tipo_gestion: number = 0;
  gest_id_contactabilidad: number = 0;
  gest_id_conectividad: number = 0;
  gest_id_contacto: number = 0;
  gest_num_contacto: string = '';
  gest_gestion_mediante: string = '';
  gest_fecha_gestion: string = '';
  gest_hora_gestion: string = '';
  gest_fecha_compromiso: string = '';
  gest_fecha_incumplido: string = '';
  gest_descripcion: string = '';
  gest_valor_comp: string = '';
  gest_abonos: string = '';
  gest_num_coutas: string = '';
  gest_num_coutas_res: string = '';
  gest_couta: string = '';
  gest_valor_a_cobrar: string = '';
  gest_valor_incumplido: string = '';
  gest_fecha_prox_pago: string = '';
  gest_fecha_conv: string = '';
  gest_observacion: string = '';
  gest_certificado: string = '';
  gest_volver_llamar: string = '';
  gest_fecha_volver_llamar: string = '';
  gest_hora_volver_llamar: string = '';
  gest_perdio_contacto: string = '';
  gest_esgestion_real: string = '';
}
export class Tipo_Gestion_Class implements Tipo_GestionIC {
  id_tipo_gestion: number = 0;
  gestion_tip_descripcion: string = '';
}
export class Pagos_Class implements PagosIC {
  cli_identificacion: string = '';
  id_cartera: string = '';
  id_gestor: string = '';
  id_cuenta: string = '';
  ope_cod_credito: string = '';
  pag_codigo_comprobante: string = '';
  pag_fecha_pago: string = '';
  pag_mes_pago: string = '';
  pag_observacion_pago: string = '';
  pag_pago: string = '';
  pag_valor_total_comprobante: string = '';
}
export class Cuenta_Class implements CuentaIC {
  cuent_numero: string = '';
  cuent_entidadfinanciera: string = '';
  cuent_nombre: string = '';
}
export class Tipo_CarteraClass implements Tipo_CarteraIC {
  cart_tip_descripcion: string = '';
  id_tipo_cartera: number = 0;
}
export class CarteraClass implements CarteraIC {
  cart_descripcion: string = '';
  cart_observacion: string = '';
  id_tipo_cartera: number = 0;
}
export class GestorClass implements GestorIC {
  ges_nombres: string = '';
  ges_apellidos: string = '';
  ges_esgestor: string = '1';
  ges_observacion: string = '';
  ges_fecha_entrada: string = '';
  ges_fecha_salida: string = '';
}

export class AsignacionClass implements AsignacionIC {
  cli_identificacion: string = '';
  id_gestor: number = 0;
  cgc_observacion: string = '';
}
export class TipoGestionConectividadContactivilidadClasss
  implements TipoGestionConectividadContactivilidadIC
{
  id_tipo_gestion: number = 0;
  id_conectividad: number = 0;
  id_contactabilidad: number = 0;
  tipges_per_edi:number=0
}
export class CuentaCarteraClass implements CuentaCarteraIC {
  id_cuenta: number = 0;
  ctipcar_observacion: string = '';
}
export class GestionCClass implements GestionICC {
  id_gestor:number=0;
	cli_identificacion:string='';
	ope_cod_credito:string='';
	gest_id_gestor_asign:number=0;
	gest_id_tipo_gestion:number=0;
	gest_id_contactabilidad:number=0;
	gest_id_conectividad:number=0;
	gest_num_contacto:string='';
	gest_gestion_mediante:string='';
	gest_fecha_compromiso:string='';
	gest_fecha_incumplido:string='';
	gest_descripcion:string='';
	gest_valor_comp:string='';
	gest_abonos:string='';
	gest_num_coutas:string='';
	gest_num_coutas_res:string='';
	gest_couta:string='';
	//gest_valor_a_cobrar:string='';
	gest_valor_incumplido:string='';
	gest_fecha_prox_pago:string='';
	gest_fecha_conv:string='';
	gest_observacion:string='';
	gest_certificado:string='';
	gest_volver_llamar:string='';
	gest_fecha_volver_llamar:string='';
	gest_hora_volver_llamar:string='';
	gest_perdio_contacto:string='';
  gest_fecha_in:string='';
  gest_fecha_gestion:string='';	
  gest_hora_gestion:string='';

}
export class PagoCClass implements PagosICU {
  id_gestor:number=0;
	cli_identificacion:string='';	
	ope_cod_credito:string='';
	id_cuenta:number=0;
	pag_pago:string='';
	pag_valor_total_comprobante:string='';
	pag_observacion_pago:string='';
	pag_codigo_comprobante:string='';
	pag_url_comprobante:string='';
	pag_observ_comprobante:string='';
	pag_pago_verificado:string='';
	pag_id_gestor_ingresa:number=0;
	pag_id_gestor_verifica:number=0;
	pag_mes_pago:string='';
	pag_fecha_pago:string='';
	pag_fecha_verificacion:string='';
	pag_medio_contacto:string='';
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface clsItemI {
  [key: string]: any;
}

export class clsClienteGestorCartera implements ClienteGestorCarteraI {
  id_cliente_gestor_cartera: number;
  id_carter: number;
  cli_identificacion: string;
  id_gestor: number;
  cgc_observacion?: string;
  cgc_gestor_in?: string;
  cgc_gestor_up?: string;
  cgc_gestor_rem?: string;
  cgc_gestor_act?: string;
  cgc_gestor_desact?: string;
  cgc_fecha_act?: string;
  cgc_fecha_desact?: string;
  cgc_fecha_in?: string;
  cgc_fecha_up?: string;
  cgc_esactivo?: string;
  cgc_baseactual?: string;

  constructor() {
    this.id_cliente_gestor_cartera = 0;
    this.id_carter = 0;
    this.cli_identificacion = '';
    this.id_gestor = 0;
    this.cgc_observacion = '';
    this.cgc_gestor_in = '';
    this.cgc_gestor_up = '';
    this.cgc_gestor_rem = '';
    this.cgc_gestor_act = '';
    this.cgc_gestor_desact = '';
    this.cgc_fecha_act = '';
    this.cgc_fecha_desact = '';
    this.cgc_fecha_in = '';
    this.cgc_fecha_up = '';
    this.cgc_esactivo = '';
    this.cgc_baseactual = '';
  }
}
export class clsCartera implements CarteraI {
  id_cartera: number;
  id_tipo_cartera: number;
  cart_descripcion: string;
  cart_observacion: string;
  cart_fecha_act: Date;
  cart_fecha_desact: Date;
  cart_fecha_in: Date;
  cart_fecha_up: Date;
  cart_esactivo: string;

  constructor() {
    this.id_cartera = 0;
    this.id_tipo_cartera = 0;
    this.cart_descripcion = '';
    this.cart_observacion = '';
    this.cart_fecha_act = new Date();
    this.cart_fecha_desact = new Date();
    this.cart_fecha_in = new Date();
    this.cart_fecha_up = new Date();
    this.cart_esactivo = '';
  }
}
export class clsCliente implements ClienteI {
  id_cliente: number;
  cli_identificacion: string;
  cli_nombres: string;
  cli_tipo_identificacion: number;
  cli_genero: string;
  cli_estado_civil: string;
  cli_ocupacion: string;
  cli_sit_laboral: string;
  cli_fecha_nacimiento: string;
  cli_id_prioridad: string;
  cli_fecha_prioridad: string;
  cli_certificado: string;
  cli_certificado_entregado: string;
  cli_certificado_url: string;
  cli_score: string;
  cli_fallecido: string;
  cli_fecha_fallecido: string;
  cli_observacion: string;
  cli_carteras: string;
  cli_provincia: string;
  cli_canton: string;
  cli_parroquia: string;
  cli_trabajo: string;
  cli_vehiculo: string;
  cli_ruc: string;
  cli_fecha_act: Date;
  cli_fecha_desact: Date;
  cli_fecha_in: Date;
  cli_fecha_up: Date;
  cli_esactivo: string;
  cli_estado_contacta: string;
  cli_id_ultima_gestion: string;
  cli_fecha_ultima_gest: string;
  cli_fecha_ultimo_pago: string;
  cli_fecha_asignacion: string;
  cli_baseactual: string;
  cli_origendatos: string;

  constructor() {
    this.id_cliente = 0;
    this.cli_identificacion = '';
    this.cli_nombres = '';
    this.cli_tipo_identificacion = 0;
    this.cli_genero = '';
    this.cli_estado_civil = '';
    this.cli_ocupacion = '';
    this.cli_sit_laboral = '';
    this.cli_fecha_nacimiento = '';
    this.cli_id_prioridad = '';
    this.cli_fecha_prioridad = '';
    this.cli_certificado = '';
    this.cli_certificado_entregado = '';
    this.cli_certificado_url = '';
    this.cli_score = '';
    this.cli_fallecido = '';
    this.cli_fecha_fallecido = '';
    this.cli_observacion = '';
    this.cli_carteras = '';
    this.cli_provincia = '';
    this.cli_canton = '';
    this.cli_parroquia = '';
    this.cli_trabajo = '';
    this.cli_vehiculo = '';
    this.cli_ruc = '';
    this.cli_fecha_act = new Date();
    this.cli_fecha_desact = new Date();
    this.cli_fecha_in = new Date();
    this.cli_fecha_up = new Date();
    this.cli_esactivo = '';
    this.cli_estado_contacta = '';
    this.cli_id_ultima_gestion = '';
    this.cli_fecha_ultima_gest = '';
    this.cli_fecha_ultimo_pago = '';
    this.cli_fecha_asignacion = '';
    this.cli_baseactual = '';
    this.cli_origendatos = '';
  }
}
export class clsConectividad implements ConectividadI {
  id_conectividad: number;
  conec_descripcion: string;
  conec_fecha_act: Date;
  conec_fecha_desact: Date;
  conec_fecha_in: Date;
  conec_fecha_up: Date;
  conec_esactivo: string;

  constructor() {
    this.id_conectividad = 0;
    this.conec_descripcion = '';
    this.conec_fecha_act = new Date();
    this.conec_fecha_desact = new Date();
    this.conec_fecha_in = new Date();
    this.conec_fecha_up = new Date();
    this.conec_esactivo = '';
  }
}
export class clsContactabilidad implements ContactabilidadI {
  id_contactabilidad: number;
  contac_descripcion: string;
  contac_fecha_act: Date;
  contac_fecha_desact: Date;
  contac_fecha_in: Date;
  contac_fecha_up: Date;
  contac_esactivo: string;

  constructor() {
    this.id_contactabilidad = 0;
    this.contac_descripcion = '';
    this.contac_fecha_act = new Date();
    this.contac_fecha_desact = new Date();
    this.contac_fecha_in = new Date();
    this.contac_fecha_up = new Date();
    this.contac_esactivo = '';
  }
}
export class clsCorreo implements CorreoI {
  id_correo: number;
  cli_identificacion: string;
  cor_descripcion: string;
  cor_email: string;
  cor_fecha_act: Date;
  cor_fecha_desact: Date;
  cor_fecha_in: Date;
  cor_fecha_up: Date;
  cor_esactivo: string;
  cor_id_tipo_correo: string;
  cor_origendatos: string;

  constructor() {
    this.id_correo = 0;
    this.cli_identificacion = '';
    this.cor_descripcion = '';
    this.cor_email = '';
    this.cor_fecha_act = new Date();
    this.cor_fecha_desact = new Date();
    this.cor_fecha_in = new Date();
    this.cor_fecha_up = new Date();
    this.cor_esactivo = '';
    this.cor_id_tipo_correo = '';
    this.cor_origendatos = '';
  }
}
export class clsCxcOperacion implements CxcOperacionI {
  id_cxc_operacion: number;
  ope_cod_credito: string;
  cli_identificacion: string;
  id_cartera: number;
  ope_descripcion: string;
  ope_linea: string;
  ope_producto: string;
  ope_dias_mora: string;
  ope_interes_mora: string;
  ope_gastos_cobranzas: string;
  ope_saldo_cxc_actual: string;
  ope_saldo_cuota_actual: string;
  ope_saldo_capital_venc: string;
  ope_poner_aldia: string;
  ope_liquidar: string;
  ope_fecha_venc: Date;
  ope_plazo: string;
  ope_liquidado: string;
  ope_deuda_pagada: string;
  ope_fecha_pagada: Date;
  ope_provincia: string;
  ope_tiene_garante: string;
  ope_fecha_compra: Date;
  ope_observacion: string;
  ope_abono_realizado: string;
  ope_valor_total_pag: string;
  ope_tipo_actualizacion: string;
  ope_total_vencido: string;
  ope_nom_segm_vencido: string;
  ope_categoria_cliente: string;
  ope_segmentacion: string;
  ope_promo_cuotas_gratis: string;
  ope_deuda_actual: string;
  ope_saldo_interes: string;
  ope_saldo_amortizacion: string;
  ope_int_cobra: string;
  ope_saldo_cobra_mora: string;
  ope_descu_campa_saldo_capit: string;
  ope_valor_descu_saldo_capit: string;
  ope_descrip_unidad_gestion: string;
  ope_gestor_in: string;
  ope_gestor_up: string;
  ope_gestor_rem: string;
  ope_gestor_act: string;
  ope_gestor_desact: string;
  ope_fecha_act: Date;
  ope_fecha_desact: Date;
  ope_fecha_in: Date;
  ope_fecha_up: Date;
  ope_esactivo: string;
  ope_id_ultima_gestion: number;
  ope_estado_contacta: string;
  ope_fecha_entrega: Date;
  ope_origendatos: string;
  ope_baseactual: string;

  constructor() {
    this.id_cxc_operacion = 0;
    this.ope_cod_credito = '';
    this.cli_identificacion = '';
    this.id_cartera = 0;
    this.ope_descripcion = '';
    this.ope_linea = '';
    this.ope_producto = '';
    this.ope_dias_mora = '';
    this.ope_interes_mora = '';
    this.ope_gastos_cobranzas = '';
    this.ope_saldo_cxc_actual = '';
    this.ope_saldo_cuota_actual = '';
    this.ope_saldo_capital_venc = '';
    this.ope_poner_aldia = '';
    this.ope_liquidar = '';
    this.ope_fecha_venc = new Date();
    this.ope_plazo = '';
    this.ope_liquidado = '';
    this.ope_deuda_pagada = '';
    this.ope_fecha_pagada = new Date();
    this.ope_provincia = '';
    this.ope_tiene_garante = '';
    this.ope_fecha_compra = new Date();
    this.ope_observacion = '';
    this.ope_abono_realizado = '';
    this.ope_valor_total_pag = '';
    this.ope_tipo_actualizacion = '';
    this.ope_total_vencido = '';
    this.ope_nom_segm_vencido = '';
    this.ope_categoria_cliente = '';
    this.ope_segmentacion = '';
    this.ope_promo_cuotas_gratis = '';
    this.ope_deuda_actual = '';
    this.ope_saldo_interes = '';
    this.ope_saldo_amortizacion = '';
    this.ope_int_cobra = '';
    this.ope_saldo_cobra_mora = '';
    this.ope_descu_campa_saldo_capit = '';
    this.ope_valor_descu_saldo_capit = '';
    this.ope_descrip_unidad_gestion = '';
    this.ope_gestor_in = '';
    this.ope_gestor_up = '';
    this.ope_gestor_rem = '';
    this.ope_gestor_act = '';
    this.ope_gestor_desact = '';
    this.ope_fecha_act = new Date();
    this.ope_fecha_desact = new Date();
    this.ope_fecha_in = new Date();
    this.ope_fecha_up = new Date();
    this.ope_esactivo = '';
    this.ope_id_ultima_gestion = 0;
    this.ope_estado_contacta = '';
    this.ope_fecha_entrega = new Date();
    this.ope_origendatos = '';
    this.ope_baseactual = '';
  }
}
export class clsCuentaCartera implements CuentaCarteraI {
  id_cuenta_tipo_cartera: number;
  id_cartera: number;
  id_cuenta: number;
  ctipcar_observacion: string;
  ctipcar_fecha_act: Date;
  ctipcar_fecha_desact: Date;
  ctipcar_fecha_in: Date;
  ctipcar_fecha_up: Date;
  ctipcar_esactivo: string;

  constructor() {
    this.id_cuenta_tipo_cartera = 0;
    this.id_cartera = 0;
    this.id_cuenta = 0;
    this.ctipcar_observacion = '';
    this.ctipcar_fecha_act = new Date();
    this.ctipcar_fecha_desact = new Date();
    this.ctipcar_fecha_in = new Date();
    this.ctipcar_fecha_up = new Date();
    this.ctipcar_esactivo = '';
  }
}
export class clsCuenta implements CuentaI {
  id_cuenta: number;
  cuent_nombre: string;
  cuent_numero: string;
  cuent_entidadfinanciera: string;
  cuent_fecha_act: Date;
  cuent_fecha_desact: Date;
  cuent_fecha_in: Date;
  cuent_fecha_up: Date;
  cuent_esactivo: string;

  constructor() {
    this.id_cuenta = 0;
    this.cuent_nombre = '';
    this.cuent_numero = '';
    this.cuent_entidadfinanciera = '';
    this.cuent_fecha_act = new Date();
    this.cuent_fecha_desact = new Date();
    this.cuent_fecha_in = new Date();
    this.cuent_fecha_up = new Date();
    this.cuent_esactivo = '';
  }
}
export class clsDetalle_TelefonoC implements DetalleTelefonoI {
  id_detalle_telefono: number;
  tel_detal_descripcion: string;
  tel_detal_fecha_act: Date;
  tel_detal_fecha_desact: Date;
  tel_detal_fecha_in: Date;
  tel_detal_fecha_up: Date;
  tel_detal_esactivo: string;

  constructor() {
    this.id_detalle_telefono = 0;
    this.tel_detal_descripcion = '';
    this.tel_detal_fecha_act = new Date();
    this.tel_detal_fecha_desact = new Date();
    this.tel_detal_fecha_in = new Date();
    this.tel_detal_fecha_up = new Date();
    this.tel_detal_esactivo = '';
  }
}
export class clsDireccion implements DireccionI {
  id_direccion: number;
  cli_identificacion: string;
  dir_completa: string;
  dir_calle_principal: string;
  dir_calle_secundaria: string;
  dir_numero_casa: string;
  dir_referencia: string;
  dir_provincia: string;
  dir_canton: string;
  dir_parroquia: string;
  dir_fecha_act: Date;
  dir_fecha_desact: Date;
  dir_fecha_in: Date;
  dir_fecha_up: Date;
  dir_esactivo: string;
  dir_id_tipo_direccion: string;
  dir_origendatos: string;

  constructor() {
    this.id_direccion = 0;
    this.cli_identificacion = '';
    this.dir_completa = '';
    this.dir_calle_principal = '';
    this.dir_calle_secundaria = '';
    this.dir_numero_casa = '';
    this.dir_referencia = '';
    this.dir_provincia = '';
    this.dir_canton = '';
    this.dir_parroquia = '';
    this.dir_fecha_act = new Date();
    this.dir_fecha_desact = new Date();
    this.dir_fecha_in = new Date();
    this.dir_fecha_up = new Date();
    this.dir_esactivo = '';
    this.dir_id_tipo_direccion = '';
    this.dir_origendatos = '';
  }
}
export class clsGarante implements GaranteI {
  id_garante: number;
  cli_identificacion: string;
  gar_identificacion: string;
  gar_nombres: string;
  gar_trabajo: string;
  gar_direccion_dom: string;
  gar_direccion_trabajo: string;
  gar_telefono_domicilio: string;
  gar_telefono_trabajo: string;
  gar_telefono_adicional: string;
  gar_observacion: string;
  gar_fecha_act: Date;
  gar_fecha_desact: Date;
  gar_fecha_in: Date;
  gar_fecha_up: Date;
  gar_esactivo: string;

  constructor() {
    this.id_garante = 0;
    this.cli_identificacion = '';
    this.gar_identificacion = '';
    this.gar_nombres = '';
    this.gar_trabajo = '';
    this.gar_direccion_dom = '';
    this.gar_direccion_trabajo = '';
    this.gar_telefono_domicilio = '';
    this.gar_telefono_trabajo = '';
    this.gar_telefono_adicional = '';
    this.gar_observacion = '';
    this.gar_fecha_act = new Date();
    this.gar_fecha_desact = new Date();
    this.gar_fecha_in = new Date();
    this.gar_fecha_up = new Date();
    this.gar_esactivo = '';
  }
}
export class clsGestor implements GestorI {
  id_gestor: number;
  ges_nombres: string;
  ges_apellidos: string;
  ges_esgestor: string;
  ges_observacion: string;
  ges_fecha_entrada: string;
  ges_fecha_salida: string;
  ges_fecha_act: Date;
  ges_fecha_desact: Date;
  ges_fecha_in: Date;
  ges_fecha_up: Date;
  ges_esactivo: string;
  ges_meta: string;
  detalle: any[];

  constructor() {
    this.id_gestor = 0;
    this.ges_nombres = '';
    this.ges_apellidos = '';
    this.ges_esgestor = '';
    this.ges_observacion = '';
    this.ges_fecha_entrada = '';
    this.ges_fecha_salida = '';
    this.ges_fecha_act = new Date();
    this.ges_fecha_desact = new Date();
    this.ges_fecha_in = new Date();
    this.ges_fecha_up = new Date();
    this.ges_esactivo = '';
    this.ges_meta = '';
    this.detalle = [];
  }
}
export class clsTelefono implements TelefonoI {
  id_telefono: number;
  cli_identificacion: string;
  tel_numero: string;
  tel_observacion: string;
  tel_operadora: string;
  tel_tipo_operadora: string;
  tel_fecha_act: Date;
  tel_fecha_desact: Date;
  tel_fecha_in: Date;
  tel_fecha_up: Date;
  tel_esactivo: string;
  tel_tipo_telefono: string;
  tel_detal_telefono: string;
  tel_origendatos: string;

  constructor() {
    this.id_telefono = 0;
    this.cli_identificacion = '';
    this.tel_numero = '';
    this.tel_observacion = '';
    this.tel_operadora = '';
    this.tel_tipo_operadora = '';
    this.tel_fecha_act = new Date();
    this.tel_fecha_desact = new Date();
    this.tel_fecha_in = new Date();
    this.tel_fecha_up = new Date();
    this.tel_esactivo = '';
    this.tel_tipo_telefono = '';
    this.tel_detal_telefono = '';
    this.tel_origendatos = '';
  }
}
export class clsTipo_Cartera implements Tipo_CarteraI {
  id_tipo_cartera: number;
  cart_tip_descripcion: string;
  cart_tip_fecha_act: Date;
  cart_tip_fecha_desact: Date;
  cart_tip_fecha_in: Date;
  cart_tip_fecha_up: Date;
  cart_tip_esactivo: string;

  constructor() {
    this.id_tipo_cartera = 0;
    this.cart_tip_descripcion = '';
    this.cart_tip_fecha_act = new Date();
    this.cart_tip_fecha_desact = new Date();
    this.cart_tip_fecha_in = new Date();
    this.cart_tip_fecha_up = new Date();
    this.cart_tip_esactivo = '';
  }
}
export class clsTipo_Correo implements Tipo_CorreoI {
  id_tipo_correo: number;
  corr_tip_descripcion: string;
  corr_tip_fecha_act: Date;
  corr_tip_fecha_desact: Date;
  corr_tip_fecha_in: Date;
  corr_tip_fecha_up: Date;
  corr_tip_esactivo: string;

  constructor() {
    this.id_tipo_correo = 0;
    this.corr_tip_descripcion = '';
    this.corr_tip_fecha_act = new Date();
    this.corr_tip_fecha_desact = new Date();
    this.corr_tip_fecha_in = new Date();
    this.corr_tip_fecha_up = new Date();
    this.corr_tip_esactivo = '';
  }
}
export class clsTipo_Direccion implements Tipo_DireccionI {
  id_tipo_direccion: number;
  dir_tip_descripcion: string;
  dir_tip_fecha_act: Date;
  dir_tip_fecha_desact: Date;
  dir_tip_fecha_in: Date;
  dir_tip_fecha_up: Date;
  dir_tip_esactivo: string;

  constructor() {
    this.id_tipo_direccion = 0;
    this.dir_tip_descripcion = '';
    this.dir_tip_fecha_act = new Date();
    this.dir_tip_fecha_desact = new Date();
    this.dir_tip_fecha_in = new Date();
    this.dir_tip_fecha_up = new Date();
    this.dir_tip_esactivo = '';
  }
}
export class clsTipo_Gestion implements Tipo_GestionI {
  id_tipo_gestion: number;
  gestion_tip_descripcion: string;
  gestion_tip_fecha_act: Date;
  gestion_tip_fecha_desact: Date;
  gestion_tip_fecha_in: Date;
  gestion_tip_fecha_up: Date;
  gestion_tip_esactivo: string;

  constructor() {
    this.id_tipo_gestion = 0;
    this.gestion_tip_descripcion = '';
    this.gestion_tip_fecha_act = new Date();
    this.gestion_tip_fecha_desact = new Date();
    this.gestion_tip_fecha_in = new Date();
    this.gestion_tip_fecha_up = new Date();
    this.gestion_tip_esactivo = '1';
  }
}
export class clsTipoGestion_Conectividad_Contactivilidad
  implements TipoGestion_Conectividad_ContactivilidadI
{
  id_tipges_conect_contac: number;
  id_tipo_gestion: number;
  id_conectividad: number;
  id_contactabilidad: number;
  tipges_fecha_act: Date;
  tipges_fecha_desact: Date;
  tipges_fecha_in: Date;
  tipges_fecha_up: Date;
  tipges_esactivo: string;
  tipges_per_edi: string;

  constructor() {
    this.id_tipges_conect_contac = 0;
    this.id_tipo_gestion = 0;
    this.id_conectividad = 0;
    this.id_contactabilidad = 0;
    this.tipges_fecha_act = new Date();
    this.tipges_fecha_desact = new Date();
    this.tipges_fecha_in = new Date();
    this.tipges_fecha_up = new Date();
    this.tipges_esactivo = '';
    this.tipges_per_edi = '';
  }
}
export class clsTipo_Telefono implements Tipo_TelefonoI {
  id_tipo_telefono: number;
  tel_tip_descripcion: string;
  tel_tip_fecha_act: Date;
  tel_tip_fecha_desact: Date;
  tel_tip_fecha_in: Date;
  tel_tip_fecha_up: Date;
  tel_tip_esactivo: string;

  constructor() {
    this.id_tipo_telefono = 0;
    this.tel_tip_descripcion = '';
    this.tel_tip_fecha_act = new Date();
    this.tel_tip_fecha_desact = new Date();
    this.tel_tip_fecha_in = new Date();
    this.tel_tip_fecha_up = new Date();
    this.tel_tip_esactivo = '';
  }
}
export class clsTipo_Trabajo implements Tipo_TrabajoI {
  id_tipo_trabajo: number;
  trab_tip_descripcion: string;
  trab_tip_fecha_act: Date;
  trab_tip_fecha_desact: Date;
  trab_tip_fecha_in: Date;
  trab_tip_fecha_up: Date;
  trab_tip_esactivo: string;

  constructor() {
    this.id_tipo_trabajo = 0;
    this.trab_tip_descripcion = '';
    this.trab_tip_fecha_act = new Date();
    this.trab_tip_fecha_desact = new Date();
    this.trab_tip_fecha_in = new Date();
    this.trab_tip_fecha_up = new Date();
    this.trab_tip_esactivo = '';
  }
}
export class clsTrabajo implements TrabajoI {
  id_trabajo: number;
  cli_identificacion: string;
  tra_ruc: string;
  tra_descripcion: string;
  tra_direccion: string;
  tra_telefono: string;
  tra_correo: string;
  tra_observacion: string;
  tra_fecha_act: Date;
  tra_fecha_desact: Date;
  tra_fecha_in: Date;
  tra_fecha_up: Date;
  tra_esactivo: string;
  tra_tipo_trabajo: string;
  tra_origendatos: string;

  constructor() {
    this.id_trabajo = 0;
    this.cli_identificacion = '';
    this.tra_ruc = '';
    this.tra_descripcion = '';
    this.tra_direccion = '';
    this.tra_telefono = '';
    this.tra_correo = '';
    this.tra_observacion = '';
    this.tra_fecha_act = new Date();
    this.tra_fecha_desact = new Date();
    this.tra_fecha_in = new Date();
    this.tra_fecha_up = new Date();
    this.tra_esactivo = '';
    this.tra_tipo_trabajo = '';
    this.tra_origendatos = '';
  }
}
