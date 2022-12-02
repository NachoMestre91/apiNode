import { Request, Response } from 'express';
import UsuarioModel from '../Usuario/Usuario_Models';

exports.ListarFavoritos = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({ message: 'No se ingresó el ID de usuario' });
    } else {
      UsuarioModel.findById(req.body.usuarioId, {
        password: 0,
        cuit: 0,
        categorias: 0,
      })
        .populate('proyectosSeguidos', {
          categorias: 0,
          progreso: 0,
          descripcion: 0,
        })
        .then((dato: any) => {
          if (dato) {
            res.status(200).send({
              message: 'Favoritos encontrados',
              value: dato,
            });
          } else {
            res.status(200).send({
              message:
                'No se encontraron proyectos seguidos por el usuario ingresado',
              value: [],
            });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({ message: 'Error interno del servidor' });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
};

exports.SeguirProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId && !req.body.usuarioId) {
      res.status(400).send({ message: 'No se ingresaron datos' });
    } else {
      if (req.body.proyectoId && !req.body.usuarioId) {
        res.status(400).send({ message: 'No se ingresó usuario' });
      } else {
        if (!req.body.proyectoId && req.body.usuarioId) {
          res.status(400).send({ message: 'No se ingresó el ID de proyecto' });
        } else {
          UsuarioModel.findById(req.body.usuarioId)
            .then(async (usuario: any) => {
              if (usuario) {
                const proyectosSeguidos = usuario.proyectosSeguidos;
                let existeProyecto = false;
                for await (const item of proyectosSeguidos) {
                  if (item == req.body.proyectoId) {
                    existeProyecto = true;
                  }
                }

                if (!existeProyecto) {
                  usuario.proyectosSeguidos.push(req.body.proyectoId);
                  usuario
                    .save()
                    .then((resultado: any) => {
                      if (resultado) {
                        res.status(200).send({
                          message: 'Favorito insertado correctamente',
                          value: resultado,
                        });
                      } else {
                        res.status(200).send({
                          message: 'No se pudo insertar el favorito',
                          value: '',
                        });
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({
                        message: 'Error al intentar insertar un favorito',
                      });
                    });
                } else {
                  res.status(200).send({
                    message:
                      'El proyecto ingresado ya es seguido por el usuario',
                    value: '',
                  });
                }
              } else {
                res
                  .status(200)
                  .send({ message: 'Usuario no encontrado', value: '' });
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({ message: 'Error interno del servidor' });
            });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
};

exports.DejarDeSeguirProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId && !req.body.usuarioId) {
      res.status(400).send({ message: 'No se ingresaron datos' });
    } else {
      if (req.body.proyectoId && !req.body.usuarioId) {
        res.status(400).send({ message: 'No se ingresó usuario' });
      } else {
        if (!req.body.proyectoId && req.body.usuarioId) {
          res.status(400).send({ message: 'No se ingresó el ID de proyecto' });
        } else {
          UsuarioModel.findById(req.body.usuarioId)
            .then(async (usuario: any) => {
              if (usuario) {
                const proyectosSeguidos = usuario.proyectosSeguidos;
                let existeProyecto = false;
                for await (const item of proyectosSeguidos) {
                  if (item == req.body.proyectoId) {
                    existeProyecto = true;
                  }
                }

                if (existeProyecto) {
                  let indice = usuario.proyectosSeguidos.indexOf(
                    req.body.proyectoId
                  );
                  usuario.proyectosSeguidos.splice(indice, 1);
                  usuario
                    .save()
                    .then((resultado: any) => {
                      if (resultado) {
                        res.status(200).send({
                          message:
                            'El proyecto se dejó de seguir por el usuario',
                          value: resultado,
                        });
                      } else {
                        console.log(resultado);
                        res
                          .status(200)
                          .send({ message: 'Falló la operación', value: '' });
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({
                        message: 'Error al intentar insertar un favorito',
                      });
                    });
                } else {
                  res.status(200).send({
                    message:
                      'El proyecto ingresado ya no existe entre los seguidos',
                    value: '',
                  });
                }
              } else {
                res
                  .status(200)
                  .send({ message: 'Usuario no encontrado', value: '' });
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({ message: 'Error interno del servidor' });
            });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
};

exports.ElimFavorito = (req: Request, res: Response) => {
  try {
    // let {idFav} = req.body;
    // if (!{idFav}) {
    //   res.status(401).send('No se ingresaron datos');
    // } else {
    //   connection
    //     .collection('Favorito')
    //     .findOneAndDelete({_id: new mongo.ObjectId(idFav)}, (error, result) => {
    //       if (error) {
    //         console.log(error);
    //         res.status(500).send({message: 'Error interno del servidor'});
    //       } else {
    //         res.status(200).send('Favorito eliminado');
    //       }
    //     });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
};
