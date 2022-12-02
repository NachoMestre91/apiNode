import { Schema, model, Document, ObjectId } from "mongoose";

export interface ICategoria extends Document {
  nombreCategoria: string;
  tipoCategoriaId: number;
  keyCategoria: number;
  color: string;
}

const CategoriaSchema = new Schema({
  nombreCategoria: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  keyCategoria: {
    type: Number,
    required: true,
    unique: true,
  },
  tipoCategoriaId: {
    type: Number,
    required: true,
  },
});
export default model<ICategoria>("categorias", CategoriaSchema);
