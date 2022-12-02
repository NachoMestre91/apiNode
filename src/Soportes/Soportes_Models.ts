import {model, Schema, Document} from 'mongoose';
export interface ISoporte extends Document {
  nombre: string;
  keySoporte: number;
}

const SoporteSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  keySoporte: {
    type: Number,
    required: true,
  },
});

export default model<ISoporte>('soporte', SoporteSchema);
