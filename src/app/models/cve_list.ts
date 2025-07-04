export interface CVEGrupoAndCausa {
  CVE_Grupo: number;
  CVE_Causa_def: string;
}

export interface CausaDescription {
  CVE_Causa_def: number;
  Causa_def: string;
}
export type ApiResponse = [CVEGrupoAndCausa[], CausaDescription[]];

export interface Record {
  CVE_Enfermedad: number;
  CVE_Grupo: number;
  CVE_Causa_def: string;
  CVE_Estado: number;
  CVEGEO: string;
  CVE_Metropoli: string;
  Ambito: string;
  Sexo: number;
  Edad_gpo: string;
  Ocupacion: number;
  Escolaridad: number;
  Edo_civil: number;
  Anio: number;
}