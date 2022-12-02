import {model, Schema, Document} from 'mongoose';

export interface ILogInvocaciones extends Document {
  fecha: Date;
  usuarioId: string;
  consulta: object;
}

const LogInvocacionesSchema = new Schema({
  fecha: {
    type: Date,
    required: true,
  },
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true,
  },
  consulta: {
    type: Object,
  },
});

export default model<ILogInvocaciones>('Logs', LogInvocacionesSchema);
