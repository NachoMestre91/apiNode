import {model, Schema, Document} from 'mongoose';
import {IPieza} from '../Piezas/Pieza.model';

export interface IProyectos extends Document {
  nombreProyecto: string;
  descripcion: string;
  prioridadId: number;
  fechaDeadLine: Date;
  fechaRecordatorio: Date;
  fechaCreacion: Date;
  usuarioId: string;
  tipoCategoriaId: number;
  estadoId: number;
  archivado: boolean;
  piezas: Array<IPieza>;
  editando: boolean;
  fechaBloqueo: Date;
  progreso: object;
  categorias: Array<string>;
  cantidadDeAdjuntosDelBody: Number;
  progresoAdjuntos: {
    totalAdjuntosAntesDeInsertar: {type: Number; default: 0};
    totalAdjuntosDespuesDeInsertar: {type: Number; default: 0};
    totalAdjuntosAntesDeEliminar: {type: Number; default: 0};
    totalAdjuntosDespuesDeEliminar: {type: Number; default: 0};
  };
  isCambiaDescripcionPieza: boolean;
  // progresoPiezas: {
  //   // piezasAntesDeInsertar: [{}];
  //   // piezasDespuesDeInsertar: [{}];
  //   piezasAntesDeEditar: [{}];
  //   piezasDespuesDeEditar: [{}];
  //   // piezasAntesDeEditarProyecto: [{}];
  //   // piezasDespuesDeEditarProyecto: [{}];
  // };
}

const ProyectosSchema = new Schema({
  nombreProyecto: {
    type: String,
    required: true,
    unique: true,
  },
  descripcion: {
    type: String,
  },
  prioridadId: {
    type: Number,
  },
  fechaDeadLine: {
    type: Date,
  },
  fechaBloqueo: {
    type: Date,
  },
  fechaRecordatorio: {
    type: Date,
  },
  fechaCreacion: {
    type: Date,
  },
  piezas: [
    {
      type: Schema.Types.ObjectId,
      ref: 'piezas',
    },
  ],
  categorias: [
    {
      type: Schema.Types.ObjectId,
      ref: 'categorias',
    },
  ],
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
  },
  tipoCategoriaId: {
    type: Number,
  },

  estadoId: {
    type: Number,
    required: true,
  },
  editando: {
    type: Boolean,
  },
  archivado: {
    type: Boolean,
    default: false,
  },
  progreso: {
    totalPiezas: Number,
    piezasTerminadas: Number,
  },
  cantidadDeAdjuntosDelBody: {type: Number, default: 0},
  progresoAdjuntos: {
    totalAdjuntosAntesDeInsertar: {type: Number, default: 0},
    totalAdjuntosDespuesDeInsertar: {type: Number, default: 0},
    totalAdjuntosAntesDeEliminar: {type: Number, default: 0},
    totalAdjuntosDespuesDeEliminar: {type: Number, default: 0},
  },
  isCambiaDescripcionPieza: {type: Boolean, default: false},
  // progresoPiezas: {
  //   // piezasAntesDeInsertar: [{type: Object, default: []}],
  //   // piezasDespuesDeInsertar: [{type: Object, default: []}],
  //   piezasAntesDeEditar: [{type: Object, default: []}],
  //   piezasDespuesDeEditar: [{type: Object, default: []}],
  //   // piezasAntesDeEditarProyecto: [{type: Object, default: []}],
  //   // piezasDespuesDeEditarProyecto: [{type: Object, default: []}],
  // },
});

export default model<IProyectos>('proyectos', ProyectosSchema);
