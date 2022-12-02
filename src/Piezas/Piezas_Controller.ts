import PiezasModel, {IPieza} from './Pieza.model';
import {Request, response, Response} from 'express';
import {Estado, Rol} from '../Config/enumeradores';
import {
  traerProyectoPorId,
  modificarProgreso,
  actualizarCantidadPiezasDeProyecto,
} from '../Proyectos/Proyecto.Controller';
import {traerUsuarioPorId} from '../Usuario/Usuario_Controller';
import AdjuntosPiezaModel from '../Adjuntos_Piezas/AdjuntosPieza.model';
import {
  TraerAjduntosPorIdDePieza,
  eliminarAdjuntosDePiezaPorId,
} from '../Adjuntos_Piezas/AdjuntosPieza_Controller';
// import {
//   filtrarDatosParaNotificarPiezaAprobada,
//   filtrarDatosParaNotificarPiezaEnCurso,
//   filtrarDatosParaNotificarPiezaRechazada,
//   filtrarDatosParaNotificarPiezaTerminada,
// } from '../Config/NotificacionesPorMail';
import {
  filtrarDatosParaPiezaAprobada,
  filtrarDatosParaPiezaCreada,
  filtrarDatosParaPiezaEnCurso,
  filtrarDatosParaPiezaRechazada,
  filtrarDatosParaPiezaTerminada,
} from '../Config/NotificacionesViaNavegador';
import {IUsuario} from '../Usuario/Usuario_Models';

