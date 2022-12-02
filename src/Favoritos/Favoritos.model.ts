import {model, Document, Schema} from 'mongoose';

export interface IFavoritos extends Document {
  fechaHoraLike: string;
  proyectosSeguidos: string[];
  usuarioId: string;
}

const FavoritosSchema = new Schema({
  fechaHoraLike: {
    type: String,
  },
  proyectosSeguidos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'proyectos',
    },
  ],
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
  },
});

export default model<IFavoritos>('favoritos', FavoritosSchema);
