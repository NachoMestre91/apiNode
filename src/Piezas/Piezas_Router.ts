import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarPiezas,
  CrearPieza,
  AdjuntosPieza,
  ModificarPieza,
  AsignarResponsablePieza,
  EliminarPieza,
  TerminarPieza,
  RechazarPieza,
  AprobarPieza,
  CalcularEstadoPieza,
  ListarPiezasTerminadas,
  ListarPiezasAprobadas,
  ListarPiezasAprobadasParaPrensa,
  ListarPiezasTerminadasParaPrensa,
} = require('./Piezas_Controller');

//Testing
router.get('/listarFinalizadas', ValidarToken.ValidarToken, ListarPiezasTerminadas);
router.get('/listarAprobadas', ValidarToken.ValidarToken, ListarPiezasAprobadas);
router.post(
  '/listarAprobadasParaPrensa',
  ValidarToken.ValidarToken,
  ListarPiezasAprobadasParaPrensa
);
router.post(
  '/listarTerminadasParaPrensa',
  ValidarToken.ValidarToken,
  ListarPiezasTerminadasParaPrensa
);
router.post('/listar', ValidarToken.ValidarToken, ListarPiezas);
router.post('/crear', ValidarToken.ValidarToken, CrearPieza);
router.post('/estadoPieza', ValidarToken.ValidarToken, CalcularEstadoPieza);
// router.post('/adjuntosPieza', ValidarToken.ValidarToken, AdjuntosPieza);
// router.post('/responsablePieza', ValidarToken.ValidarToken, AsignarResponsablePieza);
router.put('/modificar', ValidarToken.ValidarToken, ModificarPieza);
router.put('/terminar', ValidarToken.ValidarToken, TerminarPieza);
router.put('/rechazar', ValidarToken.ValidarToken, RechazarPieza);
router.put('/aprobar', ValidarToken.ValidarToken, AprobarPieza);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarPieza);

//Produccion
// router.get('/',ValidarToken.ValidarToken,Piezas)
// router.post('/',ValidarToken.ValidarToken,CrearPieza)
// router.put('/',ValidarToken.ValidarToken,ModifPieza)
// router.delete('/',ValidarToken.ValidarToken, EliminarPieza)

module.exports = router;
