import {model, Schema, Document} from 'mongoose';

export interface IEstado extends Document {
  nombreEstado: string;
  keyEstado: number;
  color: string;
}

const EstadosSchema = new Schema({
  nombreEstado: {
    type: String,
    required: true,
  },
  keyEstado: {
    type: Number,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    required: true,
  },
});

export default model<IEstado>('estados', EstadosSchema);
