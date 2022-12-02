const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
//TODO: Libreria env-var?
import * as env from 'env-var';
import {NextFunction, Request, Response} from 'express';
import {Rol} from './enumeradores';

export default class CodifClaves {
  HashClave = (clave: string) => {
    let datos = bcrypt.hashSync(clave, 10);
    return datos;
  };

  CompareClave = (claveUser: string, claveServidor: string) => {
    let result = bcrypt.compareSync(claveUser, claveServidor);
    return result;
  };

  GenerateToken = (datos: object) => {
    let token = jwt.sign(datos, env.get('TOKEN_SECRET').required().asString());
    // let token = jwt.sign(datos, env.get('TOKEN_SECRET').required().asString(), {
    //   expiresIn: '6h',
    // });

    return token;
  };

  ValidarToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['access-token'];
    //res.send({token:token})
    if (token) {
      jwt.verify(
        token,
        env.get('TOKEN_SECRET').required().asString(),
        (err: string, decoded: string) => {
          if (err) {
            return res.status(403).json({mensaje: 'TOKEN INVALIDO'});
          } else {
            next();
          }
        }
      );
    } else {
      res.status(403).send({mensaje: 'SIN TOKEN'});
    }
  };
  ValidarTokenAdministrador = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['access-token'];
    var datosToken = jwt.decode(token, {complete: true});
    if (token) {
      if (datosToken.payload) {
        if (datosToken.payload.rolId === Rol.Administrador) {
          jwt.verify(token, process.env.TOKEN_SECRET, (err: string, decoded: string) => {
            if (err) {
              res.status(403).json({mensaje: 'TOKEN INVALIDO'});
            } else {
              next();
            }
          });
        } else {
          res.status(401).json({mensaje: 'NO TIENE PERMISOS DE ADMINISTRADOR'});
        }
      } else {
        res.status(403).json({mensaje: 'TOKEN INVALIDO'});
      }
    } else {
      res.status(403).send({mensaje: 'SIN TOKEN'});
    }
  };
}
