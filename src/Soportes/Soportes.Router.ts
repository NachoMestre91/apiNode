import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  agregarSoporte,
  eliminarSoporte,
  modificarSoporte,
  listarSoportes,
} = require('./Soportes.Controller');

router.get('/listar', ValidarToken.ValidarToken, listarSoportes);
router.post('/crear', ValidarToken.ValidarToken, agregarSoporte);
router.delete('/eliminar', ValidarToken.ValidarToken, eliminarSoporte);
router.put('/modificar', ValidarToken.ValidarToken, modificarSoporte);

module.exports = router;
