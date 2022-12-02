import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarAdjuntosPieza,
  CrearAdjuntosPieza,
  //ModificarAdjuntosPieza,
  EliminarAdjuntoPieza,
} = require('./AdjuntosPieza_Controller');

router.post('/listar', ValidarToken.ValidarToken, ListarAdjuntosPieza);
router.post('/crear', ValidarToken.ValidarToken, CrearAdjuntosPieza);
//router.put('/modificar', ValidarToken.ValidarToken, ModificarAdjuntosPieza);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarAdjuntoPieza);

module.exports = router;
