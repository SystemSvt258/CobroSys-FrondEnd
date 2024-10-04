import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class TipoDeTexto {
  constructor() {}
  ///////////////////////////////////////// VALIDAR CAMPOS DE ACUERDO AL TIPO  //////////////////////////////////////////////////////////
  V_ValidadorGeneral(tipo: string, valor: any): boolean {
    switch (tipo) {
      case 'numerico':
        return this.V_SoloNumeros(valor);
        break;
      case 'alfanumerico':
        return this.V_AlfaNumerico(valor);
        break;
        case 'alfanumericoNoNull':
        return this.V_AlfaNumericoNoNulo(valor);
        break;
      case 'correo':
        return this.V_Correo(valor);
        break;
      default:
        return false;
    }
  }

  ///////////////////////////////////////// VALIDAR ALFA NUMERICO  //////////////////////////////////////////////////////////
  V_AlfaNumericoNoNulo(parametro: string) {
    var parm = parametro.trim()
    let resultado = false;
    if (parm.length == 0) {
      return false;
    }
    for (let i = 0; i < parm.length; i++) {
      let caracterActual = parm[i];
      if (!caracterActual.match(/^[0-9a-zñA-ZÑ\s]*$/)) {
        return false;
      }
      
    }
    return true;
  }
  V_AlfaNumerico(parametro: string) {
    var parm = parametro.trim()
    let resultado = false;
    for (let i = 0; i < parm.length; i++) {
      let caracterActual = parm[i];
      if (!caracterActual.match(/^[0-9a-zñA-ZÑ\s]*$/)) {
        return false;
      }
      
    }
    return true;
  }
  VFN_AlfaNumerico(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_AlfaNumerico(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }
  VFN_AlfaNumericoNoNulo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_AlfaNumericoNoNulo(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }
  ///////////////////////////////////////// VALIDAR SOLO TEXTO  //////////////////////////////////////////////////////////
  V_SoloLetras(parametro: string) {
    let resultado = false;
    for (let i = 0; i < parametro.length; i++) {
      let caracterActual = parametro[i];
      if (!caracterActual.match(/^[a-zñA-ZÑ\s]*$/)) {
        return false;
      }
    }
    return true;
  }
  VFN_SoloLetras(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_AlfaNumerico(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }
  ///////////////////////////////////////// VALIDAR SOLO NUMEROS  //////////////////////////////////////////////////////////
  V_SoloNumeros(parametro: string) {
    if (parametro === '' || parametro === null) {
      return true;
    } else {
      for (let i = 0; i < parametro.length; i++) {
        let caracterActual = parametro[i];
        if (!caracterActual.match('^[0-9]*$')) {
          return false;
        }
      }
      return true;
    }
  }
  VFN_SoloNumeros(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_SoloNumeros(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }
  ///////////////////////////////////////// VALIDAR SOLO NUMEROS DIFERENTE DE CERO  //////////////////////////////////////////////////////////
  V_NumDiferDeCero(parametro: string) {
    // definir bien para utilizarlo
    if (parametro === '' || parametro === null) {
      return true;
    } else {
      for (let i = 0; i < parametro.length; i++) {
        let caracterActual = parametro[i];
        if (!caracterActual.match('^[0-9]*$')) {
          return false;
        }
      }
      return true;
    }
  }
  VFN_NumDiferDeCero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value != 0 && this.V_SoloNumeros(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }
  ///////////////////////////////////////// VALIDAR SOLO NUMEROS DECIMALES //////////////////////////////////////////////////////////

  V_NumerosDesimales(parametro: string) {
    if (parametro === '' || parametro === null) {
      return true;
    } else {
      let comaEncontrada = false;
      for (let i = 0; i < parametro.length; i++) {
        let caracterActual = parametro[i];
        if (caracterActual === '.') {
          if (comaEncontrada) {
            return false;
          } else {
            comaEncontrada = true;
          }
        } else if (!caracterActual.match('^[0-9]*$')) {
          return false;
        }
      }
      return true;
    }
  }

  VFN_NumerosDesimales(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_NumerosDesimales(value)) {
        return null;
      } else {
        return { soloNumerosDesimales: { value: control.value } };
      }
    };
  }

  ///////////////////////////////////////// VALIDAR FORMATO CORREO  //////////////////////////////////////////////////////////
  V_Correo(correo: string) {
    if (
      correo.includes('@') &&
      correo.endsWith(
        '.com' ||
          '.ec' ||
          '.co' ||
          'com' ||
          'org' ||
          'net' ||
          'edu' ||
          'gov' ||
          'mil' ||
          'ec' ||
          'co' ||
          'es' ||
          'mx' ||
          'ar' ||
          'cl' ||
          'br' ||
          'info' ||
          'biz' ||
          'name' ||
          'pro' ||
          'xyz'
      )
    ) {
      let partes = correo.split('@');
      if (partes.length === 2 && partes[1].split('.').length === 2) {
        return true;
      }
    }
    return false;
  }
  VFN_Correo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '' || value === null || this.V_Correo(value)) {
        return null;
      } else {
        return { TipoCorreo: { value: control.value } };
      }
    };
  }

  ///////////////////////////////////////// VALIDAR LONGITUD FIJA  //////////////////////////////////////////////////////////
  V_LongitudFija(numero: string, longitud: number) {
    return numero.length === longitud;
  }
  validarLongitudFija(longitud: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (
        value === '' ||
        value === null ||
        this.V_LongitudFija(value, longitud)
      ) {
        return null;
      } else {
        return { TipoLongitudFija: { value: control.value } };
      }
    };
  }

  ///////////////////////////////////////// VALIDAR LONGITUD DOBLE  //////////////////////////////////////////////////////////
  V_LongitudDoble(numero: string, longitud1: number, longitud2: number) {
    return numero.length === longitud1 || numero.length === longitud2;
  }
  validarLongitudDoble(longitud1: number, longitud2: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (
        value === '' ||
        value === null ||
        this.V_LongitudDoble(value, longitud1, longitud2)
      ) {
        return null;
      } else {
        return { TipoLongitudDoble: { value: control.value } };
      }
    };
  }
  ///////////////////////////////////////// VALIDAR LONGITUD MAX Y MIN //////////////////////////////////////////////////////////
  V_LongitudMinMax(numero: string, min: number, max: number) {
    return numero.length >= min && numero.length <= max;
  }
  validarLongitudMinMax(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (
        value === '' ||
        value === null ||
        this.V_LongitudMinMax(value, min, max)
      ) {
        return null;
      } else {
        return { TipoLongitudMinMax: { value: control.value } };
      }
    };
  }

  ///////////////////////////////////////// VALIDAR MAYOR Q' Y MENOR Q' //////////////////////////////////////////////////////////

  V_MayorQue(valor1: string, valor2: string): boolean {
    const num1 = parseFloat(valor1);
    const num2 = parseFloat(valor2);

    if (isNaN(num1) || isNaN(num2)) {
      throw new Error('Ambos valores deben ser números válidos.');
    }

    return num1 <= num2;
  }

  VFN_MayorQue(control1: string, control2: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null; // Si el control no tiene padre, salir

      const formGroup = control.parent as FormGroup;

      const valor1 = formGroup.controls[control1];
      const compararControl = formGroup.controls[control2];

      if (!valor1 || !compararControl) return null; // Si el control de comparación no existe, salir

      const valor = valor1.value;
      const comparar = compararControl.value;
      if (valor == '' || comparar == '') return null;

      if (!this.V_MayorQue(valor, comparar)) {
        return { mayorQue: true };
      }

      return null;
    };
  }

  // VFN_MenorQue(control1: string, control2: string): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     if (!control.parent) return null; // Si el control no tiene padre, salir

  //     const formGroup = control.parent as FormGroup;
  //     const valor1 = formGroup.controls[control1];
  //     const compararControl = formGroup.controls[control2];

  //     if (!valor1 || !compararControl) return null; // Si el control de comparación no existe, salir

  //     const valor = valor1.value;
  //     const comparar = compararControl.value;

  //     if (this.V_MayorQue(valor, comparar)) {
  //       return { menorQue: true };
  //     }

  //     return null;
  //   };
  // }

  //  VFN_MayorQue(ctl_menor: string, ctl_maximo: string): ValidatorFn {
  //   return (formGroup: AbstractControl): ValidationErrors | null => {
  //     const group = formGroup as FormGroup;
  //     const menor = group.controls[ctl_menor];
  //     const mayor = group.controls[ctl_maximo];

  //     if (!menor || !mayor) {
  //       return null; // No se puede validar si los controles no existen
  //     }

  //     const valor1 = menor.value;
  //     const valor2 = mayor.value;

  //     try {
  //       if (!this.V_MayorQue(valor1, valor2)) {
  //         menor.setErrors({ mayorQue: true });
  //         return { mayorQue: true };
  //       } else {
  //         menor.setErrors(null);
  //       }
  //     } catch (error) {
  //       menor.setErrors({ invalidNumber: error });
  //       return { invalidNumber: error };
  //     }

  //     return null;
  //   };
  // }
  //  VFN_MenorQue(ctl_menor: string, ctl_maximo: string): ValidatorFn {
  //   return (formGroup: AbstractControl): ValidationErrors | null => {
  //     const group = formGroup as FormGroup;
  //     const menor = group.controls[ctl_menor];
  //     const mayor = group.controls[ctl_maximo];

  //     if (!menor || !mayor) {
  //       return null; // No se puede validar si los controles no existen
  //     }

  //     const valor1 = menor.value;
  //     const valor2 = mayor.value;

  //     try {
  //       if (!this.V_MenorQue(valor1, valor2)) {
  //         menor.setErrors({ mayorQue: true });
  //         return { mayorQue: true };
  //       } else {
  //         menor.setErrors(null);
  //       }
  //     } catch (error) {
  //       menor.setErrors({ invalidNumber: error });
  //       return { invalidNumber: error };
  //     }

  //     return null;
  //   };
  // }

  /////////////////////////////////////// VALIDAR NUMERO DE DIGITOS POR TIPO DE IDENTIFICACION   //////////////////////////////////////////////////////////

  Tipo_Identificacion(Valor: string, tipo: string) {
    if (tipo === '1') {
      return Valor.length === 10 && this.V_SoloNumeros(Valor);
    }
    if (tipo === '2') {
      return Valor.length === 13 && this.V_SoloNumeros(Valor);
    }
    if (tipo === '3') {
      return (
        Valor.length >= 6 && Valor.length <= 9 && this.V_AlfaNumerico(Valor)
      );
    }
    return false;
  }

  ValidatorTipo_Identificacion(
    identificacion: string,
    tipo_identificacion: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const ide = formGroup.get(identificacion)?.value;
      const tipo_ide = formGroup.get(tipo_identificacion)?.value;
      if (tipo_ide != null && tipo_ide != '') {
        if (
          ide === '' ||
          ide === null ||
          this.Tipo_Identificacion(ide, tipo_ide)
        ) {
          return null;
        } else {
          return { Requerido: true };
        }
      } else {
        return null;
      }
    };
  }

  ///////////////////////////////////////// VALIDACION ESPECIAL PARA GESTIONAR //////////////////////////////////////////////////////////

  ValidatorCamposDependientes(
    idCampo: string,
    contactoCampo: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const idControl = formGroup.get(idCampo);
      const contactoControl = formGroup.get(contactoCampo);
      if (
        idControl!.value == 1 ||
        (idControl!.value == 3 && contactoCampo != 'gest_fecha_prox_pago')
      ) {
        if (!contactoControl!.value || contactoControl!.value.trim() === '') {
          contactoControl!.setErrors({ ['contactoRequerido']: true });
          return { ['contactoRequerido']: true };
        }
      }
      if (
        contactoControl!.errors &&
        contactoControl!.errors['contactoRequerido']
      ) {
        delete contactoControl!.errors['contactoRequerido'];
        if (Object.keys(contactoControl!.errors).length === 0) {
          contactoControl!.setErrors(null);
        }
      }

      return null;
    };
  }
  ValidatorCamposDependientes2(
    idCampo: string,
    contactoCampo: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const idControl = formGroup.get(idCampo);
      const contactoControl = formGroup.get(contactoCampo);

      if (idControl!.value == 2) {
        if (!contactoControl!.value || contactoControl!.value.trim() === '') {
          contactoControl!.setErrors({ ['contactoRequerido']: true });
          return { ['contactoRequerido']: true };
        }
      }
      if (
        contactoControl!.errors &&
        contactoControl!.errors['contactoRequerido']
      ) {
        delete contactoControl!.errors['contactoRequerido'];
        if (Object.keys(contactoControl!.errors).length === 0) {
          contactoControl!.setErrors(null);
        }
      }

      return null;
    };
  }

  validarVolverLlamar(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const gestVolverLlamar = control.get('gest_volver_llamar');
      const gestFechaVolverLlamar = control.get('gest_fecha_volver_llamar');
      const gestHoraVolverLlamar = control.get('gest_hora_volver_llamar');

      if (gestVolverLlamar && gestVolverLlamar.value) {
        if (!gestFechaVolverLlamar || !gestFechaVolverLlamar.value) {
          gestFechaVolverLlamar?.setErrors({ required: true });
          return { fechaVolverLlamarRequired: true };
        }
        if (!gestHoraVolverLlamar || !gestHoraVolverLlamar.value) {
          gestHoraVolverLlamar?.setErrors({ required: true });
          return { horaVolverLlamarRequired: true };
        }
      }

      return null;
    };
  }
}
