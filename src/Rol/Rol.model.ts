import {model, Schema, Document} from 'mongoose';

export interface IRol extends Document {
  nombreRol: string;
  keyRol: number;
}

const RolSchema = new Schema({
  nombreRol: {
    type: String,
    required: true,
  },
  keyRol: {
    type: Number,
    required: true,
    unique: true,
  },
});

export default model<IRol>('roles', RolSchema);
