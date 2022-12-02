import {Schema, model, Document} from 'mongoose';

export interface IAdjuntosProyectos extends Document {
  link: string;
  proyectoId: string;
  datosArchivo: object;
}

const AdjuntosProyectosSchema = new Schema({
  linkAdjunto: {
    type: String,
  },
  idArchivo: {
    type: String,
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    ref: 'proyectos',
  },
  datosArchivo: {
    nombre: String,
    tamanio: Number,
    usuario: String,
    fecha: Date,
    tipo: String,
  },
});
export default model<IAdjuntosProyectos>('adjuntos_proyectos', AdjuntosProyectosSchema);
