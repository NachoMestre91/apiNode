import {model, Schema, Document} from 'mongoose';

export interface IPiezasMedios extends Document {
  nombrePiezaMedio: string;
  medioAsignadoId: string;
  estadoId: number;
  totalAdjuntos: number;
  adjuntosDescargados: number;
  publicacionDesde: Date;
  publicacionHasta: Date;
  piezaId: string;
  descargoPieza: boolean;
  descripcionPieza: string;
  archivosAdjuntos: [
    {
      datosArchivo: {};
      linkAdjunto: string;
      idArchivo: string;
      piezaId: string;
      descargado: {type: boolean; default: false};
    }
  ];
  alcance: number;
  soportes: [
    {
      tipoSoporteId: {
        type: number;
      };
      detalles: [{}];
    }
  ];
}
const PiezasMediosSchema = new Schema({
  nombrePiezaMedio: {
    type: String,
  },
  medioAsignadoId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
  },
  estadoId: {
    type: Number,
    required: true,
  },
  totalAdjuntos: {
    type: Number,
  },
  adjuntosDescargados: {
    type: Number,
  },
  publicacionDesde: {
    type: Date,
  },
  publicacionHasta: {
    type: Date,
  },
  piezaId: {
    type: Schema.Types.ObjectId,
    ref: 'piezas',
    required: true,
  },
  descargoPieza: {
    type: Boolean,
    default: false,
  },
  descripcionPieza: {
    type: String,
  },
  archivosAdjuntos: [
    {
      datosArchivo: {type: Object},
      linkAdjunto: {type: String},
      idArchivo: {type: String},
      piezaId: {type: Schema.Types.ObjectId, ref: 'piezas'},
      descargado: {type: Boolean, default: false},
    },
  ],
  alcance: {
    type: Number,
  },
  soportes: [
    {
      tipoSoporteId: {
        type: Number,
      },
      detalles: [],
    },
  ],
});

export default model<IPiezasMedios>('piezas_medios', PiezasMediosSchema);
