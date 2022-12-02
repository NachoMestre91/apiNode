import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {
  ListarPiezasMedios,
  CrearPiezasMedios,
  PublicarPiezaMedios,
  DescargarPiezaMedios,
  EliminarPiezasMedios,
  ModificarPiezasMedios,
} = require('./PiezasMedios_Controller');

router.post('/listar', ValidarToken.ValidarToken, ListarPiezasMedios);
router.post('/crear', ValidarToken.ValidarToken, CrearPiezasMedios);
router.put('/publicar', ValidarToken.ValidarToken, PublicarPiezaMedios);
router.put('/descargar', ValidarToken.ValidarToken, DescargarPiezaMedios);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarPiezasMedios);
router.put('/modificar', ValidarToken.ValidarToken, ModificarPiezasMedios);

module.exports = router;
