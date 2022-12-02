import mongoose from 'mongoose';

//Cadena de conexion BD Desarrollo
const db = mongoose.connection;

const cadenaDeConexion =
  process.env.NODE_ENV == 'testing' ? process.env.DATABASE_TEST : process.env.DATABASE_DEV;

const conectarse = () => {
  mongoose
    .connect(cadenaDeConexion!, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => console.error(`ERROR DE CONEXION A BD: ${err}`));
};

//En caso de conectarse
db.once('open', (_) => {
  console.log('BD de ' + process.env.NODE_ENV + ' conectada');
});

//En caso de error
let reintentos = 0;
db.on('error', (err) => {
  if (err == 'MongooseServerSelectionError: connection timed out' && reintentos < 4) {
    setTimeout(() => {
      db.close();
      reintentos++;
      console.info(`Reintentando conectar por ${reintentos}º vez ...`);
      conectarse();
    }, 1000);
  }
  console.error(`BD ERROR:${err}`);
});

export default conectarse;
