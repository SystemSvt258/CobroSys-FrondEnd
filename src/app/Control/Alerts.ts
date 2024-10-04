import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Alertas {
  MensajePersonalizado(titulo: string, mensaje: string,icono: number) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono == 0?'info':icono == 1?'success':icono == 2?'warning':icono == 3?'question':'error',
        confirmButtonColor: "var(--color-terciario)",
        confirmButtonText: "OK"
      });
  }
  ErrorAlRecuperarElementos() {
    Swal.fire({
      title: 'Oops....!',
      text: 'Error al intentar recuperar la información!',
      icon: 'error',
      confirmButtonColor: 'var(--color-terciario)',
      confirmButtonText: 'OK',
    });
  }
  ErrorAlRecuperarElementosError(cod:string,error:string) {
    Swal.fire({
      title: 'Error "'+cod+'"',
      text: error,
      icon: 'error',
      confirmButtonColor: 'var(--color-terciario)',
      confirmButtonText: 'OK',
    });
  }
  ErrorEnLaOperacion() {
    Swal.fire({
      title: 'Error inesperado!',
      text: 'Error al intentar realizar una acción dentro del formulario!',
      icon: 'error',
      confirmButtonColor: 'var(--color-terciario)',
      confirmButtonText: 'OK',
    });
  }

  ErrorEnLaPeticion(mensaje: string) {
    Swal.fire({
        title: "Error inesperado!",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "var(--color-terciario)",
        confirmButtonText: "OK"
      });
  }


  NoSeRegistranCambios() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'info',
      title: 'Sin Cambios',
    });
  }

  NoExistenDatos() {
    Swal.fire('Oops....!', 'No Existen Datos?', 'warning');
  }

  RegistroAgregado() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'success',
      title: 'Registro Agregado',
    });
  }
  RegistroActualizado() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'success',
      title: 'Registro Actualizado',
    });
  }
  EliminarRegistroTipo(elemento:string): Promise<boolean> {
    return Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      text: elemento,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#32c2de',
      cancelButtonColor: '#f33734',
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    });
  }
  EliminarRegistro(): Promise<boolean> {
    return Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#32c2de',
      cancelButtonColor: '#f33734',
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    });
  }
  RegistroEliminado() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'error',
      title: 'Registro Eliminado',
    });
  }
  PeticionModificada() {
    Swal.fire(
      'Oops....!',
      'La Peticion ha sido modificada en algun punto',
      'error'
    );
  }

  AlertaValidacion(mensaje:string): Promise<boolean> {
    return Swal.fire({
      title: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#32c2de',
      cancelButtonColor: '#f33734',
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    });
  }
  AlertaProcesadosBien(mensaje:string): Promise<boolean> {
    return Swal.fire({
      title: mensaje,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#32c2de',
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    });
  }
  AlertaProcesadosMal(mensaje:string): Promise<boolean> {
    return Swal.fire({
      title: mensaje,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f33734',
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    });
  }
  AlertaValidacionOk(mensaje:string) {
    Swal.fire({
      title: mensaje,
      icon: 'warning',
      confirmButtonColor: '#32c2de',
    });
  }


// ////////////////////////////////// MENSAJES DE CONFIRMACION ///////////////////////////////////////////////////////////
ExitoEnLaPeticion(mensaje: string) {
  Swal.fire({
      title: "Exito!",
      text: mensaje,
      icon: "success",
      confirmButtonColor: "var(--color-terciario)",
      confirmButtonText: "OK"
    });
}

// ////////////////////////////////// MENSAJES DE CONFIRMACION ///////////////////////////////////////////////////////////
MensajeConfirmacion(titulo:string,texto:string): Promise<boolean> {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCloseButton:true,
    showCancelButton: false,
    confirmButtonText: 'Aceptar',
    // cancelButtonText: 'Cancelar',
    confirmButtonColor: '#32c2de',
    // cancelButtonColor: '#f33734',
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  });
}

// ////////////////////////////////// MENSAJES DE NOTIFICACION ///////////////////////////////////////////////////////////
MensajeSuperiorDerechaSuccess(mensaje:string) {
  const alerta = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  alerta.fire({
    icon: 'success',
    title: mensaje,
  });
}
// ////////////////////////////////// MENSAJES DE NOTIFICACION ///////////////////////////////////////////////////////////
NotificacionEnviada() {
  const alerta = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  alerta.fire({
    icon: 'success',
    title: 'Notificacion enviada',
  });
}
// ////////////////////////////////// MENSAJES DE ALERTA ///////////////////////////////////////////////////////////
AlertaEnLaPeticion(mensaje: string) {
  Swal.fire({
      title: "Alerta!",
      text: mensaje,
      icon: "warning",
      confirmButtonColor: "var(--color-terciario)",
      confirmButtonText: "OK"
    });
}
// ////////////////////////////////// MENSAJES DE VERIFICACION ///////////////////////////////////////////////////////////
PagoVerificado() {
  const alerta = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

    alerta.fire({
      icon: 'success',
      title: 'Pago Verificado',
    });
  }


