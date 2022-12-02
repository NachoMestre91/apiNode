import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarPrioridades,
  CrearPrioridad,
  ModificarPrioridad,
  EliminarPrioridad,
} = require('./Prioridad_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarPrioridades);
router.post('/crear', ValidarToken.ValidarToken, CrearPrioridad);
router.put('/modificar', ValidarToken.ValidarToken, ModificarPrioridad);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarPrioridad);

module.exports = router;
