import fs from 'fs'
const path = require('path')

export const cargarFotoPerfil = async (archivo: any) => {
  try {
    console.log('En adminArchivos')
    console.log(archivo);
    var nuevoPath: string = '';
    var oldPath: string = '';
    var path: string = '';
    var datosImagen = {
      nombre: '',
      tipo: '',
      tamanio: 0,
    };
    oldPath = archivo.archivos.path;
    // TODO: path para local
    // path = archivo.archivos.path.split('\\');

    // TODO: Path para Heroku
    path = archivo.archivos.path.split('/');
    // console.log(path);
    nuevoPath = 'fotosPerfil/' + path[1];
    console.log(nuevoPath);
    const pr = new Promise((resolve: any, reject: any) => {
     
      fs.rename(oldPath, nuevoPath, (err: any) => {
        if (err) reject(new Error(err));

        datosImagen.nombre = path[1];
        datosImagen.tipo = archivo.archivos.type;
        datosImagen.tamanio = archivo.archivos.size;
        console.log(datosImagen);
        console.log('***********************')
        resolve(datosImagen);
      });
    });
    return pr;
  } catch (error) {
    return error;
  }
};

export const obtenerFotoPerfil = async (fotoPerfil: any) => {
  try {
    let archivoEncontrado:string = ""
    let pathRepo = path.resolve("./");
    let pathFile = path.join(pathRepo + "/fotosPerfil")
    console.log('En el obtener foto de adminArchivos')
    console.log(`path repo: ${pathRepo}`)
    console.log(`path file: ${pathFile}`)
    const pr = new Promise((resolve: any, reject: any) => {
    fs.readdir(pathFile, function (err, archivos) {
      if (err) {
        // console.log(err);
        reject(err)
      } else {
        archivos.forEach((item) => {
          // console.log(item)
          if (item == fotoPerfil) {
            archivoEncontrado = item
          }
        });
        resolve(archivoEncontrado)
      }
      });
    
    });
    return pr;
  } catch (error) {
    // return error;
    return new Promise((resolve: any, reject: any) => {
      reject(error);
    })
  }
};

export const modificarFotoPerfil = async (imagenVieja: any, imagenNueva: any) => {
  try {
    // Path local
    // var imagenEliminar: string = 'fotosPerfil\\' + imagenVieja;

    // Path Heroku
    // var imagenEliminar: string = 'fotosPerfil\\' + imagenVieja;
    let pathRepo = path.resolve("./");
    let pathFile = path.join(pathRepo+"/fotosPerfil/"+imagenVieja)

    const pr = new Promise((resolve: any, reject: any) => {
      fs.rm(pathFile, (err: any) => {
        if (err) reject(err);

        resolve(cargarFotoPerfil(imagenNueva));
      });
    });
    return pr;
  } catch (error) {
    return error;
  }
};

export const eliminarFotoPerfil = async (imagenEliminar:string) => {
  try {
    let pathRepo = path.resolve("./");
    let pathFile = path.join(pathRepo + "/fotosPerfil/" + imagenEliminar)
    const pr = new Promise((resolve: any, reject: any) => {
      fs.rm(pathFile, (err: any) => {
        if (err) reject(err);

        resolve("Foto de perfil eliminada");
      });
    });
    return pr;
    
  } catch (error) {
    return error
  }
}

