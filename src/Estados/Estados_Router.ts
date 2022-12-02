import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarEstados,
  CrearEstado,
  ModificarEstado,
  EliminarEstado,
} = require('./Estados_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarEstados);
router.post('/crear', ValidarToken.ValidarToken, CrearEstado);
router.put('/modificar', ValidarToken.ValidarToken, ModificarEstado);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarEstado);

module.exports = router;
