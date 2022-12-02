import {Request, Response} from 'express';
import {Estado, Rol} from '../Config/enumeradores';
import {traerPiezaPorIdConProyecto} from '../Piezas/Piezas_Controller';
import {
  TraerAjduntoPorId,
  TraerAjduntosPorIdDePieza,
} from '../Adjuntos_Piezas/AdjuntosPieza_Controller';
import {traerUsuarioPorId} from '../Usuario/Usuario_Controller';
import PiezaMedioModel, {IPiezasMedios} from './PiezaMedios.model';
import {
  filtrarDatosParaNotificarDescargaDePiezaMedios,
  notificarAsignacionPiezaMedio,
  // notificarPiezaMediosPublicada,
} from '../Config/NotificacionesPorMail';
import {
  filtrarDatosParaAsignacionDePiezaMedios,
  filtrarDatosParaDescargaDePiezaMedios,
  filtrarDatosParaPublicacionDePiezaMedios,
} from '../Config/NotificacionesViaNavegador';

exports.ListarPiezasMedios = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaro id de usuario'});
    } else {
      const Usuario = traerUsuarioPorId(req.body.usuarioId);
      Usuario.then((usuario: any) => {
        if (usuario) {
          if (usuario.rolId === Rol.Medio) {
            PiezaMedioModel.find({medioAsignadoId: req.body.usuarioId})
              .then((piezasMedio: any[]) => {
                res.status(200).send(piezasMedio);
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          } else {
            if (usuario.rolId === Rol.Administrador) {
              PiezaMedioModel.find({})
                .then((piezasMedio: any[]) => {
                  res.status(200).send(piezasMedio);
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            } else {
              res.status(400).send({message: 'El usuario no es de medios o admin'});
            }
          }
        } else {
          res.status(400).send({message: 'usuario no encontrado'});
        }
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
export const ListarPiezasMediosPorUsuarioMedio = (usuarioId: string) => {
  return PiezaMedioModel.find({medioAsignadoId: usuarioId});
};
export const ListarPiezasMediosPorUsuarioAdministrador = () => {
  return PiezaMedioModel.find({});
};
export const ListarPiezasMediosPorUsuarioParaInicio = (usuarioId: string) => {
  const pr = new Promise((resolve: any, reject: any) => {
    const Usuario = traerUsuarioPorId(usuarioId);
    Usuario.then((usuario: any) => {
      if (usuario) {
        if (usuario.rolId === Rol.Medio) {
          PiezaMedioModel.find({medioAsignadoId: usuarioId})
            .then((piezasMedio: any[]) => {
              // res.status(200).send(piezasMedio);
              if (piezasMedio.length) {
                resolve(piezasMedio);
              } else {
                resolve([]);
              }
            })
            .catch((error: any) => {
              reject(error);
            });
        } else {
          if (usuario.rolId === Rol.Administrador) {
            PiezaMedioModel.find({})
              .then((piezasMedio: any[]) => {
                if (piezasMedio.length) {
                  resolve(piezasMedio);
                } else {
                  resolve([]);
                }
              })
              .catch((error: any) => {
                reject(error);
              });
          } else {
            resolve([]);
          }
        }
      } else {
        reject(new Error('usuario no encontrado'));
      }
    }).catch((error: any) => {
      reject(error);
    });
  });
  return pr;
};

exports.CrearPiezasMedios = (req: Request, res: Response) => {
  try {
    if (req.body.medioAsignadoId) {
      const MedioAsignado = traerUsuarioPorId(req.body.medioAsignadoId);
      MedioAsignado.then((medioAsignado: any) => {
        if (medioAsignado) {
          if (medioAsignado.rolId === Rol.Medio) {
            if (req.body._id) {
              const Pieza = traerPiezaPorIdConProyecto(req.body._id);
              Pieza.then((pieza: any) => {
                if (pieza) {
                  if (pieza.estadoId === Estado.Aprobado) {
                    if (pieza.proyectoId) {
                      const AdjuntosDePieza = TraerAjduntosPorIdDePieza(pieza._id);
                      AdjuntosDePieza.then((adjuntosDePieza: any) => {
                        var arregloDeArchivosDePieza: any = [];
                        if (adjuntosDePieza) {
                          adjuntosDePieza.forEach((adjuntos: any) => {
                            adjuntos.descargado = false;
                            arregloDeArchivosDePieza.push(adjuntos);
                          });
                          const newPiezaMedios: IPiezasMedios = new PiezaMedioModel({
                            nombrePiezaMedio: pieza.proyectoId.nombreProyecto,
                            medioAsignadoId: medioAsignado._id,
                            totalAdjuntos: adjuntosDePieza.length,
                            adjuntosDescargados: 0,
                            estadoId: Estado.Asignado,
                            descargoPieza: false,
                            publicacionDesde: req.body.desde,
                            publicacionHasta: req.body.hasta,
                            piezaId: pieza._id,
                            descripcionPieza: pieza.descripcion,
                            archivosAdjuntos: arregloDeArchivosDePieza,
                            alcance: medioAsignado.alcance,
                            soportes: req.body.soportes,
                          });
                          newPiezaMedios
                            .save()
                            .then(async (piezaMedio: any) => {
                              if (piezaMedio) {
                                // TODO Alexis: Esta función notifica por mail
                                // if (piezaMedio.medioAsignadoId && medioAsignado.isActivado) {
                                //   notificarAsignacionPiezaMedio(medioAsignado, pieza);
                                // }
                                const datosFiltrados =
                                  await filtrarDatosParaAsignacionDePiezaMedios(piezaMedio)
                                    .then((piezaResultante: any) => {
                                      return piezaResultante;
                                    })
                                    .catch((error: any) => {
                                      return error;
                                    });

                                res.status(200).send({
                                  message: 'Pieza para medio creada',
                                  piezaMedio,
                                  datosParaNotificar: datosFiltrados,
                                });
                              } else {
                                console.log(piezaMedio);
                                res.status(200).send({
                                  message: 'No se pudo insertar la pieza para medios',
                                });
                              }
                            })
                            .catch((error: any) => {
                              console.log(error);
                              res.status(500).send({
                                message: 'Error interno del servidor',
                              });
                            });
                        } else {
                          res.status(400).send({message: 'La pieza no tiene adjuntos'});
                        }
                      }).catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                    } else {
                      res.status(400).send({
                        message: 'La pieza no tiene proyecto asociado',
                      });
                    }
                  } else {
                    res.status(400).send({message: 'La pieza aun no fue aprobada'});
                  }
                } else {
                  res.status(400).send({message: 'No se encontro pieza con ese ID'});
                }
              }).catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
            } else {
              res.status(400).send({message: 'Falta ID de pieza'});
            }
          } else {
            res.status(400).send({message: 'El usuario asignado no es de tipo Medio'});
          }
        } else {
          res.status(400).send({message: 'El usuario no fue encontrado'});
        }
      }).catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
    } else {
      res.status(400).send({message: 'Falta el id del asignado de medio'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.PublicarPiezaMedios = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezaMedioModel.findById(req.body._id)
        .then((piezaMedio: any) => {
          if (piezaMedio) {
            piezaMedio.estadoId = Estado.Publicado;
            piezaMedio
              .save()
              .then(async (piezaMedio: any) => {
                // TODO Alexis: Esta accion notifica por mail
                // notificarPiezaMediosPublicada(piezaMedio);
                const datosFiltrados = await filtrarDatosParaPublicacionDePiezaMedios(piezaMedio)
                  .then((datos: any) => {
                    return datos;
                  })
                  .catch((error: any) => {
                    return error;
                  });

                res.status(200).send({
                  message: 'Pieza publicada',
                  value: piezaMedio,
                  datosParaNotificar: datosFiltrados,
                });
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
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
exports.DescargarPiezaMedios = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezaMedioModel.findById(req.body._id)
        .populate('piezaId')
        .then((piezaMedio: any) => {
          if (piezaMedio) {
            if (req.body.idAdjunto) {
              const Adjunto = TraerAjduntoPorId(req.body.idAdjunto);
              Adjunto.then((adjunto: any) => {
                if (adjunto) {
                  const indexArchivoDescargado = piezaMedio.archivosAdjuntos.findIndex(
                    (archivo: any) => archivo._id.equals(adjunto._id)
                  );
                  if (indexArchivoDescargado >= 0) {
                    piezaMedio.archivosAdjuntos[indexArchivoDescargado].descargado = true;
                    piezaMedio.estadoId = Estado.Descargado;
                    if (piezaMedio.adjuntosDescargados < piezaMedio.totalAdjuntos) {
                      piezaMedio.adjuntosDescargados = piezaMedio.adjuntosDescargados + 1;
                    }

                    piezaMedio
                      .save()
                      .then(async () => {
                        // TODO Alexis: Esta accion notifica por mail
                        // filtrarDatosParaNotificarDescargaDePiezaMedios(piezaMedio);
                        const datosFiltrados = await filtrarDatosParaDescargaDePiezaMedios(
                          piezaMedio
                        )
                          .then((piezaResultante: any) => {
                            return piezaResultante;
                          })
                          .catch((error: any) => {
                            return error;
                          });
                        res.status(200).send({
                          message: 'Estado descargado de adjunto actualizado',
                          value: piezaMedio,
                          datosParaNotificar: datosFiltrados,
                        });
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(400).send({message: 'Adjunto no asociado a esta pieza'});
                  }
                } else {
                  res.status(400).send({message: 'No se encontro el adjunto'});
                }
              }).catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
            } else {
              res.status(400).send({message: 'Falta id de Adjunto'});
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
exports.EliminarPiezasMedios = (req: Request, res: Response) => {
  try {
    if (req.body.usuarioId) {
      const Usuario = traerUsuarioPorId(req.body.usuarioId);
      Usuario.then((usuario: any) => {
        if (usuario) {
          if (usuario.rolId == Rol.Administrador) {
            if (req.body._id) {
              PiezaMedioModel.findById(req.body._id)
                .then((piezaMedio: any) => {
                  if (piezaMedio) {
                    PiezaMedioModel.deleteOne({_id: req.body._id})
                      .then((piezaMedioEliminada: any) => {
                        res.status(200).send({
                          message: 'piezaMedios eliminada',
                        });
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
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
          } else {
            res.status(400).send({message: 'Usuario sin permisos de Administrador'});
          }
        } else {
          res.status(400).send({message: 'Usuario no encontrado'});
        }
      }).catch((error: any) => {
        console.log(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
    } else {
      res.status(400).send({message: 'Falta id de usuario'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.ModificarPiezasMedios = (req: Request, res: Response) => {
  try {
    if (req.body._id) {
      PiezaMedioModel.findById(req.body._id)
        .then((piezaMedio: any) => {
          if (piezaMedio) {
            if (piezaMedio.estadoId == Estado.Asignado) {
              //TODO:VERIFICAR LOS DATOS QUE PUEDEN SER MODIFICADOS
              PiezaMedioModel.updateOne(
                {_id: req.body._id},
                {
                  $set: {
                    nombrePiezaMedio: req.body.nombrePiezaMedio,
                    medioAsignadoId: req.body.medioAsignadoId,
                    publicacionDesde: req.body.publicacionDesde,
                    publicacionHasta: req.body.publicacionHasta,
                    piezaId: req.body.piezaId,
                    descripcionPieza: req.body.descripcionPieza,
                    archivosAdjuntos: req.body.archivosAdjuntos,
                    alcance: req.body.alcance,
                    soportes: req.body.soportes,
                  },
                }
              )
                .then((doc: any) => {
                  res.status(200).send({mesagge: 'PiezaMedio actualizada'});
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            } else {
              res.status(400).send({message: 'La pieza debe estar en estado Asignado'});
            }
          } else {
            res.status(400).send({message: 'No se encontro pieza con ese Id'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } else {
      res.status(400).send({message: 'No se ingreso id de piezaMedio'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
