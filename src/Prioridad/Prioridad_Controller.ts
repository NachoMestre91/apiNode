import PrioridadModel, { IPrioridad } from "./Prioridad.model";
import { Request, Response } from "express";

//const Codificar = new CodifClaves();

//Nombre de las funciones: Prioridades,CrearPrioridad,ModifPrioridad,EliminarPrioridad
exports.ListarPrioridades = (req: Request, res: Response) => {
  try {
    PrioridadModel.find({})
      .then((docs: IPrioridad[]) => {
        if (docs) {
          res.status(200).json(docs);
        } else {
          console.log(docs);
          res
            .status(400)
            .send({ message: "No existen prioridades para mostrar" });
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

export const ListarPrioridadesParaInicio = async () => {
  return PrioridadModel.find({});
};

exports.CrearPrioridad = (req: Request, res: Response) => {
  try {
    if (!(req.body.nombrePrioridad && req.body.color)) {
      res.status(400).send("faltan datos requeridos");
    } else {
      const newPrioridad: IPrioridad = new PrioridadModel({
        nombrePrioridad: req.body.nombrePrioridad,
        color: req.body.color,
      });
      newPrioridad
        .save()
        .then((doc: any) => {
          if (doc) {
            res.status(200).send({
              message: "Prioridad insertada",
              prioriodadInsertada: doc,
            });
          } else {
            console.log(doc);
            res
              .status(400)
              .send({ message: "Ocurrió un error al insertar la prioridad" });
          }
        })
        .catch((error) => {
          console.log(error),
            res.status(500).send({ message: "Error interno del servidor" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.EliminarPrioridad = (req: Request, res: Response) => {
  try {
    if (!req.body.prioridadId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      PrioridadModel.findByIdAndDelete(req.body.prioridadId)
        .then((doc: any) => {
          if (doc) {
            res.status(200).send({ message: "Prioridad eliminada" });
          } else {
            console.log(doc);
            res.status(400).send({ message: "Prioridad no encontrada" });
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

exports.ModificarPrioridad = (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    // return false;
    if (!req.body.prioridadId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      PrioridadModel.findById(req.body.prioridadId)
        .then((doc: any) => {
          if (doc) {
            PrioridadModel.updateOne(
              { _id: req.body.prioridadId },
              {
                $set: {
                  nombrePrioridad: req.body.nombrePrioridad,
                  color: req.body.color,
                },
              }
            )
              .then((doc: any) => {
                if (doc) {
                  res.status(200).send({ message: "Prioridad actualizada" });
                } else {
                  console.log(doc);
                  res.status(500).send({
                    message: "Ocurrió un error al actualizar la prioridad",
                  });
                }
              })
              .catch();
          } else {
            console.log(doc);
            res.status(400).send({ message: "Prioridad no encontrada" });
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
