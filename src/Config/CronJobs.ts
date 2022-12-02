import {response} from 'express';
import {
  traerPiezasAsignadasPorIdProyecto,
  traerPiezasPorIdProyecto,
} from '../Piezas/Piezas_Controller';
import {
  calcularFechaProyectoVencido,
  calcularFechaVencimientoProyecto,
  calcularTiempoEntreFechas,
  listarTodosProyectosEnCurso,
  ObtenerProyectos,
} from '../Proyectos/Proyecto.Controller';
import {traerUsuariosAdministradores} from '../Usuario/Usuario_Controller';
import {Estado} from './enumeradores';

import {notificarProyectoProximoAVencer, notificarProyectoVencido} from './NotificacionesPorMail';
import {
  filtrarDatosParaProyectoProximoAVencer,
  filtrarDatosParaProyectoVencido,
} from './NotificacionesViaNavegador';

const cron = require('node-cron');

/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *

 Valores permitidos
 second: 0-59
 minute: 0-59
 hour: 0-23
 day of month: 1-31
 month: 1-12 (or names)
 day of week: 0-7 (or names, 0 or 7 are sunday)
 */

export const PruebaCronJob = () => {
  cron.schedule('* * * * *', () => {
    console.log('Ejecutando CRON JOB...');
  });
};

export const proyectosProximosAVencer = () => {
  // Se debe ejecutar a las 7:50 de luneas a domingo
  cron.schedule('0 50 7 * * *', () => {
    console.log('Ejecutando cron...');
    try {
      var datosAEnviar = {
        proyectoId: '',
        nombreProyecto: '',
        correosDeUsuarios: <any>[],
        fechaVencimientoProxima: '',
        nombreUsuarioCompleto: '',
        proyectoProximoAVencer: false,
        proyectoVencido: false,
        mensaje: '',
      };

      listarTodosProyectosEnCurso()
        .then(async (proyectos: any) => {
          if (proyectos.length) {
            for await (const proyecto of proyectos) {
              datosAEnviar.correosDeUsuarios = [];
              let dias = calcularFechaVencimientoProyecto(proyecto.fechaDeadLine);
              let minutos = calcularTiempoEntreFechas(proyecto.fechaDeadLine);

              let fechaVencimientoProyecto = new Date(proyecto.fechaDeadLine);
              let fechaVencimientoFormateada =
                fechaVencimientoProyecto.getDate() +
                '/' +
                (fechaVencimientoProyecto.getMonth() + 1) +
                '/' +
                fechaVencimientoProyecto.getFullYear();
              datosAEnviar.fechaVencimientoProxima = fechaVencimientoFormateada;
              datosAEnviar.nombreProyecto = proyecto.nombreProyecto;
              // datosAEnviar.proyectodias = dias;
              datosAEnviar.proyectoId = proyecto._id;

              if (dias === 1 || dias === 3 || (minutos && minutos >= 50 && minutos <= 70)) {
                if (Object.keys(proyecto.usuarioId).length && proyecto.usuarioId.email) {
                  datosAEnviar.correosDeUsuarios.push(proyecto.usuarioId.email);
                }

                const piezas = await traerPiezasAsignadasPorIdProyecto(proyecto._id);
                if (piezas) {
                  piezas.forEach(async (pieza: any) => {
                    if (pieza && pieza.asignadoId && pieza.asignadoId.isActivado) {
                      datosAEnviar.correosDeUsuarios.push(pieza.asignadoId.email);
                    }
                  });
                }

                if (dias === 3) {
                  datosAEnviar.mensaje = `El proyecto ${proyecto.nombreProyecto} vence en 3 días.`;
                } else if (dias === 1) {
                  datosAEnviar.mensaje = `El proyecto ${proyecto.nombreProyecto} vence en 1 día.`;
                } else if (minutos && minutos >= 50 && minutos <= 70) {
                  datosAEnviar.mensaje = `El proyecto ${proyecto.nombreProyecto} vence en 1 hora.`;
                }

                if (datosAEnviar.correosDeUsuarios.length) {
                  notificarProyectoProximoAVencer(datosAEnviar);
                }
              } else {
                console.log('Los proyectos analizados estan vigentes');
              }
            }
          } else {
            throw new Error('No hay proyectos cargados');
          }
        })
        .catch((error: any) => {
          console.log(error);
          return error;
        });
    } catch (error) {
      response.status(500).send(error);
    }
  });
};
