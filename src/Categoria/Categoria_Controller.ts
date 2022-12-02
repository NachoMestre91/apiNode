import CategoriaModel, { ICategoria } from "./Categoria.model";
// import TipoCategoriaModel, {ITipoCategoria} from '../Tipo_Categoria/TipoCategoria.model';
import {
  traerTipoCategoriaPorId,
  listarTiposCategoria,
} from "../Tipo_Categoria/TipoCategoria_Controller";
import { Request, Response } from "express";

//TODO Búsqueda: para buscar por clave foránea utilizar find en lugar de findById
exports.ListarCategorias = (req: Request, res: Response) => {
  try {
    if (!req.body.tipoCategoriaId) {
      //Busco todas las categorias
      CategoriaModel.find({})
        .then((docs: ICategoria[]) => {
          if (docs) {
            res.status(200).json(docs);
          } else {
            res.status(400).send({ message: "No existen categorías" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno de servidor" });
        });
    } else {
      //Selecciono para un tipo de categoria sus dependencias
      CategoriaModel.find({ tipoCategoriaId: req.body.tipoCategoriaId })
        .then((docs: ICategoria[]) => {
          if (docs) {
            res.status(200).json(docs);
          } else {
            res
              .status(400)
              .send({ message: "No hay categorías para el ID ingresado" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno de servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno de servidor" });
  }
};

export const ListarCategoriasParaInicio = async () => {
  return CategoriaModel.find({});
};

exports.CrearCategoria = (req: Request, res: Response) => {
  try {
    if (!(req.body.nombreCategoria && req.body.tipoCategoriaId)) {
      res.status(400).send("No se ingresaron datos");
    } else {
      if (req.body.tipoCategoriaId) {
        const TipoCategoria = traerTipoCategoriaPorId(req.body.tipoCategoriaId);
        TipoCategoria.then((tc: any) => {
          if (tc) {
            //Existe el tipo de categoria
            let ultimoIndice;
            CategoriaModel.find({})
              .then((doc: ICategoria[]) => {
                if (doc.length > 0) {
                  ultimoIndice = doc.length + 1;
                } else {
                  ultimoIndice = 1;
                }

                const nuevaCategoria: ICategoria = new CategoriaModel({
                  nombreCategoria: req.body.nombreCategoria,
                  color: req.body.color,
                  keyCategoria: ultimoIndice,
                  tipoCategoriaId: req.body.tipoCategoriaId,
                });

                nuevaCategoria
                  .save()
                  .then((resultado: any) => {
                    if (resultado) {
                      res.status(200).send({
                        message: "Categoria insertada",
                        categInsertada: resultado,
                      });
                    } else {
                      console.log(resultado);
                      res.status(500).send({
                        message: "Ocurrió un error al insertar la categoría",
                      });
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res
                      .status(500)
                      .send({ message: "Error interno del servidor" });
                  });
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({ message: "Error interno del servidor" });
              });
          } else {
            res.status(400).send({ message: "El tipo de categoria no existe" });
          }
        }).catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno del servidor" });
        });
      } else {
        res.status(400).send("No se ingresó tipo de categoria");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.ModificarCategoria = (req: Request, res: Response) => {
  try {
    if (!req.body.categoriaId && !req.body.nombreCategoria && !req.body.color) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      CategoriaModel.findById(req.body.categoriaId)
        .then((categoria: any) => {
          if (categoria) {
            // const newCategoria: ICategoria = new CategoriaModel({
            //   nombreCategoria: req.body.nombreCategoria,
            //   color: req.body.color,
            //   tipoCategoriaId: categoria.tipoCategoriaId,
            //   keyCategoria: categoria.keyCategoria,
            // });
            categoria.nombreCategoria = req.body.nombreCategoria;
            categoria.color = req.body.color;
            categoria.save().then((resultado: ICategoria) => {
              if (resultado) {
                res.status(200).send({
                  message: "Categoria actualizada",
                  categoriaActualizada: resultado,
                });
              } else {
                res.status(400).send({ message: "Categoría no encontrada" });
              }
            });
          } else {
            res
              .status(400)
              .send({ message: "No hay resultados para el ID ingresado" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno de servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno de servidor" });
  }
};

exports.EliminarCategoria = (req: Request, res: Response) => {
  try {
    if (!req.body.categoriaId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      CategoriaModel.findByIdAndDelete(req.body.categoriaId)
        .then((doc: any) => {
          if (doc) {
            res.status(200).send({
              message: "Categoria eliminada",
              categoriaEliminada: doc,
            });
          } else {
            res
              .status(400)
              .send({ message: "El ID de categoria ingresado no se encontro" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno de servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno de servidor" });
  }
};
