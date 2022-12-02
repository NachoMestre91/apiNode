import {Request, response, Response} from 'express';
import ProyectosModel, {IProyectos} from './Proyecto.model';
import {Estado, Tipo_Categoria, Prioridad, Rol} from '../Config/enumeradores';
//import {traerUnAdjuntoPorIdDeProyecto} from '../Adjuntos_Piezas/AdjuntosPieza_Controller';
import {
  eliminarAdjuntosDelProyecto,
  listarAdjuntosPorIdProyecto,
} from '../Adjuntos_Proyectos/adjuntosProyectos_Controller';
import {
  traerPiezasEnEstadoBorrador,
  traerPiezasPorAsigando,
  traerPiezasPorIdProyecto,
  eliminarPiezasDeProyecto,
  traerPiezasEnEstadoAsignado,
  traerPiezasEnEstadoTerminado,
  actualizarDescripcionAnteriorDePieza,
  // listarPiezasPorIdProyecto,
} from '../Piezas/Piezas_Controller';
import {traerUsuarioPorId, traerUsuarioPorIdConCategorias} from '../Usuario/Usuario_Controller';
import adjuntosProyectoModel from '../Adjuntos_Proyectos/adjuntosProyecto.model';
import {traerTipoCategoriaPorId} from '../Tipo_Categoria/TipoCategoria_Controller';
// import {filtrarDatosParaEnviarMailAgregandoModificandoProyecto} from '../Config/NotificacionesPorMail';
import {
  filtrarDatosParaCambioPrioridadProyecto,
  filtrarDatosParaCreacionDeProyecto,
  filtrarDatosParaPiezaCreada,
} from '../Config/NotificacionesViaNavegador';
import PiezaMediosModel from '../Piezas_Medios/PiezaMedios.model';

const apiGoogleDrive = require('../ApiGoogleDrive/apiGoogleDrive.js');
const GoogleDrive = new apiGoogleDrive();