export const cargarDocumento = async (archivo: any, tipoDocumento: string) => {
  try {
    var nuevoPath: string = '';
    var oldPath: string = '';
    var path: string = '';
    var datosDocumento = {
      nombre: '',
      tipo: '',
      tamanio: 0,
      tipoDocumento: 0,
    };
    oldPath = archivo.archivos.path;

    // TODO: Path para local
    // path = archivo.archivos.path.split('\\');

    // TODO: Path para Heroku
    path = archivo.archivos.path.split('/');
    datosDocumento.tipo = archivo.archivos.type;
    datosDocumento.tamanio = archivo.archivos.size;
    const pr = new Promise((resolve: any, reject: any) => {
      switch (tipoDocumento) {
        case '1':
          // AFIP
          nuevoPath = 'documentacionUsuarios/afip/' + path[1];
          fs.rename(oldPath, nuevoPath, (err: any) => {
            if (err) reject(new Error(err));

            datosDocumento.nombre = path[1];
            datosDocumento.tipoDocumento = 1;
            resolve(datosDocumento);
          });
          break;
        case '2':
          //RENTAS
          nuevoPath = 'documentacionUsuarios/rentas/' + path[1];
          fs.rename(oldPath, nuevoPath, (err: any) => {
            if (err) reject(new Error(err));

            datosDocumento.nombre = path[1];
            datosDocumento.tipoDocumento = 2;
            resolve(datosDocumento);
          });
          break;
        case '3':
          //PROVEEDOR_ESTADO
          nuevoPath = 'documentacionUsuarios/proveedor/' + path[1];
          fs.rename(oldPath, nuevoPath, (err: any) => {
            if (err) reject(new Error(err));

            datosDocumento.nombre = path[1];
            datosDocumento.tipoDocumento = 3;
            resolve(datosDocumento);
          });
          break;
        case '4':
          //CONSTANCIA_PUBLICACION
          nuevoPath = 'documentacionUsuarios/constanciaPub/' + path[1];
          fs.rename(oldPath, nuevoPath, (err: any) => {
            if (err) reject(new Error(err));

            datosDocumento.nombre = path[1];
            datosDocumento.tipoDocumento = 4;
            resolve(datosDocumento);
          });
          break;
        // default:
        //   reject('El tipo de documento ingresado no es válido');
      }
    });
    return pr;
  } catch (error) {
    return new Promise((resolve: any, reject: any) => {
      reject(error);
    });
  }
};

export const modificarDocumento = async (
  tipoDoc: string,
  documentoViejo: string,
  documentoNuevo: any
) => {
  try {
    let pathRepo = path.resolve("./");
    let pathDocs = path.join(pathRepo + "/documentacionUsuarios/")
    var documentoEliminar: string = '';
    var op: string = '';
    switch (tipoDoc) {
      case '1':
        documentoEliminar = pathDocs+'afip/' + documentoViejo;
        op = tipoDoc;
        break;
      case '2':
        documentoEliminar = pathDocs+'rentas/' + documentoViejo;
        op = tipoDoc;
        break;
      case '3':
        documentoEliminar = pathDocs+'proveedor/' + documentoViejo;
        op = tipoDoc;
        break;
      case '4':
        documentoEliminar = pathDocs+'afip/' + documentoViejo;
        op = tipoDoc;
        break;
    }

    const pr = new Promise((resolve: any, reject: any) => {
      fs.rm(documentoEliminar, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(cargarDocumento(documentoNuevo, op));
        }
      });
    });
    return pr;
  } catch (error) {
    return new Promise((resolve: any, reject: any) => {
      reject(error);
    });
  }
};

export const obtenerDocumento = async (tipoDoc: string, nombreDoc: string) => {
  try {
    let pathRepo = path.resolve("./");
    let pathDocs = path.join(pathRepo + "/documentacionUsuarios/")
    // var path = '';
    let getDocumento:string=''
    switch (tipoDoc) {
      case '1':
        getDocumento = pathDocs+'afip/' + nombreDoc;
        break;
      case '2':
        getDocumento = pathDocs+'rentas/' + nombreDoc;
        break;
      case '3':
        getDocumento = pathDocs+'proveedor/' + nombreDoc;
        break;
      case '4':
        getDocumento = pathDocs+'constanciaPub/' + nombreDoc;
        break;
      default:
        getDocumento = '';
    }

    const pr = new Promise((resolve: any, reject: any) => {
      if (getDocumento != '') resolve(fs.createReadStream(path));
      else reject(new Error('Tipo de archivo inválido'));
    });
    return pr;
  } catch (error) {
    return new Promise((resolve: any, reject: any) => {
      reject(error);
    });
  }
};

export const eliminarDocumento = async (tipoDoc: string, nombreDoc: string) => {
  try {
    let pathRepo = path.resolve("./");
    let pathDocs = path.join(pathRepo + "/documentacionUsuarios/")
    var pathEliminarDoc:string = '';
    const pr = new Promise((resolve: any, reject: any) => {
      switch (tipoDoc) {
        case '1':
          pathEliminarDoc = pathDocs+'afip/' + nombreDoc;
          break;
        case '2':
          pathEliminarDoc = pathDocs+'rentas/' + nombreDoc;
          break;
        case '3':
          pathEliminarDoc = pathDocs+'proveedor/' + nombreDoc;
          break;
        case '4':
          pathEliminarDoc = pathDocs+'constanciaPub/' + nombreDoc;
          break;
        default:
          reject(new Error('Tipo de documento inválido'));
          break;
      }

      fs.rm(pathEliminarDoc, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    return pr;
  } catch (error) {
    return new Promise((resolve: any, reject: any) => {
      reject(error);
    });
  }
};
