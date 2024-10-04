import { Time } from '@angular/common';

export interface ResponseI {
  exito: string;
  mensaje: string;
  data: any;
}
export interface EntidadEncriptado {
  valor: string;
}

export interface FiltroCompuesto {
  tipo: number;
  gestor: string;
  contactabilidad: string;
  cartera: string;
  fecha_inicial: string;
  fecha_final: string;
  todas: boolean;
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface CarteraI {
  id_cartera: number;
  id_tipo_cartera: number;
  cart_descripcion: string;
  cart_observacion: string;
  cart_fecha_act: Date;
  cart_fecha_desact: Date;
  cart_fecha_in: Date;
  cart_fecha_up: Date;
  cart_esactivo: string;
}
export interface ClienteI {
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
}

export interface ConectividadI {
  id_conectividad: number;
  conec_descripcion: string;
  conec_fecha_act: Date;
  conec_fecha_desact: Date;
  conec_fecha_in: Date;
  conec_fecha_up: Date;
  conec_esactivo: string;
}
export interface ContactabilidadI {
  id_contactabilidad: number;
  contac_descripcion: string;
  contac_fecha_act: Date;
  contac_fecha_desact: Date;
  contac_fecha_in: Date;
  contac_fecha_up: Date;
  contac_esactivo: string;
}
export interface CorreoI {
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
}
export interface CxcOperacionI {
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
}
export interface CuentaI {
  id_cuenta: number;
  cuent_nombre: string;
  cuent_numero: string;
  cuent_entidadfinanciera: string;
  cuent_fecha_act: Date;
  cuent_fecha_desact: Date;
  cuent_fecha_in: Date;
  cuent_fecha_up: Date;
  cuent_esactivo: string;
}
export interface CuentaCarteraI {
  id_cuenta_tipo_cartera: number;
  id_cartera: number;
  id_cuenta: number;
  ctipcar_observacion: string;
  ctipcar_fecha_act: Date;
  ctipcar_fecha_desact: Date;
  ctipcar_fecha_in: Date;
  ctipcar_fecha_up: Date;
  ctipcar_esactivo: string;
}
export interface DetalleTelefonoI {
  id_detalle_telefono: number;
  tel_detal_descripcion: string;
  tel_detal_fecha_act: Date;
  tel_detal_fecha_desact: Date;
  tel_detal_fecha_in: Date;
  tel_detal_fecha_up: Date;
  tel_detal_esactivo: string;
}
export interface DireccionI {
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
}
export interface GaranteI {
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
}
export interface GestionI {
  id_gestion: number;
  id_gestor: number;
  cli_identificacion: string;
  ope_cod_credito: string;
  gest_id_cartera: number;
  gest_id_gestor_asign: number;
  gest_id_tipo_gestion: number;
  gest_id_contactabilidad: number;
  gest_id_conectividad: number;
  gest_id_contacto: number;
  gest_num_contacto: string;
  gest_gestion_mediante: string;
  gest_fecha_gestion: Date;
  gest_hora_gestion: string;
  gest_fecha_compromiso: Date;
  gest_fecha_incumplido: Date;
  gest_descripcion: string;
  gest_valor_comp: string;
  gest_abonos: string;
  gest_num_coutas: string;
  gest_num_coutas_res: string;
  gest_couta: string;
  gest_valor_a_cobrar: string;
  gest_valor_incumplido: string;
  gest_fecha_prox_pago: Date;
  gets_fecha_conv: Date;
  gest_observacion: string;
  gest_certificado: string;
  gest_volver_llamar: string;
  gest_fecha_volver_llamar: Date;
  gest_hora_volver_llamar: string;
  gest_perdio_contacto: string;
  gest_esgestion_real: string;
  gest_fecha_act: Date;
  gest_fecha_desact: Date;
  gest_fecha_in: Date;
  gest_fecha_up: Date;
  gest_esactivo: string;
}
export interface Tipo_CarteraI {
  id_tipo_cartera: number;
  cart_tip_descripcion: string;
  cart_tip_fecha_act: Date;
  cart_tip_fecha_desact: Date;
  cart_tip_fecha_in: Date;
  cart_tip_fecha_up: Date;
  cart_tip_esactivo: string;
}
export interface Tipo_CorreoI {
  id_tipo_correo: number;
  corr_tip_descripcion: string;
  corr_tip_fecha_act: Date;
  corr_tip_fecha_desact: Date;
  corr_tip_fecha_in: Date;
  corr_tip_fecha_up: Date;
  corr_tip_esactivo: string;
}
export interface Tipo_DireccionI {
  id_tipo_direccion: number;
  dir_tip_descripcion: string;
  dir_tip_fecha_act: Date;
  dir_tip_fecha_desact: Date;
  dir_tip_fecha_in: Date;
  dir_tip_fecha_up: Date;
  dir_tip_esactivo: string;
}
export interface Tipo_Doc_AdicionalI {
  id_tipo_docum_adiciomal: number;
  doc_tip_descripcion: string;
  doc_tip_fecha_act: Date;
  doc_tip_fecha_desact: Date;
  doc_tip_fecha_in: Date;
  doc_tip_fecha_up: Date;
  doc_tip_esactivo: string;
}
export interface Tipo_GestionI {
  id_tipo_gestion: number;
  gestion_tip_descripcion: string;
  gestion_tip_fecha_act: Date;
  gestion_tip_fecha_desact: Date;
  gestion_tip_fecha_in: Date;
  gestion_tip_fecha_up: Date;
  gestion_tip_esactivo: string;
}
export interface Tipo_TelefonoI {
  id_tipo_telefono: number;
  tel_tip_descripcion: string;
  tel_tip_fecha_act: Date;
  tel_tip_fecha_desact: Date;
  tel_tip_fecha_in: Date;
  tel_tip_fecha_up: Date;
  tel_tip_esactivo: string;
}
export interface Tipo_TrabajoI {
  id_tipo_trabajo: number;
  trab_tip_descripcion: string;
  trab_tip_fecha_act: Date;
  trab_tip_fecha_desact: Date;
  trab_tip_fecha_in: Date;
  trab_tip_fecha_up: Date;
  trab_tip_esactivo: string;
}
export interface MenuI {
  id_menu: number;
  men_descripcion: string;
  men_url: string;
  men_icono: string;
  men_fecha_act: Date;
  men_fecha_desact: Date;
  men_fecha_in: Date;
  men_fecha_up: Date;
  men_esactivo: string;
}
export interface PermisosI {
  id_permiso: number;
  perm_descripcion: string;
  perm_fecha_act: Date;
  perm_fecha_desact: Date;
  perm_fecha_in: Date;
  perm_fecha_up: Date;
  perm_esactivo: string;
  detalles_menu: PermisoDetalleMI[];
  detalles_cartera: PermisoDetalleCI[];
}
export interface PermisoDetalleMI {
  id_perm_detalle_menu: number;
  id_permiso: number;
  id_menu: number;
  men_descripcion: string;
  perm_det_m_lectura: string;
  perm_det_m_tipo: string;
  perm_det_m_esactivo: string;
}
export interface PermisoDetalleCI {
  id_perm_detalle_cartera: number;
  id_permiso: number;
  id_cartera: number;
  cart_descripcion: string;
  cart_tip_descripcion: string;
  perm_det_c_esactivo: string;
}

export interface RolesI {
  id_rol: number;
  rol_descripcion: string;
  rol_observacion: string;
  rol_fecha_act: Date;
  rol_fecha_desact: Date;
  rol_fecha_in: Date;
  rol_fecha_up: Date;
  rol_esactivo: string;
  detalle: any[];
}
export interface TelefonoI {
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
}
export interface TrabajoI {
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
}
export interface GestorI {
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
}
export interface NotificacionI {
  id_notificacion: number;
  cli_identificacion: string;
  ope_cod_credito: string;
  not_id_gestor_env: string;
  not_id_gestor_rec: string;
  not_id_cartera: string;
  not_mensaje: string;
  not_visto: string;
  not_fecha_env: string;
  not_hora_env: string;
  not_fecha_vis: string;
  not_hora_vis: string;
  not_esactivo: string;
}

export interface TrabajoI {
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
}
export interface PagosI {
  id_pagos: number;
  id_gestor: number;
  cli_identificacion: string;
  ope_cod_credito: string;
  id_cuenta: number;
  id_cartera: number;
  pag_pago: string;
  pag_valor_total_comprobante: string;
  pag_observacion_pago: string;
  pag_codigo_comprobante: string;
  pag_url_comprobante: string;
  pag_observ_comprobante: string;
  pag_pago_verificado: string;
  pag_id_gestor_ingresa: number;
  pag_id_gestor_verifica: number;
  pag_mes_pago: string;
  pag_medio_contacto: string;
  pag_fecha_pago: Date;
  pag_fecha_verificacion: Date;
  pag_fecha_act: Date;
  pag_fecha_desact: Date;
  pag_fecha_in: Date;
  pag_fecha_up: Date;
  pag_esactivo: string;
}

export interface UsuariosI {
  id_usuario: number;
  id_rol: number;
  id_gestor: number;
  usr_usuario: string;
  usr_password: string;
  usr_correo: string;
  usr_telefono: string;
  usr_img_url: string;
  usr_observacion: string;
  usr_fraccion_datos: string;
  usr_rango_datos: string;
  usr_lectura_escritura: string;
  usr_esgestor: string;
  usr_estasesion: string;
  usr_fecha_act: Date;
  usr_fecha_desact: Date;
  usr_fecha_in: Date;
  usr_fecha_up: Date;
  usr_esactivo: string;
  dias_laborales: DiasLaboralesI[];
}

export interface DiasLaboralesI {
  id_dias_laborales: number;
  id_usuario: number;
  dlab_dia: string;
  dlab_hora_entra: string;
  dlab_hora_salid: string;
  dlab_esactivo: string;
}
export interface RecargoI {
  id_recarga: number;
  rec_descripcion: string;
  rec_id_cartera: number;
  rec_valor: string;
  rec_fecha_act: Date;
  rec_fecha_desact: Date;
  rec_fecha_in: Date;
  rec_fecha_up: Date;
  rec_esactivo: string;
}
export interface Tipo_RecargoI {
  id_tipo_recargo: number;
  rec_tip_descripcion: string;
  rec_tip_fecha_act: Date;
  rec_tip_fecha_desact: Date;
  rec_tip_fecha_in: Date;
  rec_tip_fecha_up: Date;
  rec_tip_esactivo: string;
}

export interface TipoGestion_Conectividad_ContactivilidadI {
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
}
////////////////////////////////////////////////  COMPLEMENTOS NECESARIOS ////////////////////////////////////////////////////////////
export interface AsignacionFiltroI {
  identificacion: string;
  nombres_cliente: string;
  cartera: number;
  gestor: number;
  codigo: number;
  rango: number;
  [key: string]: string | number | boolean;
}

export interface GestionCG {
  identificacion: string;
  nombres_cliente: string;
  cartera: number[];
  gestor: number;
  contactabilidad: number;
  pago: string;
  prioridad: string;
  monto_min: string;
  monto_max: string;
  meses: number;
  tipo: number;
  codigo: number;
  rango: number;
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

export interface GestionarPropio {
  tipo: number;
  identificacion: string;
  cartera: number;
  [key: string]: string | number | string[] | number[];
}

export interface FiltroGestion {
  tipo: number;
  identificacion: string;
  nombres_cliente: string;
  cartera: number[];
  gestor: number;
  contactabilidad: number;
  fecha_inicial: string;
  fecha_final: string;
  ultima_gestion: string;
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}
export interface FiltroGestion2 {
  tipo: number;
  identificacion: string;
  nombres_cliente: string;
  cartera: number[];
  gestor: number;
  contactabilidad: number[];
  fecha_inicial_gestion: string;
  fecha_final_gestion: string;
  fecha_inicial_pp: string;
  fecha_final_pp: string;
  ultima_gestion: string;
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}
export interface FiltroPagos {
  tipo: number;
  identificacion: string;
  nombres_cliente: string;
  cartera: number[];
  gestor: number;
  cuenta: number;
  mes: string;
  year: string;
  codigo: number;
  rango: number;
  [key: string]: string | number | string[] | number[];
}
export interface UploadFileI {
  archivo: File;
  url: string;
}

export interface FiltroDescarga {
  tipo: number;
  identificacion: string;
  nombres_cliente: string;
  cartera: number;
  estado_contactibilidad: string;
  fecha_inicial_gestion: string;
  fecha_final_gestion: string;
  fecha_inicial_pp: string;
  fecha_final_pp: string;

