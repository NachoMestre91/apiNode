import UsuarioModel, {IUsuario} from './Usuario_Models';
import {Request, Response} from 'express';
import CodifClaves from '../Config/validaciones';
import {REGEXEMAIL, REGEXPASSWORD} from '../Config/expresionesRegulares';
// import {
//   cargarFotoPerfil,
//   obtenerFotoPerfil,
//   modificarFotoPerfil,
//   eliminarFotoPerfil,
//   cargarDocumento,
//   modificarDocumento,
//   obtenerDocumento,
//   eliminarDocumento,
// } from '../Config/administracionArchivos';
import {Rol} from '../Config/enumeradores';
import {enviarMailConHash, enviarMailConNuevaClave} from '../middlewares/SendMail';
import {
  notificarActivacionUsuario,
  notificarRegistroDeNuevoUsuario,
} from '../Config/NotificacionesPorMail';
import {filtrarDatosParaRegistroDeUsuario} from '../Config/NotificacionesViaNavegador';
const apiGoogleDrive = require('../ApiGoogleDrive/apiGoogleDrive.js');
const GoogleDrive = new apiGoogleDrive();

const CodfCla = new CodifClaves();

const proyeccion = {password: 0};

exports.Login = (req: Request, res: Response) => {
  try {
    let datosLogeo = req.body;
    if (!(datosLogeo.email && datosLogeo.password)) {
      res.status(401).send({message: 'Falta Email o password'});
    } else {
      if (REGEXEMAIL.test(datosLogeo.email)) {
        UsuarioModel.findOne({email: datosLogeo.email})

          .then((doc: any) => {
            if (doc) {
              if (doc.isActivado) {
                let boolCompare = CodfCla.CompareClave(datosLogeo.password, doc.password);
                if (boolCompare) {
                  var JWtoken = CodfCla.GenerateToken(JSON.parse(JSON.stringify(doc)));
                  res.status(200).send(JWtoken);
                } else {
                  res.status(401).send({message: 'Clave incorrecta'});
                }
              } else {
                res.status(400).send({message: 'Usuario no autorizado'});
              }
            } else {
              res.status(401).send({message: 'Usuario no encontrado'});
            }
          })
          .catch((error: any) => {
            console.log(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
      } else {
        res.status(401).send({message: 'El email no es valido'});
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.RegistrarUsuario = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'Falta id de usuario'});
    } else {
      UsuarioModel.findById(req.body._id)
        .then((usuario: any) => {
          if (!usuario) {
            res.status(200).send({message: 'No se encontro el usuario'});
          } else {
            if (!REGEXPASSWORD.test(req.body.password)) {
              res.status(200).send({message: 'Debe ingresar una contraseña valida'});
            } else {
              const passwordCodificado = CodfCla.HashClave(req.body.password);
              req.body.password = passwordCodificado;
              const usuarioModelado = modelarUsuarioParaRegistro(req.body, usuario);
              usuarioModelado
                .save()
                .then((usuario: any) => {
                  notificarRegistroDeNuevoUsuario(usuario);
                  // const datosParaNotificar = await filtrarDatosParaRegistroDeUsuario(usuario)
                  //   .then((datosFiltrados: any) => {
                  //     return datosFiltrados;
                  //   })
                  //   .catch((error: any) => {
                  //     console.log(error);
                  //     return error;
                  //   });
                  const traerUsuariosAdmin = traerUsuariosAdministradores();
                  traerUsuariosAdmin
                    .then((usuariosAdministradores: any) => {
                      res.status(200).send({
                        message: 'Registro exitoso',
                        value: {
                          usuario: usuarioModelado,
                          destinatariosNotificacion: usuariosAdministradores.map((usuario: any) => {
                            return usuario._id;
                          }),
                        },
                      });
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(200).send({message: 'Registro exitoso', value: []});
                    });
                })
                .catch((error: any) => {
                  console.log(error);
                  res.status(500).send({
                    message: 'Error interno del servidor al registrar el usuario',
                  });
                });
            }
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({
            message: 'Error interno del servidor al buscar el usuario',
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
const modelarUsuarioParaRegistro = (datos: any, entidadOriginal: any) => {
  entidadOriginal.isActivado = false;
  // entidadOriginal.documentacionAdjunta.docAfip.nombre = '';
  // entidadOriginal.documentacionAdjunta.docAfip.usuario = '';
  // entidadOriginal.documentacionAdjunta.docAfip.tipoDocumento = 0;
  // entidadOriginal.documentacionAdjunta.docAfip.idDrive = '';
  // entidadOriginal.documentacionAdjunta.docAfip.tipo = '';
  // entidadOriginal.documentacionAdjunta.docAfip.tamanio = 0;
  // entidadOriginal.documentacionAdjunta.docAfip.linkDeDescarga = '';
  // entidadOriginal.documentacionAdjunta.docAfip.linkDeVistaWeb = '';

  // entidadOriginal.documentacionAdjunta.docRentas.nombre = '';
  // entidadOriginal.documentacionAdjunta.docRentas.usuario = '';
  // entidadOriginal.documentacionAdjunta.docRentas.tipoDocumento = 0;
  // entidadOriginal.documentacionAdjunta.docRentas.idDrive = '';
  // entidadOriginal.documentacionAdjunta.docRentas.tipo = '';
  // entidadOriginal.documentacionAdjunta.docRentas.tamanio = 0;
  // entidadOriginal.documentacionAdjunta.docRentas.linkDeDescarga = '';
  // entidadOriginal.documentacionAdjunta.docRentas.linkDeVistaWeb = '';

  // entidadOriginal.documentacionAdjunta.docProveedorEstado.nombre = '';
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.usuario = '';
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.tipoDocumento = 0;
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.idDrive = '';
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.tipo = '';
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.tamanio = 0;
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.linkDeDescarga = '';
  // entidadOriginal.documentacionAdjunta.docProveedorEstado.linkDeVistaWeb = '';

  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.nombre = '';
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.usuario = '';
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.tipoDocumento = 0;
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.idDrive = '';
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.tipo = '';
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.tamanio = 0;
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.linkDeDescarga = '';
  // entidadOriginal.documentacionAdjunta.docConstanciaPublicacion.linkDeVistaWeb = '';
  //TODO:FALTA CONTROLAR CAMPOS QUE SE PUEDEN EDITAR SEGUN CADA ROL DE USUARIO
  switch (entidadOriginal.rolId) {
    case 1: {
      //Caso Administrador
      entidadOriginal.categorias = datos.categorias;
      entidadOriginal.proyectosSeguidos = datos.proyectosSeguidos;
      entidadOriginal.soportes = datos.soportes;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.nombreUsuario = datos.nombreUsuario;
      entidadOriginal.password = datos.password;
      entidadOriginal.hash = '';
    }
    case 2: {
      //Caso Prensa
      entidadOriginal.categorias = datos.categorias;
      entidadOriginal.proyectosSeguidos = datos.proyectosSeguidos;
      entidadOriginal.soportes = datos.soportes;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.nombreUsuario = datos.nombreUsuario;
      entidadOriginal.password = datos.password;
      entidadOriginal.alcanceMedio = datos.alcanceMedio;
      entidadOriginal.medioPrograma = datos.medioPrograma;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
      entidadOriginal.hash = '';
    }
    case 3: {
      //Caso Productor
      entidadOriginal.categorias = datos.categorias;
      entidadOriginal.proyectosSeguidos = datos.proyectosSeguidos;
      entidadOriginal.soportes = datos.soportes;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.nombreUsuario = datos.nombreUsuario;
      entidadOriginal.password = datos.password;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
      entidadOriginal.area = datos.area;
      entidadOriginal.hash = '';
    }
    case 4: {
      //Caso Medio
      entidadOriginal.categorias = datos.categorias;
      entidadOriginal.proyectosSeguidos = datos.proyectosSeguidos;
      entidadOriginal.soportes = datos.soportes;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.nombreUsuario = datos.nombreUsuario;
      entidadOriginal.password = datos.password;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
      entidadOriginal.hash = '';
      entidadOriginal.alcanceMedio = datos.alcanceMedio;
      entidadOriginal.medioPrograma = datos.medioPrograma;
    }
    default:
      break;
  }
  return entidadOriginal;
};

exports.ActivarUsuario = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId)
        .then((usuario: any) => {
          if (usuario) {
            usuario.isActivado = true;

            usuario.save().then((resultado: any) => {
              if (resultado) {
                if (!resultado.isNotificadoPorMailDeActivacion) {
                  notificarActivacionUsuario(resultado);
                  resultado.isNotificadoPorMailDeActivacion = true;
                  resultado
                    .save()
                    .then((user: any) => {
                      if (user) {
                        res
                          .status(200)
                          .send({message: 'Usuario activado y notificado', value: user});
                      } else {
                        console.log(resultado);
                        res.status(500).send({message: 'Error al actualizar el usuario'});
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({message: 'Error interno del servidor'});
                    });
                } else {
                  res.status(200).send({message: 'Usuario activado', value: resultado});
                }
              } else {
                console.log(resultado);
                res.status(500).send({message: 'Error al actualizar el usuario'});
              }
            });
          } else {
            res.status(200).send({message: 'Usuario no encontrado'});
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

exports.DesactivarUsuario = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId)
        .then((usuario: any) => {
          if (usuario) {
            usuario.isActivado = false;

            usuario.save().then((resultado: any) => {
              if (resultado) {
                res.status(200).send({message: 'Usuario desactivado', value: resultado});
              } else {
                console.log(resultado);
                res.status(500).send({message: 'Error al actualizar el usuario'});
              }
            });
          } else {
            res.status(200).send({message: 'Usuario no encontrado'});
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

exports.EliminarUsuario = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'Falta id de usuario'});
    } else {
      UsuarioModel.findById(req.body._id)
        .then((usuarioAEliminar: any) => {
          if (!usuarioAEliminar) {
            res.status(400).send({message: 'Usuario no encontrado'});
          } else {
            UsuarioModel.deleteOne({
              _id: usuarioAEliminar._id,
            })
              .then(() => {
                res.status(200).send({message: 'Usuario eliminado'});
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({
                  message: 'Error interno del servidor al eliminar el usuario',
                });
              });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({
            message: 'Error interno del servidor al buscar el usuario',
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModificarUsuario = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'Falta id de usuario'});
    } else {
      UsuarioModel.findById(req.body._id)
        .then((usuario: any) => {
          if (!usuario) {
            res.status(404).send({message: 'No se encontro el usuario'});
          } else {
            if (!REGEXEMAIL.test(req.body.email)) {
              //TODO:Estatus correcto?
              res.status(400).send({message: 'Ingrese un Correo valido'});
            } else {
              if (req.body.password) {
                if (!REGEXPASSWORD.test(req.body.password)) {
                  res.status(400).send({message: 'Debe ingresar una contraseña valida'});
                } else {
                  const passwordCodificado = CodfCla.HashClave(req.body.password);
                  const usuarioEditado = modelarUsuarioAModificar(req.body, usuario);
                  usuarioEditado.password = passwordCodificado;
                  usuarioEditado
                    .save()
                    .then(() => {
                      res.status(200).send({
                        message: 'usuario editado',
                        value: usuarioEditado,
                        isCerrarSesion: true,
                      });
                    })
                    .catch((error: any) => {
                      console.log(error);
                      res.status(500).send({
                        message: 'Error interno del servidor,no se actualizo el usuario',
                      });
                    });
                }
              } else {
                const usuarioEditado = modelarUsuarioAModificar(req.body, usuario);
                usuarioEditado
                  .save()
                  .then(() => {
                    res.status(200).send({
                      message: 'usuario editado',
                      value: usuarioEditado,
                      isCerrarSesion: false,
                    });
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({
                      message: 'Error interno del servidor,no se actualizo el usuario',
                    });
                  });
              }
            }
          }
        })
        .catch((error: any) => {
          console.log({error});
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {}
};
const modelarUsuarioAModificar = (datos: any, entidadOriginal: any) => {
  switch (entidadOriginal.rolId) {
    case 1: {
      //Caso Administrador
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.contacto = datos.contacto;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.email = datos.email;
    }
    case 2: {
      //Caso Prensa
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.contacto = datos.contacto;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.email = datos.email;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
    }
    case 3: {
      //Caso Productor
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.contacto = datos.contacto;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.email = datos.email;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
      entidadOriginal.area = datos.area;
    }
    case 4: {
      //Caso Medio
      entidadOriginal.nombre = datos.nombre;
      entidadOriginal.apellido = datos.apellido;
      entidadOriginal.contacto = datos.contacto;
      entidadOriginal.cuit = datos.cuit;
      entidadOriginal.email = datos.email;
      entidadOriginal.cargoDesempeña = datos.cargoDesempeña;
      entidadOriginal.soportes = datos.soportes;
      entidadOriginal.alcanceMedio = datos.alcanceMedio;
      entidadOriginal.medioPrograma = datos.medioPrograma;
    }
    default:
      break;
  }
  entidadOriginal.nombreUsuario = datos.email;
  return entidadOriginal;
};

exports.TraerUsuarios = (req: Request, res: Response) => {
  try {
    UsuarioModel.find({}, proyeccion)
      .then((docs: IUsuario[]) => {
        if (docs) {
          //TODO:CORREGIR,esto debe ser status 200 con send
          res.status(200).json(docs);
        } else {
          res.status(200).send({message: 'No hay resultados'});
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

export const ListarUsuariosParaInicio = async () => {
  return UsuarioModel.find({}, proyeccion).populate('proyectosSeguidos');
};

export const ListarProyectosSeguidosPorUsuarioParaInicio = (usuarioId: string) => {
  return UsuarioModel.findById(usuarioId, proyeccion).populate('proyectosSeguidos');
};

exports.ValidarNuevoUsuario = (req: Request, res: Response) => {
  try {
    if (req.body.hash) {
      UsuarioModel.findOne({hash: req.body.hash})
        .then((usuario: any) => {
          if (usuario) {
            res.status(200).send(usuario);
          } else {
            res.status(403).send({
              message: 'No se encontro usuario con ese hash asociado',
            });
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    } else {
      res.status(400).send({message: 'No se envio hash'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

const generarClaveAleatoria = () => {
  var longCadena = Math.floor(Math.random() * (16 + 1 - 8) + 8);
  const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let resultado = '';
  const caracteresLength = caracteres.length;
  for (let i = 0; i < longCadena; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLength));
  }
  return resultado;
};

exports.RecuperarPassword = (req: Request, res: Response) => {
  try {
    if (!req.body.Email) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      if (REGEXEMAIL.test(req.body.Email)) {
        UsuarioModel.findOne({email: req.body.Email}, {password: 0})
          .then((usuario: any) => {
            if (usuario) {
              let nuevaClaveAleatoriaUsuario = generarClaveAleatoria();
              if (REGEXPASSWORD.test(nuevaClaveAleatoriaUsuario)) {
                enviarMailConNuevaClave(
                  usuario.email,
                  usuario.nombreUsuario,
                  nuevaClaveAleatoriaUsuario
                );
                let nuevaClaveCifrada = CodfCla.HashClave(nuevaClaveAleatoriaUsuario);
                usuario.password = nuevaClaveCifrada;
                usuario
                  .save()
                  .then((resultado: any) => {
                    if (resultado) {
                      res.status(200).send({
                        message: 'Contraseña del usuario reestablecida',
                      });
                    } else {
                      res.status(400).send({
                        message: 'Error al intentar reestablecer la contraseña',
                      });
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500);
                  });
              } else {
                res.status(500).send({message: 'Error al generar la clave'});
              }
            } else {
              res.status(404).send({message: 'Usuario no encontrado'});
            }
          })
          .catch((error: any) => {
            console.log(error);
            res.status(500).send({message: 'Error al intentar recuperar el usuario'});
          });
      } else {
        res.status(400).send({message: 'Debe ingresar un correo electrónico válido'});
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.GenerarHash = (req: Request, res: Response) => {
  try {
    if (REGEXEMAIL.test(req.body.email)) {
      if (req.body.categorias) {
        UsuarioModel.findOne({email: req.body.email})
          .then((doc: any) => {
            if (doc) {
              res.status(400).send({
                message: 'Ya existe un usuario con el email especificado',
              });
            } else {
              if (Rol[req.body.rolId]) {
                const nuevoHash = CodfCla.HashClave(req.body.email);
                const nuevoUsuario: IUsuario = new UsuarioModel({
                  isActivado: false,
                  email: req.body.email,
                  nombreUsuario: req.body.email,
                  rolId: req.body.rolId,
                  categorias: req.body.categorias,
                  hash: nuevoHash,
                  documentacionAdjunta: ModelarDocumentacion(),
                });
                nuevoUsuario
                  .save()
                  .then((newUser: any) => {
                    if (newUser) {
                      enviarMailConHash(newUser)
                        .then(() => {
                          res
                            .status(200)
                            .send({message: 'Usuario creado, mail enviado', value: newUser});
                        })
                        .catch((error: any) => {
                          // nuevoUsuario.delete();
                          console.log(error);
                          res.status(500).send({message: 'Error interno del servidor'});
                        });
                    } else {
                      console.log(newUser);
                      res.status(500).send({
                        message: 'Ocurrió un error al intentar registrar al usuario',
                      });
                    }
                  })
                  .catch((error: any) => {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  });
              } else {
                res.status(400).send({message: 'El Rol ingresado no es valido'});
              }
            }
          })
          .catch((error: any) => {
            console.log(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
      } else {
        res.status(400).send({message: 'No se ingreso categoria'});
      }
    } else {
      res.status(400).send({message: 'Ingrese un Correo valido'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

export const traerUsuarioPorId = (idDeUsuario: string) => {
  return UsuarioModel.findById(idDeUsuario);
};
export const traerUsuarioPorIdConCategorias = (idDeUsuario: string) => {
  return UsuarioModel.findById(idDeUsuario).populate('categorias');
};
export const traerUsuariosAdministradoresYPrensa = () => {
  return UsuarioModel.find(
    {$and: [{isActivado: true}, {$or: [{rolId: Rol.Administrador}, {rolId: Rol.Prensa}]}]},
    proyeccion
  );
};

export const traerUsuariosAdministradoresYProductores = () => {
  return UsuarioModel.find({$or: [{rolId: Rol.Administrador}, {rolId: Rol.Productor}]}, proyeccion);
};

export const traerUsuariosAdministradoresProductoresYPrensa = () => {
  return UsuarioModel.find(
    {
      $and: [
        {isActivado: true},
        {$or: [{rolId: Rol.Administrador}, {rolId: Rol.Productor}, {rolId: Rol.Prensa}]},
      ],
    },
    proyeccion
  );
};

export const traerUsuariosPrensa = () => {
  return UsuarioModel.find({rolId: Rol.Prensa}, proyeccion);
};

export const traerUsuariosAdministradores = () => {
  return UsuarioModel.find({rolId: Rol.Administrador, isActivado: true}, proyeccion);
};

exports.CargarFotoPerfil = (req: Request, res: Response) => {
  try {
    let archivos = req.files;
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          // console.log(usuario);
          if (usuario) {
            if (archivos) {
              GoogleDrive.conectar(
                6,
                usuario._id,
                '',
                '',
                '',
                archivos,
                '',
                '',
                (respuesta: any) => {
                  if (respuesta && respuesta.statusText == 'OK') {
                    // console.log(respuesta);
                    // return false;
                    usuario.fotoPerfil.nombreImagen = respuesta.nombreImagen;
                    usuario.fotoPerfil.tamanio = respuesta.tamanio;
                    usuario.fotoPerfil.tipo = respuesta.tipo;
                    usuario.fotoPerfil.idDrive = respuesta.idDrive;
                    usuario.fotoPerfil.linkDeDescarga = respuesta.linkDeDescarga;
                    usuario.fotoPerfil.linkDeVistaWeb = respuesta.linkDeVistaWeb;
                    // console.log(respuesta);
                    // console.log(usuario.fotoPerfil);

                    usuario
                      .save()
                      .then((resultado: any) => {
                        if (resultado) {
                          res.status(200).send({
                            message: 'Foto de perfil insertada',
                            value: usuario.fotoPerfil,
                          });
                        } else {
                          console.log(resultado);
                          res.status(500).send({
                            message: 'Error al insertar la foto de perfil',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(500).send({message: 'Error interno del servidor'});
                  }
                }
              );
            } else {
              res.status(400).send({message: 'No hay archivos para subir'});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.log;
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ObtenerFotoPerfil = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresó ID de usuario'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          // console.log(usuario);
          if (usuario) {
            if (usuario.fotoPerfil.idDrive) {
              GoogleDrive.conectar(
                7,
                usuario._id,
                '',
                '',
                '',
                '',
                '',
                usuario.fotoPerfil.idDrive,
                (respuesta: any) => {
                  if (respuesta && respuesta.status == 200) {
                    res.status(200).send({
                      message: 'Foto de perfil encontrada',
                      fotoPerfil: respuesta.archivo[0],
                    });
                  } else {
                    // console.log(respuesta)
                    res.status(200).send({fotoPerfil: {}});
                  }
                }
              );
            } else {
              res.status(200).send({fotoPerfil: {}});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.log;
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModificarFotoPerfil = (req: Request, res: Response) => {
  try {
    let archivos = req.files;
    if (!req.body.usuarioId && archivos) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          if (usuario) {
            if (usuario.fotoPerfil.nombreImagen && usuario.fotoPerfil.idDrive) {
              GoogleDrive.conectar(
                8,
                usuario._id,
                '',
                '',
                '',
                archivos,
                '',
                usuario.fotoPerfil,
                (respuesta: any) => {
                  // console.log(respuesta); return false;
                  if (respuesta && respuesta.status == 200) {
                    usuario.fotoPerfil.nombreImagen = respuesta.nombreImagen;
                    usuario.fotoPerfil.tamanio = respuesta.tamanio;
                    usuario.fotoPerfil.tipo = respuesta.tipo;
                    usuario.fotoPerfil.idDrive = respuesta.idDrive;

                    usuario
                      .save()
                      .then((doc: any) => {
                        if (doc) {
                          res.status(200).send({message: 'Foto de perfil actualizada'});
                        } else {
                          res.status(500).send({
                            message: 'Error al intentar actualizar la foto de perfil del usuario',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(respuesta.status).send({message: respuesta.statusText});
                  }
                }
              );
            } else {
              res.status(400).send({message: 'El usuario no posee foto de perfil'});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
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

exports.EliminarFotoPerfil = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          if (usuario) {
            if (usuario.fotoPerfil.nombreImagen && usuario.fotoPerfil.idDrive) {
              GoogleDrive.conectar(
                9,
                usuario._id,
                '',
                '',
                '',
                '',
                '',
                usuario.fotoPerfil,
                (respuesta: any) => {
                  if (respuesta && respuesta.status == 200) {
                    usuario.fotoPerfil.nombreImagen = '';
                    usuario.fotoPerfil.tamanio = 0;
                    usuario.fotoPerfil.tipo = '';
                    usuario.fotoPerfil.idDrive = '';
                    usuario.fotoPerfil.linkDeDescarga = '';
                    usuario
                      .save()
                      .then((doc: any) => {
                        if (doc) {
                          res.status(200).send({
                            message: 'Foto de perfil eliminada',
                            value: usuario.fotoPerfil,
                          });
                        } else {
                          res.status(500).send({
                            message: 'Error al intentar eliminar la foto de perfil del usuario',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(respuesta.status).send({message: respuesta.statusText});
                  }
                }
              );
            } else {
              res.status(400).send({message: 'El usuario no posee foto de perfil'});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
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

exports.CargarDocumentacion = (req: Request, res: Response) => {
  try {
    let archivos = req.files;
    let tipoDoc = req.body.tipoDocumento;

    if (!req.body.usuarioId && !archivos) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          if (usuario) {
            if (archivos) {
              GoogleDrive.conectar(
                10,
                usuario._id,
                '',
                '',
                '',
                archivos,
                '',
                tipoDoc,
                (respuesta: any) => {
                  if (respuesta && respuesta.status == 200) {
                    switch (tipoDoc) {
                      case '1':
                        usuario.documentacionAdjunta.docAfip.nombre = respuesta.archivo[0].name;
                        usuario.documentacionAdjunta.docAfip.usuario = req.body.usuarioId;
                        usuario.documentacionAdjunta.docAfip.idDrive = respuesta.archivo[0].id;
                        usuario.documentacionAdjunta.docAfip.tipoDocumento = 1;
                        usuario.documentacionAdjunta.docAfip.tipo = respuesta.archivo[0].mimeType;
                        usuario.documentacionAdjunta.docAfip.tamanio = respuesta.archivo[0].size;
                        usuario.documentacionAdjunta.docAfip.linkDeDescarga =
                          respuesta.archivo[0].webContentLink;
                        usuario.documentacionAdjunta.docAfip.linkDeVistaWeb =
                          respuesta.archivo[0].webViewLink;
                        break;
                      case '2':
                        usuario.documentacionAdjunta.docRentas.nombre = respuesta.archivo[0].name;
                        usuario.documentacionAdjunta.docRentas.usuario = req.body.usuarioId;
                        usuario.documentacionAdjunta.docRentas.idDrive = respuesta.archivo[0].id;
                        usuario.documentacionAdjunta.docRentas.tipoDocumento = 2;
                        usuario.documentacionAdjunta.docRentas.tipo = respuesta.archivo[0].mimeType;
                        usuario.documentacionAdjunta.docRentas.tamanio = respuesta.archivo[0].size;
                        usuario.documentacionAdjunta.docRentas.linkDeDescarga =
                          respuesta.archivo[0].webContentLink;
                        usuario.documentacionAdjunta.docRentas.linkDeVistaWeb =
                          respuesta.archivo[0].webViewLink;
                        break;
                      case '3':
                        usuario.documentacionAdjunta.docProveedorEstado.nombre =
                          respuesta.archivo[0].name;
                        usuario.documentacionAdjunta.docProveedorEstado.usuario =
                          req.body.usuarioId;
                        usuario.documentacionAdjunta.docProveedorEstado.idDrive =
                          respuesta.archivo[0].id;
                        usuario.documentacionAdjunta.docProveedorEstado.tipoDocumento = 3;
                        usuario.documentacionAdjunta.docProveedorEstado.tipo =
                          respuesta.archivo[0].mimeType;
                        usuario.documentacionAdjunta.docProveedorEstado.tamanio =
                          respuesta.archivo[0].size;
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeDescarga =
                          respuesta.archivo[0].webContentLink;
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeVistaWeb =
                          respuesta.archivo[0].webViewLink;
                        break;
                      case '4':
                        usuario.documentacionAdjunta.docConstanciaPublicacion.nombre =
                          respuesta.archivo[0].name;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.usuario =
                          req.body.usuarioId;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive =
                          respuesta.archivo[0].id;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipoDocumento = 4;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipo =
                          respuesta.archivo[0].mimeType;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tamanio =
                          respuesta.archivo[0].size;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeDescarga =
                          respuesta.archivo[0].webContentLink;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeVistaWeb =
                          respuesta.archivo[0].webViewLink;
                        break;
                      default:
                        console.log('Error tipoDocumento invalido');
                        res.status(400).send({
                          message: 'El tipo de documento ingresado no es válido',
                        });
                        break;
                    }

                    usuario
                      .save()
                      .then((usuarioActualizado: any) => {
                        if (usuarioActualizado) {
                          res.status(200).send({
                            message: 'Documentación cargada',
                            value: usuarioActualizado.documentacionAdjunta,
                          });
                        } else {
                          console.log('Error en la bd al cargar');
                          res.status(500).send({
                            message: 'Error al cargar la documentación del usuario',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(respuesta.status).send({message: respuesta.statusText});
                  }
                }
              );
            } else {
              res.status(400).send({message: 'No se ingresó documentación para cargar'});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
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

exports.ObtenerDocumentacion = (req: Request, res: Response) => {
  try {
    if (!req.body.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          // console.log(usuario);
          if (usuario) {
            GoogleDrive.conectar(11, usuario._id, '', '', '', '', '', '', (respuesta: any) => {
              if (respuesta && respuesta.archivos.length) {
                //TODO Trasladar a model
                var respuestaFinal = {
                  documentacionAdjunta: {
                    docAfip: {
                      nombre: '',
                      usuario: '',
                      idDrive: '',
                      tipoDocumento: 0,
                      tipo: '',
                      tamanio: '',
                      linkDeDescarga: '',
                      linkDeVistaWeb: '',
                    },
                    docRentas: {
                      nombre: '',
                      usuario: '',
                      idDrive: '',
                      tipoDocumento: 0,
                      tipo: '',
                      tamanio: '',
                      linkDeDescarga: '',
                      linkDeVistaWeb: '',
                    },
                    docProveedorEstado: {
                      nombre: '',
                      usuario: '',
                      idDrive: '',
                      tipoDocumento: 0,
                      tipo: 0,
                      tamanio: '',
                      linkDeDescarga: '',
                      linkDeVistaWeb: '',
                    },
                    docConstanciaPublicacion: {
                      nombre: '',
                      usuario: '',
                      idDrive: '',
                      tipoDocumento: 0,
                      tipo: '',
                      tamanio: '',
                      linkDeDescarga: '',
                      linkDeVistaWeb: '',
                    },
                  },
                };
                for (let i = 0; i < respuesta.archivos.length; i++) {
                  if (respuesta.archivos[i].properties) {
                    switch (respuesta.archivos[i].properties.tipoDocumento) {
                      case '1':
                        respuestaFinal.documentacionAdjunta.docAfip.nombre =
                          respuesta.archivos[i].name;
                        respuestaFinal.documentacionAdjunta.docAfip.usuario = req.body.usuarioId;
                        respuestaFinal.documentacionAdjunta.docAfip.idDrive =
                          respuesta.archivos[i].id;
                        respuestaFinal.documentacionAdjunta.docAfip.tipoDocumento = 1;
                        respuestaFinal.documentacionAdjunta.docAfip.tipo =
                          respuesta.archivos[i].mimeType;
                        respuestaFinal.documentacionAdjunta.docAfip.tamanio =
                          respuesta.archivos[i].size;
                        respuestaFinal.documentacionAdjunta.docAfip.linkDeDescarga =
                          respuesta.archivos[i].webContentLink;
                        respuestaFinal.documentacionAdjunta.docAfip.linkDeVistaWeb =
                          respuesta.archivos[i].webViewLink;
                        break;
                      case '2':
                        respuestaFinal.documentacionAdjunta.docRentas.nombre =
                          respuesta.archivos[i].name;
                        respuestaFinal.documentacionAdjunta.docRentas.usuario = req.body.usuarioId;
                        respuestaFinal.documentacionAdjunta.docRentas.idDrive =
                          respuesta.archivos[i].id;
                        respuestaFinal.documentacionAdjunta.docRentas.tipoDocumento = 2;
                        respuestaFinal.documentacionAdjunta.docRentas.tipo =
                          respuesta.archivos[i].mimeType;
                        respuestaFinal.documentacionAdjunta.docRentas.tamanio =
                          respuesta.archivos[i].size;
                        respuestaFinal.documentacionAdjunta.docRentas.linkDeDescarga =
                          respuesta.archivos[i].webContentLink;
                        respuestaFinal.documentacionAdjunta.docRentas.linkDeVistaWeb =
                          respuesta.archivos[i].webViewLink;
                        break;
                      case '3':
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.nombre =
                          respuesta.archivos[i].name;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.usuario =
                          req.body.usuarioId;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.idDrive =
                          respuesta.archivos[i].id;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.tipoDocumento = 3;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.tipo =
                          respuesta.archivos[i].mimeType;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.tamanio =
                          respuesta.archivos[i].size;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.linkDeDescarga =
                          respuesta.archivos[i].webContentLink;
                        respuestaFinal.documentacionAdjunta.docProveedorEstado.linkDeVistaWeb =
                          respuesta.archivos[i].webViewLink;
                        break;
                      case '4':
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.nombre =
                          respuesta.archivos[i].name;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.usuario =
                          req.body.usuarioId;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.idDrive =
                          respuesta.archivos[i].id;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.tipoDocumento = 4;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.tipo =
                          respuesta.archivos[i].mimeType;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.tamanio =
                          respuesta.archivos[i].size;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.linkDeDescarga =
                          respuesta.archivos[i].webContentLink;
                        respuestaFinal.documentacionAdjunta.docConstanciaPublicacion.linkDeVistaWeb =
                          respuesta.archivos[i].webViewLink;
                        break;
                      default:
                        console.log('Error tipoDocumento invalido');
                        break;
                    }
                  }
                }
                res.status(200).send({
                  message: 'Archivos encontrados',
                  value: respuestaFinal,
                });
              } else {
                console.log(respuesta);
                //TODO: Controlar que si no tiene documentos, deberia responder con un status 200 y no 400
                res.status(200).send({message: 'El usuario no posee documentación'});
              }
            });
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
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

export const ObtenerDocumentacionDelUsuario = (usuarioId: string) => {
  const pr = new Promise((resolve: any, reject: any) => {
    UsuarioModel.findById(usuarioId, proyeccion)
      .then(async (usuario: any) => {
        if (usuario) {
          await GoogleDrive.conectar(
            11,
            usuario._id,
            '',
            '',
            '',
            '',
            '',
            '',
            async (respuesta: any) => {
              if (respuesta && respuesta.status === 200) {
                resolve(respuesta.archivo);
              } else {
                resolve({});
              }
            }
          );
        } else {
          resolve({});
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });

  return pr;
};

exports.ModificarDocumentacion = (req: Request, res: Response) => {
  try {
    let archivos = req.files;
    let tipoDoc: string = req.body.tipoDocumento;
    let idDocModificar: string = '';

    if (!req.body.usuarioId && !archivos) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          if (usuario) {
            switch (tipoDoc) {
              case '1':
                if (usuario.documentacionAdjunta.docAfip.idDrive) {
                  idDocModificar = usuario.documentacionAdjunta.docAfip.idDrive;
                }
                break;
              case '2':
                if (usuario.documentacionAdjunta.docRentas.idDrive) {
                  idDocModificar = usuario.documentacionAdjunta.docRentas.idDrive;
                }
                break;
              case '3':
                if (usuario.documentacionAdjunta.docProveedorEstado.idDrive) {
                  idDocModificar = usuario.documentacionAdjunta.docProveedorEstado.idDrive;
                }
                break;
              case '4':
                if (usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive) {
                  idDocModificar = usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive;
                }
                break;

              default:
                res.status(400).send({message: 'Tipo de documento inválido'});
                break;
            }
            if (idDocModificar != '') {
              GoogleDrive.conectar(
                12,
                usuario._id,
                '',
                tipoDoc,
                '',
                archivos,
                '',
                idDocModificar,
                (respuesta: any) => {
                  if (respuesta && respuesta.nuevoArchivo.length) {
                    switch (tipoDoc) {
                      case '1':
                        usuario.documentacionAdjunta.docAfip.nombre =
                          respuesta.nuevoArchivo[0].name;
                        usuario.documentacionAdjunta.docAfip.usuario = req.body.usuarioId;
                        usuario.documentacionAdjunta.docAfip.idDrive = respuesta.nuevoArchivo[0].id;
                        usuario.documentacionAdjunta.docAfip.tipoDocumento = 1;
                        usuario.documentacionAdjunta.docAfip.tipo =
                          respuesta.nuevoArchivo[0].mimeType;
                        usuario.documentacionAdjunta.docAfip.tamanio =
                          respuesta.nuevoArchivo[0].size;
                        usuario.documentacionAdjunta.docAfip.linkDeDescarga =
                          respuesta.nuevoArchivo[0].webContentLink;
                        usuario.documentacionAdjunta.docAfip.linkDeVistaWeb =
                          respuesta.nuevoArchivo[0].webViewLink;
                        break;
                      case '2':
                        usuario.documentacionAdjunta.docRentas.nombre =
                          respuesta.nuevoArchivo[0].name;
                        usuario.documentacionAdjunta.docRentas.usuario = req.body.usuarioId;
                        usuario.documentacionAdjunta.docRentas.idDrive =
                          respuesta.nuevoArchivo[0].id;
                        usuario.documentacionAdjunta.docRentas.tipoDocumento = 2;
                        usuario.documentacionAdjunta.docRentas.tipo =
                          respuesta.nuevoArchivo[0].mimeType;
                        usuario.documentacionAdjunta.docRentas.tamanio =
                          respuesta.nuevoArchivo[0].size;
                        usuario.documentacionAdjunta.docRentas.linkDeDescarga =
                          respuesta.nuevoArchivo[0].webContentLink;
                        usuario.documentacionAdjunta.docRentas.linkDeVistaWeb =
                          respuesta.nuevoArchivo[0].webViewLink;
                        break;
                      case '3':
                        usuario.documentacionAdjunta.docProveedorEstado.nombre =
                          respuesta.nuevoArchivo[0].name;
                        usuario.documentacionAdjunta.docProveedorEstado.usuario =
                          req.body.usuarioId;
                        usuario.documentacionAdjunta.docProveedorEstado.idDrive =
                          respuesta.nuevoArchivo[0].id;
                        usuario.documentacionAdjunta.docProveedorEstado.tipoDocumento = 3;
                        usuario.documentacionAdjunta.docProveedorEstado.tipo =
                          respuesta.nuevoArchivo[0].mimeType;
                        usuario.documentacionAdjunta.docProveedorEstado.tamanio =
                          respuesta.nuevoArchivo[0].size;
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeDescarga =
                          respuesta.nuevoArchivo[0].webContentLink;
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeVistaWeb =
                          respuesta.nuevoArchivo[0].webViewLink;
                        break;
                      case '4':
                        usuario.documentacionAdjunta.docConstanciaPublicacion.nombre =
                          respuesta.nuevoArchivo[0].name;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.usuario =
                          req.body.usuarioId;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive =
                          respuesta.nuevoArchivo[0].id;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipoDocumento = 4;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipo =
                          respuesta.nuevoArchivo[0].mimeType;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tamanio =
                          respuesta.nuevoArchivo[0].size;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeDescarga =
                          respuesta.nuevoArchivo[0].webContentLink;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeVistaWeb =
                          respuesta.nuevoArchivo[0].webViewLink;
                        break;
                      default:
                        res.status(400).send({
                          message: 'El tipo de documento ingresado no es válido',
                        });
                        break;
                    }

                    usuario
                      .save()
                      .then((usuarioActualizado: any) => {
                        if (usuarioActualizado) {
                          res.status(200).send({
                            message: 'Documentación actualizada',
                            value: usuarioActualizado.documentacionAdjunta,
                          });
                        } else {
                          res.status(500).send({
                            message: 'Error al actualizar la documentación del usuario',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(500).send({message: 'error en la api de google'});
                  }
                }
              );
            } else {
              res.status(200).send({message: 'Tipo de documento inválido'});
            }
          } else {
            res.status(200).send({message: 'Usuario no encontrado'});
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

exports.EliminarDocumentacion = (req: Request, res: Response) => {
  try {
    let tipoDoc: string = req.body.tipoDocumento.toString();
    let idDocumentoEliminar: string = '';
    if (!req.body.usuarioId && !req.body.tipoDocumento) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(req.body.usuarioId, proyeccion)
        .then((usuario: any) => {
          if (usuario) {
            switch (tipoDoc) {
              case '1':
                if (usuario.documentacionAdjunta.docAfip.idDrive) {
                  idDocumentoEliminar = usuario.documentacionAdjunta.docAfip.idDrive;
                }
                break;
              case '2':
                if (usuario.documentacionAdjunta.docRentas.idDrive) {
                  idDocumentoEliminar = usuario.documentacionAdjunta.docRentas.idDrive;
                }
                break;
              case '3':
                if (usuario.documentacionAdjunta.docProveedorEstado.idDrive) {
                  idDocumentoEliminar = usuario.documentacionAdjunta.docProveedorEstado.idDrive;
                }
                break;
              case '4':
                if (usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive) {
                  idDocumentoEliminar =
                    usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive;
                }
                break;

              default:
                res.status(400).send({
                  message: 'Tipo de documento no válido o el mismo no existe',
                });
                break;
            }

            if (idDocumentoEliminar != '') {
              GoogleDrive.conectar(
                13,
                usuario._id,
                '',
                '',
                '',
                '',
                '',
                idDocumentoEliminar,
                (respuesta: any) => {
                  if (respuesta && respuesta.cantArchivosEliminados > 0) {
                    switch (tipoDoc) {
                      case '1':
                        usuario.documentacionAdjunta.docAfip.nombre = '';
                        usuario.documentacionAdjunta.docAfip.usuario = '';
                        usuario.documentacionAdjunta.docAfip.idDrive = '';
                        usuario.documentacionAdjunta.docAfip.tipoDocumento = 0;
                        usuario.documentacionAdjunta.docAfip.tipo = '';
                        usuario.documentacionAdjunta.docAfip.tamanio = 0;
                        usuario.documentacionAdjunta.docAfip.linkDeDescarga = '';
                        usuario.documentacionAdjunta.docAfip.linkDeVistaWeb = '';
                        break;
                      case '2':
                        usuario.documentacionAdjunta.docRentas.nombre = '';
                        usuario.documentacionAdjunta.docRentas.usuario = '';
                        usuario.documentacionAdjunta.docRentas.idDrive = '';
                        usuario.documentacionAdjunta.docRentas.tipoDocumento = 0;
                        usuario.documentacionAdjunta.docRentas.tipo = '';
                        usuario.documentacionAdjunta.docRentas.tamanio = 0;
                        usuario.documentacionAdjunta.docRentas.linkDeDescarga = '';
                        usuario.documentacionAdjunta.docRentas.linkDeVistaWeb = '';
                        break;
                      case '3':
                        usuario.documentacionAdjunta.docProveedorEstado.nombre = '';
                        usuario.documentacionAdjunta.docProveedorEstado.usuario = '';
                        usuario.documentacionAdjunta.docProveedorEstado.idDrive = '';
                        usuario.documentacionAdjunta.docProveedorEstado.tipoDocumento = 0;
                        usuario.documentacionAdjunta.docProveedorEstado.tipo = '';
                        usuario.documentacionAdjunta.docProveedorEstado.tamanio = 0;
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeDescarga = '';
                        usuario.documentacionAdjunta.docProveedorEstado.linkDeVistaWeb = '';
                        break;
                      case '4':
                        usuario.documentacionAdjunta.docConstanciaPublicacion.nombre = '';
                        usuario.documentacionAdjunta.docConstanciaPublicacion.usuario = '';
                        usuario.documentacionAdjunta.docConstanciaPublicacion.idDrive = '';
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipoDocumento = 0;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tipo = '';
                        usuario.documentacionAdjunta.docConstanciaPublicacion.tamanio = 0;
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeDescarga = '';
                        usuario.documentacionAdjunta.docConstanciaPublicacion.linkDeVistaWeb = '';
                        break;
                      default:
                        res.status(400).send({
                          message: 'El tipo de documento ingresado no es válido',
                        });
                        break;
                    }

                    // TODO: probar mañana
                    usuario
                      .save()
                      .then((usuarioActualizado: any) => {
                        if (usuarioActualizado) {
                          res.status(200).send({
                            message: 'Documento eliminado',
                            value: usuarioActualizado.documentacionAdjunta,
                          });
                        } else {
                          res.status(500).send({
                            message: 'Error al intentar eliminar el documento',
                          });
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        res.status(500).send({message: 'Error interno del servidor'});
                      });
                  } else {
                    res.status(respuesta.status).send({message: respuesta.statusText});
                  }
                }
              );
            } else {
              res.status(400).send({message: 'Tipo de documento inválido'});
            }
          } else {
            res.status(404).send({message: 'Usuario no encontrado'});
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

exports.ConfigurarNotificaciones = (req: Request, res: Response) => {
  try {
    let datosBody = req.body;
    if (!datosBody.usuarioId) {
      res.status(400).send({message: 'No se ingresaron datos'});
    } else {
      UsuarioModel.findById(datosBody.usuarioId)
        .then((usuario: any) => {
          if (usuario) {
            // Los valores que vienen desde el front deben ser true o false
            usuario.quieroRecibirNotificaciones = datosBody.quieroRecibirNotificaciones;
            usuario.enviarNotificacionViaMail.enviarViaMail =
              datosBody.enviarNotificacionViaMail.enviarViaMail;
            usuario.enviarNotificacionViaMail.seCreaUnProyecto =
              datosBody.enviarNotificacionViaMail.seCreaUnProyecto;

            usuario.enviarNotificacionViaMail.mencionEnComentario =
              datosBody.enviarNotificacionViaMail.mencionEnComentario;
            usuario.enviarNotificacionViaMail.creadorDelProyecto =
              datosBody.enviarNotificacionViaMail.creadorDelProyecto;
            if (usuario.rolId === Rol.Administrador) {
              usuario.enviarNotificacionViaMail.piezaTerminada =
                datosBody.enviarNotificacionViaMail.piezaTerminada;
              usuario.enviarNotificacionViaMail.usuarioMediosDescargaAdjunto =
                datosBody.enviarNotificacionViaMail.usuarioMediosDescargaAdjunto;
            }
            usuario.enviarNotificacionViaMail.recordatorioDeProyecto =
              datosBody.enviarNotificacionViaMail.recordatorioDeProyecto;
            usuario.enviarNotificacionViaMail.emailPreferidoParaNotificaciones =
              datosBody.enviarNotificacionViaMail.emailPreferidoParaNotificaciones;

            usuario.enviarNotificacionViaNavegador.enviarViaNavegador =
              datosBody.enviarNotificacionViaNavegador.enviarViaNavegador;
            usuario.enviarNotificacionViaNavegador.seCreaUnProyecto =
              datosBody.enviarNotificacionViaNavegador.seCreaUnProyecto;
            usuario.enviarNotificacionViaNavegador.piezaTerminada =
              datosBody.enviarNotificacionViaNavegador.piezaTerminada;
            usuario.enviarNotificacionViaNavegador.mencionEnComentario =
              datosBody.enviarNotificacionViaNavegador.mencionEnComentario;
            usuario.enviarNotificacionViaNavegador.creadorDelProyecto =
              datosBody.enviarNotificacionViaNavegador.creadorDelProyecto;
            usuario.enviarNotificacionViaNavegador.usuarioMediosDescargaAdjunto =
              datosBody.enviarNotificacionViaNavegador.usuarioMediosDescargaAdjunto;
            usuario.enviarNotificacionViaNavegador.recordatorioDeProyecto =
              datosBody.enviarNotificacionViaNavegador.recordatorioDeProyecto;

            usuario.pausarNotificaciones.pausar = datosBody.pausarNotificaciones.pausar;
            usuario.pausarNotificaciones.cantidadTiempoPausa =
              datosBody.pausarNotificaciones.cantidadTiempoPausa;

            usuario.noQuieroRecibirNotificaciones.desdeHs =
              datosBody.noQuieroRecibirNotificaciones.desdeHs;
            usuario.noQuieroRecibirNotificaciones.hastaHs =
              datosBody.noQuieroRecibirNotificaciones.hastaHs;
            let arrayDeDias: Array<string>;
            if (datosBody.noQuieroRecibirNotificaciones.dias.length) {
              arrayDeDias = usuario.noQuieroRecibirNotificaciones.dias.concat(
                datosBody.noQuieroRecibirNotificaciones.dias
              );
            } else {
              arrayDeDias = usuario.noQuieroRecibirNotificaciones.dias;
            }

            usuario.noQuieroRecibirNotificaciones.dias = arrayDeDias;

            usuario
              .save()
              .then((usuarioGuardado: IUsuario) => {
                if (usuarioGuardado) {
                  res.status(200).send({
                    message: 'Usuario actualizado',
                    value: usuarioGuardado,
                  });
                } else {
                  res.status(400).send({
                    message: 'Ocurrió un error al intentar actualizar los datos del usuario',
                  });
                }
              })
              .catch((error: any) => {
                console.log(error);
                res.status(500).send({message: 'Error interno del servidor'});
              });
          } else {
            res.status(200).send({message: 'Usuario no encontrado'});
          }
        })
        .catch((error: any) => {
          console.log(error);
          res.status(500).send({message: 'Error interno del servidor'});
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ActualizarToken = (req: Request, res: Response) => {
  try {
    if (!req.body._id) {
      res.status(400).send({message: 'Falta id'});
    } else {
      UsuarioModel.findById(req.body._id)
        .then((doc: any) => {
          if (doc) {
            if (doc.isActivado) {
              var JWtoken = CodfCla.GenerateToken(JSON.parse(JSON.stringify(doc)));
              res.status(200).send(JWtoken);
            } else {
              res.status(400).send({message: 'Usuario no autorizado'});
            }
          } else {
            res.status(401).send({message: 'Usuario no encontrado'});
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

const ModelarDocumentacion = () => {
  return {
    docAfip: {
      nombre: '',
      usuario: '',
      tipoDocumento: 0,
      idDrive: '',
      tipo: '',
      tamanio: 0,
      linkDeDescarga: '',
      linkDeVistaWeb: '',
    },
    docRentas: {
      nombre: '',
      usuario: '',
      tipoDocumento: 0,
      idDrive: '',
      tipo: '',
      tamanio: 0,
      linkDeDescarga: '',
      linkDeVistaWeb: '',
    },
    docProveedorEstado: {
      nombre: '',
      usuario: '',
      tipoDocumento: 0,
      idDrive: '',
      tipo: '',
      tamanio: 0,
      linkDeDescarga: '',
      linkDeVistaWeb: '',
    },
    docConstanciaPublicacion: {
      nombre: '',
      usuario: '',
      tipoDocumento: 0,
      idDrive: '',
      tipo: '',
      tamanio: 0,
      linkDeDescarga: '',
      linkDeVistaWeb: '',
    },
  };
};
