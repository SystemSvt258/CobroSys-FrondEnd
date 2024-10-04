import {InjectionToken} from "@angular/core"

export interface LoginI{
    usr_usuario?:string | null ,
    usr_password?:string  | null,
    cambio?:number
    
}
export interface TokenI{
    token?:string | null
    
}
// //////////////////////// SERVIDATA //////////////////////////////////
export interface LoginISD{
    codUsuario?:string | null ,
    passwordusuario?:string  | null,
    cambio?:number
    
}
export interface TokenISD{
    token?:string | null
    
}
// //////////////////////////////////////////////////////////
export interface ResultadoPermisosI
{
     menu: ResultadoMenuI[] ;
     cartera: ResultadoCarteraI[];
     gestor: ResultadoGestorI;
}
export interface ResultadoMenuI
{
    men_descripcion: string;
    men_url: string;
    men_icono: string;
    men_lectura: string;
    men_esactivo: string;
}
export interface ResultadoCarteraI
{
    cart_id: Number;
    cart_descripcion: string;
    cart_tip_descripcion: string;
    cart_observacion: string;
    cart_essactivo: string;
}
export interface ResultadoGestorI
{
    id_gestor: Number;
    ges_nombres: string;
    ges_apellidos: string;
    ges_esactivo: string;    
    usr_fraccion_datos: string;
    usr_rango_datos: string;
    ges_meta: string; 
    ges_rol: string;     
    usr_img_url: string; 
}


export interface EditUsuarioI {
    idusuario: number;
    valor: string;
    tipo: number;
  }

// //////////////////////////////////////////////////////////