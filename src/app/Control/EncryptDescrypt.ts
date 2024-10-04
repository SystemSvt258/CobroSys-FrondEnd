export const secretKey: string = 'AAECAwQFBgcICQoLDA0ODw==';
import * as CryptoJS from 'crypto-js';
import {
  CarteraI,
  ClienteI,
  ConectividadI,
  ContactabilidadI,
  CorreoI,
  CuentaI,
  CxcOperacionI,
  DetalleTelefonoI,
  DireccionI,
  GaranteI,
  GestionI,
  GestorI,
  MenuI,
  NotificacionI,
  PagosI,
  PermisosI,
  RolesI,
  TelefonoI,
  Tipo_CarteraI,
  Tipo_CorreoI,
  Tipo_DireccionI,
  Tipo_Doc_AdicionalI,
  Tipo_GestionI,
  Tipo_TelefonoI,
  Tipo_TrabajoI,
  TrabajoI,
  UsuariosI,
  RecargoI,
  Tipo_RecargoI,
  CXC_OperacionI,
  CuentaCarteraI,
  TipoGestion_Conectividad_ContactivilidadI,cargaMasiva
} from '../Modelos/response.interface';
import { EditUsuarioI, LoginI } from '../Modelos/login.interface';

export class Encriptacion {
  encriptarAES(
    objeto:
      | EditUsuarioI
      | LoginI
      | ClienteI
      | ConectividadI
      | ContactabilidadI
      | CorreoI
      | CuentaI
      | CxcOperacionI
      | DetalleTelefonoI
      | DireccionI
      | GaranteI
      | Tipo_CarteraI
      | MenuI
      | NotificacionI
      | CarteraI
      | RolesI
      | TrabajoI
      | TelefonoI
      | PermisosI
      | UsuariosI
      | GestorI
      | GestionI
      | Tipo_CorreoI
      | Tipo_DireccionI
      | Tipo_Doc_AdicionalI
      | Tipo_GestionI
       | Tipo_TelefonoI
       | Tipo_TrabajoI
       | PagosI
       |RecargoI
       |Tipo_RecargoI
       |CXC_OperacionI|CuentaCarteraI|TipoGestion_Conectividad_ContactivilidadI|cargaMasiva

  ): string {
    let jsonResponse: string = JSON.stringify(objeto);
    const textoBytes = CryptoJS.enc.Utf8.parse(jsonResponse);
    const claveBytes = CryptoJS.enc.Utf8.parse(secretKey);
    let iv: string = 'unvectordeinicializacion';
    const ivBytes = CryptoJS.enc.Utf8.parse(
      iv.padEnd(16, ' ').substring(0, 16)
    ); // Ajusta el IV al tamaño correcto
    const aesOptions = {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    };
    const encrypted = CryptoJS.AES.encrypt(textoBytes, claveBytes, aesOptions);
    return encrypted.toString();
  }
  decrypt(encryptedText: string): string {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    let iv2: string = 'unvectordeinicializacion';
    const iv = CryptoJS.enc.Utf8.parse(iv2);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

   encryptString(text: string): string {
    // Convierte la clave a un objeto WordArray
    const keyUtf8 = CryptoJS.enc.Utf8.parse('key');
    // Encripta el texto usando AES y la clave
    const encrypted = CryptoJS.AES.encrypt(text, keyUtf8, {
      mode: CryptoJS.mode.ECB, // Modo de cifrado: Electronic Codebook (ECB)
      padding: CryptoJS.pad.Pkcs7 // Relleno: PKCS #7
    });
    // Convierte el texto encriptado a Base64 URL segura
    const base64Encoded = this.base64URLEncode(encrypted.toString());
    return base64Encoded;
  }

   decryptString(encryptedText: string, key: string): string {
    // Decodifica el texto Base64 URL segura
    const encryptedBase64 = this.base64URLDecode(encryptedText);
    // Convierte la clave a un objeto WordArray
    const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
    // Realiza la desencriptación
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, keyUtf8, {
      mode: CryptoJS.mode.ECB, // Modo de cifrado: Electronic Codebook (ECB)
      padding: CryptoJS.pad.Pkcs7 // Relleno: PKCS #7
    });
    // Convierte el resultado a texto
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  }

  private  base64URLEncode(input: string): string {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private  base64URLDecode(input: string): string {
    const pad = (4 - (input.length % 4)) % 4;
    const base64 = (input + "===".slice(0, pad)).replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }

  
}
