import {model, Schema, Document} from 'mongoose';

export interface ITipoPieza extends Document {
  nombreTipoPieza: string;
}
const TipoPiezasSchema = new Schema({
  nombreTipoPieza: {
    type: String,
    required: true,
  },
});

export default model<ITipoPieza>('tipo_piezas', TipoPiezasSchema);
