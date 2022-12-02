import * as jwt from 'jsonwebtoken';
import * as env from 'env-var';
import {Request, Response, NextFunction} from 'express';

//TODO: Todos los mensajes de error de autorizacion deberán devolver un status 401

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers['auth'];
  let jwtPayload;
  let clavePrivada = env.get('TOKEN_SECRET').required().asString();

  try {
    jwtPayload = <any>jwt.verify(token, clavePrivada);
    res.locals.jwtPayload = jwtPayload;
    next();
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }
};

//exports.RegExpEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
//exports.RegExpPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
