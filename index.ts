import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import cors = require('cors');
import {Request, Response} from 'express';
import {proyectosProximosAVencer, PruebaCronJob} from './src/Config/CronJobs';

//Inicializacioon de Enviroment
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'desarrollo';

import bd from './src/Config/poolMongo';
setTimeout(() => {
  bd();
}, 5000);

import {instalarBD} from './src/Config/instalacionInicial';
import TipoCategoriaModel from './src/Tipo_Categoria/TipoCategoria.model';
const formData = require('express-form-data');
const app = express();

const options = {
  uploadDir: 'filesUploads/',
  autoClean: true,
};

//inicializaciones
app.use(express.static('estaticos'));
app.use(express.json());
app.use(formData.parse(options));
app.use(cors());

// Variables de despliegue
let deploy = 'Dep34 - 01-11-21: // Branch:main';
let version = 'v0.0.34';
app.listen(process.env.PORT, () => {
  console.log(`⚡️[PCSSJ]: El servidor esta corriendo en http://localhost:${process.env.PORT}`);
  process.env.NODE_ENV == 'desarrollo'
    ? console.warn(`${deploy} // ${version}`)
    : console.log(`${version}`);
});

//Ruta Principal
app.get('/', (req: Request, res: Response) => {
  res
    .status(200)
    .send(
      `<!DOCTYPE html><html lang="es"><body><h2>Servidor corriendo</h2> <iframe src="https://giphy.com/embed/8Sy6PsU7oPMhq" width="480" height="307" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p></p><br> <p> ${deploy}</p></body></html>`
    );
});

app.get('/instalar', (req: Request, res: Response) => {
  //Comprueba q la bd no esta instalada
  TipoCategoriaModel.findOne({})
    .then((elemento: any) => {
      if (elemento) {
        res.status(200).send('Ya instalada');
      } else {
        instalarBD()
          .then((respuesta: any) => {
            res.status(200).send(respuesta);
          })
          .catch((e: any) => {
            console.log(e);
            res.status(500).send('ocurrio un error');
          });
      }
    })
    .catch((error: any) => {
      console.log(error);
      res.status(500).send({message: 'error interno de servidor al instalar'});
    });
});

// Seccion CRONJOBS
proyectosProximosAVencer();

//Rutas
app.use('/datosIniciales', require('./src/Datos_Iniciales/Datos_Iniciales_Router'));
app.use('/usuarios', require('./src/Usuario/Usuario_Router'));
app.use('/roles', require('./src/Rol/Rol.Router'));
app.use('/tiposCategoria', require('./src/Tipo_Categoria/TipoCategoria_Router'));
app.use('/categorias', require('./src/Categoria/Categoria_Router'));
app.use('/estados', require('./src/Estados/Estados_Router'));
app.use('/favoritos', require('./src/Favoritos/Favoritos_Router'));
app.use('/adjuntosPieza', require('./src/Adjuntos_Piezas/AdjuntosPieza_Router'));
app.use('/adjuntosProyecto', require('./src/Adjuntos_Proyectos/adjuntosProyectos_Router'));
app.use('/proyectos', require('./src/Proyectos/Proyectos.Router'));
app.use('/piezasMedios', require('./src/Piezas_Medios/PiezasMedios_Router'));
app.use('/piezas', require('./src/Piezas/Piezas_Router'));
app.use('/prioridad', require('./src/Prioridad/Prioridad_Router'));
app.use('/soportes', require('./src/Soportes/Soportes.Router'));