// ////////////////////////////////// ALERTAS DE SESION ///////////////////////////////////////////////////////////

  SesionIniciadaSD() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'success',
      title: 'Se inicio sesión en Servidata',
    });
  }
  SesionRechazadaSD() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'error',
      title: 'No se inicio sesión en Servidata',
    });
  }

  AlertaDeSesion() {
    Swal.fire({
       icon: 'error',
       title: 'Sesión fallida',
       text: 'No se encontraron los valores de sesión!',
     });
   }
  AccesoDenegado() {
    Swal.fire({
       icon: 'warning',
       title: 'Acceso denegado',
      //  text: 'No se encontraron los valores de sesión!',
     });
   }

///////////////////////////////////////////// MODALES TOP END CON TIME ///////////////////////////////////////////////////////////////////////
SuccessTop_End(mensaje: string) {
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: mensaje,
    showConfirmButton: false,
    timer: 1500,
  });
}

// ////////////////////////////////// MODAL CENTRADO SIN TIME   ///////////////////////////////////////////////////////////
ErrorInesperado(mensaje: string) {
  Swal.fire({
      title: "Error inesperado!",
      text: mensaje,
      icon: "error",
      confirmButtonColor: "var(--color-terciario)",
      confirmButtonText: "OK"
    });
}

// ////////////////////////////////// MODAL CENTRADO SIN TIME   ///////////////////////////////////////////////////////////
AlertaConfirmacion(titulo:string,mensaje:string): Promise<boolean> {
  return Swal.fire({
    title: titulo,
    text: mensaje+' '+titulo.toLowerCase()+'?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#32c2de',
    cancelButtonColor: '#f33734',
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  });
}








  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async DescargaModelo2(valor:string) {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
    alerta.fire({
      icon: 'success',
      title: valor,
    });
  }
  async showCustomModal(message: string) {
    let respuestaMensaje='';
    if (message === 'Cliente-Cartera') {
      respuestaMensaje = 'cli_tipo_identificacion,cli_estado_civil,cli_score,cli_fallecido' + ' ' + 'deben estar con valor 0 o vacio en el documento excel';
    }
    if (message === 'Credito-Cartera') {
      respuestaMensaje = 'ope_dias_mora,ope_interes_mora,ope_gastos_cobranzas,ope_saldo_cxc_actual,ope_saldo_cuota_actual,ope_saldo_capital_venc,ope_poner_aldia,ope_liquidar,ope_plazo,ope_liquidado,ope_deuda_pagada,ope_tiene_garante,ope_abono_realizado,ope_valor_total_pag,ope_total_vencido,ope_promo_cuotas_gratis,ope_deuda_actual,ope_saldo_interes,ope_saldo_amortizacion,ope_int_cobra,ope_saldo_cobra_mora,ope_descu_campa_saldo_capit,ope_valor_descu_saldo_capit,ope_id_ultima_gestion,id_cartera' + ' ' + 'deben estar con valor 0 o VACIO en el documento excel';
    }
    if (message === 'Correo') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Direccion') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Garante') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Telefono') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Trabajo') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoTrabajo') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoTelefono') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoDireccion') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'detallesTelefono') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoTrabajo') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Contactabilidad') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Conectivilidad') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoGestion') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Cartera') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Gestor') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoCartera') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'Asignacion') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'cuentaCartera') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    if (message === 'tipoGCC') {
      respuestaMensaje = 'Guiarce como esta en el modelo para la insercion de datos,si los valores son nulos colocar con la palabra VACIO' + ' ' + 'en el documento excel';
    }
    const alerta = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
      },
      buttonsStyling: false,
    });
  
    const result = await alerta.fire({
      title: message,
      html: respuestaMensaje,
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
    });
  
    if (result.isConfirmed) {
      await this.DescargaModelo2('Descargar Modelo'+' '+message);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Modal dismissed');
    }
  }
  DescargaModelo(valor:string) {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-start',
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
    alerta.fire({
      icon: 'success',
      title: valor,
    });
  }
  ArchivoCargado() {
    const alerta = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    alerta.fire({
      icon: 'success',
      title: 'Archivo Cargado',
    });
  }
}
