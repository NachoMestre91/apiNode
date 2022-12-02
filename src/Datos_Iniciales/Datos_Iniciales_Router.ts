import { Router } from "express";
const router = Router();
import CodifClaves from "../Config/validaciones";
const ValidarToken = new CodifClaves();

const { ListarDatosIniciales } = require("./Datos_Iniciales_Controller");

router.post("/listar", ValidarToken.ValidarToken, ListarDatosIniciales);

module.exports = router;
