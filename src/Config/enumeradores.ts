export enum Estado {
  Borrador,
  Creado,
  Asignado,
  EnCurso,
  Pausado,
  Terminado,
  Archivado,
  Correcciones,
  Aprobado,
  Publicado,
  Descargado,
}

export enum Prioridad {
  Urgente,
  Alta,
  Media,
  Baja,
}

export enum Tipo_Categoria {
  FiguraPublica,
  ComunicacionInstitucional,
  ComunicacionPolitica,
}

export enum Rol {
  Administrador = 1,
  Prensa,
  Productor,
  Medio,
}

export enum Area_Usuario {
  Grafica = 1,
  Redes,
  AudioVisual,
  Streaming,
}

export enum Alcance_Medio {
  Nacional = 1,
  Local,
}

export enum Tipo_Documento {
  Afip = 1,
  Rentas,
  Proveedor_Estado,
  Constancia_Publicacion,
}
export enum Soportes {
  Grafica = 1,
  Television,
  Radio,
  Via_Publica,
  VP_LED,
  Web,
  Redes_Sociales,
}
