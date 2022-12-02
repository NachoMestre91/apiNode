import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarComentarios,
  CrearComentario,
  ModifComentario,
  EliminarComentario,
} = require('./Comentarios_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarComentarios);
router.post('/crear', ValidarToken.ValidarToken, CrearComentario);
router.put('/modificar', ValidarToken.ValidarToken, ModifComentario);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarComentario);

module.exports = router;
