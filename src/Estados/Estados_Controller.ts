import EstadosModel, { IEstado } from "./Estado.model";
import { Request, Response } from "express";
import { Estado } from "../Config/enumeradores";

//Nombre de las function: Estados,CrearEstado,ModifEstado,ElimEstado
exports.ListarEstados = (req: Request, res: Response) => {
  try {
    EstadosModel.find({})
      .then((docs: IEstado[]) => {
        if (docs) {
          res.status(200).json(docs);
        } else {
          console.log(docs);
          res.status(400).send({ message: "No existen estados para mostrar" });
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.status(500).send({ message: "Error interno del servidor" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

export const ListarEstadosParaInicio = async () => {
  return EstadosModel.find({});
};

exports.CrearEstado = (req: Request, res: Response) => {
  try {
    if (!req.body.nombreEstado && !req.body.color) {
      res.status(400).send("No se ingresaron datos");
    } else {
      EstadosModel.findOne({ nombreEstado: req.body.nombreEstado })
        .then((estado: any) => {
          if (estado) {
            res.status(400).send({ message: "El estado ingresado ya existe" });
          } else {
            let max = 0;
            let indiceUltimoEstado;
            EstadosModel.find()
              .then((estados: any) => {
                if (estados.length > 0) {
                  estados.forEach((e: any) => {
                    if (e.keyEstado > max) {
                      max = e.keyEstado;
                    }
                  });
                  indiceUltimoEstado = max + 1;
                  const newEstado: IEstado = new EstadosModel({
                    nombreEstado: req.body.nombreEstado,
                    keyEstado: indiceUltimoEstado,
                    color: req.body.color,
                  });
                  newEstado
                    .save()
                    .then((doc: IEstado) => {
                      if (doc) {
                        res.status(200).send({
                          message: "Estado insertado",
                          estadoInsertado: doc,
                        });
                      } else {
                        console.log(doc);
                        res.status(400).send({
                          message: "Ocurrió un error al insertar el estado",
                        });
                      }
                    })
                    .catch((error) => {
                      console.log(error),
                        res
                          .status(500)
                          .send({ message: "Error interno del servidor" });
                    });
                } else {
                  res
                    .status(400)
                    .send({ message: "No se encontraron estados" });
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({ message: "Error interno del servidor" });
              });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno del servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.ModificarEstado = (req: Request, res: Response) => {
  try {
    if (!req.body.estadoId && !req.body.nombreEstado && !req.body.color) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      EstadosModel.findById(req.body.estadoId)
        .then((estado: any) => {
          if (estado) {
            estado.nombreEstado = req.body.nombreEstado;
            estado.color = req.body.color;
            estado
              .save()
              .then((resultado: any) => {
                if (resultado) {
                  res.status(200).send({ message: "Estado actualizado" });
                } else {
                  res
                    .status(500)
                    .send({ message: "Error al actualizar el estado" });
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({ message: "Error interno del servidor" });
              });
          } else {
            res.status(404).send({ message: "Estado no encontrado" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno del servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.EliminarEstado = (req: Request, res: Response) => {
  try {
    if (!req.body.estadoId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      EstadosModel.findByIdAndDelete(req.body.estadoId)
        .then((estado: any) => {
          if (estado) {
            res.status(200).send({ message: "Estado eliminado" });
          } else {
            res.status(404).send({ message: "Estado no encontrado" });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: "Error interno del servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};
