import {Request, Response} from 'express';
import {ListarPrioridadesParaInicio} from '../Prioridad/Prioridad_Controller';
import {ListarEstadosParaInicio} from '../Estados/Estados_Controller';
import {ListarTiposCategoriaParaInicio} from '../Tipo_Categoria/TipoCategoria_Controller';
import {ListarCategoriasParaInicio} from '../Categoria/Categoria_Controller';
import {
  ListarProyectosSeguidosPorUsuarioParaInicio,
  ListarUsuariosParaInicio,
  ObtenerDocumentacionDelUsuario,
} from '../Usuario/Usuario_Controller';
import {ListarRolesParaInicio} from '../Rol/Rol.Controller';
import {
  ListarPiezasMediosPorUsuarioAdministrador,
  ListarPiezasMediosPorUsuarioMedio,
  ListarPiezasMediosPorUsuarioParaInicio,
} from '../Piezas_Medios/PiezasMedios_Controller';
import {ListarSoportesParaInicio} from '../Soportes/Soportes.Controller';
import {
  ListarProyectosInicioPorPrensa,
  ListarProyectosInicioPorProductor,
  ListarProyectosParaInicio,
} from '../Proyectos/Proyecto.Controller';
import {Rol} from '../Config/enumeradores';

exports.ListarDatosIniciales = async (req: Request, res: Response) => {
  try {
    let datosInicialesARetornar = {
      prioridades: [],
      estados: [],
      tiposDeCategorias: [],
      categorias: [],
      usuarios: [],
      roles: [],
      documentacionDeUsuario: {},
      listaDeProyectosSeguidosPorUsuario: [],
      piezasMedios: [],
      soportes: [],
      proyectos: [],
    };
    if (!req.body.usuarioId || !req.body.rolId) {
      res.status(400).send({message: 'Faltan datos necesarios (id de usuario y rol)'});
    } else {
      if (req.body.rolId === Rol.Medio) {
        await ListarSoportesParaInicio()
          .then((soportes: any) => {
            if (soportes.length) {
              datosInicialesARetornar.soportes = soportes;
            } else {
              datosInicialesARetornar.soportes = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
        await ListarPiezasMediosPorUsuarioMedio(req.body.usuarioId)
          .then((piezasMedios: any) => {
            if (piezasMedios.length) {
              datosInicialesARetornar.piezasMedios = piezasMedios;
            } else {
              datosInicialesARetornar.piezasMedios = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
        await ListarRolesParaInicio()
          .then((roles: any) => {
            if (roles.length) {
              datosInicialesARetornar.roles = roles;
            } else {
              datosInicialesARetornar.roles = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
        await ListarEstadosParaInicio()
          .then((estados: any) => {
            if (estados.length) {
              datosInicialesARetornar.estados = estados;
            } else {
              datosInicialesARetornar.estados = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
        await ListarUsuariosParaInicio()
          .then((usuarios: any) => {
            if (usuarios.length) {
              datosInicialesARetornar.usuarios = usuarios;
            } else {
              datosInicialesARetornar.usuarios = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });
      } else {
        await ListarPrioridadesParaInicio()
          .then((prioridades: any) => {
            if (prioridades.length) {
              datosInicialesARetornar.prioridades = prioridades;
            } else {
              datosInicialesARetornar.prioridades = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ListarEstadosParaInicio()
          .then((estados: any) => {
            if (estados.length) {
              datosInicialesARetornar.estados = estados;
            } else {
              datosInicialesARetornar.estados = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ListarTiposCategoriaParaInicio()
          .then((tiposCategoria: any) => {
            if (tiposCategoria.length) {
              datosInicialesARetornar.tiposDeCategorias = tiposCategoria;
            } else {
              datosInicialesARetornar.tiposDeCategorias = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ListarCategoriasParaInicio()
          .then((categorias: any) => {
            if (categorias.length) {
              datosInicialesARetornar.categorias = categorias;
            } else {
              datosInicialesARetornar.categorias = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ListarUsuariosParaInicio()
          .then((usuarios: any) => {
            if (usuarios.length) {
              datosInicialesARetornar.usuarios = usuarios;
            } else {
              datosInicialesARetornar.usuarios = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ListarRolesParaInicio()
          .then((roles: any) => {
            if (roles.length) {
              datosInicialesARetornar.roles = roles;
            } else {
              datosInicialesARetornar.roles = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        await ObtenerDocumentacionDelUsuario(req.body.usuarioId)
          .then((documentacion: any) => {
            if (documentacion) {
              datosInicialesARetornar.documentacionDeUsuario = documentacion;
            } else {
              datosInicialesARetornar.documentacionDeUsuario = [];
            }
          })
          .catch((error: any) => {
            console.error(error);
            res.status(500).send({message: 'Error interno del servidor'});
          });

        // await ListarProyectosSeguidosPorUsuarioParaInicio(datosBody.usuarioId)
        //   .then((proyectosSeguidos: any) => {
        //     if (proyectosSeguidos) {
        //       datosInicialesARetornar.listaDeProyectosSeguidosPorUsuario = proyectosSeguidos;
        //     } else {
        //       datosInicialesARetornar.listaDeProyectosSeguidosPorUsuario = [];
        //     }
        //   })
        //   .catch((error: any) => {
        //     console.error(error);
        //     res.status(500).send({message: 'Error interno del servidor'});
        //   });

        //solo si el usuario es de Medios o Administrador

        switch (req.body.rolId) {
          case Rol.Administrador:
            {
              await ListarSoportesParaInicio()
                .then((soportes: any) => {
                  if (soportes.length) {
                    datosInicialesARetornar.soportes = soportes;
                  } else {
                    datosInicialesARetornar.soportes = [];
                  }
                })
                .catch((error: any) => {
                  console.error(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
              await ListarProyectosParaInicio()
                .then((proyectos: any) => {
                  if (proyectos.length) {
                    datosInicialesARetornar.proyectos = proyectos;
                  } else {
                    datosInicialesARetornar.proyectos = [];
                  }
                })
                .catch((error: any) => {
                  console.error(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
              await ListarPiezasMediosPorUsuarioAdministrador()
                .then((piezasMedios: any) => {
                  if (piezasMedios.length) {
                    datosInicialesARetornar.piezasMedios = piezasMedios;
                  } else {
                    datosInicialesARetornar.piezasMedios = [];
                  }
                })
                .catch((error: any) => {
                  console.error(error);
                  res.status(500).send({message: 'Error interno del servidor'});
                });
            }
            break;
          case Rol.Prensa:
            {
              await ListarProyectosInicioPorPrensa(req.body.usuarioId)
                .then((proyectos: any) => {
                  if (proyectos.length) {
                    datosInicialesARetornar.proyectos = proyectos;
                  } else {
                    datosInicialesARetornar.proyectos = [];
                  }
                })
                .catch((error: any) => {
                  if (!error.status) {
                    res.status(error.status).send({message: error.menssage});
                  } else {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  }
                });
            }
            break;
          case Rol.Productor:
            {
              await ListarProyectosInicioPorProductor(req.body.usuarioId)
                .then((proyectos: any) => {
                  if (proyectos.length) {
                    datosInicialesARetornar.proyectos = proyectos;
                  } else {
                    datosInicialesARetornar.proyectos = [];
                  }
                })
                .catch((error: any) => {
                  if (!error.status) {
                    res.status(error.status).send({message: error.menssage});
                  } else {
                    console.log(error);
                    res.status(500).send({message: 'Error interno del servidor'});
                  }
                });
            }
            break;
          default:
            res.status(400).send({message: 'No es encontro el Rol del usuario ingresado'});
            break;
        }
      }
      res.status(200).send(datosInicialesARetornar);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
