import {Schema, model, Document} from 'mongoose';

export interface IComentario extends Document {
  texto: string;
  fecha: string;
  usuarioId: string;
  proyectoId: string;
}

const ComentarioSchema = new Schema({
  texto: {
    type: String,
    required: true,
  },
  fecha: {
    type: String,
    required: true,
  },
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    ref: 'proyectos',
  },
});
export default model<IComentario>('comentarios', ComentarioSchema);
