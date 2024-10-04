import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Fechas {
  // constructor(private datePipe: DatePipe){}
  calcularEdad(fechaNacimiento: string): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    const diaActual = hoy.getDate();

    if (
      mesActual < fechaNac.getMonth() + 1 ||
      (mesActual === fechaNac.getMonth() + 1 && diaActual < fechaNac.getDate())
    ) {
      edad--;
    }

    return edad;
  }
  // fechaActualLarga
  fechaMinDate() {
    const minDate = new Date('1969-12-31').toISOString().split('T')[0];
    return minDate;
  }
  HoraMinima() {
    const minTime = '00:00:00';
    return minTime;
  }
  // fechaActualLarga
  fecha() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}Z`;
  }
  // fechaActualLarga
  fechaActualCorta() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${anio}-${mes}-${dia}`;
  }
  fechaActualCorta2() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }
  fechaActualCortaEnvio(dato: string) {
    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    let fecha = `${anio}-${mes}-${dia}`;
    return fecha;
  }

  fechaFormato(dato: string) {
    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');

    return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}Z`;
  }
  FechaMuestra(dato: string) {
    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');

    return `${dia}-${mes}-${anio} ${hora}:${minutos}:${segundos}`;
  }
  fechaCorta(dato: string) {
    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Los meses son base 0, así que sumamos 1
    const anio = fechaActual.getFullYear().toString();

    // Formatea la fecha en "dd/MM/yyyy"
    return `${dia}-${mes}-${anio}`;
  }
  fechaCortaFormato(dato: string) {
    if(dato!){      
    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Los meses son base 0, así que sumamos 1
    const anio = fechaActual.getFullYear().toString();

    // Formatea la fecha en "dd/MM/yyyy"
    return `${anio}-${mes}-${dia}`;
    }else{
      return null;
    }
  }

  fechaCortaAbt(dato: string) {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mesIndex = fechaActual.getMonth();
    const mesAbreviado = meses[mesIndex];
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mesAbreviado}-${anio}`;
  }
  fechaCortaAbtF1(dato: string) {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const fechaActual = new Date(dato);
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mesIndex = fechaActual.getMonth();
    const mesAbreviado = meses[mesIndex];
    const anio = fechaActual.getFullYear().toString();

    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');

    return `${dia}-${mesAbreviado}-${anio} ${hora}:${minutos}:${segundos}`;
  }

  fechaCortaAbtF2(dato: string) {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const partes = dato.split(' ');
    const fechaPartes = partes[0].split('/');
    const horaPartes = partes[1] ? partes[1].split(':') : ['00', '00', '00'];

    const dia = fechaPartes[0].padStart(2, '0');
    const mesIndex = parseInt(fechaPartes[1]) - 1;
    const mesAbreviado = meses[mesIndex];
    const anio = fechaPartes[2];

    const hora = horaPartes[0].padStart(2, '0');
    const minuto = horaPartes[1].padStart(2, '0');
    const segundo = horaPartes[2].padStart(2, '0');

    // return `${dia}-${mesAbreviado}-${anio} ${hora}:${minuto}:${segundo}`;
    return `${dia}-${mesAbreviado}-${anio}`;
  }
  fechaCortaAbtF3(dato: string) {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const partes = dato.split(' ');
    const fechaPartes = partes[0].split('/');
    const horaPartes = partes[1] ? partes[1].split(':') : ['00', '00', '00'];

    const dia = fechaPartes[0].padStart(2, '0');
    const mesIndex = parseInt(fechaPartes[1]) - 1;
    const mesAbreviado = meses[mesIndex];
    const anio = fechaPartes[2];

    const hora = horaPartes[0].padStart(2, '0');
    const minuto = horaPartes[1].padStart(2, '0');
    const segundo = horaPartes[2].padStart(2, '0');

    return `${dia}-${mesAbreviado}-${anio} ${hora}:${minuto}:${segundo}`;
    // return `${dia}-${mesAbreviado}-${anio}`;
  }

  // obtener el mes de una fecha
  // ExtraerMes(dato: Date) {
  //   console.log(dato)
  //   const meses = [
  //     'Enero',
  //     'Febrero',
  //     'Marzo',
  //     'Abril',
  //     'Mayo',
  //     'Junio',
  //     'Julio',
  //     'Agosto',
  //     'Septiembre',
  //     'Octubre',
  //     'Noviembre',
  //     'Diciembre',
  //   ];
  
  //   const mesIndex = dato.getMonth(); // Obtener el índice del mes (0-11)
  //   const nombreMes = meses[mesIndex]; // Obtener el nombre del mes usando el índice
  //   return nombreMes;
  // }

  ExtraerMes(fecha: any): string {
    if (!(fecha instanceof Date)) {
      fecha = new Date(fecha);
    }
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }

    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];

    return meses[fecha.getMonth()];
  }
  //////////////////////////////////////////  HORAS /////////////////////////////////////////////////////////

  HoraActual() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
    return `${hora}:${minutos}:${segundos}`;
  }
  HoraCorta(dato: string) {
    let hora = dato.substring(0,8)
    return `${hora}`;
  }
  formatearHora(dato: string): string {
    // Extraer la parte de hora, minuto y segundo (ignorar los milisegundos)
    const horaCompleta = dato.split('.')[0]; // Obtiene "15:57:38"

    // Dividir la hora en componentes
    const [hora, minuto, segundo] = horaCompleta.split(':');
    
    // Construir la hora en el formato "HH:mm:ss"
    return `${hora}:${minuto}:${segundo}`;
}
}
