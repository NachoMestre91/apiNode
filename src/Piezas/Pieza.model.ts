import {model, Schema, Document, Types} from 'mongoose';
import {IUsuario} from '../Usuario/Usuario_Models';
import {IProyectos} from '../Proyectos/Proyecto.model';

export interface IPieza extends Document {
  descripcionAnterior: string;
  descripcion: string;
  fechaVencimiento: Date;
  estadoId: number;
  tipoPiezaId: string;
  asignadoId: Types.ObjectId;
  proyectoId: Types.ObjectId;
}

const PiezaSchema = new Schema({
  descripcionAnterior: {
    type: String,
  },
  descripcion: {
    type: String,
    required: true,
  },
  fechaVencimiento: {
    type: Date,
  },
  estadoId: {
    type: Number,
    required: true,
  },
  tipoPiezaId: {
    type: Schema.Types.ObjectId,
    ref: 'tipo_piezas',
  },
  asignadoId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    ref: 'proyectos',
    required: true,
  },
});

export default model<IPieza>('piezas', PiezaSchema);
