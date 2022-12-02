import {model, Schema, Document} from 'mongoose';

export interface IPrioridad extends Document {
  nombrePrioridad: string;
  color: string;
  keyPrioridad: number;
}
const PrioridadSchema = new Schema({
  nombrePrioridad: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  keyPrioridad: {
    type: Number,
    required: true,
  },
});

export default model<IPrioridad>('prioridades', PrioridadSchema);
