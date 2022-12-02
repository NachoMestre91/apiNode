import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarTiposCategoria,
  CrearTipoCategoria,
  ModificarTipoCategoria,
  EliminarTipoCategoria,
} = require('./TipoCategoria_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarTiposCategoria);
router.post('/crear', ValidarToken.ValidarToken, CrearTipoCategoria);
router.put('/modificar', ValidarToken.ValidarToken, ModificarTipoCategoria);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarTipoCategoria);

module.exports = router;
