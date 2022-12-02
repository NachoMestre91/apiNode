import {model, Schema, Document} from 'mongoose';

export interface ITipoCategoria extends Document {
  nombreTipoCategoria: string;
  keyTipoCategoria: number;
}

const TipoCategoriaSchema = new Schema({
  nombreTipoCategoria: {
    type: String,
    required: true,
  },
  keyTipoCategoria: {
    type: Number,
    required: true,
  },
});

export default model<ITipoCategoria>('tipo_categorias', TipoCategoriaSchema);
