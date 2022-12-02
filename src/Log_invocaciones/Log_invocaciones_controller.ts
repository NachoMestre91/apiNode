import LogInvocacionesModel, {ILogInvocaciones} from './Log_invocaciones_model';

export default class LogAudit {
  InsertLog = (id: string, data: Object) => {
    const nuevoLog: ILogInvocaciones = new LogInvocacionesModel({
      fecha: new Date(),
      usuarioId: id,
      consulta: data,
    });
    nuevoLog
      .save()
      .then((doc: ILogInvocaciones) => {
        if (doc) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
}
