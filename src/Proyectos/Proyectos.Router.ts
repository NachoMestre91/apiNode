import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarProyectos,
  ActualizarProyectos,
  EliminarProyectoBorrador,
  ArchivarProyecto,
  EstadoProyecto,
  CambiarPrioridad,
  AgregarProyecto,
  TraerProyectosPorIdProductor,
  PausarProyecto,
  BloquearConcurrencia,
  AprobarProyecto,
  DesarchivarProyecto,
  ConsultarPiezasTerminadas,
  ObtenerInformacionProyecto,
  ListarProyectosPorPrensa,
  ObtenerLinkCarpetaDeProyecto,
  DesbloquearConcurrencia,
  RenovarBloquearConcurrencia,
} = require('./Proyecto.Controller');

// const {RevisarVencimientoProyecto} = require('../Config/NotificacionesViaNavegador');

router.get('/listar', ValidarToken.ValidarToken, ListarProyectos);
router.post('/listarPorPrensa', ValidarToken.ValidarToken, ListarProyectosPorPrensa);

router.put('/bloquearConcurrencia', ValidarToken.ValidarToken, BloquearConcurrencia);
router.put('/renovarbloquearConcurrencia', ValidarToken.ValidarToken, RenovarBloquearConcurrencia);

router.put('/desbloquearConcurrencia', ValidarToken.ValidarToken, DesbloquearConcurrencia);
router.post('/crear', ValidarToken.ValidarToken, AgregarProyecto);
router.put('/actualizar', ValidarToken.ValidarToken, ActualizarProyectos);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarProyectoBorrador);
router.put('/archivar', ValidarToken.ValidarToken, ArchivarProyecto);
router.put('/desarchivar', ValidarToken.ValidarToken, DesarchivarProyecto);
router.put('/estado', ValidarToken.ValidarToken, EstadoProyecto);
router.put('/cambiarprioridad', ValidarToken.ValidarToken, CambiarPrioridad);
router.put('/pausar', ValidarToken.ValidarToken, PausarProyecto);
router.put('/aprobar', ValidarToken.ValidarToken, AprobarProyecto);
router.post('/listarPorProductor', ValidarToken.ValidarToken, TraerProyectosPorIdProductor);
router.post('/consultarPiezasTerminadas', ValidarToken.ValidarToken, ConsultarPiezasTerminadas);
router.post('/obtenerInfoProyecto', ValidarToken.ValidarToken, ObtenerInformacionProyecto);
router.post('/linkCarpetaProyecto', ValidarToken.ValidarToken, ObtenerLinkCarpetaDeProyecto);
// router.post('/revisarVencimiento', ValidarToken.ValidarToken, RevisarVencimientoProyecto);

module.exports = router;
