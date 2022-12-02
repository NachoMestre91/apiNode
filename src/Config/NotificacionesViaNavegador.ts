import {Console} from 'console';
import {Request, Response} from 'express';
// import express from 'express';
// const app = express();
import {SimpleConsoleLogger} from 'typeorm';
import {listarAdjuntosPorIdProyecto} from '../Adjuntos_Proyectos/adjuntosProyectos_Controller';
import {
  traerInformacionPiezaPorId,
  traerPiezaPorId,
  traerPiezasAsignadasPorIdProyecto,
  traerPiezasDelProyecto,
  traerPiezasPorIdProyecto,
} from '../Piezas/Piezas_Controller';
import {
  calcularFechaProyectoVencido,
  calcularFechaVencimientoProyecto,
  ObtenerProyectos,
  traerProyectoPorId,
} from '../Proyectos/Proyecto.Controller';
import {
  traerUsuarioPorId,
  traerUsuariosAdministradores,
  traerUsuariosAdministradoresProductoresYPrensa,
  traerUsuariosAdministradoresYPrensa,
  traerUsuariosPrensa,
} from '../Usuario/Usuario_Controller';
import {Estado, Rol} from './enumeradores';
import {
  filtrarDatosParaEnviarMailAgregandoModificandoProyecto,
  notificarProyectoProximoAVencer,
  notificarProyectoVencido,
} from './NotificacionesPorMail';

export const filtrarDatosParaProyectoProximoAVencer = async (datosDeProyecto: any, socket: any) => {
  try {
    var datosARetornar = {
      proyectoId: '',
      fechaVencimientoFormateada: '',
      mensaje: '',
      nombresCategoriasProyecto: <any>[],
      notificacionDirigidaA: <any>[],
      nombreProyecto: '',
      usuarioCreadorDelProyecto: '',
      nombreUsuario: '',
      nombreUsuarioCompleto: '',
      tipoOperacion: 'proyectoProximoAVencer',
      usuarioEtiquetado: '',
      fechaNotificacion: new Date(),
    };

    if (datosDeProyecto) {
      datosARetornar.mensaje = `El proyecto ${datosDeProyecto.nombreProyecto} vence el día ${datosDeProyecto.fechaVencimientoProxima}.`;
      datosARetornar.proyectoId = datosDeProyecto.proyectoId;

      if (datosDeProyecto.correosDeUsuarios.length) {
        for await (const correoDeUsuario of datosDeProyecto.correosDeUsuarios) {
          datosARetornar.notificacionDirigidaA.push(correoDeUsuario);
        }
      }
    }

    if (datosDeProyecto.proyectoProximoAVencer)
      socket.emit('datosDeProyectoProximoAVencer', datosARetornar);
  } catch (error) {
    console.log(error);
    return error;
    // res.status(500).send({message: 'Error interno del servidor'});
  }
};

export const filtrarDatosParaProyectoVencido = async (datosDeProyecto: any, socket: any) => {
  // console.log('Datos de proyecto - En filtrarDatosParaProyectoVencido');
  // console.log(datosDeProyecto);
  try {
    var datosARetornar = {
      proyectoId: '',
      fechaVencimientoFormateada: '',
      mensaje: '',
      nombresCategoriasProyecto: <any>[],
      notificacionDirigidaA: <any>[],
      nombreProyecto: '',
      usuarioCreadorDelProyecto: '',
      nombreUsuario: '',
      nombreUsuarioCompleto: '',
      tipoOperacion: 'proyectoVencido',
      usuarioEtiquetado: '',
      caracteristicasModificadas: '',
      fechaNotificacion: new Date(),
    };

    if (datosDeProyecto) {
      datosARetornar.mensaje = `El proyecto ${datosDeProyecto.nombreProyecto} venció el día ${datosDeProyecto.fechaVencimientoProxima}.`;
      datosARetornar.proyectoId = datosDeProyecto.proyectoId;

      if (datosDeProyecto.correosDeUsuarios.length) {
        for await (const correoDeUsuario of datosDeProyecto.correosDeUsuarios) {
          datosARetornar.notificacionDirigidaA.push(correoDeUsuario);
        }
      }
    }

    if (datosDeProyecto.proyectoVencido) {
      socket.emit('datosDeProyectoVencido', datosARetornar);
    }
  } catch (error) {
    console.log(error);
    return error;
    // res.status(500).send({message: 'Error interno del servidor'});
  }
};

