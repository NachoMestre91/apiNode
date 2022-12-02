import AdjuntosProyectos, {IAdjuntosProyectos} from './adjuntosProyecto.model';
import ProyectosModel, {IProyectos} from '../Proyectos/Proyecto.model';
import {Tipo_Categoria} from '../Config/enumeradores';
import {Request, Response} from 'express';
import adjuntosProyectoModel from './adjuntosProyecto.model';
import {ActualizarCantidadAdjuntosDeProyecto} from '../Proyectos/Proyecto.Controller';

const apiGDrive = require('../ApiGoogleDrive/apiGoogleDrive.js');
const apiDrive = new apiGDrive();

exports.ListarAdjuntosProyecto = async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    // return false;
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresó el ID de proyecto'});
    } else {
      ProyectosModel.findById(req.body.proyectoId)
        .then((proyecto: any) => {
          if (proyecto) {
            adjuntosProyectoModel
              .find({proyectoId: req.body.proyectoId})
              .then((adjuntosProyecto: any) => {
                if (adjuntosProyecto) {
                  res.status(200).json(adjuntosProyecto);
                } else {
                  console.log(adjuntosProyecto);
                  res.status(500).send({message: 'Error interno del servidor'});
                }
              })
              .catch((error: any) => {
                console.log(error);
                res
                  .status(400)
                  .send({message: 'No se encontraron adjuntos para el ID de proyecto ingresado'});
              });
          } else {
            res.status(400).send({message: 'Proyecto no encontrado'});
          }
        })
        .catch((error: any) => {});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.CrearAdjuntosProyecto = (req: Request, res: Response) => {
  try {
    let adjuntosInsertados: number = 0;
    let resultado: Array<any> = [];
    if (req.body._id) {
      ProyectosModel.findById(req.body._id)
        .then(async (proyecto: any) => {
          if (proyecto) {
            const cantidadAdjuntosAntesDeInsertar = await adjuntosProyectoModel
              .find({proyectoId: proyecto._id})
              .then((adjuntos: any) => {
                return adjuntos;
              })
              .catch((error: any) => {
                console.log(error);
                return error;
              });

            const nombreDelProyecto = proyecto.nombreProyecto;

            if (Tipo_Categoria[proyecto.tipoCategoriaId]) {
              if (req.files) {
                apiDrive.conectar(
                  2,
                  req.body._id,
                  nombreDelProyecto,
                  proyecto.tipoCategoriaId,
                  Tipo_Categoria[proyecto.tipoCategoriaId],
                  req.files,
                  '',
                  '',
                  async (respuesta: any) => {
                    if (respuesta.status != undefined) {
                      //TODO: Despues verificar de donde proviene el ID usuario, por ahora, es enviado desde el request
                      let band = false;
                      if (respuesta.archivosSinErrores.length > 0) {
                        for (let i = 0; i < respuesta.archivosSinErrores.length; i++) {
                          const nuevoArchivoAdjunto: IAdjuntosProyectos = new AdjuntosProyectos({
                            linkAdjunto: respuesta.linksArchivos[i],
                            idArchivo: respuesta.idsArchivos[i],
                            proyectoId: req.body._id,
                            datosArchivo: {
                              nombre: respuesta.nombreArchivo[i],
                              tamanio: respuesta.tamanioArchivo[i],
                              usuario: req.body.usuario,
                              fecha: respuesta.fechaCreacionArchivo[i],
                              tipo: respuesta.tipoArchivo[i],
                            },
                          });

                          resultado.push(await nuevoArchivoAdjunto.save());
                          adjuntosInsertados++;
                          if (resultado.length) {
                            band = true;
                          }
                        }

                        if (band == true) {
                          const cantidadAdjuntosDespuesDeInsertar = await adjuntosProyectoModel
                            .find({proyectoId: proyecto._id})
                            .then((adjuntos: any) => {
                              return adjuntos;
                            })
                            .catch((error: any) => {
                              console.log(error);
                              return error;
                            });

                          const datos = {
                            operacion: 'insertar',
                            idProyecto: proyecto._id,
                            cantidadDeAdjuntosAntesDeInsertar:
                              cantidadAdjuntosAntesDeInsertar.length,
                            cantidadDeAdjuntosInsertados: cantidadAdjuntosDespuesDeInsertar.length,
                          };
                          ActualizarCantidadAdjuntosDeProyecto(datos).then((value: any) => {
                            // console.log(resultado);
                            if (value) {
                              res.status(200).send({
                                message: 'Archivos insertados con éxito',
                                archivosInsertados: resultado,
                              });
                            } else {
                              res.status(500).send({
                                message: 'Ocurrió un error al intentar guardar los archivos;',
                              });
                            }
                          });
                          // console.log(`Adjuntos insertados: ${adjuntosInsertados}`);
                        } else {
                          res.status(500).send({
                            message: 'Ocurrió un error al intentar guardar los archivos;',
                          });
                        }
                      } else {
                        console.log(respuesta);
                        res
                          .status(500)
                          .send({message: 'Ocurrió un error al intentar subir los archivos.'});
                      }
                    } else {
                      console.log(respuesta);
                      res
                        .status(500)
                        .send({message: 'Ocurrió un error al intentar subir los archivos.'});
                    }
                  }
                );
              } else {
                res.status(400).send({message: 'No existen archivos para cargar'});
              }
            } else {
              res
                .status(500)
                .send({message: 'Error interno del servidor al buscar el tipo de categoria'});
            }
          } else {
            res.status(400).send({message: 'El ID de proyecto no se encuentra o fue eliminado.'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res
            .status(500)
            .send({message: 'Error interno del servidor al buscar el proyecto por id'});
        });
    } else {
      res.status(400).send({message: 'Falta el ID de proyecto'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.EliminarAdjuntosProyecto = (req: Request, res: Response) => {
  try {
    var adjuntosEliminados: number = 0;
    if (!req.body.idArchivo && !req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body.idArchivo && !req.body.proyectoId) {
        res.status(400).send({message: 'Falta ID de proyecto'});
      } else {
        if (!req.body.idArchivo && req.body.proyectoId) {
          res.status(400).send({message: 'Falta ID de archivo'});
        } else {
          ProyectosModel.findById(req.body.proyectoId)
            .then(async (proyecto: any) => {
              if (proyecto) {
                const cantidadDeAdjuntosAntesDeEliminar = await adjuntosProyectoModel
                  .find({proyectoId: proyecto._id})
                  .then((adjuntos: any) => {
                    return adjuntos;
                  })
                  .catch((error: any) => {
                    console.log(error);
                    return error;
                  });

                apiDrive.conectar(
                  4,
                  proyecto._id,
                  '',
                  '',
                  '',
                  '',
                  '',
                  req.body.idArchivo,
                  async (respuesta: any) => {
                    //TODO: Verificar algunas excepciones al eliminar el archivo
                    if (respuesta != 0) {
                      AdjuntosProyectos.findOneAndDelete({idArchivo: req.body.idArchivo})
                        .then(async (doc: any) => {
                          if (doc) {
                            // adjuntosEliminados++;
                            const cantidadDeAdjuntosDespuesDeEliminar = await adjuntosProyectoModel
                              .find({proyectoId: proyecto._id})
                              .then((adjuntos: any) => {
                                return adjuntos;
                              })
                              .catch((error: any) => {
                                console.log(error);
                                return error;
                              });

                            // console.log(
                            //   `Adj antes de eliminar: ${cantidadDeAdjuntosAntesDeEliminar.length}`
                            // );
                            // console.log(
                            //   `Adj antes de eliminar: ${cantidadDeAdjuntosDespuesDeEliminar.length}`
                            // );
                            // console.log(
                            //   `Resta entre los adjuntos: ${
                            //     cantidadDeAdjuntosAntesDeEliminar.length -
                            //     cantidadDeAdjuntosDespuesDeEliminar.length
                            //   }`
                            // );

                            const datos = {
                              operacion: 'eliminar',
                              idProyecto: proyecto._id,
                              cantidadDeAdjuntosAntesDeEliminar:
                                cantidadDeAdjuntosAntesDeEliminar.length,
                              cantidadDeAdjuntosDespuesDeEliminar:
                                cantidadDeAdjuntosDespuesDeEliminar.length,
                            };

                            ActualizarCantidadAdjuntosDeProyecto(datos).then((value: any) => {
                              if (value) {
                                res
                                  .status(200)
                                  .send({message: 'Archivo eliminado', archivoEliminado: doc});
                              } else {
                                res
                                  .status(400)
                                  .send({message: 'Archivo no encontrado en la base de datos'});
                              }
                            });
                          } else {
                            res
                              .status(400)
                              .send({message: 'Archivo no encontrado en la base de datos'});
                          }
                        })
                        .catch((error: any) => {
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    } else {
                      AdjuntosProyectos.find({idArchivo: req.body.idArchivo})
                        .then((archivo: any) => {
                          if (archivo) {
                            adjuntosProyectoModel
                              .deleteOne({idArchivo: req.body.idArchivo})
                              .then(async (resultado: any) => {
                                if (resultado) {
                                  // adjuntosEliminados++;
                                  const cantidadDeAdjuntosDespuesDeEliminar =
                                    await adjuntosProyectoModel
                                      .find({proyectoId: proyecto._id})
                                      .then((adjuntos: any) => {
                                        return adjuntos;
                                      })
                                      .catch((error: any) => {
                                        console.log(error);
                                        return error;
                                      });

                                  const datos = {
                                    operacion: 'eliminar',
                                    idProyecto: proyecto._id,
                                    cantidadDeAdjuntosAntesDeEliminar:
                                      cantidadDeAdjuntosAntesDeEliminar.length,
                                    cantidadDeAdjuntosDespuesDeEliminar:
                                      cantidadDeAdjuntosDespuesDeEliminar.length,
                                  };

                                  ActualizarCantidadAdjuntosDeProyecto(datos).then((value: any) => {
                                    if (value) {
                                      res.status(200).send({
                                        message:
                                          'Archivo no encontrado en Google Drive. Se elimina de la base de datos',
                                        archivoEliminado: resultado,
                                      });
                                    } else {
                                      res.status(400).send({
                                        message: 'Archivo no encontrado en la base de datos',
                                      });
                                    }
                                  });
                                  // res.status(200).send({
                                  //   message:
                                  //     'Archivo no encontrado en Google Drive. Se elimina de la base de datos',
                                  //   archivoEliminado: resultado,
                                  // });
                                } else {
                                  console.log(resultado);
                                  res.status(500).send({
                                    message:
                                      'Ocurrió un error al eliminar el archivo de la base de datos',
                                  });
                                }
                              })
                              .catch((error: any) => {
                                console.log(error);
                                res.status(500).send({message: 'Error interno del servidor'});
                              });
                          } else {
                            res
                              .status(400)
                              .send({message: 'Archivo no encontrado en la base de datos'});
                          }
                        })
                        .catch((error: any) => {
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    }
                  }
                );
              } else {
                console.log(proyecto);
                res.status(400).send({message: 'Proyecto eliminado o no encontrado'});
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({message: 'Error interno del servidor'});
            });
          //apiDrive.conectar(4,req.body.proyectoId)
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

export const eliminarAdjuntosDelProyecto = async (idProyecto: string) => {
  let cantAdjuntosEliminados: number = 0;
  let retornar = {
    docsEliminadosBd: {},
    docsEliminadosDrive: 0,
  };
  const pr = new Promise((resolve: any, reject: any) => {
    adjuntosProyectoModel
      .find({proyectoId: idProyecto})
      .then((adjuntos: any) => {
        // console.log('hay adjuntos');
        // console.log(adjuntos.length);
        if (adjuntos) {
          apiDrive.conectar(5, idProyecto, '', '', '', adjuntos, '', '', (respuesta: any) => {
            //resolve(respuesta);
            retornar.docsEliminadosDrive = respuesta;
            adjuntosProyectoModel
              .deleteMany({proyectoId: idProyecto})
              .then((docsEliminados: any) => {
                retornar.docsEliminadosBd = docsEliminados;
                resolve(retornar);
              })
              .catch((error: any) => {
                reject(error);
              });
          });
        } else {
          resolve(new Error('No existen archivos adjuntos para el proyecto seleccionado'));
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });
  return pr;
};

export const listarAdjuntosPorIdProyecto = (proyectoId: any) => {
  return adjuntosProyectoModel.find({proyectoId: proyectoId});
};
