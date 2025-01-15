import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ngxCsv } from 'ngx-csv';
import autotable from 'jspdf-autotable';
import { Injectable } from '@angular/core';
import { Fechas } from 'src/app/Control/Fechas';
import { cargaMasiva, generarPDF } from '../Modelos/response.interface';

@Injectable({
    providedIn: 'root',
  })
  export class GeneradorReporte {
    public Fechas!: Fechas;

generarPDF(objeto:generarPDF) {
    const fechaActual = new Date();
    const vRows=this.getKeys2(objeto.listado).length;
    const opciones = { timeZone: 'America/Guayaquil' };
    const fecha = fechaActual.toLocaleString('es-EC', opciones);
    let formato='';
    if(vRows<=6)
      {
        formato='a4'
      }else
      {
        formato='a3'
      }
    const doc = new jsPDF('l', 'pt', formato);
    const imageUrl = './assets/Imagenes/LogoSistema.png';
    const imgWidth = 50; 
    const imgHeight = 50;
    doc.text(objeto.entidad, 0, 20);
    doc.text(fecha.substring(0,fecha.length-3), 260, 20);
    doc.addImage(imageUrl, 'PNG', 700, 0, imgWidth, imgHeight, '', 'FAST');
    autotable(doc, {
      head: [this.getKeys2(objeto.listado)],
      margin:{top: 60,left: 0},
      body: this.getProductData(objeto), // empty body for now, you can add data later
      theme: 'grid',
      tableWidth:'auto',
      styles: {
        fontSize:7.5,
        fontStyle: 'normal',
        textColor: 'black',
        cellPadding: 3,
      },
      rowPageBreak: 'avoid', // Configuración para evitar dividir filas
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text('Datos Registrados en'+' '+objeto.entidad, data.settings.margin.left, 50);

        const pageCount = doc.internal.pages.length-1;
        doc.setPage(pageCount);
        doc.text(`Pagina ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      },
      startY:60,
    });
    //const imag= File();
    const pdf = doc.output('blob');
    const url = window.URL.createObjectURL(pdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fecha.substring(0,fecha.length-3)}_reporte.pdf`;
    a.click();
  }
  generarExcel(objeto:generarPDF)
  {
    const fechaActual = new Date();
    const opciones = { timeZone: 'America/Guayaquil' };
    const fecha = fechaActual.toLocaleString('es-EC', opciones);
    let filename: string = `${fecha.substring(0, fecha.length - 3)}_reporte.xlsx`;
    const ws = XLSX.utils.json_to_sheet(objeto.listado);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws,objeto.entidad);
    XLSX.writeFile(wb, filename);

  }
  generarCSV(objeto:generarPDF)
  {
    var opciones=
   {
     title:objeto.entidad,
     fieldSeparator:',',
     quoteStrings:'"',
     showLabels:false,
     noDownload:false,
     useBom:false,
     headers:this.getKeys2(objeto.listado)
   };
   new ngxCsv(objeto.listado,"reporte",opciones);
  }
  getKeys2(valor:any[]): string[] {
    if (valor.length > 0) { // Checks if ListaResultado array has elements
      return Object.keys(valor[0]); // Returns the keys of the first object in ListaResultado array
  }
  return []; // Returns an empty array if ListaResultado is empty
  }
  getProductData(objeto:generarPDF) {
    let array:any[]=[];
      if (objeto.entidad === 'Pagos') {
        array = objeto.listado.map(objeto => [objeto.Cedula,
        objeto.Nombre,
        objeto.Cartera,
        objeto.CodComprobante,
        objeto.Abono,
        objeto.Cuenta,
        objeto.Credito,
        objeto.Producto,
        objeto.FechaPago,
        objeto.GestorIng,
        objeto.FechaVerificacion,
        objeto.GestorVer,
        objeto.GestorAsig,
        objeto.FechaIngreso,
        objeto.Estado]);
      }
      if (objeto.entidad === 'Gestion') {
        array = objeto.listado.map(objeto => [objeto.idGestion,
        objeto.Cedula,
        objeto.Nombre,
        objeto.Credito,
        objeto.nCelular,
        objeto.Contactabilidad,
        objeto.FCompromiso,
        objeto.VolverLlamar,
        objeto.FVolvLlamar,
        objeto.HVolvLlamar,
        objeto.FGestion,
        objeto.Gestor,
        objeto.Cartera,
        objeto.GAsignado]);
      }
      if (objeto.entidad === 'misClientes') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombre,
          objeto.Estado,
          objeto.SaldoTC,
          objeto.SaldoCXC,
          objeto.PagoActual,
          objeto.Gestor,
          objeto.Cartera,
          objeto.Provincia,
          objeto.Certificado,
          objeto.Ultimagestion,
          objeto.RangoEdad,
          objeto.Creditos
          ]
        );
      }
      if (objeto.entidad === 'Usuarios') {
        array = objeto.listado.map(objeto =>
          [objeto.userName,
          objeto.Nombre,
          objeto.Descripcion,
          objeto.EstaSession,
          objeto.FIngreso
          ]
        );
      }
      if (objeto.entidad === 'tipoTrabajo' || objeto.entidad === 'tipoTelefono' || objeto.entidad === 'tipoGestion' || objeto.entidad === 'tipoDocumento' || objeto.entidad === 'tipoDireccion' || objeto.entidad === 'tipoCorreo' || objeto.entidad === 'tipoCartera' || objeto.entidad === 'tipoRecargo') {
        array = objeto.listado.map(objeto =>
          [objeto.idTipo,
          objeto.Descripcion,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Recargo') {
        array = objeto.listado.map(objeto =>
          [objeto.Descripcion,
          objeto.Valor,
          objeto.idCartera,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'detalleTelefono' || objeto.entidad === 'Contactabilidad' || objeto.entidad === 'Conectividad' || objeto.entidad === 'tipoDocumento') {
        array = objeto.listado.map(objeto =>
          [objeto.id,
          objeto.Descripcion,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Asignacion') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombre,
          objeto.Gestor,
          objeto.Cartera,
          objeto.FAsignacion,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Cartera') {
        array = objeto.listado.map(objeto =>
          [objeto.id,
          objeto.Descripcion,
          objeto.Tipo,
          objeto.Observacion,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Cuenta') {
        array = objeto.listado.map(objeto =>
          [objeto.Nombre,
          objeto.Entidad,
          objeto.Numero,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'CuentaCartera') {
        array = objeto.listado.map(objeto =>
          [objeto.Cuenta,
          objeto.Entidad,
          objeto.Numero,
          objeto.Cartera,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Gestor') {
        array = objeto.listado.map(objeto =>
          [objeto.Nombre,
          objeto.Apellido,
          objeto.Meta,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Menu') {
        array = objeto.listado.map(objeto =>
          [objeto.Descripcion,
          objeto.Url,
          objeto.Icono,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Permiso') {
        array = objeto.listado.map(objeto =>
          [objeto.Descripcion,
          objeto.Carteras,
          objeto.Menus,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Roles') {
        array = objeto.listado.map(objeto =>
          [objeto.Descripcion,
          objeto.Observacion,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'TGCC') {
        array = objeto.listado.map(objeto =>
          [objeto.TipoGestion,
          objeto.Contactabilidad,
          objeto.Conectividad,
          objeto.Fecha,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Cliente') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.Certificado,
          objeto.FNacimiento,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Correo') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.Correo,
          objeto.Tipo,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Telefono') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.Numero,
          objeto.Tipo,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Direccion') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.Direccion,
          objeto.Referencia,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Garante') {
        array = objeto.listado.map(objeto =>
          [objeto.CedCliente,
          objeto.NombresCliente,
          objeto.CedGarante,
          objeto.NombresGarante,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Trabajo') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.Ruc,
          objeto.Descripcion,
          objeto.FIngreso,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'Credito') {
        array = objeto.listado.map(objeto =>
          [objeto.Cedula,
          objeto.Nombres,
          objeto.CodigoCxc,
          objeto.Descripcion,
          objeto.SaldoCXC,
          objeto.FechaCompra,
          objeto.Cartera,
          objeto.Estado
          ]
        );
      }
      if (objeto.entidad === 'ReporteGeneral') {
        array = objeto.listado.map(gestion =>
          [
            gestion.cartera,gestion.cedula,gestion.ope_cod_credito,gestion.ope_descripcion,
            gestion.ope_producto,gestion.cli_nombres,gestion.tipo_gestion,gestion.cli_estado_contacta,gestion.Conectividad,gestion.gest_num_contacto,gestion.ope_saldo_cxc_actual,
            gestion.ope_dias_mora,gestion.ope_gastos_cobranzas,gestion.ope_interes_mora,gestion.ope_liquidar,
            gestion.gest_fecha_gestion,
            gestion.gest_fecha_compromiso,
            gestion.gest_valor_a_cobrar,gestion.gest_couta,gestion.gest_fecha_prox_pago,
            gestion.Gestionado,gestion.gest_fecha_volver_llamar,
            gestion.gest_hora_volver_llamar,gestion.volver_llamar,gestion.contac_descripcion,gestion.GestorAsignado
          ]
        );
      }
      if (objeto.entidad === 'ReporteGeneralFiltro') {
        array = objeto.listado.map(gestion =>
          [ 
            gestion.cartera,
            gestion.cedula,
            gestion.ope_cod_credito,
            gestion.ope_descripcion,
            gestion.ope_producto,
            gestion.cli_nombres,
            gestion.tipo_gestion,
            gestion.cli_estado_contacta,
            gestion.Conectividad,
            gestion.gest_num_contacto,
            gestion.ope_saldo_cxc_actual,
            gestion.ope_dias_mora,
            gestion.ope_gastos_cobranzas,
            gestion.ope_interes_mora,
            gestion.ope_liquidar,
            gestion.gest_fecha_gestion,
            gestion.gest_fecha_compromiso,
            gestion.gest_valor_a_cobrar,
            gestion.gest_couta,
            gestion.gest_fecha_prox_pago,
            gestion.Gestionado,
            gestion.gest_fecha_volver_llamar,
            gestion.gest_hora_volver_llamar,
            gestion.volver_llamar,
            gestion.contac_descripcion,
            gestion.GestorAsignado
          ]
        );
      }



      
      return array;
  }
}