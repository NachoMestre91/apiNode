import {
  traerUsuarioPorId,
  traerUsuariosAdministradores,
  traerUsuariosAdministradoresYPrensa,
  traerUsuariosPrensa,
} from '../Usuario/Usuario_Controller';
import {Estado, Rol} from '../Config/enumeradores';
import {enviarNotificacionPorMail} from '../middlewares/SendMail';
import {
  ObtenerInformacionDeProyectoPorId,
  traerProyectoPorId,
} from '../Proyectos/Proyecto.Controller';
import {traerPiezaPorId, traerPiezasPorIdProyecto} from '../Piezas/Piezas_Controller';
import {listarAdjuntosPorIdProyecto} from '../Adjuntos_Proyectos/adjuntosProyectos_Controller';
const link = process.env.DNS_FRONT;

export const filtrarDatosParaEnviarMailAgregandoModificandoProyecto = async (
  proyectoAnterior: any,
  proyectoNuevo: any
) => {
  var fechaVencimientoFormateada: any;
  var correosDeUsuarios: any = [];
  var asunto: string = 'Proyecto Modificado';
  var categoriasDeProyecto: any = [];
  var nombresCategorias: any = [];
  var categoriasParaMail: string = '';

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

  if (proyectoAnterior._doc.prioridadId !== proyectoNuevo.prioridadId) {
    cambiaPrioridad = true;
    caracteristicasModificadas += '<li>Prioridad del proyecto.</li>';
    seEdito = true;
  }

  if (proyectoAnterior._doc.nombreProyecto !== proyectoNuevo.nombreProyecto) {
    cambiaNombreProyecto = true;
    caracteristicasModificadas += '<li>Nombre del proyecto.</li>';
    seEdito = true;
  }

  if (proyectoAnterior._doc.descripcion !== proyectoNuevo.descripcion) {
    cambiaDescripcionProyecto = true;
    caracteristicasModificadas += '<li>Descripción del proyecto.</li>';
    seEdito = true;
  }

  var date1 = new Date(proyectoAnterior._doc.fechaDeadLine);
  var date2 = new Date(proyectoNuevo.fechaDeadLine);

  if (date1 > date2 || date1 < date2) {
    cambiaFechaDeadLine = true;
    caracteristicasModificadas += '<li>Fecha de vencimiento del proyecto.</li>';
    seEdito = true;
  }

  if (proyectoAnterior._doc.categorias.length != proyectoNuevo.categorias.length) {
    cambiaCategorias = true;
    caracteristicasModificadas += '<li>Categorías del proyecto.</li>';
    seEdito = true;
  }

  if (proyectoAnterior.piezasDelProyectoAnterior.length != proyectoNuevo.progreso.totalPiezas) {
    const piezasNuevas = await traerPiezasPorIdProyecto(proyectoNuevo._id)
      .then((piezas: any) => {
        return piezas;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    if (piezasNuevas) {
      for await (const piezaNueva of piezasNuevas) {
        for await (const piezaAnterior of proyectoAnterior.piezasDelProyectoAnterior) {
          if (piezaNueva.descripcion !== piezaAnterior.descripcion) {
            cambiaDescripcionPieza = true;
            caracteristicasModificadas += '<li>Descripción de una pieza del proyecto.</li>';
            seEdito = true;
          }
        }
      }
    }
  }

  const adjuntosActualesDeProyecto = await listarAdjuntosPorIdProyecto(proyectoNuevo._id)
    .then((adjuntos: any) => {
      return adjuntos;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (
    proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeInsertar &&
    proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeInsertar >=
      adjuntosActualesDeProyecto.length
  ) {
    if (
      proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeInsertar >
      proyectoNuevo.progresoAdjuntos.totalAdjuntosAntesDeInsertar
    ) {
      masAdjuntos = true;
      caracteristicasModificadas += '<li>Se agregaron adjuntos al proyecto.</li>';
      seEdito = true;
    }
  }

  if (
    proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeEliminar &&
    proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeEliminar <=
      adjuntosActualesDeProyecto.length
  ) {
    if (
      proyectoNuevo.progresoAdjuntos.totalAdjuntosAntesDeEliminar -
      proyectoNuevo.progresoAdjuntos.totalAdjuntosDespuesDeEliminar
    ) {
      menosAdjuntos = true;
      caracteristicasModificadas += '<li>Se eliminaron adjuntos al proyecto.</li>';
      seEdito = true;
    }
  }
  // if(proyectoNuevo.totalAdjuntosAnteriorAInsertar < proyectoNuevo.totalAdjuntosPosteriorAInsertar){
  //   menosAdjuntos = true;
  //   caracteristicasModificadas += '<li>Se agregaron adjuntos al proyecto.</li>';
  //   seEdito = true;
  // }

  if (proyectoNuevo.usuarioId) {
    let fecha = new Date(proyectoNuevo.fechaDeadLine);
    fechaVencimientoFormateada =
      fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();

    const UsuarioDeProyecto = traerUsuarioPorId(proyectoNuevo.usuarioId._id);
    UsuarioDeProyecto.then(async (usuario: any) => {
      const piezasDelProyecto = await traerPiezasPorIdProyecto(proyectoNuevo._id)
        .then((piezas: any) => {
          return piezas;
        })
        .catch((error: any) => {
          console.log(error);
          return error;
        });

      if (piezasDelProyecto.length) {
        for await (const pieza of piezasDelProyecto) {
          if (
            pieza.estadoId === Estado.Asignado &&
            pieza.asignadoId.enviarNotificacionViaMail.enviarViaMail &&
            pieza.asignadoId.enviarNotificacionViaMail.seCreaUnProyecto
          ) {
            correosDeUsuarios.push(pieza.asignadoId.email);
          }
        }
      }

      console.log(caracteristicasModificadas);
      var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>${usuario.nombreUsuario} ha modificado las siguientes características en el proyecto ${proyectoNuevo.nombreProyecto}: <ul>${caracteristicasModificadas}</ul>.</dd>
        <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
      </div>`;
      // var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:38px;margin-right:38px">
      //   <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
      //   <dd>El usuario ${usuario.nombreUsuario} ha creado el proyecto ${proyecto.nombreProyecto}.</dd>
      //   <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href="http://localhost:3000" target="_blank">Click aquí para ingresar</a></dd></dl>
      // </div>`;
      if (usuario) {
        if (usuario.rolId === Rol.Administrador || usuario.rolId === Rol.Prensa) {
          let usuariosInvolucrados = traerUsuariosAdministradoresYPrensa();
          usuariosInvolucrados
            .then(async (usuarios: any) => {
              if (usuarios.length) {
                for await (const users of usuarios) {
                  if (users.rolId === Rol.Prensa) {
                    if (users.categorias.length) {
                      if (
                        users.categorias.some((ObjetoUsersCategorias: any) =>
                          categoriasDeProyecto.some(
                            (ObjetoCategoriasDeProyecto: any) =>
                              JSON.stringify(ObjetoUsersCategorias) ===
                              JSON.stringify(ObjetoCategoriasDeProyecto)
                          )
                        ) &&
                        users.enviarNotificacionViaMail.enviarViaMail &&
                        users.enviarNotificacionViaMail.seCreaUnProyecto &&
                        users.isActivado
                      ) {
                        correosDeUsuarios.push(users.email);
                      }
                    }
                  } else {
                    if (
                      users.enviarNotificacionViaMail.enviarViaMail &&
                      users.enviarNotificacionViaMail.seCreaUnProyecto &&
                      users.isActivado
                    ) {
                      correosDeUsuarios.push(users.email);
                    }
                  }
                }

                console.log(correosDeUsuarios);
                if (correosDeUsuarios.length && seEdito) {
                  console.log('Entro a enviar el MAIL');
                  enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
                }
              } else {
                return new Error('No se encontraron usuarios con los roles especificados');
              }
            })
            .catch((error: any) => {
              console.log(error);
              return error;
            });
        } else {
          return new Error('El usuario especificado no tiene permisos para realizar esta acción');
        }
      } else {
        return new Error('No se encontró usuario con el ID especificado');
      }
    }).catch((error: any) => {
      console.log(error);
      return error;
    });
  } else {
    return new Error('El proyecto no tiene usuario cargado');
  }
};

export const filtrarDatosParaNotificarDescargaDePiezaMedios = async (piezaMedio: any) => {
  var nombreDelProyecto: string = '';
  var nombreDelUsuario: string = '';
  var correosDeUsuarios: any = [];
  var asunto: string = 'Descarga de adjuntos de piezas medios';

  if (piezaMedio.archivosAdjuntos.length && piezaMedio.archivosAdjuntos[0].descargado) {
    nombreDelProyecto = await traerProyectoPorId(piezaMedio.piezaId.proyectoId)
      .then((proyecto: any) => {
        return proyecto.nombreProyecto;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    nombreDelUsuario = await traerUsuarioPorId(piezaMedio.medioAsignadoId)
      .then((usuario: any) => {
        return usuario.nombreUsuario;
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });

    var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>El usuario ${nombreDelUsuario} descargó la pieza ${piezaMedio.piezaId.descripcion} del proyecto ${nombreDelProyecto}.</dd>
        <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
      </div>`;

    const usuariosInvolucrados = traerUsuariosAdministradores();
    usuariosInvolucrados
      .then(async (usuarios: any) => {
        if (usuarios.length) {
          for await (const usuario of usuarios) {
            if (
              usuario.enviarNotificacionViaMail.enviarViaMail &&
              usuario.enviarNotificacionViaMail.usuarioMediosDescargaAdjunto &&
              usuario.isActivado
            ) {
              correosDeUsuarios.push(usuario.email);
            }
          }

          if (correosDeUsuarios.length)
            enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
        } else {
          return new Error('No hay usuarios administradores');
        }
      })
      .catch((error: any) => {
        console.log(error);
        return error;
      });
  } else {
    return new Error('La pieza medios seleccionada no posee archivos adjuntos');
  }
};

export const filtrarDatosParaNotificarPiezaTerminada = async (pieza: any) => {
  var nombreDelProyecto: string = pieza.proyectoId.nombreProyecto;
  var nombreDelUsuario: string = '';
  var correosDeUsuarios: any = [];
  var categoriasDeProyecto: any = [];
  var asunto: string = 'Pieza Terminada';

  if (pieza.proyectoId.categorias.length) {
    for await (const item of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(item._id);
    }
  }

  nombreDelUsuario = await traerUsuarioPorId(pieza.asignadoId)
    .then((usuario: any) => {
      return usuario.nombreUsuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
    <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
    <dd>${nombreDelUsuario} ha finalizado una pieza del proyecto ${nombreDelProyecto}.</dd>
    <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
  </div>`;

  // const usuariosInvolucrados = traerUsuariosAdministradores();
  const usuariosInvolucrados = traerUsuariosAdministradoresYPrensa();
  usuariosInvolucrados
    .then(async (usuarios: any) => {
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
                ) &&
                usuario.enviarNotificacionViaMail.enviarViaMail &&
                usuario.enviarNotificacionViaMail.seCreaUnProyecto &&
                usuario.isActivado
              ) {
                correosDeUsuarios.push(usuario.email);
              }
            }
          } else {
            if (
              usuario.enviarNotificacionViaMail.enviarViaMail &&
              usuario.enviarNotificacionViaMail.piezaTerminada &&
              usuario.isActivado
            ) {
              correosDeUsuarios.push(usuario.email);
            }
          }
        }

        if (correosDeUsuarios.length)
          enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
      } else {
        return new Error('No hay usuarios administradores');
      }
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });
};

export const filtrarDatosParaNotificarPiezaRechazada = async (pieza: any) => {
  var nombreDelProyecto: string = pieza.proyectoId.nombreProyecto;
  var usuarioDelProyecto: any;
  var usuarioAsignadoALaPieza: any;
  var correosDeUsuarios: any = [];
  var categoriasDeProyecto: any = [];
  var asunto: string = 'Pieza Rechazada';

  if (pieza.proyectoId.categorias.length) {
    for await (const item of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(item._id);
    }
  }

  usuarioDelProyecto = await traerUsuarioPorId(pieza.proyectoId.usuarioId)
    .then((usuario: any) => {
      return usuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  usuarioAsignadoALaPieza = await traerUsuarioPorId(pieza.asignadoId)
    .then((usuario: any) => {
      return usuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuarioAsignadoALaPieza) {
    correosDeUsuarios.push(usuarioAsignadoALaPieza.email);
  }

  var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
    <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
    <dd>${usuarioDelProyecto.nombreUsuario} ha rechazado la pieza ${pieza.descripcion} del proyecto ${nombreDelProyecto}.</dd>
    <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
  </div>`;

  // const usuariosInvolucrados = traerUsuariosAdministradores();
  const usuariosInvolucrados = traerUsuariosPrensa();
  usuariosInvolucrados
    .then(async (usuarios: any) => {
      if (usuarios.length) {
        for await (const usuario of usuarios) {
          if (usuario.categorias.length) {
            if (
              usuario.categorias.some((ObjetoUsersCategorias: any) =>
                categoriasDeProyecto.some(
                  (ObjetoCategoriasDeProyecto: any) =>
                    JSON.stringify(ObjetoUsersCategorias) ===
                    JSON.stringify(ObjetoCategoriasDeProyecto)
                )
              ) &&
              usuario.isActivado
            ) {
              correosDeUsuarios.push(usuario.email);
            }
          }
        }

        if (correosDeUsuarios.length)
          enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
      } else {
        return new Error('No hay usuarios administradores');
      }
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });
};

export const filtrarDatosParaNotificarPiezaAprobada = async (pieza: any) => {
  var nombreDelProyecto: string = pieza.proyectoId.nombreProyecto;
  var usuarioDelProyecto: any;
  var usuarioAsignadoALaPieza: any;
  var correosDeUsuarios: any = [];
  var categoriasDeProyecto: any = [];
  var asunto: string = 'Pieza Aprobada';

  if (pieza.proyectoId.categorias.length) {
    for await (const item of pieza.proyectoId.categorias) {
      categoriasDeProyecto.push(item._id);
    }
  }

  usuarioDelProyecto = await traerUsuarioPorId(pieza.proyectoId.usuarioId)
    .then((usuario: any) => {
      return usuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  usuarioAsignadoALaPieza = await traerUsuarioPorId(pieza.asignadoId)
    .then((usuario: any) => {
      return usuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  if (usuarioAsignadoALaPieza) {
    correosDeUsuarios.push(usuarioAsignadoALaPieza.email);
  }

  var cuerpoDelMensaje: string = `<div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
    <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
    <dd>${usuarioDelProyecto.nombreUsuario} aprobó la pieza ${pieza.descripcion} del proyecto ${nombreDelProyecto}.</dd>
    <dd>Para ver los cambios puedes dirigirte al siguiente link: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
  </div>`;

  // const usuariosInvolucrados = traerUsuariosAdministradores();
  const usuariosInvolucrados = traerUsuariosPrensa();
  usuariosInvolucrados
    .then(async (usuarios: any) => {
      if (usuarios.length) {
        for await (const usuario of usuarios) {
          if (usuario.categorias.length) {
            if (
              usuario.categorias.some((ObjetoUsersCategorias: any) =>
                categoriasDeProyecto.some(
                  (ObjetoCategoriasDeProyecto: any) =>
                    JSON.stringify(ObjetoUsersCategorias) ===
                    JSON.stringify(ObjetoCategoriasDeProyecto)
                )
              ) &&
              usuario.isActivado
            ) {
              correosDeUsuarios.push(usuario.email);
            }
          }
        }

        if (correosDeUsuarios.length)
          enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
      } else {
        return new Error('No hay usuarios administradores');
      }
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });
};

// export const filtrarDatosParaNotificarPiezaEnCurso = async (piezas: any) => {
//   var contadorPiezasEnCurso: number = 0;
//   var nombreDelUsuario: string = '';
//   var correosDeUsuarios: any = [];
//   var categoriasDeProyecto: any = [];
//   var nombresDePiezasPuestasEnCurso: string = '';
//   var asunto: string = 'Pieza/s en curso';

//   const infoDeProyecto = await ObtenerInformacionDeProyectoPorId(piezas[0].proyectoId)
//     .then((proyecto: any) => {
//       return proyecto;
//     })
//     .catch((error: any) => {
//       console.log(error);
//       return error;
//     });

//   if (infoDeProyecto) {
//     if (infoDeProyecto.categorias.length) {
//       for await (const categoria of infoDeProyecto.categorias) {
//         categoriasDeProyecto.push(categoria._id);
//       }
//     }
//   }

//   for await (const pieza of piezas) {
//     if (pieza.estadoId === Estado.EnCurso) {
//       contadorPiezasEnCurso++;
//       nombresDePiezasPuestasEnCurso += `<li>${pieza.descripcion}</li>`;
//     }
//   }

//   nombreDelUsuario = await traerUsuarioPorId(piezas[0].asignadoId)
//     .then((usuario: any) => {
//       return usuario.nombreUsuario;
//     })
//     .catch((error: any) => {
//       console.log(error);
//       return error;
//     });

//   var cuerpoDelMensaje: string =
//     '<div style="max-width:600px;font-size:15px;margin-left:38px;margin-right:38px">' +
//     '<dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>' +
//     '<dd>' +
//     nombreDelUsuario +
//     ' ha visualizado las siguientes piezas:</dd>' +
//     '<dd><ul>' +
//     nombresDePiezasPuestasEnCurso +
//     '</ul></dd>' +
//     '<dd>Para ver los cambios puedes dirigirte al siguiente link: <a href="http://localhost:3000" target="_blank">Click aquí para ingresar</a></dd></dl>' +
//     '</div>';

//   const usuariosInvolucrados = traerUsuariosAdministradoresYPrensa();
//   usuariosInvolucrados
//     .then(async (usuarios: any) => {
//       if (usuarios.length) {
//         for await (const usuario of usuarios) {
//           if (usuario.rolId === Rol.Prensa) {
//             if (usuario.categorias.length) {
//               if (
//                 usuario.categorias.some((ObjetoUsersCategorias: any) =>
//                   categoriasDeProyecto.some(
//                     (ObjetoCategoriasDeProyecto: any) =>
//                       JSON.stringify(ObjetoUsersCategorias) ===
//                       JSON.stringify(ObjetoCategoriasDeProyecto)
//                   )
//                 ) &&
//                 usuario.isActivado
//               ) {
//                 correosDeUsuarios.push(usuario.email);
//               }
//             }
//           } else {
//             if (usuario.isActivado) correosDeUsuarios.push(usuario.email);
//           }
//         }

//         if (contadorPiezasEnCurso > 0 && correosDeUsuarios.length)
//           enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
//       } else {
//         return new Error('No hay usuarios administradores');
//       }
//     })
//     .catch((error: any) => {
//       console.log(error);
//       return error;
//     });
// };

export const notificarActivacionUsuario = (datosUsuario: any) => {
  var asunto: string = 'Activación de Usuario';
  var correosDeUsuarios: any = [];
  if (datosUsuario && datosUsuario.isActivado) {
    correosDeUsuarios.push(datosUsuario.email);
  }

  var cuerpoDelMensaje: string = `
  <div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>El acceso al sistema ha sido concedido, recuerda que debes completar todos los datos de tu ajuste de perfil para que éste no sea desactivado.</dd>
        <dd>Para ingresar al sistema debes dirigirte a: <a href=${link} target="_blank">Click aquí para ingresar</a></dd></dl>
      </div>`;

  if (correosDeUsuarios.length)
    enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
};

export const notificarProyectoProximoAVencer = (datos: any) => {
  var asunto: string = 'Proyecto próximo a vencer';

  var cuerpoDelMensaje: string = `
  <div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>${datos.mensaje}</dd>
      </div>`;

  if (datos.correosDeUsuarios.length)
    enviarNotificacionPorMail(asunto, datos.correosDeUsuarios, cuerpoDelMensaje);
};

export const notificarProyectoVencido = (datos: any) => {
  var asunto: string = 'Proyecto vencido';

  var cuerpoDelMensaje: string = `
  <div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>El proyecto ${datos.nombreProyecto} venció hoy día ${datos.fechaVencimientoProxima}</dd>
      </div>`;

  if (datos.correosDeUsuarios.length)
    enviarNotificacionPorMail(asunto, datos.correosDeUsuarios, cuerpoDelMensaje);
};

export const notificarRegistroDeNuevoUsuario = async (nuevoUsuario: any) => {
  var correosDeUsuarios: any = [];
  var asunto: string = 'Nuevo Usuario Registrado';

  var cuerpoDelMensaje: string = `
  <div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>${nuevoUsuario.nombre.concat(
          ' ',
          nuevoUsuario.apellido
        )} ha registrado todos sus datos.</dd>
      </div>`;

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
      if (user.isActivado && user.enviarNotificacionViaMail.enviarViaMail) {
        correosDeUsuarios.push(user.email);
      }
    }
  } else {
    return new Error('No existen usuarios administradores');
  }

  if (correosDeUsuarios.length)
    enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
};

export const notificarAsignacionPiezaMedio = async (usuarioMedioAsignado: any, pieza: any) => {
  var correosDeUsuarios: any = [];
  var asunto: string = 'Asignación de Pieza Medios';

  correosDeUsuarios.push(usuarioMedioAsignado.email);

  const usuarioDeProyecto = await traerUsuarioPorId(pieza.proyectoId.usuarioId)
    .then((usuario: any) => {
      return usuario;
    })
    .catch((error: any) => {
      console.log(error);
      return error;
    });

  var cuerpoDelMensaje: string = `
  <div style="max-width:600px;font-size:15px;margin-left:5px;margin-right:2px">
        <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
        <dd>${usuarioDeProyecto.nombreUsuario} te asignó una pieza en el proyecto ${pieza.proyectoId.nombreProyecto}</dd>
      </div>`;

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
      if (user.isActivado && user.enviarNotificacionViaMail.enviarViaMail) {
        correosDeUsuarios.push(user.email);
      }
    }
  } else {
    return new Error('No existen usuarios administradores');
  }

  if (correosDeUsuarios.length)
    enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
};

// export const notificarPiezaMediosPublicada = async (piezaMedio: any) => {
//   var correosDeUsuarios: any = [];
//   var asunto: string = 'Pieza Medios publicada';

//   const usuarioAsignadoALaPieza = await traerUsuarioPorId(piezaMedio.medioAsignadoId)
//     .then((usuario: any) => {
//       return usuario;
//     })
//     .catch((error: any) => {
//       console.log(error);
//       return error;
//     });

//   if (usuarioAsignadoALaPieza && usuarioAsignadoALaPieza.email) {
//     correosDeUsuarios.push(usuarioAsignadoALaPieza.email);
//   }

//   var cuerpoDelMensaje: string = `
//   <div style="max-width:600px;font-size:15px;margin-left:38px;margin-right:38px">
//         <dl style="margin-top:0%;margin-bottom:0%"><dd><h2>Hola</h2></dd>
//         <dd>${usuarioAsignadoALaPieza.nombreUsuario} publicó la pieza ${piezaMedio.descripcionPieza} del proyecto ${piezaMedio.nombrePiezaMedio}.</dd>
//       </div>`;

//   const usuariosAdministradores = await traerUsuariosAdministradores()
//     .then((usuarios: any) => {
//       return usuarios;
//     })
//     .catch((error: any) => {
//       console.log(error);
//       return error;
//     });

//   if (usuariosAdministradores.length) {
//     for await (const user of usuariosAdministradores) {
//       if (user.isActivado && user.enviarNotificacionViaMail.enviarViaMail) {
//         correosDeUsuarios.push(user.email);
//       }
//     }
//   } else {
//     return new Error('No existen usuarios administradores');
//   }

//   console.log(correosDeUsuarios);
//   if (correosDeUsuarios.length)
//     enviarNotificacionPorMail(asunto, correosDeUsuarios, cuerpoDelMensaje);
// };
