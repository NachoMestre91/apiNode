import TipoCategoria, { ITipoCategoria } from "./TipoCategoria.model";
import Categoria, { ICategoria } from "../Categoria/Categoria.model";
import { Request, response, Response } from "express";
import CodifClaves from "../Config/validaciones";
import TipoCategoriaModel from "./TipoCategoria.model";

const CodfCla = new CodifClaves();

//TCategorias,CrearTCategoria,ModifTCategoria,EliminarTCateg

exports.ListarTiposCategoria = (req: Request, res: Response) => {
  try {
    TipoCategoria.find({})
      .then((docs: any[]) => {
        if (docs) {
          res.status(200).json(docs);
        } else {
          res.status(400).send({ message: "No hay resultados" });
        }
      })
      .catch((err: any) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: "Error interno de servidor" });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

export const ListarTiposCategoriaParaInicio = async () => {
  return TipoCategoria.find({});
};

exports.CrearTipoCategoria = (req: Request, res: Response) => {
  try {
    if (!req.body.nombreTipoCategoria) {
      res.status(400).send({ message: "No se ingresó tipo de categoría" });
    } else {
      const newTipoCategoria: ITipoCategoria = new TipoCategoria({
        nombreTipoCategoria: req.body.nombreTipoCategoria,
      });
      newTipoCategoria.save(function (error, doc) {
        if (error) {
          console.log(error);
          res.status(500).send({ message: "Error interno del servidor" });
        } else {
          res.status(200).json(doc);
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.ModificarTipoCategoria = (req: Request, res: Response) => {
  try {
    if (!req.body.tipoCategoriaId && !req.body.nombreTipoCategoria) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      TipoCategoria.findByIdAndUpdate({ _id: req.body.tipoCategoriaId })
        .then((v: any) => {
          if (v == null) {
            res
              .status(404)
              .send({ message: "Tipo de categoría no encontrada" });
          } else {
            v.nombreTipoCategoria = req.body.nombreTipoCategoria;
            v.save().then((value: any) => {
              if (value) {
                res.status(200).send({
                  message: "Tipo de categoría actualizada",
                  TipoCategoriaActualizada: value,
                });
              } else {
                res.status(500).send({
                  message: "Error al actualizar el tipo de categoría",
                });
              }
            });
          }
        })
        .catch((e: any) => {
          //console.log('En el catch');
          if (e) {
            console.log(e);
            res.status(500).send({ message: "Error interno del servidor" });
          }
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

//TODO:
//Proceso: Comprueba la existencia de subcategorías, elimina las dependencias
//luego elimina de la BD la categoría correspondiente

exports.EliminarTipoCategoria = (req: Request, res: Response) => {
  try {
    if (!req.body.tipoCategoriaId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      TipoCategoria.findById({ _id: req.body.tipoCategoriaId })
        .then((doc: any) => {
          console.log(doc);
          if (doc) {
            //Si existe el tipo de categoria, busco sus dependencias, las elimino y despues elimino el tipo de categoría
            Categoria.find({ tipoCategoriaId: req.body.tipoCategoriaId })
              .then((docs: any[]) => {
                if (docs) {
                  Categoria.deleteMany({})
                    .then((resultado: any) => {
                      if (resultado) {
                        TipoCategoria.deleteOne({
                          _id: req.body.tipoCategoriaId,
                        })
                          .then((value: any) => {
                            res.status(200).send({
                              message:
                                "El tipo de categoría y sus dependencias han sido eliminadas correctamente",
                            });
                          })
                          .catch((e: any) => {
                            console.log(e);
                            res
                              .status(500)
                              .send({ message: "Error interno del servidor" });
                          });
                      } else {
                        TipoCategoria.deleteOne({
                          _id: req.body.tipoCategoriaId,
                        }).then((v: any) => {
                          if (v) {
                            res.status(200).send({
                              message:
                                "El tipo de categoría se elimino correctamente",
                            });
                          } else {
                            console.log(v);
                            res.status(500).send({
                              message:
                                "No se encontró el tipo de categoría ingresado",
                            });
                          }
                        });
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res
                        .status(500)
                        .send({ message: "Error interno del servidor" });
                    });
                } else {
                  res.status(400).send({
                    message:
                      "El tipo de categoría ingresado no existe o fue eliminado",
                  });
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({ message: "Error interno del servidor" });
              });
          } else {
          }
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ message: "Error del servidor" });
  }
};

export const traerTipoCategoriaPorId = (idTipoCategoria: number) => {
  return TipoCategoriaModel.findOne({ keyTipoCategoria: idTipoCategoria });
};

export const listarTiposCategoria = () => {
  return TipoCategoriaModel.find();
};
