import {Router} from 'express';
const router = Router();
import CodifClaves from '../../src/Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarCategorias,
  CrearCategoria,
  ModificarCategoria,
  EliminarCategoria,
} = require('./Categoria_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarCategorias);
router.post('/crear', ValidarToken.ValidarToken, CrearCategoria);
router.put('/modificar', ValidarToken.ValidarToken, ModificarCategoria);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarCategoria);

module.exports = router;
