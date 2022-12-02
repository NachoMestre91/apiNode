import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();

const {
  Login,
  TraerUsuarios,
  RegistrarUsuario,
  EliminarUsuario,
  ModificarUsuario,
  ValidarNuevoUsuario,
  RecuperarPassword,
  GenerarHash,
  CargarFotoPerfil,
  ObtenerFotoPerfil,
  ModificarFotoPerfil,
  EliminarFotoPerfil,
  CargarDocumentacion,
  ModificarDocumentacion,
  ObtenerDocumentacion,
  EliminarDocumentacion,
  ConfigurarNotificaciones,
  ActivarUsuario,
  DesactivarUsuario,
  ActualizarToken,
} = require('./Usuario_Controller');

router.get('/listar', ValidarToken.ValidarToken, TraerUsuarios);
router.put('/registrar', RegistrarUsuario);
router.post('/generarHash', ValidarToken.ValidarToken, GenerarHash);
router.post('/cargarFoto', ValidarToken.ValidarToken, CargarFotoPerfil);
router.post('/obtenerFoto', ValidarToken.ValidarToken, ObtenerFotoPerfil);
router.post('/cargarDocumento', CargarDocumentacion);
router.post('/obtenerDocumento', ObtenerDocumentacion);
router.delete('/eliminar', ValidarToken.ValidarTokenAdministrador, EliminarUsuario);
router.delete('/eliminarFoto', ValidarToken.ValidarToken, EliminarFotoPerfil);
router.delete('/eliminarDocumento', EliminarDocumentacion);
router.put('/modificar', ValidarToken.ValidarToken, ModificarUsuario);

router.put('/modificarFoto', ValidarToken.ValidarToken, ModificarFotoPerfil);
router.put('/modificarDocumento', ModificarDocumentacion);
router.post('/login', Login);
router.post('/validar', ValidarNuevoUsuario);
router.post('/recuperarPass', RecuperarPassword);
router.post('/configurarNotificaciones', ValidarToken.ValidarToken, ConfigurarNotificaciones);
router.post('/activar', ValidarToken.ValidarToken, ActivarUsuario);
router.post('/desactivar', ValidarToken.ValidarToken, DesactivarUsuario);
router.post('/actualizarToken', ValidarToken.ValidarToken, ActualizarToken);

// router.get('/',rutasProtegidas,urlencodedParser,obtenerEquipos)

module.exports = router;
