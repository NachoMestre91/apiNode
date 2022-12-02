import { model, Schema, Document } from "mongoose";

export interface IAdjuntosPieza extends Document {
  linkAdjunto: string;
  piezaId: string;
  datosArchivo: object;
  descargado: boolean;
}

const AdjuntosPiezaSchema = new Schema({
  linkAdjunto: {
    type: String,
  },
  idArchivo: {
    type: String,
  },
  piezaId: {
    type: Schema.Types.ObjectId,
    ref: "piezas",
  },
  datosArchivo: {
    nombre: String,
    tamanio: Number,
    usuario: String,
    fecha: Date,
    tipo: String,
  },
  descargado: { type: Boolean, default: false },
});

export default model<IAdjuntosPieza>("adjuntos_piezas", AdjuntosPiezaSchema);
