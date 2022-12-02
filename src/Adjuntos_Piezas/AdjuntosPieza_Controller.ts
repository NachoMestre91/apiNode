import AdjuntosPiezaModel, {IAdjuntosPieza} from '../Adjuntos_Piezas/AdjuntosPieza.model';
import {Request, Response} from 'express';
import ProyectoModel from '../Proyectos/Proyecto.model';
import {Estado, Tipo_Categoria} from '../Config/enumeradores';
import {IAdjuntosProyectos} from '../Adjuntos_Proyectos/adjuntosProyecto.model';
import {obtenerPiezaPorId} from '../Piezas/Piezas_Controller';
import {type} from 'os';
import {isTemplateExpression} from 'typescript';
const apiGDrive = require('../ApiGoogleDrive/apiGoogleDrive.js');
const apiDrive = new apiGDrive();

exports.ListarAdjuntosPieza = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      AdjuntosPiezaModel.find({piezaId: req.body._id})
        .then((docs: any[]) => {
          if (docs) {
            res.status(200).json(docs);
          } else {
            res.status(400).send({message: 'No se encontraron resultados para el ID ingresado'});
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

exports.CrearAdjuntosPieza = (req: any, res: Response) => {
  try {
    let resultado: any;
    if (!req.body._id && !req.body.proyectoId && !req.body.usuario) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body._id && !req.body.proyectoId) {
        res.status(400).send({message: 'No se ingreso el ID de proyecto'});
      } else {
        if (!req.body._id && req.body.proyectoId) {
          res.status(400).send({message: 'No se ingreso el ID de la pieza'});
        } else {
          //TODO: controlar que la pieza exista
          ProyectoModel.findById(req.body.proyectoId)
            .then((proyecto: any) => {
              if (proyecto) {
                if (Tipo_Categoria[proyecto.tipoCategoriaId]) {
                  const nombreTipoCategoria = Tipo_Categoria[proyecto.tipoCategoriaId];
                  if (req.files) {
                    apiDrive.conectar(
                      3,
                      req.body.proyectoId,
                      proyecto.nombreProyecto,
                      proyecto.tipoCategoriaId,
                      nombreTipoCategoria,
                      req.files,
                      req.body._id,
                      '',
                      async (respuesta: any) => {
                        if (respuesta.status != undefined) {
                          let band = false;
                          // console.log(respuesta);
                          // return false;
                          if (respuesta.archivosSinErrores.length > 0) {
                            for (let i = 0; i < respuesta.archivosSinErrores.length; i++) {
                              const nuevoArchivoAdjuntoPieza: IAdjuntosPieza =
                                new AdjuntosPiezaModel({
                                  linkAdjunto: respuesta.linksArchivos[i],
                                  idArchivo: respuesta.idsArchivos[i],
                                  piezaId: req.body._id,
                                  datosArchivo: {
                                    nombre: respuesta.nombreArchivo[i],
                                    tamanio: respuesta.tamanioArchivo[i],
                                    usuario: req.body.usuario,
                                    fecha: respuesta.fechaCreacionArchivo[i],
                                    tipo: respuesta.tipoArchivo[i],
                                  },
                                });

                              resultado = await nuevoArchivoAdjuntoPieza.save();
                              if (resultado) {
                                band = true;
                              }
                            }

                            if (band == true) {
                              res.status(200).send({
                                message: 'Archivos insertados con éxito',
                              });
                            } else {
                              res.status(500).send({
                                message: 'Ocurrió un error al intentar guardar los archivos;',
                              });
                            }
                          } else {
                            console.log(respuesta);
                            res.status(400).send({message: 'No existen archivos para almacenar'});
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
                    res.status(400).send({message: 'No hay archivos para cargar'});
                  }
                } else {
                  res.status(400).send({message: 'El proyecto no posee un tipo de categoría'});
                }
              } else {
                res
                  .status(400)
                  .send({message: 'No existen datos para el ID de proyecto ingresado'});
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

exports.ModifLinkAdjPieza = (req: Request, res: Response) => {
  try {
    // let {link, idPieza} = req.body;
    // if (!{link, idPieza}) {
    //   res.status(401).send('No hay datos');
    // } else {
    //   connection
    //     .collection('Adjuntos_Piezas')
    //     .findOneAndUpdate(
    //       {_id: new mongo.ObjectID(idPieza)},
    //       {$set: {linkAdjunto: link}},
    //       {returnOriginal: false},
    //       (error, doc) => {
    //         if (error) {
    //           console.log(error);
    //           res.status(500).send({message: 'Error interno del servidor'});
    //         } else {
    //           res.status(200).send('Adjunto Pieza actualizado');
    //         }
    //       }
    //     );
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModificarAdjuntosPieza = (req: Request, res: Response) => {
  try {
    // let {idPiezaNuevo, idAdjPieza} = req.body;
    // if (!{idPiezaNuevo, idAdjPieza}) {
    //   res.status(401).send('No hay datos');
    // } else {
    //   connection
    //     .collection('Adjuntos_Piezas')
    //     .findOneAndUpdate(
    //       {_id: new mongo.ObjectID(idAdjPieza)},
    //       {$set: {piezaId: new mongo.ObjectID(idPiezaNuevo)}},
    //       {returnOriginal: false},
    //       (error, doc) => {
    //         if (error) {
    //           console.log(error);
    //           res.status(500).send({message: 'Error del servidor'});
    //         } else {
    //           res.status(200).send('Adjunto Pieza actualizado');
    //         }
    //       }
    //     );
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error del servidor'});
  }
};

exports.EliminarAdjuntoPieza = (req: Request, res: Response) => {
  try {
    if (!req.body.piezaId && !req.body.archivoId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (req.body.piezaId && !req.body.archivoId) {
        res.status(400).send({message: 'No se ingresó el ID del archivo a eliminar'});
      } else {
        if (!req.body.piezaId && req.body.archivoId) {
          res.status(400).send({message: 'No se ingresó el ID de pieza'});
        } else {
          const Pieza = obtenerPiezaPorId(req.body.piezaId);
          // console.log(Pieza);
          // return false;
          Pieza.then((doc: any) => {
            if (doc) {
              if (doc.estadoId === Estado.Aprobado) {
                res.status(400).send({message: 'No se pueden eliminar adjuntos de pieza aprobada'});
              } else {
                apiDrive.conectar(
                  4,
                  '',
                  '',
                  '',
                  '',
                  '',
                  req.body.piezaId,
                  req.body.archivoId,
                  async (respuesta: any) => {
                    if (respuesta != 0) {
                      AdjuntosPiezaModel.findOneAndDelete({idArchivo: req.body.archivoId})
                        .then((doc: any) => {
                          if (doc) {
                            res
                              .status(200)
                              .send({message: 'Archivo eliminado', archivoEliminado: doc});
                          } else {
                            res
                              .status(400)
                              .send({message: 'El archivo no existe en la base de datos'});
                          }
                        })
                        .catch((error: any) => {
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    } else {
                      AdjuntosPiezaModel.find({idArchivo: req.body.archivoId})
                        .then((adjunto: any) => {
                          if (adjunto) {
                            AdjuntosPiezaModel.deleteOne({idArchivo: req.body.archivoId})
                              .then((resultado: any) => {
                                if (resultado) {
                                  res.status(200).send({
                                    message: 'Archivo eliminado de la base de datos',
                                  });
                                } else {
                                  console.log(resultado);
                                  res.status(400).send({
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
                      //res.status(400).send({message: 'El archivo no existe'});
                    }
                  }
                );
              }
            } else {
              res.status(400).send({message: 'Pieza no encontrada'});
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

export const traerUnAdjuntoPorIdDeProyecto = (idDeProyecto: any) => {
  return AdjuntosPiezaModel.findOne({_id: idDeProyecto});
};

export const TraerAjduntosPorIdDePieza = (piezaId: any) => {
  return AdjuntosPiezaModel.find({piezaId: piezaId});
};
export const TraerAjduntoPorId = (id: any) => {
  return AdjuntosPiezaModel.findById(id);
};

export const eliminarAdjuntosDePiezaPorId = async (idPieza: string) => {
  var retorno = {
    cantAdjuntosEliminadosDrive: 0,
    cantAdjuntosEliminadosBd: 0,
    mensaje: '',
    idArchivoEliminado: [],
  };

  const pr = new Promise((resolve: any, reject: any) => {
    AdjuntosPiezaModel.find({piezaId: idPieza})
      .then((adjuntosPiezas: any) => {
        if (adjuntosPiezas) {
          apiDrive.conectar(5, '', '', '', '', adjuntosPiezas, '', '', (respuesta: any) => {
            retorno.cantAdjuntosEliminadosDrive = respuesta;
            AdjuntosPiezaModel.deleteMany({piezaId: idPieza})
              .then((docsEliminados: any) => {
                retorno.cantAdjuntosEliminadosBd = docsEliminados;
                resolve(retorno);
              })
              .catch((error: any) => {
                reject(error);
              });
          });
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });
  return pr;
};
