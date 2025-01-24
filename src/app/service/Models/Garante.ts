import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
  export class GaranteService {
    private garantes: any[] = [
        { id: 1, name: 'id_garante', label: 'ID Garante', type: 'number', required: true },
        { id: 2, name: 'cli_identificacion', label: 'Identificación Cliente', type: 'text', required: true },
        { id: 3, name: 'gar_identificacion', label: 'Identificación Garante', type: 'text', required: true, validation: { length: 10 } },
        { id: 4, name: 'gar_nombres', label: 'Nombres', type: 'text', required: true },
        { id: 5, name: 'gar_trabajo', label: '¿Tiene Trabajo?', type: 'checkbox', required: false },
        { id: 6, name: 'gar_direccion_dom', label: 'Dirección Domicilio', type: 'text', required: false },
        { id: 7, name: 'gar_direccion_trabajo', label: 'Dirección Trabajo', type: 'text', required: false },
        { id: 8, name: 'gar_telefono_domicilio', label: 'Teléfono Domicilio', type: 'text', required: false },
        { id: 9, name: 'gar_telefono_trabajo', label: 'Teléfono Trabajo', type: 'text', required: false },
        { id: 10, name: 'gar_telefono_adicional', label: 'Teléfono Adicional', type: 'text', required: false },
        { id: 11, name: 'gar_observacion', label: 'Observación', type: 'textarea', required: false },
        { id: 12, name: 'gar_fecha_act', label: 'Fecha Activo', type: 'date', required: true },
        { id: 13, name: 'gar_fecha_desact', label: 'Fecha Desactivo', type: 'date', required: false },
        { id: 14, name: 'gar_fecha_in', label: 'Fecha Creación', type: 'date', required: true },
        { id: 15, name: 'gar_fecha_up', label: 'Fecha Actualización', type: 'date', required: true },
        { id: 16, name: 'gar_esactivo', label: 'Activo', type: 'checkbox', required: false },
      ];
      
    // Obtener todos los garantes
    getGarantes(): any[] {
      return this.garantes;
    }
  
    // Crear un garante
    createGarante(garante: any) {
      this.garantes.push({ ...garante, id_garante: this.garantes.length + 1 });
    }
  
    // Actualizar un garante
    updateGarante(id_garante: number, updatedGarante: any) {
      const index = this.garantes.findIndex((g) => g.id_garante === id_garante);
      if (index !== -1) this.garantes[index] = updatedGarante;
    }
  
    // Eliminar un garante
    deleteGarante(id_garante: number) {
      this.garantes = this.garantes.filter((g) => g.id_garante !== id_garante);
    }
  }
  