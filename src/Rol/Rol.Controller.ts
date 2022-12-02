import RolModel, { IRol } from "./Rol.model";
import { Request, Response } from "express";

exports.ListarRoles = (req: Request, res: Response) => {
  try {
    RolModel.find({})
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

export const ListarRolesParaInicio = async () => {
  return RolModel.find({});
};

exports.AgregarRol = (req: Request, res: Response) => {
  try {
    if (!req.body.nombreRol) {
      res.status(400).send("No se ingresaron datos");
    } else {
      RolModel.findOne({ nombreRol: req.body.nombreRol })
        .then((rol: any) => {
          if (rol) {
            res.status(400).send({ message: "El rol ingresado ya existe" });
          } else {
            let max = 0;
            let indiceUltimoRol;
            RolModel.find()
              .then((roles: any) => {
                if (roles.length > 0) {
                  roles.forEach((r: any) => {
                    if (r.keyRol > max) {
                      max = r.keyRol;
                    }
                  });
                  indiceUltimoRol = max + 1;
                  const newRol: IRol = new RolModel({
                    nombreRol: req.body.nombreRol,
                    keyRol: indiceUltimoRol,
                  });
                  newRol
                    .save()
                    .then((doc: IRol) => {
                      if (doc) {
                        res.status(200).send({
                          message: "Rol insertado",
                          rolInsertado: doc,
                        });
                      } else {
                        console.log(doc);
                        res.status(400).send({
                          message: "Ocurrió un error al insertar el rol",
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
                  res.status(404).send({ message: "No se encontraron roles" });
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

exports.EliminarRol = (req: Request, res: Response) => {
  try {
    if (!req.body.rolId) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      RolModel.findByIdAndDelete(req.body.rolId)
        .then((rol: any) => {
          if (rol) {
            res.status(200).send({ message: "Rol eliminado" });
          } else {
            res.status(404).send({ message: "Rol no encontrado" });
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

exports.ModificarRol = (req: Request, res: Response) => {
  try {
    if (!req.body.rolId && !req.body.nombreRol) {
      res.status(400).send({ message: "No se ingresaron datos" });
    } else {
      if (req.body.rolId && !req.body.nombreRol) {
        res.status(400).send({ message: "No se ingreso un nombre de rol" });
      } else {
        if (!req.body.rolId && req.body.nombreRol) {
          res
            .status(400)
            .send({ message: "No se ingreso el ID correspondiente" });
        } else {
          RolModel.findById(req.body.rolId)
            .then((rol: any) => {
              if (rol) {
                rol.nombreRol = req.body.nombreRol;
                rol
                  .save()
                  .then((resultado: any) => {
                    if (resultado) {
                      res.status(200).send({ message: "Rol actualizado" });
                    } else {
                      console.log(resultado);
                      res
                        .status(500)
                        .send({ message: "Error al actualizar el rol" });
                    }
                  })
                  .catch();
              } else {
                res.status(404).send({ message: "Rol no encontrado" });
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({ message: "Error interno del servidor" });
            });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error interno del servidor" });
  }
};