exports.AgregarProyecto = (req: Request, res: Response) => {
  try {
    var nomProyecto: string;
    var max = 0;
    var cont = 0;
    var cc = 0;
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      const Usuario = traerUsuarioPorIdConCategorias(req.body.usuarioId);
      Usuario.then((usuario: any) => {
        if (usuario) {
          ProyectosModel.find({nombreProyecto: /sin titulo/})
            .then((docs: any[]) => {
              if (docs.length > 0) {
                //Existen proyectos con el nombre predeterminado. Busco y encuentro el último (máximo) y le sumo uno
                for (let i = 0; i < docs.length; i++) {
                  if (docs[i].nombreProyecto.includes('(') == true) {
                    let cadena = docs[i].nombreProyecto.split('(');
                    let cadAGuardar = cadena[0];
                    cadena = cadena[1].split(')');
                    let c = parseInt(cadena[0]) + 1;
                    if (c > max) {
                      max = c;
                    }
                  } else {
                    cont++;
                  }
                }

                if (max) {
                  cc = max;
                } else {
                  cc = cont;
                }
                nomProyecto = 'Proyecto sin titulo'.concat('(' + cc + ')');
              } else {
                //No hay proyectos con el nombre predeterminado
                nomProyecto = 'Proyecto sin titulo';
              }
              //TODO: Comprobar si el usuario enviado es correcto/existe
              if (Tipo_Categoria[req.body.tipoCategoriaId]) {
                if (
                  usuario.rolId === Rol.Prensa &&
                  req.body.tipoCategoriaId === Tipo_Categoria.ComunicacionInstitucional
                ) {
                  if (!usuario.categorias && usuario.categorias.length) {
                    res
                      .status(400)
                      .send({message: 'El usuario prensa no tiene categorias cargadas'});
                  } else {
                    const categoriaInstitucional = usuario.categorias.find(
                      (categoria: any) =>
                        categoria.tipoCategoriaId === Tipo_Categoria.ComunicacionInstitucional
                    );
                    if (!categoriaInstitucional) {
                      res.status(400).send({
                        message: 'El usuario prensa no tiene categorias institucionales cargadas',
                      });
                    } else {
                      const newProyect = new ProyectosModel({
                        nombreProyecto: nomProyecto,
                        editando: true,
                        fechaBloqueo: new Date(),
                        progreso: {
                          totalPiezas: 0,
                          piezasTerminadas: 0,
                        },
                        estadoId: Estado.Borrador,
                        tipoCategoriaId: req.body.tipoCategoriaId,
                        usuarioId: req.body.usuarioId,
                        fechaCreacion: new Date(),
                        categorias: [categoriaInstitucional._id],
                      });
                      newProyect
                        .save()
                        .then((doc: any) => {
                          if (doc) {
                            res.status(200).send({
                              message: 'Proyecto creado',
                              value: {
                                progresoAdjuntos: doc.progresoAdjuntos,
                                piezas: [],
                                categorias: [
                                  {
                                    _id: categoriaInstitucional._id,
                                    nombreCategoria: categoriaInstitucional.nombreCategoria,
                                    tipoCategoriaId: categoriaInstitucional.tipoCategoriaId,
                                    color: categoriaInstitucional.color,
                                    keyCategoria: categoriaInstitucional.keyCategoria,
                                  },
                                ],
                                archivado: doc.archivado,
                                cantidadDeAdjuntosDelBody: doc.cantidadDeAdjuntosDelBody,
                                isCambiaDescripcionPieza: doc.isCambiaDescripcionPieza,
                                _id: doc._id,
                                nombreProyecto: doc.nombreProyecto,
                                editando: doc.editando,
                                fechaBloqueo: doc.fechaBloqueo,
                                progreso: doc.progreso,
                                estadoId: doc.estadoId,
                                tipoCategoriaId: doc.tipoCategoriaId,
                                usuarioId: doc.usuarioId,
                                fechaCreacion: doc.fechaCreacion,
                              },
                            });
                          } else {
                            res.status(400).send({message: 'Error al crear el proyecto'});
                          }
                        })
                        .catch((error: any) => {
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    }
                  }
                } else {
                  const newProyect = new ProyectosModel({
                    nombreProyecto: nomProyecto,
                    editando: true,
                    fechaBloqueo: new Date(),
                    progreso: {
                      totalPiezas: 0,
                      piezasTerminadas: 0,
                    },
                    estadoId: Estado.Borrador,
                    tipoCategoriaId: req.body.tipoCategoriaId,
                    usuarioId: req.body.usuarioId,
                    fechaCreacion: new Date(),
                  });
                  newProyect
                    .save()
                    .then((doc: any) => {
                      if (doc) {
                        res.status(200).send({message: 'Proyecto creado', value: doc});
                      } else {
                        res.status(400).send({message: 'Error al crear el proyecto'});
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({message: 'Error interno del servidor'});
                    });
                }
              } else {
                res.status(400).send({message: 'El tipo de categoria es incorrecto'});
              }
            })
            .catch((error: any) => {
              console.log(error);
              res.status(500).send({message: 'Error interno del servidor'});
            });
        } else {
          res.status(400).send({message: 'El usuario no existe en la base de datos'});
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

const cambiarProgresoDePiezasEnProyecto = async (datos: any) => {
  try {
    // console.log(datos.piezas);
    // return false;

    var match: number = 0;
    if (datos) {
      const piezasActuales = await traerPiezasPorIdProyecto(datos._id)
        .then((piezas: any) => {
          return piezas;
        })
        .catch((error: any) => {
          return error;
        });

      if (piezasActuales.length) {
        for await (const piezaActual of piezasActuales) {
          if (datos.piezas.length) {
            for await (const piezasDelBody of datos.piezas) {
              if (JSON.stringify(piezaActual._id) === JSON.stringify(piezasDelBody._id)) {
                if (
                  JSON.stringify(piezaActual.descripcionAnterior) !==
                    JSON.stringify(piezaActual.descripcion) &&
                  JSON.stringify(piezaActual.descripcion) ===
                    JSON.stringify(piezasDelBody.descripcion)
                ) {
                  piezaActual.descripcionAnterior = piezasDelBody.descripcion;
                  const resultado = await actualizarDescripcionAnteriorDePieza(piezaActual)
                    .then((value: any) => {
                      return value;
                    })
                    .catch((error: any) => {
                      console.log(error);
                      return error;
                    });

                  if (resultado.n) {
                    match++;
                  }
                }
              }
            }
          } else {
            return new Error('No vienen piezas del body');
          }
        }
      } else {
        return new Error('El proyecto no posee piezas');
      }
    } else {
      return new Error('Proyecto no existente');
    }
    return match;
    // if (datos) {
    //   const piezasDelProyecto = await traerPiezasPorIdProyecto(datos._id)
    //     .then((piezas: any) => {
    //       return piezas;
    //     })
    //     .catch((error: any) => {
    //       return error;
    //     });

    //   if (piezasDelProyecto.length) {
    //     for await (const pieza of piezasDelProyecto) {
    //       // console.log(pieza);
    //       if (proyecto.progresoPiezas.piezasDespuesDeEditar.length) {
    //         for await (const piezasEnProyecto of proyecto.progresoPiezas.piezasDespuesDeEditar) {
    //           if (JSON.stringify(pieza._id) === JSON.stringify(piezasEnProyecto._id)) {
    //             if (
    //               JSON.stringify(pieza.descripcion) === JSON.stringify(piezasEnProyecto.descripcion)
    //             ) {
    //               if (proyecto.progresoPiezas.piezasAntesDeEditar.length) {
    //                 for await (const piezaAntesDeEditarEnProyecto of proyecto.progresoPiezas
    //                   .piezasAntesDeEditar) {
    //                   if (
    //                     JSON.stringify(pieza._id) ===
    //                       JSON.stringify(piezaAntesDeEditarEnProyecto._id) &&
    //                     JSON.stringify(pieza._id) === JSON.stringify(piezasEnProyecto._id)
    //                   ) {
    //                     if (
    //                       JSON.stringify(pieza.descripcion) ===
    //                       JSON.stringify(piezasEnProyecto.descripcion)
    //                     ) {
    //                       console.log(
    //                         'No cambio nada, actualizo el progreso de pieza antes de editar'
    //                       );
    //                       piezaAntesDeEditarEnProyecto.descripcion = pieza.descripcion;
    //                       piezaAntesDeEditarEnProyecto.fechaVencimiento = pieza.fechaVencimiento;
    //                       piezaAntesDeEditarEnProyecto.asignadoId = pieza.asignadoId;
    //                       piezaAntesDeEditarEnProyecto.estadoId = pieza.estadoId;
    //                       let res = await ProyectosModel.replaceOne({_id: proyecto._id}, proyecto);
    //                       if (res.n) {
    //                         match++;
    //                       }
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }

    //   console.log(`Match: ${match}`);
    //   // const resultado = await proyecto.updateOne().then((value: any) => {
    //   //   if (value) {
    //   //     return true;
    //   //   } else {
    //   //     return false;
    //   //   }
    //   // });
    //   return match;
    // } else {
    //   return new Error('Proyecto no existente');
    // }
  } catch (error) {
    return error;
  }
};

exports.ActualizarProyectos = (req: Request, res: Response) => {
  try {
    var estado: any;
    const proyectoNuevo = new ProyectosModel(req.body);
    // console.log(proyectoNuevo);
    // return false;
    if (!proyectoNuevo._id) {
      res.status(400).send({message: 'No se ingreso el id de proyecto'});
    } else {
      const Proyecto = traerProyectoPorId(proyectoNuevo._id);

      Proyecto.then(async (proyectoPorId: any) => {
        if (proyectoPorId) {
          const proyectoAnterior = await ProyectosModel.findById(req.body._id)
            .then((proyecto: any) => {
              return proyecto;
            })
            .catch((error: any) => {
              console.log(error);
              return error;
            });

          // cambiarProgresoDePiezasEnProyecto(req.body)
          //   .then((resultado: any) => {
          //     console.log(resultado);
          //   })
          //   .catch((error: any) => {
          //     console.log(error);
          //   });

          //Comprobamos si hay alguna pieza en borrador
          if (proyectoPorId.nombreProyecto != proyectoNuevo.nombreProyecto) {
            //El nombre del proyecto ha cambiado
            ProyectosModel.findOne({
              nombreProyecto: proyectoNuevo.nombreProyecto,
            })
              .then((proyectoPorNombre: any) => {
                if (proyectoPorNombre) {
                  res.status(400).send({
                    message: 'Ya existe un proyecto con ese nombre',
                    NombreDuplicado: true,
                  });
                } else {
                  if (proyectoPorId.usuarioId.rolId === Rol.Prensa) {
                    traerPiezasEnEstadoAsignado(proyectoPorId._id)
                      .then((piezas: any) => {
                        if (piezas && piezas.length) {
                          res.status(400).send({
                            message:
                              'Usuario Prensa - El proyecto no se puede editar ya que posee piezas asignadas',
                          });
                        } else {
                          traerPiezasEnEstadoBorrador(proyectoPorId._id)
                            .then(async (piezas: any) => {
                              if (piezas && piezas.length > 0) {
                                estado = Estado.Borrador;
                              } else {
                                estado = calcularEstadoDeProyecto(proyectoPorId, req.body, res);
                              }

                              proyectoPorId.cantidadDeAdjuntosDelBody =
                                proyectoNuevo.cantidadDeAdjuntosDelBody;
                              proyectoPorId.nombreProyecto = proyectoNuevo.nombreProyecto;
                              proyectoPorId.descripcion = proyectoNuevo.descripcion;
                              proyectoPorId.prioridadId = proyectoNuevo.prioridadId;
                              proyectoPorId.fechaDeadLine = proyectoNuevo.fechaDeadLine;
                              proyectoPorId.categorias = proyectoNuevo.categorias;
                              proyectoPorId.fechaRecordatorio = proyectoNuevo.fechaRecordatorio;
                              proyectoPorId.estadoId = estado;
                              proyectoPorId.editando = false;
                              proyectoPorId.archivado = proyectoNuevo.archivado;
                              proyectoPorId.isCambiaDescripcionPieza =
                                proyectoNuevo.isCambiaDescripcionPieza;

                              proyectoPorId
                                .save()
                                .then((proyectoActualizado: any) => {
                                  proyectoActualizado
                                    .populate('categorias')
                                    .execPopulate()
                                    .then(async (ProyectoConCategorias: any) => {
                                      let datosDeProyectoParaNotificacionDeNavegador =
                                        await filtrarDatosParaCreacionDeProyecto(
                                          ProyectoConCategorias,
                                          proyectoAnterior,
                                          req.body.piezas ? req.body.piezas : []
                                        )
                                          .then((datos: any) => {
                                            return datos;
                                          })
                                          .catch((error: any) => {
                                            console.log(error);
                                            return error;
                                          });

                                      let datosFiltradosParaCreacionDePieza =
                                        await filtrarDatosParaPiezaCreada(
                                          req.body.piezas,
                                          ProyectoConCategorias
                                        )
                                          .then((resultado: any) => {
                                            return resultado;
                                          })
                                          .catch((error: any) => {
                                            console.log(error);
                                            return error;
                                          });

                                      res.status(200).send({
                                        message: 'Proyecto actualizado',
                                        value: ProyectoConCategorias,
                                        datosParaNotificar:
                                          datosDeProyectoParaNotificacionDeNavegador,
                                        datosParaNotificarPieza: datosFiltradosParaCreacionDePieza,
                                      });
                                    })
                                    .catch((error: any) => {
                                      console.log(error);
                                      res.status(500).send({message: 'Error interno del servidor'});
                                    });
                                })
                                .catch((error: any) => {
                                  console.log(error);
                                  res.status(500).send({
                                    message: 'Error interno del servidor',
                                  });
                                });
                            })
                            .catch((error: any) => {
                              console.log(error);
                              res.status(500).send({
                                message: 'Error interno del servidor',
                              });
                            });
                        }
                      })
                      .catch((error: any) => {
                        console.error(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    if (proyectoPorId.usuarioId.rolId === Rol.Administrador) {
                      traerPiezasEnEstadoTerminado(proyectoPorId._id)
                        .then((piezas: any) => {
                          if (piezas && piezas.length) {
                            res.status(400).send({
                              message:
                                'Usuario Administrador - El proyecto no puede ser editado porque posee piezas terminadas',
                            });
                          } else {
                            traerPiezasEnEstadoBorrador(proyectoPorId._id)
                              .then((piezas: any) => {
                                if (piezas && piezas.length > 0) {
                                  estado = Estado.Borrador;
                                } else {
                                  estado = calcularEstadoDeProyecto(proyectoPorId, req.body, res);
                                }

                                proyectoPorId.cantidadDeAdjuntosDelBody =
                                  proyectoNuevo.cantidadDeAdjuntosDelBody;
                                proyectoPorId.nombreProyecto = proyectoNuevo.nombreProyecto;
                                proyectoPorId.descripcion = proyectoNuevo.descripcion;
                                proyectoPorId.prioridadId = proyectoNuevo.prioridadId;
                                proyectoPorId.fechaDeadLine = proyectoNuevo.fechaDeadLine;
                                proyectoPorId.categorias = proyectoNuevo.categorias;
                                proyectoPorId.fechaRecordatorio = proyectoNuevo.fechaRecordatorio;
                                proyectoPorId.estadoId = estado;
                                proyectoPorId.editando = false;
                                proyectoPorId.archivado = proyectoNuevo.archivado;
                                proyectoPorId.isCambiaDescripcionPieza =
                                  proyectoNuevo.isCambiaDescripcionPieza;

                                proyectoPorId
                                  .save()
                                  .then((proyectoActualizado: any) => {
                                    proyectoActualizado
                                      .populate('categorias')
                                      .execPopulate()
                                      .then(async (ProyectoConCategorias: any) => {
                                        let datosDeProyectoParaNotificacionDeNavegador =
                                          await filtrarDatosParaCreacionDeProyecto(
                                            ProyectoConCategorias,
                                            proyectoAnterior,
                                            req.body.piezas ? req.body.piezas : []
                                          )
                                            .then((datos: any) => {
                                              return datos;
                                            })
                                            .catch((error: any) => {
                                              console.log(error);
                                              return error;
                                            });

                                        let datosFiltradosParaCreacionDePieza =
                                          await filtrarDatosParaPiezaCreada(
                                            req.body.piezas,
                                            ProyectoConCategorias
                                          )
                                            .then((resultado: any) => {
                                              return resultado;
                                            })
                                            .catch((error: any) => {
                                              console.log(error);
                                              return error;
                                            });

                                        // return false;
                                        res.status(200).send({
                                          message: 'Proyecto actualizado',
                                          value: ProyectoConCategorias,
                                          datosParaNotificar:
                                            datosDeProyectoParaNotificacionDeNavegador,
                                          datosParaNotificarPieza:
                                            datosFiltradosParaCreacionDePieza,
                                        });
                                      })
                                      .catch((error: any) => {
                                        console.log(error);
                                        res
                                          .status(500)
                                          .send({message: 'Error interno del servidor'});
                                      });
                                  })
                                  .catch((error: any) => {
                                    console.log(error);
                                    res.status(500).send({
                                      message: 'Error interno del servidor',
                                    });
                                  });
                              })
                              .catch((error: any) => {
                                console.log(error);
                                res.status(500).send({
                                  message: 'Error interno del servidor',
                                });
                              });
                          }
                        })
                        .catch((error: any) => {
                          console.error(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    }
                  }
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          } else {
            // console.log('NO cambio el nombre');
            //Actualizar todo
            //TODO:Hacerlo en una funcion y llamarla
            traerPiezasEnEstadoBorrador(proyectoPorId._id)
              .then((piezas: any) => {
                if (piezas && piezas.length > 0) {
                  estado = Estado.Borrador;
                } else {
                  estado = calcularEstadoDeProyecto(proyectoPorId, req.body, res);
                }

                proyectoPorId.cantidadDeAdjuntosDelBody = proyectoNuevo.cantidadDeAdjuntosDelBody;
                proyectoPorId.nombreProyecto = proyectoNuevo.nombreProyecto;
                proyectoPorId.descripcion = proyectoNuevo.descripcion;
                proyectoPorId.prioridadId = proyectoNuevo.prioridadId;
                proyectoPorId.fechaDeadLine = proyectoNuevo.fechaDeadLine;
                proyectoPorId.categorias = proyectoNuevo.categorias;
                proyectoPorId.fechaRecordatorio = proyectoNuevo.fechaRecordatorio;
                proyectoPorId.estadoId = estado;
                proyectoPorId.editando = false;
                proyectoPorId.isCambiaDescripcionPieza = proyectoNuevo.isCambiaDescripcionPieza;
                proyectoPorId.archivado = proyectoNuevo.archivado;
                proyectoPorId
                  .save()
                  .then((proyectoActualizado: any) => {
                    proyectoActualizado
                      .populate('categorias')
                      .execPopulate()
                      .then(async (ProyectoConCategorias: any) => {
                        let datosDeProyectoParaNotificacionDeNavegador =
                          await filtrarDatosParaCreacionDeProyecto(
                            ProyectoConCategorias,
                            proyectoAnterior,
                            req.body.piezas ? req.body.piezas : []
                          )
                            .then((datos: any) => {
                              return datos;
                            })
                            .catch((error: any) => {
                              console.log(error);
                              return error;
                            });

                        let datosFiltradosParaCreacionDePieza = await filtrarDatosParaPiezaCreada(
                          req.body.piezas,
                          ProyectoConCategorias
                        )
                          .then((resultado: any) => {
                            return resultado;
                          })
                          .catch((error: any) => {
                            console.log(error);
                            return error;
                          });
                        // console.log(datosDeProyectoParaNotificacionDeNavegador);
                        // return false;
                        res.status(200).send({
                          message: 'Proyecto actualizado',
                          value: ProyectoConCategorias,
                          datosParaNotificar: datosDeProyectoParaNotificacionDeNavegador,
                          datosParaNotificarPieza: datosFiltradosParaCreacionDePieza
                            ? datosFiltradosParaCreacionDePieza
                            : [],
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
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          }
        } else {
          res.status(400).send({message: 'Proyecto no encontrado'});
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
exports.RenovarBloquearConcurrencia = (req: Request, res: Response) => {
  try {
    if (!req.body.idProyecto) {
      res.status(400).send({message: 'No se ingreso el id de proyecto'});
    } else {
      ProyectosModel.findById(req.body.idProyecto)
        .then((proyectoEnBd: any) => {
          proyectoEnBd.editando = true;
          proyectoEnBd.fechaBloqueo = new Date();
          proyectoEnBd
            .save()
            .then(() => {
              res.status(200).send();
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.PausarProyecto = (req: Request, res: Response) => {
  try {
    var nuevoEstado: any;
    if (!req.body.proyectoId && !req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body.proyectoId && !req.body.usuarioId) {
        res.status(400).send({message: 'No se ingresó el ID de usuario'});
      } else {
        if (!req.body.proyectoId && req.body.usuarioId) {
          res.status(400).send({message: 'No se ingresó el ID de proyecto'});
        } else {
          ProyectosModel.findById(req.body.proyectoId)
            .then(async (proyecto: any) => {
              if (proyecto) {
                const usuario = await traerUsuarioPorId(req.body.usuarioId);
                if (
                  usuario &&
                  (usuario.rolId == Rol.Administrador || usuario.rolId == Rol.Prensa) &&
                  proyecto.estadoId == Estado.EnCurso
                ) {
                  nuevoEstado = Estado.Pausado;

                  ProyectosModel.updateOne(
                    {_id: req.body.proyectoId},
                    {$set: {estadoId: nuevoEstado}}
                  )
                    .then((value: any) => {
                      if (value) {
                        res.status(200).send({message: 'Estado del proyecto actualizado'});
                      } else {
                        res.status(500).send({
                          message: 'Ocurrió un error al intentar actualizar el estado del proyecto',
                        });
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({message: 'Error interno del servidor'});
                    });
                } else {
                  res.status(401).send({
                    message:
                      'El usuario no tiene permitido realizar esta operación o el proyecto no estuvo en curso',
                  });
                }
              } else {
                res.status(404).send({message: 'Proyecto no encontrado'});
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

export const ObtenerProyectos = () => {
  return ProyectosModel.find({});
};

exports.AprobarProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId && !req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body.proyectoId && !req.body.usuarioId) {
        res.status(400).send({message: 'No se ingresó el ID de usuario'});
      } else {
        if (!req.body.proyectoId && req.body.usuarioId) {
          res.status(400).send({message: 'No se ingresó el ID de proyecto'});
        } else {
          ProyectosModel.findById(req.body.proyectoId)
            .then(async (proyecto: any) => {
              if (proyecto) {
                var contPiezasAprobadasPorUserAdmin: number = 0;
                var contPiezasEnCorreccion: number = 0;
                const Usuario = await traerUsuarioPorId(req.body.usuarioId);

                if (Usuario) {
                  if (Usuario.rolId == Rol.Administrador) {
                    const piezas = await traerPiezasPorIdProyecto(req.body.proyectoId);

                    if (piezas.length > 0) {
                      piezas.map((pieza: any) => {
                        if (pieza.asignadoId == req.body.usuarioId) {
                          contPiezasAprobadasPorUserAdmin++;
                        } else {
                          contPiezasEnCorreccion++;
                        }
                      });
                    } else {
                      //El proyecto no tiene piezas
                      res.status(400).send({message: 'Este proyecto no posee piezas'});
                    }

                    if (piezas.length == contPiezasAprobadasPorUserAdmin) {
                      ProyectosModel.updateOne(
                        {_id: proyecto._id},
                        {$set: {estadoId: Estado.Aprobado}}
                      ).then((valor: any) => {
                        if (valor) {
                          res.status(200).send({
                            message: 'Estado del proyecto actualizado',
                            proyectoActualizado: valor,
                          });
                        } else {
                          res.status(500).send({
                            message: 'Error al actualizar el estado del proyecto',
                          });
                        }
                      });
                    } else {
                      if (contPiezasEnCorreccion > 0) {
                        ProyectosModel.updateOne(
                          {_id: proyecto._id},
                          {$set: {estadoId: Estado.EnCurso}}
                        ).then((valor: any) => {
                          if (valor) {
                            res.status(200).send({
                              message: 'Estado del proyecto actualizado',
                              proyectoActualizado: valor,
                            });
                          } else {
                            res.status(500).send({
                              message: 'Error al actualizar el estado del proyecto',
                            });
                          }
                        });
                      }
                    }
                  } else {
                    res.status(401).send({
                      message: 'El usuario no posee permisos para realizar esta operación',
                    });
                  }
                } else {
                  res.status(404).send({message: 'Usuario no encontrado'});
                }
              } else {
                res.status(404).send({message: 'Proyecto no encontrado'});
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
exports.ListarProyectosPorPrensa = (req: Request, res: Response) => {
  try {
    if (!req.body.idUsuario) {
      res.status(400).send({message: 'Falta id de usuario'});
    } else {
      const Usuario = traerUsuarioPorId(req.body.idUsuario);
      Usuario.populate('categorias')
        .then((usuario: any) => {
          if (usuario) {
            ProyectosModel.find({})
              .populate('categorias')
              .then((proyectos: any[]) => {
                if (proyectos.length) {
                  //Recorre proyecto.categorias que es un arreglo de objetos y filtra segun la condicion
                  const proyectosFiltrados = proyectos.filter((proyecto: any) =>
                    //La condicion recorre dos arreglos de objetos y retorna true si al menos un objeto coinciden entre ambos array
                    proyecto.categorias.some((categoriaProyecto: any) =>
                      usuario.categorias.some(
                        (categoriaUsuario: any) =>
                          JSON.stringify(categoriaProyecto) === JSON.stringify(categoriaUsuario)
                      )
                    )
                  );
                  res.status(200).send({value: proyectosFiltrados});
                } else {
                  res.status(200).send([]);
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          } else {
            res.status(400).send({message: 'Usuario no encontrado'});
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
export const filtrosPrensa = (categorias: any) => {
  return categorias.map();
};
export const ListarProyectosInicioPorPrensa = (idUsuario: any) => {
  const pr = new Promise((resolve: any, reject: any) => {
    const Usuario = traerUsuarioPorId(idUsuario);
    Usuario.populate('categorias')
      .then((usuario: any) => {
        if (usuario) {
          ProyectosModel.find({})
            .populate('categorias')
            .then((proyectos: any[]) => {
              if (proyectos.length) {
                //Recorre proyecto.categorias que es un arreglo de objetos y filtra segun la condicion
                const proyectosFiltrados = proyectos.filter((proyecto: any) =>
                  //La condicion recorre dos arreglos de objetos y retorna true si al menos un objeto coinciden entre ambos array
                  proyecto.categorias.some((categoriaProyecto: any) =>
                    usuario.categorias.some(
                      (categoriaUsuario: any) =>
                        JSON.stringify(categoriaProyecto) === JSON.stringify(categoriaUsuario)
                    )
                  )
                );
                resolve(proyectosFiltrados);
              } else {
                resolve([]);
              }
            })
            .catch((error: any) => {
              console.log(error);
              reject({status: 500, message: 'Error interno del servidor'});
            });
        } else {
          reject({message: 'usuario no encontrado', status: 400});
        }
      })
      .catch((error: any) => {
        console.log(error);
        reject({status: 500, message: 'Error interno del servidor'});
      });
  });
  return pr;
};
export const ListarProyectosInicioPorProductor = (idUsuario: any) => {
  const pr = new Promise((resolve: any, reject: any) => {
    const PiezasConProyectos = traerPiezasPorAsigando(idUsuario);
    PiezasConProyectos.then((piezasConProyectos: any) => {
      if (piezasConProyectos.length > 0) {
        const proyectos = [
          ...new Set(
            piezasConProyectos.map((pieza: any) => {
              if (pieza.proyectoId) {
                if (
                  pieza.proyectoId.estadoId === Estado.EnCurso ||
                  pieza.proyectoId.estadoId === Estado.Terminado
                ) {
                  return pieza.proyectoId;
                }
              }
            })
          ),
        ];
        const proyectosFiltrados = proyectos.filter(proyecto => {
          return proyecto != undefined;
        });
        resolve(proyectosFiltrados);
      } else {
        resolve([]);
      }
    }).catch((error: any) => {
      console.log(error);
      reject({status: 500, message: 'Error interno del servidor'});
    });
  });
  return pr;
};
exports.ListarProyectos = (req: Request, res: Response) => {
  try {
    ProyectosModel.find({})
      .populate('categorias')
      .then((docs: any[]) => {
        if (docs.length) {
          res.status(200).json({message: 'Hay proyectos', value: docs});
        } else {
          res.status(200).send({message: 'No existen proyectos para mostrar', value: docs});
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

export const ListarProyectosParaInicio = () => {
  return ProyectosModel.find({}).populate('categorias');
};

exports.TraerProyectosPorIdProductor = (req: Request, res: Response) => {
  try {
    const PiezasConProyectos = traerPiezasPorAsigando(req.body._id);
    PiezasConProyectos.then((piezasConProyectos: any) => {
      if (piezasConProyectos.length > 0) {
        const proyectos = [
          ...new Set(
            piezasConProyectos.map((pieza: any) => {
              if (pieza.proyectoId) {
                if (
                  pieza.proyectoId.estadoId === Estado.EnCurso ||
                  pieza.proyectoId.estadoId === Estado.Terminado
                ) {
                  return pieza.proyectoId;
                }
              }
            })
          ),
        ];
        const proyectosFiltrados = proyectos.filter(proyecto => {
          return proyecto != undefined;
        });
        res.status(200).json(proyectosFiltrados);
      } else {
        res.status(200).send([]);
      }
    }).catch((error: any) => {
      console.log(error);
      res.status(500).send({message: 'Error interno del servidor'});
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

const calcularDiferenciaFecha = (fechaCreacionProyecto: Date) => {
  //La diferencia aqui calculada se expresa en días
  var fechaHoy: Date = new Date();
  var fechaHoyParseada: any = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate()
  );
  var fechaCreacionProyectoParseada: any = new Date(
    fechaCreacionProyecto.getFullYear(),
    fechaCreacionProyecto.getMonth(),
    fechaCreacionProyecto.getDate()
  );
  var dia = 1000 * 60 * 60 * 24;
  var diferenciaEntreFechas = (fechaHoyParseada - fechaCreacionProyectoParseada) / dia;

  if (diferenciaEntreFechas > 180) {
    // Pasaron 6 meses
    return true;
  } else {
    // No pasaron
    return false;
  }
};

export const calcularFechaVencimientoProyecto = (fechaVencimiento: Date) => {
  var fechaHoy: Date = new Date();
  var fechaHoyParseada: any = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate()
  );
  var fechaVencimientoParseada: any = new Date(
    fechaVencimiento.getFullYear(),
    fechaVencimiento.getMonth(),
    fechaVencimiento.getDate()
  );
  var dia = 1000 * 60 * 60 * 24;
  var diferenciaEntreFechas = (fechaVencimientoParseada - fechaHoyParseada) / dia;

  // console.log(`Diferencia entre fechas: ${diferenciaEntreFechas}`);
  return diferenciaEntreFechas;
  // if (diferenciaEntreFechas <= 3) {
  //   return true;
  // } else {
  //   return false;
  // }
};

export const calcularFechaProyectoVencido = (fechaVencimiento: Date) => {
  var fechaHoy: Date = new Date();
  var fechaHoyParseada: any = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate()
  );
  var fechaVencimientoParseada: any = new Date(
    fechaVencimiento.getFullYear(),
    fechaVencimiento.getMonth(),
    fechaVencimiento.getDate()
  );
  var dia = 1000 * 60 * 60 * 24;
  var diferenciaEntreFechas = (fechaHoyParseada - fechaVencimientoParseada) / dia;

  if (diferenciaEntreFechas >= 0) {
    return true;
  } else {
    return false;
  }
};

export const calcularTiempoEntreFechas = (fechaVencimiento: Date) => {
  let fechaHoy: any = new Date();
  let fechaHoyParseada: any = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    fechaHoy.getHours(),
    fechaHoy.getMinutes(),
    fechaHoy.getSeconds()
  );
  let fechaVencimientoParseada: any = new Date(
    fechaVencimiento.getFullYear(),
    fechaVencimiento.getMonth(),
    fechaVencimiento.getDate(),
    fechaVencimiento.getHours(),
    fechaVencimiento.getMinutes(),
    fechaVencimiento.getSeconds()
  );

  let minutos = 1000 * 60;
  let diferenciaEnMinutos = Math.floor((fechaVencimientoParseada - fechaHoyParseada) / minutos);

  return diferenciaEnMinutos;
};

exports.ConsultarPiezasTerminadas = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    }

    ProyectosModel.findById(req.body.proyectoId)
      .then((proyecto: any) => {
        if (proyecto) {
          traerPiezasEnEstadoTerminado(req.body.proyectoId)
            .then((piezas: any) => {
              if (piezas) {
                res.status(200).json(piezas);
              } else {
                res.status(404).send({message: 'El proyecto no posee piezas terminadas'});
              }
            })
            .catch((error: any) => {
              console.error(error);
              res.status(500).send({message: 'Error interno del servidor'});
            });
        } else {
          res.status(404).send({message: 'Proyecto no encontrado'});
        }
      })
      .catch((error: any) => {
        console.error(error);
        res.status(500).send({message: 'Error interno del servidor'});
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.EliminarProyectoBorrador = (req: Request, res: Response) => {
  try {
    let resultadoFinal = {
      docsEliminadosBdProyecto: 0,
      docsEliminadosDriveProyecto: 0,
    };
    if (!req.body) {
      res.status(400).send('No se ingresaron datos');
    } else {
      if (req.body.proyectoId && !req.body.usuarioId) {
        res.status(400).send('No se ingreso usuario');
      } else {
        if (!req.body.proyectoId && req.body.usuarioId) {
          res.status(400).send('No se ingreso el ID de proyecto');
        } else {
          const Usuario = traerUsuarioPorId(req.body.usuarioId);
          Usuario.then((user: any) => {
            if (user) {
              if (user.rolId === Rol.Administrador || user.rolId === Rol.Prensa) {
                ProyectosModel.findById(req.body.proyectoId)
                  .then((proyecto: any) => {
                    if (proyecto) {
                      let calcularVidaProyecto;
                      if (proyecto.fechaCreacion) {
                        calcularVidaProyecto = calcularDiferenciaFecha(proyecto.fechaCreacion);
                      }

                      if (
                        proyecto.estadoId == Estado.Borrador ||
                        (proyecto.estadoId == Estado.Archivado && calcularVidaProyecto)
                      ) {
                        eliminarAdjuntosDelProyecto(req.body.proyectoId)
                          .then((resultado: any) => {
                            resultadoFinal.docsEliminadosBdProyecto = resultado.docsEliminadosBd.n;
                            resultadoFinal.docsEliminadosDriveProyecto =
                              resultado.docsEliminadosDrive;

                            eliminarPiezasDeProyecto(req.body.proyectoId)
                              .then((result: any) => {
                                ProyectosModel.deleteOne({
                                  _id: req.body.proyectoId,
                                })
                                  .then((proyectoEliminado: any) => {
                                    if (proyectoEliminado) {
                                      res.status(200).send({
                                        message: 'Proyecto eliminado',
                                        docsEliminadosBdProyecto:
                                          resultadoFinal.docsEliminadosBdProyecto,
                                        docsEliminadosDriveProyecto:
                                          resultadoFinal.docsEliminadosDriveProyecto,
                                        piezasEliminadas: result.cantPiezasEliminadas,
                                        adjuntosDePiezaEliminadosDeDrive:
                                          result.adjuntosEliminadosDePiezaDrive,
                                        adjuntosDePiezaEliminadosBD: result.piezasEliminadas.n
                                          ? result.piezasEliminadas.n
                                          : result.cantPiezasEliminadas,
                                        ProyectoEliminado: proyectoEliminado,
                                      });
                                    } else {
                                      res.status(400).send({
                                        message:
                                          'Ocurrió un error al intentar eliminar el proyecto',
                                      });
                                    }
                                  })
                                  .catch((error: any) => {
                                    console.log(error);
                                    res.status(500).send({
                                      message: 'Error interno del servidor',
                                    });
                                  });
                              })
                              .catch((error: any) => {
                                console.log(error);
                                res.status(500).send({
                                  message: 'Error interno del servidor',
                                });
                              });
                          })
                          .catch((error: any) => {
                            console.log(error);
                            res.status(500).send({message: 'Error interno del servidor'});
                          });
                      } else {
                        res.status(400).send({
                          message: 'El proyecto no está en estado Borrador',
                        });
                      }
                    } else {
                      res.status(404).send({message: 'Proyecto no encontrado'});
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({message: 'Error interno de servidor'});
                  });
              } else {
                res.status(400).send({
                  message: 'El usuario no posee permisos para realizar esta acción',
                });
              }
            } else {
              res.status(404).send({message: 'Usuario no encontrado'});
            }
          }).catch((error: any) => {
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

exports.ArchivarProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      ProyectosModel.findById(req.body.proyectoId)
        .then((proyecto: any) => {
          if (proyecto) {
            if (proyecto.archivado) {
              res.status(200).send({message: 'Estado del proyecto actualizado'});
            } else {
              proyecto.archivado = true;
              proyecto
                .save()
                .then((resultado: any) => {
                  if (resultado) {
                    // console.log('en el then');
                    // console.log(resultado);
                    res.status(200).send({message: 'Estado del proyecto actualizado'});
                  } else {
                    res.status(500).send({message: 'Error al archivar el proyecto'});
                  }
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({
                    message: 'Error al intentar archivar el proyecto',
                  });
                });
            }
          } else {
            res.status(404).send({message: 'Proyecto no encontrado'});
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

exports.DesarchivarProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      ProyectosModel.findById(req.body.proyectoId)
        .then((proyecto: any) => {
          if (proyecto) {
            if (!proyecto.archivado) {
              res.status(200).send({message: 'Estado del proyecto actualizado'});
            } else {
              proyecto.archivado = false;
              proyecto
                .save()
                .then((resultado: any) => {
                  if (resultado) {
                    res.status(200).send({message: 'Estado del proyecto actualizado'});
                  } else {
                    res.status(500).send({message: 'Error al archivar el proyecto'});
                  }
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({
                    message: 'Error al intentar archivar el proyecto',
                  });
                });
            }
          } else {
            res.status(404).send({message: 'Proyecto no encontrado'});
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

exports.EstadoProyecto = (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.CambiarPrioridad = (req: Request, res: Response) => {
  try {
    let proyectoRecibido = req.body;
    if (proyectoRecibido._id && Prioridad[proyectoRecibido.prioridadId]) {
      traerProyectoPorId(proyectoRecibido._id)
        .populate('categorias')
        .then((doc: any) => {
          doc.prioridadId = proyectoRecibido.prioridadId;
          doc
            .save()
            .then(async () => {
              const datosFiltrados = await filtrarDatosParaCambioPrioridadProyecto(doc)
                .then((value: any) => {
                  return value;
                })
                .catch((error: any) => {
                  console.log(error);
                  return error;
                });
              res.status(200).send({
                message: 'Prioridad Actualizada',
                value: doc,
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
      res.status(400).send({message: 'Error de ID de prioridad'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.BloquearConcurrencia = (req: Request, res: Response) => {
  try {
    if (!req.body.idProyecto) {
      res.status(400).send({message: 'No se ingreso el id de proyecto'});
    } else {
      ProyectosModel.findById(req.body.idProyecto)
        .populate('categorias')
        .then((proyectoEnBd: any) => {
          if (proyectoEnBd.editando) {
            if (proyectoEnBd.fechaBloqueo) {
              var fechaHoy: Date = new Date();
              var fechaHoyParseada: any = new Date(
                fechaHoy.getFullYear(),
                fechaHoy.getMonth(),
                fechaHoy.getDate(),
                fechaHoy.getHours(),
                fechaHoy.getMinutes()
              );
              var fechaBloqueoParseada: any = new Date(
                proyectoEnBd.fechaBloqueo.getFullYear(),
                proyectoEnBd.fechaBloqueo.getMonth(),
                proyectoEnBd.fechaBloqueo.getDay(),
                proyectoEnBd.fechaBloqueo.getHours(),
                proyectoEnBd.fechaBloqueo.getMinutes()
              );
              var minutosPasados = Math.round(
                (((fechaHoyParseada - fechaBloqueoParseada) % 86400000) % 3600000) / 60000
              );
              if (minutosPasados > 3) {
                proyectoEnBd.editando = false;
                proyectoEnBd
                  .save()
                  .then(() => {
                    res.status(200).send(proyectoEnBd);
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  });
              } else {
                res.status(403).send({message: 'No se puede modificar'});
              }
            } else {
              proyectoEnBd.editando = false;
              proyectoEnBd
                .save()
                .then(() => {
                  res.status(403).send({message: 'Ya se desbloqueo'});
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            }
          } else {
            proyectoEnBd.editando = true;
            proyectoEnBd.fechaBloqueo = new Date();
            proyectoEnBd
              .save()
              .then(() => {
                res.status(200).send(proyectoEnBd);
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.DesbloquearConcurrencia = (req: Request, res: Response) => {
  try {
    if (!req.body.idProyecto) {
      res.status(400).send({message: 'No se ingreso el id de proyecto'});
    } else {
      ProyectosModel.findById(req.body.idProyecto)

        .then((proyectoEnBd: any) => {
          proyectoEnBd.editando = false;
          proyectoEnBd
            .save()
            .then(() => {
              res.status(200).send({message: 'Ya se desbloqueo'});
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
exports.ObtenerInformacionProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      ProyectosModel.findById(req.body.proyectoId)
        .then((proyecto: any) => {
          if (proyecto) {
            res.status(200).send({message: 'Proyecto encontrado', proyectoEncontrado: proyecto});
          } else {
            res.status(200).send({message: 'El proyecto no existe'});
          }
        })
        .catch((error: any) => {
          console.error(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.error();
  }
};

export const traerProyectoPorId = (idDeProyecto: any) => {
  return ProyectosModel.findById(idDeProyecto).populate('usuarioId');
};

export const ObtenerInformacionDeProyectoPorId = (idDeProyecto: any) => {
  return ProyectosModel.findById(idDeProyecto).populate('usuarioId').populate('categorias');
};

export const listarTodosProyectosEnCurso = () => {
  return ProyectosModel.find({estadoId: Estado.EnCurso})
    .populate('categorias')
    .populate('usuarioId');
};

export const modificarProgreso = async (proyectoId: string, operacion: string) => {
  let resultado;
  if (proyectoId) {
    await ProyectosModel.findById(proyectoId)
      .then(async (proyecto: any) => {
        if (proyecto) {
          let totalPiezas = proyecto.progreso.totalPiezas;
          switch (operacion) {
            case 'eliminar':
              if (proyecto.progreso.totalPiezas > 0) {
                proyecto.progreso.totalPiezas--;
                const r = await proyecto.save();
                if (r) {
                  resultado = true;
                }
              } else {
                resultado = false;
              }
              break;
            //TODO: Revisar estado terminado, comprobar restricciones
            case 'terminado':
              proyecto.progreso.piezasTerminadas++;
              if (proyecto.progreso.piezasTerminadas == proyecto.progreso.totalPiezas) {
                proyecto.estadoId = Estado.Terminado;
              }
              const doc = await proyecto.save();
              if (doc) {
                resultado = true;
              }
              break;
            case 'rechazar':
              if (proyecto.progreso.piezasTerminadas > 0) {
                proyecto.progreso.piezasTerminadas--;
                const valor = await proyecto.save();
                if (valor) {
                  resultado = true;
                }
              } else {
                resultado = false;
              }

              break;
            default:
              break;
          }
        }
      })
      .catch((error: any) => {
        return (resultado = error);
      });
    return resultado;
  } else {
    return (resultado = new Error('No se especificó el ID de proyecto'));
  }
};

const calcularEstadoDeProyecto = (proyectoBD: any, proyectoBody: IProyectos, res: Response) => {
  //   //Lógica para el estado En Curso
  if (
    !proyectoBody.nombreProyecto.includes('Proyecto sin titulo') &&
    proyectoBD.progreso.totalPiezas &&
    proyectoBody.descripcion &&
    proyectoBody.categorias &&
    proyectoBody.categorias.length > 0 &&
    Prioridad[proyectoBody.prioridadId] &&
    proyectoBody.fechaDeadLine &&
    Tipo_Categoria[proyectoBody.tipoCategoriaId] &&
    (proyectoBD.estadoId === Estado.Borrador ||
      proyectoBD.estadoId === Estado.Terminado ||
      proyectoBD.estadoId === Estado.Pausado ||
      proyectoBD.estadoId === Estado.Aprobado ||
      proyectoBD.estadoId === Estado.EnCurso)
  ) {
    const piezasAprobadas = proyectoBody.piezas.filter(element => element.estadoId === 8);
    if (
      proyectoBD.progreso.totalPiezas === proyectoBD.progreso.piezasTerminadas &&
      proyectoBD.estadoId === Estado.Terminado
    ) {
      return Estado.Terminado;
    } else {
      if (
        piezasAprobadas.length === proyectoBody.piezas.length &&
        proyectoBD.estadoId === Estado.Aprobado
      ) {
        return Estado.Aprobado;
      } else {
        return Estado.EnCurso;
      }
    }
  } else {
    return Estado.Borrador;
  }
};

exports.ObtenerLinkCarpetaDeProyecto = (req: Request, res: Response) => {
  try {
    if (!req.body.proyectoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      ProyectosModel.findById(req.body.proyectoId)
        .then(async (proyecto: any) => {
          if (proyecto) {
            GoogleDrive.conectar(
              14,
              proyecto._id,
              '',
              proyecto.tipoCategoriaId,
              '',
              '',
              '',
              '',
              (respuesta: any) => {
                if (respuesta && !respuesta.error) {
                  res.status(200).send({
                    message: 'Carpeta de proyecto encontrada',
                    value: respuesta.linkDeCarpeta,
                  });
                } else {
                  res.status(400).send({message: 'El proyecto no posee carpeta en Drive'});
                }
              }
            );
          } else {
            res.status(400).send({message: 'Proyecto no encontrado', value: ''});
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

export const ActualizarCantidadAdjuntosDeProyecto = (datos: any) => {
  try {
    const pr = new Promise((resolve: any, reject: any) => {
      ProyectosModel.findById(datos.idProyecto).then((proyecto: any) => {
        if (proyecto) {
          switch (datos.operacion) {
            case 'insertar':
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar =
                datos.cantidadDeAdjuntosAntesDeInsertar;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeInsertar =
                datos.cantidadDeAdjuntosInsertados;
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar = 0;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar = 0;
              break;
            case 'eliminar':
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar =
                datos.cantidadDeAdjuntosAntesDeEliminar;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar =
                datos.cantidadDeAdjuntosDespuesDeEliminar;
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar = 0;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeInsertar = 0;

              break;
            default:
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar = 0;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeInsertar = 0;
              proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar = 0;
              proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar = 0;
              break;
          }
          // proyecto.progresoAdjuntos.totalAdjuntosInsertados += cantidadArchivosInsertados;
          // proyecto.progresoAdjuntosAnterior.totalAdjuntosInsertados =
          //   cantidadDeArchivosAnterioresAInsertar;

          proyecto.save().then((proyectoActualizado: any) => {
            if (proyectoActualizado) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          reject(new Error('El proyecto no existe'));
        }
      });
    });
    return pr;
  } catch (error) {
    return new Promise((reject: any) => {
      reject(error);
    });
  }
};

export const actualizarCantidadPiezasDeProyecto = (datos: any) => {
  try {
    const pr = new Promise((resolve: any, reject: any) => {
      ProyectosModel.findById(datos.idProyecto).then(async (proyecto: any) => {
        if (proyecto) {
          switch (datos.operacion) {
            case 'insertar':
              // if (proyecto.progresoPiezas.piezasAntesDeInsertar.length) {
              //   for await (const piezasEnProyecto of proyecto.progresoPiezas
              //     .piezasAntesDeInsertar) {
              //     if (datos.piezasAntesDeInsertar.length) {
              //       for await (const pieza of datos.piezasAntesDeInsertar) {
              //         if (piezasEnProyecto._id !== pieza._id) {
              //           proyecto.progresoPiezas.piezasAntesDeInsertar.push(pieza);
              //           proyecto.progresoPiezas.piezasDespuesDeInsertar.push(pieza);
              //         }
              //       }
              //     }
              //   }
              // } else {
              //   if (datos.piezasAntesDeInsertar.length) {
              //     for await (const pieza of datos.piezasAntesDeInsertar) {
              //       proyecto.progresoPiezas.piezasAntesDeInsertar.push(pieza);
              //       proyecto.progresoPiezas.piezasDespuesDeInsertar.push(pieza);
              //     }
              //   }
              //   proyecto.progresoPiezas.piezasDespuesDeInsertar.push(datos.piezasInsertadas);
              // }
              break;
            case 'editar':
              // console.log(datos);
              if (proyecto.progresoPiezas.piezasAntesDeEditar.length) {
                for await (const piezaEnProyecto of proyecto.progresoPiezas.piezasAntesDeEditar) {
                  if (
                    JSON.stringify(piezaEnProyecto._id) !==
                    JSON.stringify(datos.piezasAntesDeEditar._id)
                  ) {
                    piezaEnProyecto.push(datos.piezasAntesDeEditar);
                  } else {
                    piezaEnProyecto.descripcion = datos.piezasAntesDeEditar.descripcion;
                    piezaEnProyecto.asignadoId = datos.piezasAntesDeEditar.asignadoId;
                    piezaEnProyecto.fechaVencimiento = datos.piezasAntesDeEditar.fechaVencimiento;
                    piezaEnProyecto.estadoId = datos.piezasAntesDeEditar.estadoId;
                  }
                }
              } else {
                proyecto.progresoPiezas.piezasAntesDeEditar.push(datos.piezasAntesDeEditar);
              }

              if (proyecto.progresoPiezas.piezasDespuesDeEditar.length) {
                for await (const piezaEnProyecto of proyecto.progresoPiezas.piezasDespuesDeEditar) {
                  if (
                    JSON.stringify(piezaEnProyecto._id) !==
                    JSON.stringify(datos.piezasDespuesDeEditar._id)
                  ) {
                    piezaEnProyecto.push(datos.piezasDespuesDeEditar);
                  } else {
                    piezaEnProyecto.descripcion = datos.piezasDespuesDeEditar.descripcion;
                    piezaEnProyecto.asignadoId = datos.piezasDespuesDeEditar.asignadoId;
                    piezaEnProyecto.estadoId = datos.piezasDespuesDeEditar.estadoId;
                    piezaEnProyecto.fechaVencimiento = datos.piezasDespuesDeEditar.fechaVencimiento;
                  }
                }
              } else {
                proyecto.progresoPiezas.piezasDespuesDeEditar.push(datos.piezasDespuesDeEditar);
              }

              break;
          }
          // console.log(
          //   '**********************************************************************************'
          // );
          // console.log(proyecto.progresoPiezas);
          ProyectosModel.replaceOne({_id: proyecto._id}, proyecto)
            .then((doc: any) => {
              if (doc) {
                resolve(true);
              } else {
                resolve(false);
              }
            })
            .catch((error: any) => {
              console.log(error);
              reject(error);
            });
        } else {
          reject(new Error('El proyecto no existe'));
        }
      });
    });
    return pr;
  } catch (error) {
    return new Promise((reject: any) => {
      reject(error);
    });
  }
};
