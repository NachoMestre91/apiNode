import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarAdjuntosProyecto,
  CrearAdjuntosProyecto,
  EliminarAdjuntosProyecto,
} = require('./adjuntosProyectos_Controller');

router.post('/listar', ValidarToken.ValidarToken, ListarAdjuntosProyecto);
router.post('/crear', ValidarToken.ValidarToken, CrearAdjuntosProyecto);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarAdjuntosProyecto);

module.exports = router;
