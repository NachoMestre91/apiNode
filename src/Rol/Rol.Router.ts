import {Router} from 'express';
const router = Router();
import CodifClaves from '../Config/validaciones';
const ValidarToken = new CodifClaves();
const {AgregarRol, EliminarRol, ModificarRol, ListarRoles} = require('./Rol.Controller');

router.get('/listar', ValidarToken.ValidarToken, ListarRoles);
router.post('/crear', ValidarToken.ValidarToken, AgregarRol);
router.delete('/eliminar', ValidarToken.ValidarToken, EliminarRol);
router.put('/modificar', ValidarToken.ValidarToken, ModificarRol);

module.exports = router;
