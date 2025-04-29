export interface CVEGrupoAndCausa {
  CVE_Grupo: number;
  CVE_Causa_def: string;
}

export interface CausaDescription {
  CVE_Causa_def: number;
  Causa_def: string;
}
export type ApiResponse = [CVEGrupoAndCausa[], CausaDescription[]];