exports.ListarPiezas = (req: Request, res: Response) => {
  try {
    let descripcionesDePiezas: string[] = [];

    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      PiezasModel.find({proyectoId: req.body.proyectoId})
        .then(async (docs: any[]) => {
          if (docs) {
            if (req.body.asignadoId) {
              const isPiezasEnCurso = docs.map((pieza, i) => {
                var respuesta = false;
                if (pieza.asignadoId == req.body.asignadoId && pieza.estadoId == Estado.Asignado) {
                  pieza.estadoId = Estado.EnCurso;
                  descripcionesDePiezas.push(pieza.descripcion);
                  pieza
                    .save()
                    .then(() => {
                      docs[i].estadoId = Estado.EnCurso;
                      respuesta = true;
                    })
                    .catch(() => {
                      respuesta = false;
                    });
                } else {
                  respuesta = true;
                }
                return respuesta;
              });

              if (isPiezasEnCurso) {
                // TODO Alexis: Esta función notifica por mail
                // filtrarDatosParaNotificarPiezaEnCurso(docs);
                // const datosFiltrados = await filtrarDatosParaPiezaEnCurso(docs)
                //   .then((value: any) => {
                //     return value;
                //   })
                //   .catch((error: any) => {
                //     console.log(error);
                //     return error;
                //   });
                res.status(200).send({value: docs, notificacion: [...descripcionesDePiezas]});
              } else {
                console.log('No se pudo actualizar el estado de alguna pieza a EnCurso');
                res.status(500).send({message: 'Error interno del servidor'});
              }
            } else {
              res.status(200).send({value: docs});
            }
          } else {
            res.status(200).send({value: []});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.CrearPieza = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingreso el id de proyecto'});
    } else {
      if (!req.body.descripcion) {
        res.status(400).send({
          message: 'No se ingreso una descripcion y este dato es requerido',
        });
      } else {
        const Proyecto = traerProyectoPorId(req.body.proyectoId);
        Proyecto.then(async (proyecto: any) => {
          if (proyecto) {
            //si existe, procedo a la creación de la pieza

            const cantidadPiezasAntesDeInsertar = await PiezasModel.find({
              proyectoId: req.body.proyectoId,
            })
              .then((piezas: any) => {
                return piezas;
              })
              .catch((error: any) => {
                console.log(error);
                return error;
              });

            let infoPiezasAnterior: any = [];
            if (cantidadPiezasAntesDeInsertar.length) {
              for await (const pieza of cantidadPiezasAntesDeInsertar) {
                infoPiezasAnterior.push(pieza);
              }
            }

            proyecto.progreso.totalPiezas++;
            if (req.body.asignadoId) {
              const Usuario = traerUsuarioPorId(req.body.asignadoId);
              Usuario.then((usuario: any) => {
                if (usuario) {
                  if (req.body.fechaVencimiento) {
                    const nuevaPieza: IPieza = new PiezasModel({
                      proyectoId: req.body.proyectoId,
                      descripcion: req.body.descripcion,
                      descripcionAnterior: '',
                      fechaVencimiento: req.body.fechaVencimiento,
                      estadoId: Estado.Asignado,
                      asignadoId: req.body.asignadoId,
                    });

                    nuevaPieza
                      .save()
                      .then(async (doc: any) => {
                        // TODO este filtrado depende del estado del proyecto
                        // const datosFiltrados = await filtrarDatosParaPiezaCreada(nuevaPieza)
                        //   .then((value: any) => {
                        //     return value;
                        //   })
                        //   .catch((error: any) => {
                        //     console.log(error);
                        //     return error;
                        //   });
                        // const datos = {
                        //   operacion: 'insertar',
                        //   idProyecto: proyecto._id,
                        //   piezasAntesDeInsertar: infoPiezasAnterior,
                        //   piezasInsertadas: nuevaPieza,
                        // };
                        if (doc) {
                          // const resultadoDeActualizarProgresoDePiezas =
                          //   await actualizarCantidadPiezasDeProyecto(datos)
                          //     .then((resultado: any) => {
                          //       return resultado;
                          //     })
                          //     .catch((error: any) => {
                          //       return error;
                          //     });

                          proyecto
                            .save()
                            .then(() => {
                              res
                                .status(200)
                                .send({value: {piezaActualizada: doc, proyecto: proyecto}});
                            })
                            .catch((error: any) => {
                              console.log(error);
                              res.status(500).send({
                                message: 'Error interno del servidor',
                              });
                            });
                        } else {
                          console.log(doc);
                          res.status(400).send({
                            message: 'Ocurrió un error al insertar la pieza',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(400).send({message: 'La fecha es un dato requerido'});
                  }
                } else {
                  res.status(400).send({
                    message: 'El ID del asignado no se encontró o fue eliminado',
                  });
                }
              }).catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
            } else {
              //En caso de no tener asignado

              const nuevaPieza: IPieza = new PiezasModel({
                proyectoId: req.body.proyectoId,
                descripcion: req.body.descripcion,
                descripcionAnterior: '',
                fechaVencimiento: req.body.fechaVencimiento,
                estadoId: Estado.Borrador,
              });
              nuevaPieza
                .save()
                .then(async (doc: any) => {
                  if (doc) {
                    // const datosFiltrados = await filtrarDatosParaPiezaCreada(nuevaPieza)
                    //   .then((value: any) => {
                    //     return value;
                    //   })
                    //   .catch((error: any) => {
                    //     console.log(error);
                    //     return error;
                    //   });

                    // const datos = {
                    //   operacion: 'insertar',
                    //   idProyecto: proyecto._id,
                    //   piezasAntesDeInsertar: infoPiezasAnterior,
                    //   piezasInsertadas: nuevaPieza,
                    // };

                    // const resultadoDeActualizarProgresoDePiezas =
                    //   await actualizarCantidadPiezasDeProyecto(datos)
                    //     .then((resultado: any) => {
                    //       return resultado;
                    //     })
                    //     .catch((error: any) => {
                    //       return error;
                    //     });

                    proyecto
                      .save()
                      .then(() => {
                        res.status(200).send({value: {piezaActualizada: doc, proyecto: proyecto}});
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    console.log(doc);
                    res.status(400).send({
                      message: 'Ocurrió un error al insertar la pieza',
                    });
                  }
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            }
          } else {
            res.status(400).send({
              message: 'El ID de proyecto no se encontró o fue eliminado',
            });
          }
        }).catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModificarPieza = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezasModel.findOne({_id: req.body._id})
        .then(async (pieza: any) => {
          if (pieza) {
            const piezaAnterior = await PiezasModel.findById(req.body._id)
              .then((piezaAnterior: any) => {
                return piezaAnterior;
              })
              .catch((error: any) => {
                return error;
              });

            // let datos = {
            //   operacion: 'editar',
            //   idProyecto: req.body.proyectoId,
            //   piezasAntesDeEditar: piezaAnterior ? piezaAnterior : {},
            //   piezasDespuesDeEditar: {},
            // };

            if (pieza.estadoId === Estado.EnCurso) {
              res.status(200).send({
                message: 'No se puede editar una pieza en estado en curso',
                value: pieza,
              });
            } else {
              if (req.body.asignadoId) {
                const Usuario = traerUsuarioPorId(req.body.asignadoId);
                Usuario.then((Usuario: any) => {
                  if (Usuario) {
                    if (req.body.descripcion && req.body.fechaVencimiento) {
                      pieza.descripcion = req.body.descripcion;
                      pieza.descripcionAnterior = piezaAnterior.descripcion;
                      pieza.fechaVencimiento = req.body.fechaVencimiento;
                      pieza.asignadoId = req.body.asignadoId;
                      pieza.estadoId = Estado.Asignado;
                      pieza
                        .save()
                        .then(async (piezaActualizada: any) => {
                          if (piezaActualizada) {
                            // datos.piezasDespuesDeEditar = pieza;
                            // const resultado = await actualizarCantidadPiezasDeProyecto(datos)
                            //   .then((value: any) => {
                            //     return value;
                            //   })
                            //   .catch((error: any) => {
                            //     return error;
                            //   });
                            res.status(200).send(piezaActualizada);
                          } else {
                            res.status(200).send({message: 'La pieza no fue actualizada'});
                          }
                        })
                        .catch((error: any) => {
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    } else {
                      res.status(400).send({
                        message: 'Faltan datos requeridos ya que tiene asignado',
                      });
                    }
                  } else {
                    res.status(400).send({
                      message: 'El usuario que esta intentando asignar no existe',
                    });
                  }
                }).catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
              } else {
                // if (!pieza.asignadoId) {
                pieza.descripcionAnterior = piezaAnterior.descripcion;
                pieza.descripcion = req.body.descripcion;
                pieza.fechaVencimiento = req.body.fechaVencimiento;
                pieza.asignadoId = req.body.asignadoId;
                pieza.estadoId = Estado.Borrador;
                pieza
                  .save()
                  .then(async (piezaActualizada: any) => {
                    if (piezaActualizada) {
                      // datos.piezasDespuesDeEditar = pieza;
                      // const resultado = await actualizarCantidadPiezasDeProyecto(datos)
                      //   .then((value: any) => {
                      //     return value;
                      //   })
                      //   .catch((error: any) => {
                      //     return error;
                      //   });
                      res.status(200).send(piezaActualizada);
                    } else {
                      res.status(200).send({message: 'La pieza no fue actualizada'});
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  });
              }
            }
          } else {
            res.status(400).send({message: 'No se encontro la pieza'});
          }
        })
        .catch((error: any) => {
          console.log({error});
          res.status(500).send({message: 'Error interno en el servidor'});
        });
    } else {
      res.status(400).send({message: 'Falta el id de la pieza'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.TerminarPieza = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezasModel.findOne({_id: req.body._id})
        .populate({
          path: 'proyectoId',
          populate: {
            path: 'categorias',
          },
        })
        .then((pieza: any) => {
          if (pieza) {
            if (pieza.estadoId !== Estado.EnCurso && pieza.estadoId !== Estado.Correcciones) {
              res
                .status(400)
                .send({message: 'La pieza esta en curso o correcciones', value: pieza});
            }
            const traerAdjuntos = TraerAjduntosPorIdDePieza(pieza._id);
            if (traerAdjuntos) {
              traerAdjuntos
                .then((respuesta: any) => {
                  if (respuesta.length > 0) {
                    PiezasModel.updateOne(
                      {_id: pieza._id},
                      {
                        $set: {
                          estadoId: Estado.Terminado,
                        },
                      }
                    )
                      .then(async (doc: any) => {
                        if (doc) {
                          pieza.estadoId = Estado.Terminado;
                          pieza.proyectoId.progreso.piezasTerminadas++;
                          if (
                            pieza.proyectoId.progreso.piezasTerminadas ==
                            pieza.proyectoId.progreso.totalPiezas
                          ) {
                            pieza.proyectoId.estadoId = Estado.Terminado;
                          }
                          pieza.proyectoId
                            .save()
                            .then(async () => {
                              // TODO Alexis: Esta funcion notifica por mail
                              // filtrarDatosParaNotificarPiezaTerminada(pieza);
                              const datosFiltrados = await filtrarDatosParaPiezaTerminada(pieza)
                                .then((value: any) => {
                                  return value;
                                })
                                .catch((error: any) => {
                                  console.log(error);
                                  return error;
                                });

                              res.status(200).send({
                                message: 'Estado de la pieza actualizado',
                                value: pieza,
                                datosParaNotificar: datosFiltrados,
                              });
                            })
                            .catch((error: any) => {
                              console.log(error);
                              res.status(500).send({
                                message: 'Ocurrió un problema al actualizar',
                              });
                            });
                        } else {
                          console.log(doc);
                          res.status(500).send({
                            message: 'La pieza no cambio su estado a finalizada',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(400).send({message: 'La pieza no posee adjuntos'});
                  }
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            } else {
              res.status(400).send({message: 'La pieza no posee adjuntos'});
            }
          } else {
            res.status(400).send({message: 'Pieza no encontrada'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } else {
      res.status(400).send({message: 'No se envio el id de la pieza'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.RechazarPieza = (req: Request, res: Response) => {
  try {
    if (!req.body.piezaId) {
      res.status(400).send({message: 'No se ingresó el ID de pieza'});
    } else {
      PiezasModel.findById(req.body.piezaId)
        .populate({
          path: 'proyectoId',
          populate: {
            path: 'categorias',
          },
        })
        .then((pieza: any) => {
          if (pieza) {
            PiezasModel.updateOne({_id: req.body.piezaId}, {$set: {estadoId: Estado.Correcciones}})
              .then(async (resultado: any) => {
                if (resultado) {
                  pieza.estadoId = Estado.Correcciones;
                  if (pieza.proyectoId.estadoId === 5) {
                    pieza.proyectoId.estadoId = Estado.EnCurso;
                  }
                  pieza.proyectoId.progreso.piezasTerminadas--;
                  pieza.proyectoId
                    .save()
                    .then(async (doc: any) => {
                      // TODO Alexis: Esta funcion notifica por mail
                      // filtrarDatosParaNotificarPiezaRechazada(pieza);
                      const datosFiltrados = await filtrarDatosParaPiezaRechazada(pieza)
                        .then((value: any) => {
                          return value;
                        })
                        .catch((error: any) => {
                          console.log(error);
                          return error;
                        });

                      res.status(200).send({
                        message: 'Estado de la pieza y el proyecto actualizado',
                        value: pieza,
                        datosParaNotificar: datosFiltrados,
                      });
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send('Error al intentar actualizar el estado del proyecto');
                    });
                } else {
                  console.log(resultado);
                  res.status(500).send({message: 'Error al intentar actualizar la pieza'});
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({
                  message: 'Error al actualizar el estado de la pieza',
                });
              });
          } else {
            res.status(400).send({message: 'Pieza no encontrada'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.AsignarRespPieza = (req: Request, res: Response) => {};

export const eliminarPiezasDeProyecto = async (idProyecto: string) => {
  try {
    var retornar = {
      cantPiezas: 0,
      cantPiezasEliminadas: 0,
      adjuntosEliminadosDePiezaDrive: 0,
      adjuntosEliminadosDePiezaBD: 0,
      mensajeErrorCatchPiezas: '',
      mensajeError: '',
      piezasEliminadas: {},
    };
    var piezasEliminadas: string[] = [];
    const pr = new Promise((resolve: any, reject: any) => {
      PiezasModel.find({proyectoId: idProyecto})
        .then(async (piezas: any) => {
          if (piezas.length) {
            retornar.cantPiezas = piezas.length;
            for await (const pieza of piezas) {
              if (
                pieza.estadoId != Estado.EnCurso ||
                pieza.estadoId != Estado.Terminado ||
                pieza.estadoId != Estado.Aprobado
              ) {
                eliminarAdjuntosDePiezaPorId(pieza._id)
                  .then((value: any) => {
                    retornar.adjuntosEliminadosDePiezaDrive = value.cantAdjuntosEliminadosDrive;
                    retornar.adjuntosEliminadosDePiezaBD = value.cantAdjuntosEliminadosBd.n;
                    PiezasModel.deleteOne({_id: pieza._id})
                      .then((piezaEliminada: any) => {
                        if (piezaEliminada) {
                          retornar.cantPiezasEliminadas++;
                        }
                        piezasEliminadas.push(piezaEliminada);
                        retornar.piezasEliminadas = piezasEliminadas;
                        resolve(retornar);
                      })
                      .catch((error: any) => {
                        reject(error);
                      });
                  })
                  .catch((error: any) => {
                    retornar.mensajeErrorCatchPiezas = error;
                    reject(retornar.mensajeErrorCatchPiezas);
                  });
              } else {
                continue;
              }
            }
          } else {
            retornar.cantPiezasEliminadas = 0;
            retornar.mensajeError = 'No hay piezas para el proyecto ingresado';
            resolve(retornar);
          }
        })
        .catch((error: any) => {
          reject(error);
        });
    });
    return pr;
  } catch (error) {
    console.log(error);
    response.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.EliminarPieza = async (req: Request, res: Response) => {
  try {
    if (!req.body.piezaId && !req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (!req.body.piezaId && req.body.usuarioId) {
        res.status(400).send({message: 'No se ingresó ID de pieza'});
      } else {
        if (req.body.piezaId && !req.body.usuarioId) {
          res.status(400).send({message: 'No se ingresó el usuario'});
        } else {
          PiezasModel.findById(req.body.piezaId)
            .then((pieza: any) => {
              if (pieza) {
                const usuario = traerUsuarioPorId(req.body.usuarioId);
                usuario
                  .then(async (user: any) => {
                    if (user) {
                      if (user.rolId == Rol.Administrador) {
                        if (
                          pieza.estadoId === Estado.Aprobado ||
                          pieza.estadoId === Estado.Terminado
                        ) {
                          res.status(400).send({
                            message: 'No se pueden eliminar piezas aprobadas o terminadas',
                          });
                        } else {
                          const resultado = await eliminarPiezaPorId(req.body.piezaId);
                          if (resultado) {
                            const r = await modificarProgreso(req.body.proyectoId, 'eliminar');
                            if (r) {
                              res.status(200).send({message: 'Pieza eliminada'});
                            } else {
                              console.log(r);
                              res.status(500).send({
                                message: 'Ocurrió un error al eliminar la pieza',
                              });
                            }
                          } else {
                            res.status(400).send({
                              message: 'Ocurrió un error al eliminar la pieza',
                            });
                          }
                        }
                      } else {
                        res.status(400).send({
                          message: 'El usuario no posee los permisos para realizar esta acción',
                        });
                      }
                    } else {
                      res.status(400).send({message: 'Usuario no encontrado'});
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  });
              } else {
                res.status(404).send({message: 'Pieza no encontrada'});
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({message: 'Error interno del servidor'});
            });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.AprobarPieza = (req: Request, res: Response) => {
  //TODO:Probar esto
  try {
    if (req.body._id) {
      PiezasModel.findById(req.body._id)
        .populate({
          path: 'proyectoId',
          populate: {
            path: 'categorias',
          },
        })
        .then((pieza: any) => {
          if (pieza) {
            if (pieza.estadoId === Estado.Terminado) {
              pieza.estadoId = Estado.Aprobado;
              PiezasModel.find({
                proyectoId: pieza.proyectoId._id,
                estadoId: Estado.Aprobado,
              })
                .then((piezasAprobadas: any) => {
                  const cantidadAprobadas = piezasAprobadas.length + 1;
                  if (cantidadAprobadas === pieza.proyectoId.progreso.totalPiezas) {
                    pieza.proyectoId.estadoId = Estado.Aprobado;
                    pieza.proyectoId
                      .save()
                      .then(() => {
                        pieza
                          .save()
                          .then(async () => {
                            // TODO Alexis: Esta función notifica por mail
                            // filtrarDatosParaNotificarPiezaAprobada(pieza);
                            const datosFiltrados = await filtrarDatosParaPiezaAprobada(pieza)
                              .then((value: any) => {
                                return value;
                              })
                              .catch((error: any) => {
                                console.log(error);
                                return error;
                              });
                            res.status(200).send({
                              message: 'Pieza Aprobada',
                              value: pieza,
                              datosParaNotificar: datosFiltrados,
                            });
                          })
                          .catch((error: any) => {
                            console.log(error);
                            res.status(500).send({message: 'Error interno del servidor'});
                          });
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    pieza
                      .save()
                      .then(async () => {
                        const datosFiltrados = await filtrarDatosParaPiezaAprobada(pieza)
                          .then((value: any) => {
                            return value;
                          })
                          .catch((error: any) => {
                            console.log(error);
                            return error;
                          });

                        res.status(200).send({
                          message: 'Pieza Aprobada',
                          value: pieza,
                          datosParaNotificar: datosFiltrados,
                        });
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
            } else {
              res.status(400).send({
                message: 'La pieza no se encuentra en estado Terminado',
              });
            }
          } else {
            res.status(400).send({message: 'No se encontro la pieza'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } else {
      res.status(400).send({message: 'Falta id de pieza'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.PonerEnCurso = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezasModel.findById(req.body._id)
        .then((pieza: any) => {
          if (pieza) {
            if (pieza.estadoId === Estado.EnCurso) {
              pieza.estadoId = Estado.EnCurso;
              pieza
                .save()
                .then(() => {
                  res.status(200).send({message: 'Pieza en curso'});
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            } else {
              res.status(400).send({message: 'La pieza aun no tiene asignado'});
            }
          } else {
            res.status(400).send({message: 'No se encontro la pieza'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } else {
      res.status(400).send({message: 'Falta id de pieza'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
export const eliminarPiezaPorId = (piezaId: string) => {
  try {
    return PiezasModel.findByIdAndDelete(piezaId);
  } catch (error) {
    return false;
  }
};

export const traerPiezasPorAsigando = (IdDeAsigando: any) => {
  return PiezasModel.find({asignadoId: IdDeAsigando}).populate({
    path: 'proyectoId',
    populate: {
      path: 'categorias',
    },
  });
};

export const obtenerPiezaPorId = (piezaId: string) => {
  return PiezasModel.findById(piezaId);
};

export const traerPiezasPorIdProyecto = (idProyecto: string) => {
  return PiezasModel.find({proyectoId: idProyecto}).populate('proyectoId').populate('asignadoId');
};

export const traerPiezasDelProyecto = (idProyecto: string) => {
  return PiezasModel.find({proyectoId: idProyecto});
};

export const traerPiezasAsignadasPorIdProyecto = async (idProyecto: string) => {
  return PiezasModel.find({proyectoId: idProyecto, estadoId: Estado.Asignado}).populate(
    'asignadoId'
  );
};

exports.CalcularEstadoPieza = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'No se ingreso el ID de la pieza'});
    } else {
      AdjuntosPiezaModel.find({piezaId: req.body._id})
        .then((adjuntosPieza: any[]) => {
          if (adjuntosPieza) {
            console.log(adjuntosPieza);
            return false;
          } else {
            res.status(400).send({
              message: 'No existen adjuntos para el ID de pieza ingresado',
            });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ListarPiezasTerminadas = (req: Request, res: Response) => {
  try {
    PiezasModel.find({estadoId: Estado.Terminado})
      .then((piezas: any[]) => {
        if (piezas) {
          res.status(200).json(piezas);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ListarPiezasAprobadas = (req: Request, res: Response) => {
  try {
    PiezasModel.find({estadoId: Estado.Aprobado})
      .then((piezas: any[]) => {
        if (piezas) {
          res.status(200).json(piezas);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ListarPiezasAprobadasParaPrensa = (req: Request, res: Response) => {
  try {
    if (!req.body.idUsuario) {
      res.status(400).send({message: 'No se ingreso el ID del usuario'});
    } else {
      const Usuario = traerUsuarioPorId(req.body.idUsuario);
      Usuario.then((usuario: any) => {
        PiezasModel.find({estadoId: Estado.Aprobado})
          .populate('proyectoId')
          .then((piezas: any) => {
            if (piezas) {
              //Recorre proyecto.categorias que es un arreglo de objetos y filtra segun la condicion
              const piezasFiltradas: Array<any> = [];
              piezas.map((pieza: any) => {
                //La condicion recorre dos arreglos de objetos y retorna true si al menos un objeto coinciden entre ambos array
                if (
                  pieza.proyectoId.categorias.some((categoriaProyecto: any) =>
                    usuario.categorias.some(
                      (categoriaUsuario: any) =>
                        JSON.stringify(categoriaProyecto) === JSON.stringify(categoriaUsuario)
                    )
                  )
                ) {
                  piezasFiltradas.push({
                    _id: pieza._id,
                    proyectoId: pieza.proyectoId._id,
                    descripcion: pieza.descripcion,
                    fechaVencimiento: pieza.fechaVencimiento,
                    estadoId: pieza.estadoId,
                    asignadoId: pieza.asignadoId,
                  });
                }
              });

              res
                .status(200)
                .send({message: 'piezas aprobadas para prensista', value: piezasFiltradas});
            }
          })
          .catch((error: any) => {
            console.log(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
      }).catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.ListarPiezasTerminadasParaPrensa = (req: Request, res: Response) => {
  try {
    if (!req.body.idUsuario) {
      res.status(400).send({message: 'No se ingreso el ID del usuario'});
    } else {
      const Usuario = traerUsuarioPorId(req.body.idUsuario);
      Usuario.then((usuario: any) => {
        PiezasModel.find({estadoId: Estado.Terminado})
          .populate('proyectoId')
          .then((piezas: any[]) => {
            if (piezas) {
              //Recorre proyecto.categorias que es un arreglo de objetos y filtra segun la condicion
              const piezasFiltradas: Array<any> = [];
              piezas.map((pieza: any) => {
                //La condicion recorre dos arreglos de objetos y retorna true si al menos un objeto coinciden entre ambos array
                if (
                  pieza.proyectoId.categorias.some((categoriaProyecto: any) =>
                    usuario.categorias.some(
                      (categoriaUsuario: any) =>
                        JSON.stringify(categoriaProyecto) === JSON.stringify(categoriaUsuario)
                    )
                  )
                ) {
                  piezasFiltradas.push({
                    _id: pieza._id,
                    proyectoId: pieza.proyectoId._id,
                    descripcion: pieza.descripcion,
                    fechaVencimiento: pieza.fechaVencimiento,
                    estadoId: pieza.estadoId,
                    asignadoId: pieza.asignadoId,
                  });
                }
              });

              res
                .status(200)
                .send({message: 'piezas terminadas para prensista', value: piezasFiltradas});
            }
          })
          .catch((error: any) => {
            console.log(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
      }).catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
export const traerPiezaPorIdConProyecto = (idDePieza: any) => {
  return PiezasModel.findById(idDePieza).populate('proyectoId');
};

export const traerPiezaPorId = (idPieza: string) => {
  return PiezasModel.findById(idPieza);
};

export const traerInformacionPiezaPorId = (idPieza: string) => {
  return PiezasModel.findById(idPieza).populate({
    path: 'proyectoId',
    populate: {path: 'usuarioId'},
  });
};

export const traerPiezasEnEstadoBorrador = (idProyecto: any) => {
  return PiezasModel.find({
    proyectoId: idProyecto,
    estadoId: Estado.Borrador,
  });
};

export const traerPiezasEnEstadoTerminado = (idProyecto: any) => {
  return PiezasModel.find({
    proyectoId: idProyecto,
    estadoId: Estado.Terminado,
  });
};

export const traerPiezasEnEstadoAsignado = (idProyecto: any) => {
  return PiezasModel.find({
    proyectoId: idProyecto,
    estadoId: Estado.Asignado,
  });
};

export const listarPiezasPorIdProyecto = (idProyecto: string) => {
  return PiezasModel.find({proyectoId: idProyecto});
};

export const actualizarDescripcionAnteriorDePieza = async (pieza: any) => {
  return PiezasModel.replaceOne({_id: pieza._id}, pieza);
};