  [key: string]: string | number | string[] | number[];
}
/*****************************INTERFACES PARA EL PROCESO DE CARGA DE DATOS************************************************ */
export interface ClienteCarteraI {
  cli_identificacion: string;
  cli_nombres: string;
  cli_tipo_identificacion: number;
  cli_genero: string;
  cli_estado_civil: string;
  cli_ocupacion: string;
  cli_fecha_nacimiento: string;
  cli_score: string;
  cli_fallecido: string;
  cli_fecha_fallecido: string;
  cli_observacion: string;
  cli_provincia: string;
  cli_canton: string;
  cli_parroquia: string;
}
export interface ClienteGestorCarteraI {
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
}
export interface CXC_OperacionI {
  ope_cod_credito?: string;
  cli_identificacion?: string;
  id_cartera?: number;
  ope_descripcion?: string;
  ope_linea?: string;
  ope_producto?: string;
  ope_dias_mora?: string;
  ope_interes_mora?: string;
  ope_gastos_cobranzas?: string;
  ope_saldo_cxc_actual?: string;
  ope_saldo_cuota_actual?: string;
  ope_saldo_capital_venc?: string;
  ope_poner_aldia?: string;
  ope_liquidar?: string;
  ope_fecha_venc?: string;
  ope_plazo?: string;
  ope_liquidado?: string;
  ope_deuda_pagada?: string;
  ope_fecha_pagada?: string;
  ope_provincia?: string;
  ope_tiene_garante?: string;
  ope_fecha_compra?: string;
  ope_observacion?: string;
  ope_abono_realizado?: string;
  ope_valor_total_pag?: string;
  ope_tipo_actualizacion?: string;
  ope_total_vencido?: string;
  ope_nom_segm_vencido?: string;
  ope_categoria_cliente?: string;
  ope_segmentacion?: string;
  ope_promo_cuotas_gratis?: string;
  ope_deuda_actual?: string;
  ope_saldo_interes?: string;
  ope_saldo_amortizacion?: string;
  ope_int_cobra?: string;
  ope_saldo_cobra_mora?: string;
  ope_descu_campa_saldo_capit?: string;
  ope_valor_descu_saldo_capit?: string;
  ope_descrip_unidad_gestion?: string;
  ope_esactivo?: string;
  ope_id_ultima_gestion?: string;
  ope_estado_contacta?: string;
  ope_fecha_entrega?: string;
  ope_origendatos?: string;
  ope_baseactual?: string;
}
export interface CXC_OperacionActualizacionI {
  id_cxc_operacion_act: number;
  id_cartera: number;
  ope_act_cod_credito?: string;
  ope_act_cli_identificacion?: string;
  ope_act_descripcion?: string;
  ope_act_linea?: string;
  ope_act_producto?: string;
  ope_act_dias_mora?: string;
  ope_act_interes_mora?: string;
  ope_act_gastos_cobranzas?: string;
  ope_act_saldo_cxc_actual?: string;
  ope_act_saldo_cuota_actual?: string;
  ope_act_saldo_capital?: string;
  ope_act_poner_aldia?: string;
  ope_act_liquidar?: string;
  ope_act_abono_realizado?: string;
  ope_act_valor_total_pag?: string;
  ope_act_tipo_actualizacion?: string;
  ope_act_observacion?: string;
  ope_act_total_vencido?: string;
  ope_act_nom_segm_vencido?: string;
  ope_act_categoria_cliente?: string;
  ope_act_segmentacion?: string;
  ope_act_promo_cuotas_gratis?: string;
  ope_act_deuda_actual?: string;
  ope_act_saldo_interes?: string;
  ope_act_saldo_amortizacion?: string;
  ope_act_int_cobra?: string;
  ope_act_saldo_cobra_mora?: string;
  ope_act_descu_campa_saldo_capit?: string;
  ope_act_valor_descu_saldo_capit?: string;
  ope_act_descrip_unidad_gestion?: string;
  ope_act_plazo?: string;
  ope_act_provincia?: string;
  ope_act_tiene_garante?: string;
  ope_act_fecha_compra?: string;
  ope_act_fecha_venc?: string;
  ope_act_gestor_in?: string;
  ope_act_gestor_up?: string;
  ope_act_gestor_rem?: string;
  ope_act_gestor_act?: string;
  ope_act_gestor_desact?: string;
  ope_act_fecha_act?: string;
  ope_act_fecha_desact?: string;
  ope_act_fecha_in?: string;
  ope_act_fecha_up?: string;
  ope_act_mes_actualizacion?: string;
  ope_act_esactivo?: string;
  ope_act_fechade_entrega?: string;
  ope_act_origendatos?: string;
  ope_act_baseactual?: string;
}
export interface ObjetoVerificarI {
  cedula: string;
  columnas: string;
  mensaje: string;
  estado: boolean;
}
export interface ResultadoI {
  data: any;
}
export interface TelefonoCargaI {
  cli_identificacion: string;
  tel_numero: string;
  tel_observacion?: string;
  tel_operadora: string;
  tel_tipo_operadora: string;
  tel_id_tipo_telefono: string;
  tel_id_detal_telefono: string;
}
export interface CorreoCargaI {
  cli_identificacion: string;
  cor_descripcion: string;
  cor_id_tipo_correo: string;
  cor_email: string;
}
export interface DireccionCargaI {
  cli_identificacion: string;
  dir_id_tipo_direccion: string;
  dir_completa: string;
  dir_calle_principal?: string;
  dir_calle_secundaria?: string;
  dir_numero_casa?: string;
  dir_referencia?: string;
  dir_provincia?: string;
  dir_canton?: string;
  dir_parroquia?: string;
}
export interface GaranteCargaI {
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
}
export interface Tipo_CorreoCI {
  id_tipo_correo: string;
  corr_tip_descripcion: string;
}
export interface Tipo_DireccionCI {
  id_tipo_direccion: string;
  dir_tip_descripcion: string;
}
export interface Tipo_TelefonoCI {
  id_tipo_telefono: string;
  tel_tip_descripcion: string;
}
export interface Detalle_TelefonoCI {
  id_detalle_telefono: string;
  tel_detal_descripcion: string;
}
export interface Tipo_TrabajoIC {
  id_tipo_trabajo: string;
  trab_tip_descripcion: string;
}
export interface TrabajoIC {
  cli_identificacion: string;
  tra_ruc?: string;
  tra_descripcion?: string;
  tra_direccion?: string;
  tra_telefono?: string;
  tra_correo?: string;
  tra_observacion?: string;
  tra_id_tipo_trabajo?: string;
}
export interface ConectividadIC {
  id_conectividad: number;
  conec_descripcion: string;
}
export interface ContactabilidadIC {
  id_contactabilidad: number;
  contac_descripcion: string;
}
export interface Tipo_GestionIC {
  id_tipo_gestion: number;
  gestion_tip_descripcion: string;
}
export interface GestionIC {
  id_gestor: number;
  cli_identificacion: string;
  gest_ope_cod_credito: string;
  gest_id_cartera: number;
  gest_id_gestor_asign: number;
  gest_id_tipo_gestion: number;
  gest_id_contactabilidad: number;
  gest_id_conectividad: number;
  gest_id_contacto: number;
  gest_num_contacto: string;
  gest_gestion_mediante: string;
  gest_fecha_gestion: string;
  gest_hora_gestion: string;
  gest_fecha_compromiso: string;
  gest_fecha_incumplido: string;
  gest_descripcion: string;
  gest_valor_comp: string;
  gest_abonos: string;
  gest_num_coutas: string;
  gest_num_coutas_res: string;
  gest_couta: string;
  gest_valor_a_cobrar: string;
  gest_valor_incumplido: string;
  gest_fecha_prox_pago: string;
  gest_fecha_conv: string;
  gest_observacion: string;
  gest_certificado: string;
  gest_volver_llamar: string;
  gest_fecha_volver_llamar: string;
  gest_hora_volver_llamar: string;
  gest_perdio_contacto: string;
  gest_esgestion_real: string;
}
export interface CuentaIC {
  cuent_nombre: string;
  cuent_numero: string;
  cuent_entidadfinanciera: string;
}
export interface PagosIC {
  id_gestor: string;
  cli_identificacion: string;
  ope_cod_credito: string;
  id_cuenta: string;
  id_cartera: string;
  pag_pago: string;
  pag_valor_total_comprobante: string;
  pag_observacion_pago: string;
  pag_codigo_comprobante: string;
  pag_mes_pago: string;
  pag_fecha_pago: string;
}

export interface CxC_OperacionIC {
  ope_cod_credito?: string;
  cli_identificacion?: string;
  ope_descripcion?: string;
  ope_linea?: string;
  ope_producto?: string;
  ope_dias_mora?: string;
  ope_interes_mora?: string;
  ope_gastos_cobranzas?: string;
  ope_saldo_cxc_actual?: string;
  ope_saldo_cuota_actual?: string;
  ope_saldo_capital_venc?: string;
  ope_poner_aldia?: string;
  ope_liquidar?: string;
  ope_fecha_venc?: string;
  ope_plazo?: string;
  ope_liquidado?: string;
  ope_deuda_pagada?: string;
  ope_fecha_pagada?: string;
  ope_provincia?: string;
  ope_tiene_garante?: string;
  ope_fecha_compra?: string;
  ope_observacion?: string;
  ope_abono_realizado?: string;
  ope_valor_total_pag?: string;
  ope_tipo_actualizacion?: string;
  ope_total_vencido?: string;
  ope_nom_segm_vencido?: string;
  ope_categoria_cliente?: string;
  ope_segmentacion?: string;
  ope_promo_cuotas_gratis?: string;
  ope_deuda_actual?: string;
  ope_saldo_interes?: string;
  ope_saldo_amortizacion?: string;
  ope_int_cobra?: string;
  ope_saldo_cobra_mora?: string;
  ope_descu_campa_saldo_capit?: string;
  ope_valor_descu_saldo_capit?: string;
  ope_descrip_unidad_gestion?: string;
  ope_id_ultima_gestion?: string;
  ope_estado_contacta?: string;
  ope_fecha_entrega?: string;
}
export interface Tipo_CarteraIC {
  cart_tip_descripcion: string;
  id_tipo_cartera: number;
}
export interface CarteraIC {
  cart_descripcion: string;
  cart_observacion: string;
  id_tipo_cartera: number;
}
export interface GestorIC {
  ges_nombres: string;
  ges_apellidos: string;
  ges_esgestor: string;
  ges_observacion: string;
  ges_fecha_entrada: string;
  ges_fecha_salida: string;
}
export interface AsignacionIC {
  cli_identificacion: string;
  id_gestor: number;
  cgc_observacion: string;
}
export interface TipoGestionConectividadContactivilidadIC {
  id_tipo_gestion: number;
  id_conectividad: number;
  id_contactabilidad: number;
  tipges_per_edi:number;
}
export interface CuentaCarteraIC {
  id_cuenta: number;
  ctipcar_observacion: string;
}

/***************************************************************************************************************************/



export interface cargaMasivaDetalleCliente {
  cli_identificacion: string;
  cli_nombres: string;
  cli_tipo_identificacion: number;
  cli_genero: string;
  cli_estado_civil: string;
  cli_ocupacion: string;
  cli_fecha_nacimiento: Date;
  cli_score: string;
  cli_fallecido: string;
  cli_fecha_fallecido: Date;
  cli_observacion: string;
  cli_provincia: string;
  cli_canton: string;
  cli_parroquia: string;
  id_cartera: number;
  id_gestor: number;
}
export interface cargaMasiva {
  entidad: string;
  listado:
    | cargaMasivaDetalleCliente[]
    | Tipo_CorreoCI[]
    | Tipo_DireccionCI[]
    | Tipo_TelefonoCI[]
    | Tipo_DireccionCI[]
    | Detalle_TelefonoCI[]
    | Tipo_TrabajoIC[]
    | ConectividadIC[]
    | ContactabilidadIC[]
    | Tipo_GestionIC[]
    | Tipo_CarteraIC[]
    | CuentaIC[]
    | GestorIC[]
    | CarteraIC[]
    | CuentaCarteraIC[]
    | CorreoCargaI[]
    | DireccionCargaI[]
    | TrabajoIC[];
}





export interface GestionICC
{
    id_gestor:number,
    cli_identificacion:string,
    ope_cod_credito:string,
    gest_id_gestor_asign:number,
    gest_id_tipo_gestion:number,
    gest_id_contactabilidad:number,	
    gest_id_conectividad:	number,
    gest_id_contacto:	number,
    gest_num_contacto:	string,
    gest_gestion_mediante:	string,
    gest_fecha_compromiso:	string,
    gest_fecha_incumplido:	string,
    gest_descripcion:	string,
    gest_valor_comp:string,	
    gest_abonos:	string,
    gest_num_coutas:	string,
    gest_num_coutas_res:	string,
    gest_couta:	string,
    gest_valor_a_cobrar:	string,
    gest_valor_incumplido:	string,
    gest_fecha_prox_pago:	string,
    gest_fecha_conv:string,
    gest_observacion:	string,
    gest_certificado:string,
    gest_volver_llamar:	string,
    gest_fecha_volver_llamar:string,
    gest_hora_volver_llamar:string,
    gest_perdio_contacto:string
}
export interface PagosICU
{
    id_gestor:number,
    cli_identificacion:string	,
    ope_cod_credito:string,
    id_cuenta:number,
    pag_pago:string	,
    pag_valor_total_comprobante:string,
    pag_observacion_pago:string,
    pag_codigo_comprobante:string,
    pag_url_comprobante:string,
    pag_observ_comprobante:string,
    pag_pago_verificado:string,
    pag_id_gestor_ingresa:number,
    pag_id_gestor_verifica:number,
    pag_mes_pago:	string,
    pag_fecha_pago:string,
    pag_fecha_verificacion:string,
    pag_medio_contacto:string
}
/***************************************************************************************************************************/



export interface cargaMasivaDetalleCliente {
  cli_identificacion: string;
  cli_nombres: string;
  cli_tipo_identificacion: number;
  cli_genero: string;
  cli_estado_civil: string;
  cli_ocupacion: string;
  cli_fecha_nacimiento: Date;
  cli_score: string;
  cli_fallecido: string;
  cli_fecha_fallecido: Date;
  cli_observacion: string;
  cli_provincia: string;
  cli_canton: string;
  cli_parroquia: string;
  id_cartera: number;
  id_gestor: number;
}
export interface cargaMasiva {
  entidad: string;
  listado:
    | cargaMasivaDetalleCliente[]
    | Tipo_CorreoCI[]
    | Tipo_DireccionCI[]
    | Tipo_TelefonoCI[]
    | Tipo_DireccionCI[]
    | Detalle_TelefonoCI[]
    | Tipo_TrabajoIC[]
    | ConectividadIC[]
    | ContactabilidadIC[]
    | Tipo_GestionIC[]
    | Tipo_CarteraIC[]
    | CuentaIC[]
    | GestorIC[]
    | CarteraIC[]
    | CuentaCarteraIC[]
    | CorreoCargaI[]
    | DireccionCargaI[]
    | TrabajoIC[];
}
export interface generarPDF {
  entidad: string;
  listado:any[];
}
