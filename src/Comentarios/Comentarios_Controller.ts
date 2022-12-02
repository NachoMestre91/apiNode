// import Comentario from './Comentario.model';
import {Request, Response} from 'express';

//const CodfCla = new CodifClaves();
//Nombre de la función: Comentarios,CrearComentario,ModifComentario,EliminarComentario
exports.ListarComentarios = (req: Request, res: Response) => {
  try {
    // connection.collection("Comentarios").find({}).toArray((error,result)=>{
    //     if(error)
    //     {
    //         console.log(error); res.status(500).send({message: "Error interno del servidor"});
    //     }else{
    //         res.status(200).json(result);
    //     }
    // })
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.CrearComentario = (req: Request, res: Response) => {
  try {
    // let {texto, usuarioId, proyectoId} = req.body;
    // if (!{texto, usuarioId, proyectoId}) {
    //   res.status(401).send('No se enviaron los datos del usuario ni del proyecto');
    // } else {
    //   let NuevoComentario = new Comentario({
    //     texto: texto,
    //     fecha: new Date().toLocaleString(),
    //     usuarioId: new mongo.ObjectID(usuarioId),
    //     proyectoId: new mongo.ObjectID(proyectoId),
    //   });
    //   connection.collection('Comentarios ').insertOne(NuevoComentario, (error, result) => {
    //     if (error) {
    //       console.log(error);
    //       res.status(500).send({message: 'Error interno del servidor'});
    //     } else {
    //       res.status(200).send('Comentario Insertado');
    //     }
    //   });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModifComentario = (req: Request, res: Response) => {
  try {
    // let {idComentarioModificar, nTexto, nidUsuario} = req.body;
    // if (!{idComentarioModificar, nTexto, nidUsuario}) {
    //   res.status(401).send('No hay datos');
    // } else {
    //   connection
    //     .collection('Comentarios')
    //     .findOneAndUpdate(
    //       {_id: new mongo.ObjectID(idComentarioModificar)},
    //       {$set: {texto: nTexto, fecha: new Date().toLocaleString()}},
    //       {returnOriginal: false},
    //       (error, doc) => {
    //         if (error) {
    //           console.log(error);
    //           res.status(500).send({message: 'Error interno del servidor'});
    //         } else {
    //           res.status(200).send('Comentario actualizado');
    //         }
    //       }
    //     );
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.EliminarComentario = (req: Request, res: Response) => {
  try {
    // let {idComentario} = req.body;
    // if (!idComentario) {
    //   res.status(401).send('No se ingresaron datos');
    // } else {
    //   connection
    //     .collection('Comentarios')
    //     .deleteOne({_id: new mongo.ObjectID(idComentario)}, (error) => {
    //       if (error) {
    //         console.log(error);
    //         res.status(500).send({message: 'Error interno del servidor'});
    //       } else {
    //         res.status(200).send('Comentario Eliminado');
    //       }
    //     });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
