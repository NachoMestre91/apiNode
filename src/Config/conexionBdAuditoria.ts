import mongoose from 'mongoose';
import * as env from 'env-var';

const db_auditoria = mongoose.connection;

mongoose
  .connect(env.get('DATABASE_AUDITORIA').required().asString(), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(`BD ERROR: ${err}`));

//En caso de conectarse
db_auditoria.once('open', (_) => {
  console.log('BD Auditoria Conectada');
});

// //En caso de error
db_auditoria.on('error', (err) => {
  console.log(`BD Auditoria ERROR:${err}`);
});

export default db_auditoria;
