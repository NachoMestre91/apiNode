import {Router} from 'express';
const router = Router();
import CodifClaves from '../../src/Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarTiposPieza,
  CrearTipoPieza,
  ModifTipoPieza,
  ElimTipoPieza,
} = require('./TipoPiezas_Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarTiposPieza);
router.post('/crear', ValidarToken.ValidarToken, CrearTipoPieza);
router.put('/modificar', ValidarToken.ValidarToken, ModifTipoPieza);
router.delete('/eliminar', ValidarToken.ValidarToken, ElimTipoPieza);

module.exports = router;
