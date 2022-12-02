import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {ListarFavoritos, SeguirProyecto, DejarDeSeguirProyecto} = require('./Favoritos_Controller');

router.post('/listar', ValidarToken.ValidarToken, ListarFavoritos);
router.post('/seguir', ValidarToken.ValidarToken, SeguirProyecto);
router.post('/dejarDeSeguir', ValidarToken.ValidarToken, DejarDeSeguirProyecto);
// router.delete('/eliminar', ValidarToken.ValidarToken, ElimFavorito);

module.exports = router;
