import {Request, Response} from 'express';
//import {} from './TipoPieza.model';

// const CodfCla = new CodifClaves();
exports.ListarTiposPieza = (req: Request, res: Response) => {
  try {
    // .find({}).toArray(function(error,result){
    //     if(error){
    //         console.log(error); res.status(500).send({message: "Error interno del servidor"});
    //     }else{
    //         res.status(200).json(result);
    //     }
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.CrearTipoPieza = (req: Request, res: Response) => {
  try {
    // let {nombreTipoPieza} = req.body;
    // if (!nombreTipoPieza) {
    //   res.status(400).send('No se ingresaron datos');
    // } else {
    //   connection
    //     .collection('Tipo_Pieza')
    //     .insertOne({nombreTipoPieza: nombreTipoPieza}, (error, result) => {
    //       if (error) {
    //         console.log(error);
    //         res.status(500).send({message: 'Error interno del servidor'});
    //       } else {
    //         res.status(200).send({message: 'Tipo de Pieza insertada'});
    //       }
    //     });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ModifTipoPieza = (req: Request, res: Response) => {
  try {
    // let {idTipoPieza, nombreTipoPiezaModif} = req.body;
    // if (!(idTipoPieza && nombreTipoPiezaModif)) {
    //   res.status(401).send({message: 'No se ingresaron datos'});
    // } else {
    //   connection
    //     .collection('Tipo_Pieza')
    //     .findOneAndUpdate(
    //       {_id: new mongo.ObjectID(idTipoPieza)},
    //       {$set: {nombreTipoPieza: nombreTipoPiezaModif}},
    //       {returnOriginal: false},
    //       (error) => {
    //         if (error) {
    //           console.log(error);
    //           res.status(500).send({message: 'Error interno del servidor'});
    //         } else {
    //           res.status(200).send({message: 'Tipo de Pieza actualizada'});
    //         }
    //       }
    //     );
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};

exports.ElimTipoPieza = (req: Request, res: Response) => {
  try {
    // let {idTipoPieza} = req.body;
    // if (!idTipoPieza) {
    //   res.status(401).send('No se ingresaron datos');
    // } else {
    //   connection
    //     .collection('Tipo_Pieza')
    //     .findOneAndDelete({_id: new mongo.ObjectID(idTipoPieza)}, (error) => {
    //       if (error) {
    //         console.log(error);
    //         res.status(500).send({message: 'Error interno del servidor'});
    //       } else {
    //         res.status(200).send({message: 'Tipo de pieza eliminada'});
    //       }
    //     });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: 'Error interno del servidor'});
  }
};
