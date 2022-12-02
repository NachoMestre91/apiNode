import SoporteModel, { ISoporte } from "./Soportes_Models";
import { Request, Response } from "express";

exports.listarSoportes = (req: Request, res: Response) => {
  try {
    SoporteModel.find({})
      .then((docs: any[]) => {
        if (docs) {
          res.status(200).json(docs);
        } else {
          console.log(docs);
          res.status(400).send({ message: "No hay resultados para mostrar" });
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

export const ListarSoportesParaInicio = () => {
  return SoporteModel.find({});
};

exports.agregarSoporte = (req: Request, res: Response) => {
  try {
    /*  if (!req.body.nombreSoporte) {
      res.status(400).send('No se ingresaron datos');
    } else {
      SoporteModel.findOne({nombreSoporte: req.body.nombreSoporte})
        .then((Soporte: any) => {
          if (Soporte) {
            res.status(400).send({message: 'El Soporte ingresado ya existe'});
          } else {
            let max = 0;
            let indiceUltimoSoporte;
            SoporteModel.find()
              .then((soportes: any) => {
                if (soportes.length > 0) {
                  soportes.forEach((r: any) => {
                    if (r.keySoporte > max) {
                      max = r.keySoporte;
                    }
                  });
                  indiceUltimoSoporte = max + 1;
                  const newSoporte: ISoporte = new SoporteModel({
                    nombreSoporte: req.body.nombreSoporte,
                    keySoporte: indiceUltimoSoporte,
                  });
                  newSoporte
                    .save()
                    .then((doc: ISoporte) => {
                      if (doc) {
                        res.status(200).send({message: 'Soporte insertado', SoporteInsertado: doc});
                      } else {
                        console.log(doc);
                        res.status(400).send({message: 'Ocurrió un error al insertar el Soporte'});
                      }
                    })
                    .catch((error) => {
                      console.log(error),
                        res.status(500).send({message: 'Error interno del servidor'});
                    });
                } else {
                  res.status(404).send({message: 'No se encontraron soportes'});
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        }); 
    }*/
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.eliminarSoporte = (req: Request, res: Response) => {
  try {
    /*  if (!req.body.SoporteId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      SoporteModel.findByIdAndDelete(req.body.SoporteId)
        .then((Soporte: any) => {
          if (Soporte) {
            res.status(200).send({message: 'Soporte eliminado'});
          } else {
            res.status(404).send({message: 'Soporte no encontrado'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } */
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

exports.modificarSoporte = (req: Request, res: Response) => {
  try {
    /* if (!req.body.SoporteId && !req.body.nombreSoporte) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body.SoporteId && !req.body.nombreSoporte) {
        res.status(400).send({message: 'No se ingreso un nombre de Soporte'});
      } else {
        if (!req.body.SoporteId && req.body.nombreSoporte) {
          res.status(400).send({message: 'No se ingreso el ID correspondiente'});
        } else {
          SoporteModel.findById(req.body.SoporteId)
            .then((Soporte: any) => {
              if (Soporte) {
                Soporte.nombreSoporte = req.body.nombreSoporte;
                Soporte.save()
                  .then((resultado: any) => {
                    if (resultado) {
                      res.status(200).send({message: 'Soporte actualizado'});
                    } else {
                      console.log(resultado);
                      res.status(500).send({message: 'Error al actualizar el Soporte'});
                    }
                  })
                  .catch();
              } else {
                res.status(404).send({message: 'Soporte no encontrado'});
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({message: 'Error interno del servidor'});
            });
        }
      }
    } */
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};
