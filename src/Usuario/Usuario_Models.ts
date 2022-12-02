import {model, Schema, Document, Types} from 'mongoose';
export interface IUsuario extends Document {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  password: string;
  cuit: string;
  email: string;
  rolId: number;
  categorias: Array<Types.ObjectId>;
  hash: string;
  isActivado: boolean;
  isNotificadoPorMailDeActivacion: boolean;
  fotoPerfil: {
    nombreImagen: string;
    tipo: string;
    tamanio: number;
    idDrive: string;
    linkDeDescarga: string;
    linkDeVistaWeb: string;
  };
  documentacionAdjunta: {
    docAfip: {
      nombre: string;
      usuario: string;
      tipoDocumento: number;
      idDrive: string;
      tipo: string;
      tamanio: number;
      linkDeDescarga: string;
      linkDeVistaWeb: string;
    };
    docRentas: {
      nombre: string;
      usuario: string;
      tipoDocumento: number;
      idDrive: string;
      tipo: string;
      tamanio: number;
      linkDeDescarga: string;
      linkDeVistaWeb: string;
    };
    docProveedorEstado: {
      nombre: string;
      usuario: string;
      tipoDocumento: number;
      idDrive: string;
      tipo: string;
      tamanio: number;
      linkDeDescarga: string;
      linkDeVistaWeb: string;
    };
    docConstanciaPublicacion: {
      nombre: string;
      usuario: string;
      tipoDocumento: number;
      idDrive: string;
      tipo: string;
      tamanio: number;
      linkDeDescarga: string;
      linkDeVistaWeb: string;
    };
  };
  area: {
    type: number;
  };
  cantidadSalidas: {
    type: number;
  };
  cargoDesempeña: {type: string};
  horarioEmision: {type: Date};
  descripcionPrograma: {type: string};
  alcanceMedio: {type: number};
  proyectosSeguidos: [{type: string}];
  contacto: string;
  medioPrograma: string;
  soportes: [
    {
      tipoSoporteId: {
        type: number;
      };
      detalles: [
        {
          type: object;
        }
      ];
    }
  ];
  quieroRecibirNotificaciones: boolean;
  enviarNotificacionViaMail: {
    enviarViaMail: boolean;
    seCreaUnProyecto: boolean;
    piezaTerminada: boolean;
    mencionEnComentario: boolean;
    creadorDelProyecto: boolean;
    usuarioMediosDescargaAdjunto: boolean;
    recordatorioDeProyecto: boolean;
    emailPreferidoParaNotificaciones: string;
  };
  enviarNotificacionViaNavegador: {
    enviarViaNavegador: boolean;
    seCreaUnProyecto: boolean;
    piezaTerminada: boolean;
    mencionEnComentario: boolean;
    creadorDelProyecto: boolean;
    usuarioMediosDescargaAdjunto: boolean;
    recordatorioDeProyecto: boolean;
  };
  pausarNotificaciones: {
    pausar: boolean;
    cantidadTiempoPausa: string;
  };
  noQuieroRecibirNotificaciones: {
    desdeHs: string;
    hastaHs: string;
    dias: [string];
  };
}

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
  },
  apellido: {
    type: String,
  },
  nombreUsuario: {
    type: String,
  },
  password: {
    type: String,
  },
  hash: {
    type: String,
  },
  cuit: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rolId: {
    type: Number,
    required: true,
  },
  isActivado: {type: Boolean, default: false},
  isNotificadoPorMailDeActivacion: {type: Boolean, default: false},
  categorias: [
    {
      type: Schema.Types.ObjectId,
      ref: 'categorias',
      required: true,
    },
  ],

  fotoPerfil: {
    nombreImagen: String,
    tipo: String,
    tamanio: Number,
    idDrive: String,
    linkDeDescarga: String,
    linkDeVistaWeb: String,
  },
  documentacionAdjunta: {
    docAfip: {
      nombre: {type: String},
      usuario: {type: String},
      tipoDocumento: {type: Number},
      idDrive: {type: String},
      tipo: {type: String},
      tamanio: {type: Number},
      linkDeDescarga: {type: String},
      linkDeVistaWeb: {type: String},
    },
    docRentas: {
      nombre: {type: String},
      usuario: {type: String},
      tipoDocumento: {type: Number},
      idDrive: {type: String},
      tipo: {type: String},
      tamanio: {type: Number},
      linkDeDescarga: {type: String},
      linkDeVistaWeb: {type: String},
    },
    docProveedorEstado: {
      nombre: {type: String},
      usuario: {type: String},
      tipoDocumento: {type: Number},
      idDrive: {type: String},
      tipo: {type: String},
      tamanio: {type: Number},
      linkDeDescarga: {type: String},
      linkDeVistaWeb: {type: String},
    },
    docConstanciaPublicacion: {
      nombre: {type: String},
      usuario: {type: String},
      tipoDocumento: {type: Number},
      idDrive: {type: String},
      tipo: {type: String},
      tamanio: {type: Number},
      linkDeDescarga: {type: String},
      linkDeVistaWeb: {type: String},
    },
  },
  area: {
    type: Number,
  },
  cantidadSalidas: {
    type: Number,
  },
  cargoDesempeña: {type: String},
  horarioEmision: {type: Date},
  descripcionPrograma: {type: String},
  alcanceMedio: {type: Number},
  proyectosSeguidos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'proyectos',
    },
  ],
  contacto: {
    type: String,
  },
  medioPrograma: {
    type: String,
  },
  soportes: [
    {
      tipoSoporteId: {
        type: Number,
      },
      detalles: [
        {
          type: Object,
        },
      ],
    },
  ],
  quieroRecibirNotificaciones: {type: Boolean, default: false},
  enviarNotificacionViaMail: {
    enviarViaMail: {type: Boolean, default: false},
    seCreaUnProyecto: {type: Boolean, default: false},
    piezaTerminada: {type: Boolean, default: false},
    mencionEnComentario: {type: Boolean, default: false},
    creadorDelProyecto: {type: Boolean, default: false},
    usuarioMediosDescargaAdjunto: {type: Boolean, default: false},
    recordatorioDeProyecto: {type: Boolean, default: false},
    emailPreferidoParaNotificaciones: {type: String},
  },
  enviarNotificacionViaNavegador: {
    enviarViaNavegador: {type: Boolean, default: false},
    seCreaUnProyecto: {type: Boolean, default: false},
    piezaTerminada: {type: Boolean, default: false},
    mencionEnComentario: {type: Boolean, default: false},
    creadorDelProyecto: {type: Boolean, default: false},
    usuarioMediosDescargaAdjunto: {type: Boolean, default: false},
    recordatorioDeProyecto: {type: Boolean, default: false},
  },
  pausarNotificaciones: {
    pausar: {type: Boolean, default: false},
    cantidadTiempoPausa: {type: String, default: ''},
  },
  noQuieroRecibirNotificaciones: {
    desdeHs: {type: String, default: ''},
    hastaHs: {type: String, default: ''},
    dias: [{type: String}],
  },
});

export default model<IUsuario>('usuarios', UsuarioSchema);