export const filtrarDatosParaCreacionDeProyecto = async (
  proyecto: any,
  proyectoAnterior: any,
  piezasBodyNuevoProyecto: any
) => {
  // TODO DEBUG de estado anterior y posterior de proyecto al guardar
  // console.log(`Proyecto anterior: ${proyectoAnterior.cantidadDeAdjuntosDelBody}`);
  // console.log('********************************************************************************');
  // console.log(`Proyecto POSTERIOR: ${proyecto.cantidadDeAdjuntosDelBody}`);
  // console.log('********************************************************************************');

  var datosARetornar = {
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    tipoOperacion: 'editarProyecto',
    usuarioEtiquetado: '',
    caracteristicasModificadas: '',
  };

  var categoriasParaMostrar: string = '';
  var categoriasDeProyecto: any = [];
  var seEdito: boolean = false;
  var cambiaPrioridad: boolean = false;
  var cambiaNombreProyecto: boolean = false;
  var cambiaDescripcionProyecto: boolean = false;
  var cambiaFechaDeadLine: boolean = false;
  var cambiaCategorias: boolean = false;
  var cambiaDescripcionPieza: boolean = false;
  var masAdjuntos: boolean = false;
  var menosAdjuntos: boolean = false;
  var caracteristicasModificadas: string = '';
  var cantidadDePiezasModificadas: number = 0;

  if (proyectoAnterior._doc.prioridadId !== proyecto.prioridadId) {
    cambiaPrioridad = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', la prioridad del proyecto';
    } else {
      caracteristicasModificadas = 'la prioridad del proyecto';
    }

    seEdito = true;
  }

  if (proyectoAnterior._doc.nombreProyecto !== proyecto.nombreProyecto) {
    cambiaNombreProyecto = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', el nombre del proyecto';
    } else {
      caracteristicasModificadas = 'el nombre del proyecto';
    }

    seEdito = true;
  }

  if (proyectoAnterior._doc.descripcion !== proyecto.descripcion) {
    cambiaDescripcionProyecto = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', la descripción del proyecto';
    } else {
      caracteristicasModificadas = 'la descripción del proyecto';
    }

    seEdito = true;
  }

  var date1 = new Date(proyectoAnterior._doc.fechaDeadLine);
  var date2 = new Date(proyecto.fechaDeadLine);

  if (!proyectoAnterior.fechaDeadLine && !proyecto.fechaDeadLine) {
  } else {
    if (proyecto.fechaDeadLine && !proyectoAnterior.fechaDeadLine) {
      if (caracteristicasModificadas) {
        caracteristicasModificadas += ', la fecha de vencimiento del proyecto';
      } else {
        caracteristicasModificadas = 'la fecha de vencimiento del proyecto';
      }
    }
    seEdito = true;
  }

  if (date1 > date2 || date1 < date2) {
    cambiaFechaDeadLine = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', la fecha de vencimiento del proyecto';
    } else {
      caracteristicasModificadas = 'la fecha de vencimiento del proyecto';
    }

    seEdito = true;
  }

  if (proyectoAnterior._doc.categorias.length != proyecto.categorias.length) {
    cambiaCategorias = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', la/las categoría/s del proyecto';
    } else {
      caracteristicasModificadas = 'la/las categoría/s del proyecto';
    }

    seEdito = true;
  }

  const adjuntosActualesDeProyecto = await listarAdjuntosPorIdProyecto(proyecto._id)
    .then((adjuntos: any) => {
      return adjuntos;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  // TODO DEBUG de adicion de adjuntos
  // console.log(`Adjuntos Actuales: ${adjuntosActualesDeProyecto.length}`);
  // console.log(
  //   `Adjuntos Antes de insertar: ${proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar}`
  // );
  // console.log(
  //   `Adjuntos Despues de insertar: ${proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar}`
  // );

  // TODO DEBUG de eliminacion de adjuntos
  // console.log(`Adjuntos Actuales: ${adjuntosActualesDeProyecto.length}`);
  // console.log(
  //   `Adjuntos Antes de ELIMINAR: ${proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar}`
  // );
  // console.log(
  //   `Adjuntos Despues de ELIMINAR: ${proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar}`
  // );

  if (proyectoAnterior.cantidadDeAdjuntosDelBody !== proyecto.cantidadDeAdjuntosDelBody) {
    if (
      proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar &&
      proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar
    ) {
      if (
        proyecto.progresoAdjuntos.totalAdjuntosAntesDeEliminar >
        proyecto.progresoAdjuntos.totalAdjuntosDespuesDeEliminar
      ) {
        menosAdjuntos = true;
        if (caracteristicasModificadas) {
          caracteristicasModificadas += ', la cantidad de adjuntos del proyecto (elimino)';
        } else {
          caracteristicasModificadas = 'la cantidad de adjuntos del proyecto (elimino)';
        }

        seEdito = true;
      }
    }
  } else {
  }

  if (proyectoAnterior.cantidadDeAdjuntosDelBody !== proyecto.cantidadDeAdjuntosDelBody) {
    if (
      proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar &&
      proyecto.progresoAdjuntos.totalAdjuntosDespuesDeInsertar
    ) {
      if (
        proyecto.progresoAdjuntos.totalAdjuntosAntesDeInsertar <
        proyecto.progresoAdjuntos.totalAdjuntosDespuesDeInsertar
      ) {
        masAdjuntos = true;
        if (caracteristicasModificadas) {
          caracteristicasModificadas += ', la cantidad de adjuntos del proyecto (adiciono)';
        } else {
          caracteristicasModificadas = 'la cantidad de adjuntos del proyecto (adiciono)';
        }

        seEdito = true;
      }
    }
  } else {
  }

  datosARetornar.caracteristicasModificadas = caracteristicasModificadas;

  let fecha = new Date(proyecto.fechaDeadLine);
  datosARetornar.fechaVencimientoFormateada =
    fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();

  datosARetornar.nombreProyecto = proyecto.nombreProyecto;
  datosARetornar.usuarioCreadorDelProyecto = proyecto.usuarioId.nombre.concat(
    ' ',
    proyecto.usuarioId.apellido
  );

  if (proyecto.categorias.length) {
    for await (const categoria of proyecto.categorias) {
      categoriasDeProyecto.push(categoria._id);
      datosARetornar.nombresCategoriasProyecto.push(categoria.nombreCategoria);
      if (categoriasParaMostrar == '') {
        categoriasParaMostrar = categoria.nombreCategoria;
      } else {
        categoriasParaMostrar = categoriasParaMostrar.concat(', ', categoria.nombreCategoria);
      }
    }
  }

  const usuariosAdministradoresYPrensa = await traerUsuariosAdministradoresYPrensa()
    .then((usuarios: any) => {
      return usuarios;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuariosAdministradoresYPrensa.length) {
    for await (const usuario of usuariosAdministradoresYPrensa) {
      if (usuario.isActivado) {
        if (usuario.rolId === Rol.Prensa) {
          if (usuario.categorias.length) {
            if (
              usuario.categorias.some((ObjetoUsersCategorias: any) =>
                categoriasDeProyecto.some(
                  (ObjetoCategoriasDeProyecto: any) =>
                    JSON.stringify(ObjetoUsersCategorias) ===
                    JSON.stringify(ObjetoCategoriasDeProyecto)
                )
              )
            ) {
              datosARetornar.notificacionDirigidaA.push(usuario.email);
            }
          }
        } else {
          datosARetornar.notificacionDirigidaA.push(usuario.email);
        }
      }
    }
  } else {
  }

  const piezasDelProyecto = await traerPiezasPorIdProyecto(proyecto._id)
    .then((piezas: any) => {
      return piezas;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (piezasDelProyecto.length) {
    for await (const pieza of piezasDelProyecto) {
      if (proyecto.estadoId !== Estado.Borrador && Object.keys(pieza.asignadoId).length) {
        if (!datosARetornar.notificacionDirigidaA.includes(pieza.asignadoId.nombreUsuario)) {
          datosARetornar.notificacionDirigidaA.push(
            pieza.asignadoId.nombreUsuario ? pieza.asignadoId.nombreUsuario : pieza.asignadoId.email
          );
        }
      }
    }
  }

  if (proyecto.isCambiaDescripcionPieza) {
    seEdito = true;
    if (caracteristicasModificadas) {
      caracteristicasModificadas += ', la descripcion de una pieza';
    } else {
      caracteristicasModificadas = 'la descripcion de una pieza';
    }
  }

  if (caracteristicasModificadas) {
    datosARetornar.mensaje = `ha modificado ${caracteristicasModificadas} en el proyecto ${proyecto.nombreProyecto}`;
  }

  datosARetornar.caracteristicasModificadas = caracteristicasModificadas;
  return datosARetornar;
};

export const filtrarDatosParaRegistroDeUsuario = async (nuevoUsuario: any) => {
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    tipoOperacion: 'editarProyecto',
    usuarioEtiquetado: '',
  };

  const usuariosAdministradores = await traerUsuariosAdministradores()
    .then((usuarios: any) => {
      return usuarios;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuariosAdministradores.length) {
    for await (const user of usuariosAdministradores) {
      if (user.isActivado) {
        datosARetornar.notificacionDirigidaA.push(
          user.nombreUsuario ? user.nombreUsuario : user.email
        );
      }
    }
  } else {
  }

  datosARetornar.mensaje = `${nuevoUsuario.nombre.concat(
    ' ',
    nuevoUsuario.apellido
  )} ha registrado todos sus datos.`;
  datosARetornar.tipoOperacion = 'registroUsuario';
  datosARetornar.nombreUsuario = nuevoUsuario.email;

  return datosARetornar;
};

export const filtrarDatosParaPublicacionDePiezaMedios = async (piezaMedio: any) => {
  var nombreMedioAsignado: string = '';
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'publicarPiezaMedios',
    usuarioEtiquetado: '',
    piezaMedio: piezaMedio,
  };

  if (piezaMedio) {
    const usuarioPiezaMedios = await traerUsuarioPorId(piezaMedio.medioAsignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        return error;
      });

    if (usuarioPiezaMedios) {
      nombreMedioAsignado = usuarioPiezaMedios.nombre.concat(' ', usuarioPiezaMedios.apellido);
    }

    datosARetornar.mensaje = `${nombreMedioAsignado} publicó la pieza ${piezaMedio.descripcionPieza} del proyecto ${piezaMedio.nombrePiezaMedio}`;
    datosARetornar.nombreProyecto = piezaMedio.nombrePiezaMedio;
    datosARetornar.nombreUsuario = usuarioPiezaMedios.nombreUsuario
      ? usuarioPiezaMedios.nombreUsuario
      : usuarioPiezaMedios.email;
    datosARetornar.nombreUsuarioCompleto = nombreMedioAsignado;

    const usuariosAdministradores = await traerUsuariosAdministradores()
      .then((usuarios: any) => {
        return usuarios;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    if (usuariosAdministradores.length) {
      for await (const user of usuariosAdministradores) {
        if (user.nombreUsuario && user.isActivado) {
          datosARetornar.notificacionDirigidaA.push(user.nombreUsuario);
        } else {
          datosARetornar.notificacionDirigidaA.push(user.email);
        }
      }
    } else {
    }
  }

  return datosARetornar;
};

export const filtrarDatosParaDescargaDePiezaMedios = async (piezaMedio: any) => {
  var nombreMedioAsignado: string = '';
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'descargaPiezaMedio',
    usuarioEtiquetado: '',
    piezaMedio: piezaMedio,
  };

  if (piezaMedio) {
    const usuarioPiezaMedios = await traerUsuarioPorId(piezaMedio.medioAsignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        return error;
      });

    if (usuarioPiezaMedios) {
      nombreMedioAsignado = usuarioPiezaMedios.nombre.concat(' ', usuarioPiezaMedios.apellido);
    }

    datosARetornar.mensaje = `${nombreMedioAsignado} descargó la pieza ${piezaMedio.descripcionPieza} del proyecto ${piezaMedio.nombrePiezaMedio}`;
    datosARetornar.nombreProyecto = piezaMedio.nombrePiezaMedio;
    datosARetornar.nombreUsuario = usuarioPiezaMedios.nombreUsuario
      ? usuarioPiezaMedios.nombreUsuario
      : usuarioPiezaMedios.email;
    datosARetornar.nombreUsuarioCompleto = nombreMedioAsignado;

    const usuariosAdministradores = await traerUsuariosAdministradores()
      .then((usuarios: any) => {
        return usuarios;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    if (usuariosAdministradores.length) {
      for await (const user of usuariosAdministradores) {
        if (user.nombreUsuario && user.isActivado) {
          datosARetornar.notificacionDirigidaA.push(user.nombreUsuario);
        } else {
          datosARetornar.notificacionDirigidaA.push(user.email);
        }
      }
    } else {
    }
  }

  return datosARetornar;
};

export const filtrarDatosParaAsignacionDePiezaMedios = async (piezaMedio: any) => {
  var nombreMedioAsignado: string = '';
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'asignacionPiezaMedio',
    usuarioEtiquetado: '',
    piezaMedio: piezaMedio,
  };

  // console.log(piezaMedio);
  // return false;

  if (piezaMedio) {
    const usuarioPiezaMedios = await traerUsuarioPorId(piezaMedio.medioAsignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        return error;
      });

    if (usuarioPiezaMedios) {
      datosARetornar.notificacionDirigidaA.push(
        usuarioPiezaMedios.nombreUsuario
          ? usuarioPiezaMedios.nombreUsuario
          : usuarioPiezaMedios.email
      );
      // nombreMedioAsignado = usuarioPiezaMedios.nombre.concat(' ', usuarioPiezaMedios.apellido);
    }

    const pieza = await traerInformacionPiezaPorId(piezaMedio.piezaId)
      .then((pieza: any) => {
        return pieza;
      })
      .catch((error: any) => {
        return error;
      });

    if (pieza) {
      datosARetornar.proyectoId = pieza.proyectoId;
    }

    datosARetornar.mensaje = `${pieza.proyectoId.usuarioId.nombre.concat(
      ' ',
      pieza.proyectoId.usuarioId.apellido
    )} te asignó una pieza en el proyecto ${pieza.proyectoId.nombreProyecto}`;
    datosARetornar.nombreProyecto = piezaMedio.nombrePiezaMedio;
    datosARetornar.nombreUsuario = usuarioPiezaMedios.nombreUsuario
      ? usuarioPiezaMedios.nombreUsuario
      : usuarioPiezaMedios.email;
    datosARetornar.nombreUsuarioCompleto = nombreMedioAsignado;

    const usuariosAdministradores = await traerUsuariosAdministradores()
      .then((usuarios: any) => {
        return usuarios;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    if (usuariosAdministradores.length) {
      for await (const user of usuariosAdministradores) {
        if (user.isActivado) {
          if (user.nombreUsuario) {
            datosARetornar.notificacionDirigidaA.push(user.nombreUsuario);
          } else {
            datosARetornar.notificacionDirigidaA.push(user.email);
          }
        }
      }
    } else {
    }
  }

  return datosARetornar;
};

export const filtrarDatosParaPiezaTerminada = async (pieza: any) => {
  var categoriasDeProyecto: any = [];
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'piezaTerminada',
    usuarioEtiquetado: '',
    piezaMedio: {},
    pieza: pieza,
    vistoPor: [],
  };

  if (pieza.proyectoId.categorias.length) {
    for await (const categoria of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(categoria._id);
    }
  }

  const usuarios = await traerUsuariosAdministradoresYPrensa()
    .then((users: any) => {
      return users;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuarios.length) {
    for await (const usuario of usuarios) {
      if (usuario.rolId === Rol.Prensa) {
        if (usuario.categorias.length) {
          if (
            usuario.categorias.some((ObjetoUsersCategorias: any) =>
              categoriasDeProyecto.some(
                (ObjetoCategoriasDeProyecto: any) =>
                  JSON.stringify(ObjetoUsersCategorias) ===
                  JSON.stringify(ObjetoCategoriasDeProyecto)
              )
            )
          ) {
            datosARetornar.notificacionDirigidaA.push(usuario.email);
          }
        }
      } else {
        datosARetornar.notificacionDirigidaA.push(usuario.email);
      }
    }

    const usuarioDeLaPieza = await traerUsuarioPorId(pieza.asignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    datosARetornar.mensaje = `${usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    )} ha terminado una pieza del proyecto ${pieza.proyectoId.nombreProyecto}`;
    datosARetornar.proyectoId = pieza.proyectoId._id;
    // datosARetornar.nombreUsuario = usuarioDeLaPieza.nombreUsuario;
    datosARetornar.nombreUsuarioCompleto = usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    );

    // return datosARetornar;
  } else {
    return new Error('No hay usuarios administradores');
  }

  return datosARetornar;
};

export const filtrarDatosParaPiezaCreada = async (piezas: any, proyecto: any) => {
  var datosARetornar = {
    notificacionDirigidaA: <any>[],
    pieza: <any>[],
    mensaje: <any>[],
    vistoPor: [],
  };

  const piezasDelProyecto = await traerPiezasPorIdProyecto(proyecto._id)
    .then((piezas: any) => {
      return piezas;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (piezasDelProyecto.length) {
    for await (const pieza of piezasDelProyecto) {
      datosARetornar.pieza.push(pieza);
      datosARetornar.mensaje = `${proyecto.usuarioId.nombre.concat(
        ' ',
        proyecto.usuarioId.apellido
      )} te asignó la pieza ${pieza.descripcion} en el proyecto ${proyecto.nombreProyecto}`;
      if (proyecto.estadoId !== Estado.Borrador && Object.keys(pieza.asignadoId).length) {
        datosARetornar.notificacionDirigidaA.push(
          pieza.asignadoId.nombreUsuario ? pieza.asignadoId.nombreUsuario : pieza.asignadoId.email
        );
      }
    }
  }

  return datosARetornar;
};

export const filtrarDatosParaPiezaAprobada = async (pieza: any) => {
  // console.log(pieza);
  // return false;
  var categoriasDeProyecto: any = [];
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: pieza.proyectoId._id,
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'piezaAprobada',
    usuarioEtiquetado: '',
    piezaMedio: {},
    pieza: pieza,
    vistoPor: [],
  };

  if (pieza.proyectoId.categorias.length) {
    for await (const categoria of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(categoria._id);
    }
  }

  const usuarios = await traerUsuariosPrensa()
    .then((users: any) => {
      return users;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuarios.length) {
    for await (const usuario of usuarios) {
      if (usuario.categorias.length) {
        if (
          usuario.categorias.some((ObjetoUsersCategorias: any) =>
            categoriasDeProyecto.some(
              (ObjetoCategoriasDeProyecto: any) =>
                JSON.stringify(ObjetoUsersCategorias) === JSON.stringify(ObjetoCategoriasDeProyecto)
            )
          )
        ) {
          datosARetornar.notificacionDirigidaA.push(usuario.email);
        }
      }
    }
  } else {
    // return new Error('No hay usuarios administradores');
  }

  if (pieza.asignadoId) {
    const usuarioDeLaPieza = await traerUsuarioPorId(pieza.asignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    datosARetornar.notificacionDirigidaA.push(
      usuarioDeLaPieza.nombreUsuario ? usuarioDeLaPieza.nombreUsuario : usuarioDeLaPieza.email
    );
    datosARetornar.mensaje = `${usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    )} ha aprobado una pieza del proyecto ${pieza.proyectoId.nombreProyecto}`;
    // datosARetornar.proyectoId = pieza.proyectoId._id;
    // datosARetornar.nombreUsuario = usuarioDeLaPieza.nombreUsuario;
    datosARetornar.nombreUsuarioCompleto = usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    );
  }

  return datosARetornar;
};

export const filtrarDatosParaPiezaRechazada = async (pieza: any) => {
  // console.log(pieza);
  // return false;
  var categoriasDeProyecto: any = [];
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: pieza.proyectoId._id,
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'piezaRechazada',
    usuarioEtiquetado: '',
    piezaMedio: {},
    pieza: pieza,
    vistoPor: [],
  };

  if (pieza.proyectoId.categorias.length) {
    for await (const categoria of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(categoria._id);
    }
  }

  const usuarios = await traerUsuariosPrensa()
    .then((users: any) => {
      return users;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuarios.length) {
    for await (const usuario of usuarios) {
      if (usuario.categorias.length) {
        if (
          usuario.categorias.some((ObjetoUsersCategorias: any) =>
            categoriasDeProyecto.some(
              (ObjetoCategoriasDeProyecto: any) =>
                JSON.stringify(ObjetoUsersCategorias) === JSON.stringify(ObjetoCategoriasDeProyecto)
            )
          )
        ) {
          datosARetornar.notificacionDirigidaA.push(usuario.email);
        }
      }
    }
  } else {
    // return new Error('No hay usuarios administradores');
  }

  if (pieza.asignadoId) {
    const usuarioDeLaPieza = await traerUsuarioPorId(pieza.asignadoId)
      .then((usuario: any) => {
        return usuario;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    datosARetornar.notificacionDirigidaA.push(
      usuarioDeLaPieza.nombreUsuario ? usuarioDeLaPieza.nombreUsuario : usuarioDeLaPieza.email
    );
    datosARetornar.mensaje = `${usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    )} ha rechazado una pieza del proyecto ${pieza.proyectoId.nombreProyecto}`;
    // datosARetornar.proyectoId = pieza.proyectoId._id;
    // datosARetornar.nombreUsuario = usuarioDeLaPieza.nombreUsuario;
    datosARetornar.nombreUsuarioCompleto = usuarioDeLaPieza.nombre.concat(
      ' ',
      usuarioDeLaPieza.apellido
    );
  }

  return datosARetornar;
};

export const filtrarDatosParaPiezaEnCurso = async (piezas: any) => {
  // console.log('***********************************************************');
  // console.log(piezas);
  // console.log('***********************************************************');
  // var categoriasDeProyecto: any = [];
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'piezaEnCurso',
    usuarioEtiquetado: '',
    piezaMedio: {},
    // pieza: pieza,
    vistoPor: [],
  };

  const proyecto = await traerProyectoPorId(piezas[0].proyectoId)
    .then((value: any) => {
      return value;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  datosARetornar.proyectoId = proyecto._id;

  const usuarios = await traerUsuariosAdministradoresYPrensa()
    .then((users: any) => {
      return users;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });
  if (usuarios.length) {
    for await (const usuario of usuarios) {
      if (usuario.rolId === Rol.Prensa) {
        if (usuario.categorias.length) {
          if (
            usuario.categorias.some((ObjetoUsersCategorias: any) =>
              proyecto.categorias.some(
                (ObjetoCategoriasDeProyecto: any) =>
                  JSON.stringify(ObjetoUsersCategorias) ===
                  JSON.stringify(ObjetoCategoriasDeProyecto)
              )
            )
          ) {
            datosARetornar.notificacionDirigidaA.push(usuario.email);
          }
        }
      } else {
        datosARetornar.notificacionDirigidaA.push(usuario.email);
      }
    }
  }

  return datosARetornar;
};

export const filtrarDatosParaCambioPrioridadProyecto = async (proyecto: any) => {
  // Debo filtrar usuarios prensa que coincidan con la categoria del proyecto y productores que tengan piezas asociadas al mismo
  var categoriasDeProyecto: any = [];
  var datosARetornar = {
    fechaNotificacion: new Date(),
    proyectoId: '',
    fechaVencimientoFormateada: '',
    mensaje: '',
    nombresCategoriasProyecto: <any>[],
    notificacionDirigidaA: <any>[],
    nombreProyecto: '',
    usuarioCreadorDelProyecto: '',
    nombreUsuario: '',
    nombreUsuarioCompleto: '',
    tipoOperacion: 'cambioPrioridad',
    usuarioEtiquetado: '',
    piezaMedio: {},
    pieza: {},
    proyecto: proyecto ? proyecto : {},
    vistoPor: [],
  };
  if (proyecto && proyecto.estadoId !== Estado.Borrador) {
    datosARetornar.proyectoId = proyecto._id;
    datosARetornar.mensaje = `cambió la prioridad del proyecto ${proyecto.nombreProyecto}`;
    if (proyecto.categorias.length) {
      for await (const categoria of proyecto.categorias) {
        categoriasDeProyecto.push(categoria._id);
      }
    }

    const usuariosInvolucrados = await traerUsuariosAdministradoresProductoresYPrensa()
      .then((usuarios: any) => {
        return usuarios;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    const piezasDelProyecto = await traerPiezasDelProyecto(proyecto._id)
      .then((piezas: any) => {
        return piezas;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    if (usuariosInvolucrados.length) {
      for await (const usuario of usuariosInvolucrados) {
        switch (usuario.rolId) {
          case Rol.Prensa:
            if (usuario.categorias.length) {
              if (
                usuario.categorias.some((ObjetoUsersCategorias: any) =>
                  categoriasDeProyecto.some(
                    (ObjetoCategoriasDeProyecto: any) =>
                      JSON.stringify(ObjetoUsersCategorias) ===
                      JSON.stringify(ObjetoCategoriasDeProyecto)
                  )
                )
              ) {
                datosARetornar.notificacionDirigidaA.push(
                  usuario.nombreUsuario ? usuario.nombreUsuario : usuario.email
                );
              }
            }
            break;
          case Rol.Productor:
            if (piezasDelProyecto.length) {
              for await (const pieza of piezasDelProyecto) {
                if (
                  JSON.stringify(usuario._id) === JSON.stringify(pieza.asignadoId._id) &&
                  pieza.estadoId !== Estado.Borrador
                ) {
                  if (
                    !datosARetornar.notificacionDirigidaA.includes(
                      usuario.nombreUsuario ? usuario.nombreUsuario : usuario.email
                    )
                  ) {
                    datosARetornar.notificacionDirigidaA.push(
                      usuario.nombreUsuario ? usuario.nombreUsuario : usuario.email
                    );
                  }
                }
              }
            }
            break;
          case Rol.Administrador:
            if (
              !datosARetornar.notificacionDirigidaA.includes(
                usuario.nombreUsuario ? usuario.nombreUsuario : usuario.email
              )
            ) {
              datosARetornar.notificacionDirigidaA.push(
                usuario.nombreUsuario ? usuario.nombreUsuario : usuario.email
              );
            }
            break;
        }
      }
    } else {
    }
  } else {
  }

  return datosARetornar;
};
