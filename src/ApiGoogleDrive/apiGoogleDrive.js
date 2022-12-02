const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {restartOne} = require('docker-compose');

const TOKEN_PATH = 'src/ApiGoogleDrive/token.json';
const CREDENTIALS = 'src/ApiGoogleDrive/credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TiposCategorias = ['FiguraPublica', 'ComunicacionInstitucional', 'ComunicacionPolitica'];
class apiDrive {
  // Load client secrets from a local file.
  conectar = function (
    operacion,
    idProyecto,
    nombreProyecto,
    idTipoCategoria,
    nombreTipoCategoria,
    archivos,
    idPieza,
    idArchivo,
    callback
  ) {
    fs.readFile(CREDENTIALS, (err, content) => {
      if (err) {
        callback(err);
      } else {
        //Primero autorizo
        authorize(JSON.parse(content), autorizar => {
          var r;
          if (autorizar.credentials.access_token) {
            switch (operacion) {
              case 1:
                r = listarArchivos(autorizar);
                r.then(resultado => {
                  if (resultado) {
                    callback(resultado);
                  } else {
                    r = false;
                    callback(r);
                  }
                }).catch(error => {
                  callback(error);
                });
                break;
              case 2:
                r = crearCarpetaPadre(autorizar);
                r.then(v => {
                  crearCarpetaHijo(autorizar, v.data.id)
                    .then(val => {
                      //TODO: Manejar la excepción sino viene la promise
                      if (val) {
                        cargarArchivos(autorizar, val.data.id)
                          .then(value => {
                            callback(value);
                          })
                          .catch(error => {
                            callback(error);
                          });
                      } else {
                        r = false;
                        callback(r);
                      }
                    })
                    .catch(err => {
                      callback(err);
                    });
                }).catch(e => {
                  callback(e);
                });
                break;
              case 3:
                r = crearCarpetaPadre(autorizar);
                r.then(v => {
                  crearCarpetaHijo(autorizar, v.data.id)
                    .then(val => {
                      //TODO: Manejar la excepción sino viene la promise
                      if (val) {
                        crearCarpetaAdjuntosPieza(autorizar, val.data.id)
                          .then(v => {
                            cargarArchivos(autorizar, v.data.id)
                              .then(value => {
                                callback(value);
                              })
                              .catch(error => {
                                callback(error);
                              });
                          })
                          .catch(error => {
                            callback(error);
                          });
                      } else {
                        r = false;
                        callback(r);
                      }
                    })
                    .catch(err => {
                      callback(err);
                    });
                }).catch(e => {
                  callback(e);
                });
                break;
              case 4:
                r = eliminarArchivo(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  console.log(error);
                  r = false;
                  callback(r);
                });
                break;
              case 5:
                r = eliminarArchivos(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  console.log(error);
                  r = false;
                  callback(r);
                });
                break;
              //Cargar foto de perfil
              case 6:
                r = cargarFotoPerfil(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(false);
                });
                break;
              case 7:
                // Obtener foto de perfil
                r = obtenerFotoPerfil(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 8:
                // Modificar foto de perfil
                r = modificarFotoPerfil(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 9:
                // Eliminar foto de perfil
                r = eliminarFotoPerfil(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 10:
                // Cargar documentacion de usuario
                r = cargarDocumentacion(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 11:
                // Obtener documentacion de usuario
                r = obtenerDocumentacion(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 12:
                // Modificar documentacion de usuario
                r = modificarDocumentacion(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 13:
                // Modificar documentacion de usuario
                r = eliminarDocumentacion(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              case 14:
                r = obtenerLinkDeCarpetaDeProyecto(autorizar);
                r.then(doc => {
                  callback(doc);
                }).catch(error => {
                  callback(error);
                });
                break;
              default:
                callback(false);
                break;
            }
          } else {
            callback(false);
          }
        });
      }
    });

    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      let oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          return getAccessToken(oAuth2Client, callback);
        } else {
          oAuth2Client.setCredentials(JSON.parse(token));
          return callback(oAuth2Client);
        }
      });
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    async function getAccessToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', code => {
        rl.close();
        oAuth2Client.getToken(code, async (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          await callback(oAuth2Client);
          //return oAuth2Client
        });
      });
    }

    async function obtenerLinkDeCarpetaDeProyecto(auth) {
      let retorno = {linkDeCarpeta: '', error: 0, mensajeError: ''};
      let tipoCategoriaBuscar = "'" + TiposCategorias[idTipoCategoria] + "'";
      let idProyectoBuscar = "'" + idProyecto + "'";
      const drive = google.drive({version: 'v3', auth});

      const buscarCarpetaPadre = await drive.files.list({
        spaces: 'drive',
        pageSize: 100,
        fields: 'nextPageToken, files(id, name)',
        q:
          "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = " +
          tipoCategoriaBuscar,
      });

      if (buscarCarpetaPadre.data.files.length) {
        const buscarCarpetaDelProyecto = await drive.files.list({
          spaces: 'drive',
          pageSize: 100,
          fields: 'nextPageToken, files(id, name, webViewLink)',
          q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idProyectoBuscar}`,
        });

        if (buscarCarpetaDelProyecto.data.files.length) {
          retorno.linkDeCarpeta = buscarCarpetaDelProyecto.data.files[0].webViewLink;
        } else {
          retorno.error = 1;
          retorno.mensajeError = 'La carpeta del proyecto no existe';
        }
      } else {
        retorno.error = 1;
        retorno.mensajeError = 'La carpeta del tipo de categoria ';
      }

      const pr = new Promise(resolve => {
        resolve(retorno);
      });

      return pr;
    }

    async function cargarDocumentacion(auth) {
      try {
        let tipoDoc = idArchivo;
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let retorno = {
          statusText: '',
          status: 0,
          archivo: [],
        };

        let res;
        const drive = google.drive({version: 'v3', auth});

        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          pageSize: 100,
          fields: 'nextPageToken, files(id, name)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Documentacion Usuario'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            let fileMetadata = {
              name: archivos.archivos.name,
              parents: [buscarCarpetaUsuario.data.files[0].id],
              properties: {tipoDocumento: tipoDoc},
            };
            let media = {
              mimeType: archivos.archivos.type,
              body: fs.createReadStream(archivos.archivos.path),
            };
            res = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
            });
          } else {
            let fileMetadataCarpetaHijo = {
              name: idUsuario,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [buscarCarpetaPadre.data.files[0].id],
            };

            let resHijo = await drive.files.create({
              resource: fileMetadataCarpetaHijo,
              fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
            });

            let fileMetadata = {
              name: archivos.archivos.name,
              parents: [resHijo.data.id],
              properties: {tipoDocumento: tipoDoc},
            };
            let media = {
              mimeType: archivos.archivos.type,
              body: fs.createReadStream(archivos.archivos.path),
            };
            res = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
            });
          }
        } else {
          let fileMetadataCarpetaPadre = {
            name: 'Documentacion Usuario',
            mimeType: 'application/vnd.google-apps.folder',
          };
          let resPadre = await drive.files.create({
            resource: fileMetadataCarpetaPadre,
            fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
          });

          let fileMetadataCarpetaHijo = {
            name: idUsuario,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [resPadre.data.id],
          };
          let resHijo = await drive.files.create({
            resource: fileMetadataCarpetaHijo,
            fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
          });

          let fileMetadata = {
            name: archivos.archivos.name,
            parents: [resHijo.data.id],
            properties: {tipoDocumento: tipoDoc},
          };
          let media = {
            mimeType: archivos.archivos.type,
            body: fs.createReadStream(archivos.archivos.path),
          };
          res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name,size,mimeType,webViewLink, webContentLink,properties',
          });
        }

        if (res && res.status == 200) {
          retorno.status = 200;
          retorno.archivo.push(res.data);
          retorno.statusText = 'OK';
        } else {
          retorno.status = 500;
          retorno.statusText = res.statusText;
        }

        let pr = new Promise(resolve => {
          resolve(retorno);
        });

        return pr;
      } catch (error) {
        return error;
      }
    }

    async function obtenerDocumentacion(auth) {
      try {
        let idUsuario = idProyecto;
        // let idUsuarioBuscar = "'" + idUsuario + "'";
        let idUsuarioBuscar = `'${idUsuario}'`;
        let pr;
        let retorno = {
          status: 0,
          statusText: '',
          archivos: [],
        };

        const drive = google.drive({version: 'v3', auth});
        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType, size)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Documentacion Usuario'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            const buscarArchivos = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: `nextPageToken, files(id, name, mimeType, size,webViewLink, webContentLink,properties)`,
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in "${buscarCarpetaUsuario.data.files[0].id}"`,
            });

            if (buscarArchivos.data.files.length > 0) {
              retorno.status = buscarArchivos.status;
              retorno.statusText = buscarArchivos.statusText;
              buscarArchivos.data.files.forEach(item => {
                // console.log(item);
                retorno.archivos.push(item);
              });
            } else {
              retorno.status = 400;
              retorno.statusText = buscarArchivos.statusText;
            }
          } else {
            retorno.status = 400;
            retorno.statusText = 'La carpeta de usuario no existe';
          }
        } else {
          retorno.statusText = 'La carpeta de Documentación Usuario no existe';
          retorno.status = 400;
        }

        // console.log(retorno);
        // return false;
        pr = new Promise(resolve => {
          resolve(retorno);
        });
        return pr;
      } catch (error) {
        return new Promise(reject => {
          reject(error);
        });
      }
    }

    async function modificarDocumentacion(auth) {
      try {
        // console.log(archivos);
        // return false;
        let tipoDoc = idTipoCategoria;
        let idDocumentoBD = idArchivo;
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let pr;
        let retorno = {
          status: 0,
          statusText: '',
          nuevoArchivo: [],
        };

        const drive = google.drive({version: 'v3', auth});

        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Documentacion Usuario'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            const buscarArchivo = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaUsuario.data.files[0].id}'`,
            });

            if (buscarArchivo.data.files.length > 0) {
              for await (const item of buscarArchivo.data.files) {
                if (item.id == idDocumentoBD) {
                  let res = await drive.files.delete({
                    fileId: item.id,
                  });
                  if (res.data == '') {
                    let fileMetadata = {
                      name: archivos.archivos.name,
                      parents: [buscarCarpetaUsuario.data.files[0].id],
                      properties: {tipoDocumento: tipoDoc},
                    };
                    let media = {
                      mimeType: archivos.archivos.type,
                      body: fs.createReadStream(archivos.archivos.path),
                    };
                    let resp = await drive.files.create({
                      requestBody: fileMetadata,
                      media: media,
                      fields: 'id, name,size,mimeType,webContentLink,webViewLink,properties',
                    });

                    if (resp.status == 200) {
                      retorno.status = 200;
                      retorno.statusText = 'OK';
                      retorno.nuevoArchivo.push(resp.data);
                      // retorno.nombreImagen = resp.data.name;
                      retorno.tipo = resp.data.mimeType;
                      retorno.tamanio = resp.data.size;
                      retorno.idDrive = resp.data.id;
                      retorno.linkDeDescarga = resp.data.webContentLink;
                    } else {
                      retorno.status = 500;
                      retorno.statusText = 'Error al insertar la nueva imágen';
                    }
                  } else {
                    retorno.statusText = 'Error al eliminar la foto de perfil';
                    retorno.status = 400;
                  }
                } else {
                  retorno.statusText = 'El ID de la BD no coincide con el ID de archivo de Drive';
                  retorno.status = 400;
                }
              }
            } else {
              retorno.statusText = 'No existe el archivo para el usuario especificado';
              retorno.status = 400;
            }
          } else {
            retorno.statusText = 'No existe la carpeta del usuario';
            retorno.status = 400;
          }
        } else {
          retorno.statusText = 'La carpeta Documentacion Usuario no existe';
          retorno.status = 400;
        }

        return (pr = new Promise(resolve => {
          resolve(retorno);
        }));
      } catch (error) {
        return error;
      }
    }

    async function eliminarDocumentacion(auth) {
      try {
        let idDocumentoEliminar = idArchivo;
        let pr;
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let retorno = {
          status: 0,
          statusText: '',
          cantArchivosEliminados: 0,
        };

        const drive = google.drive({version: 'v3', auth});

        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Documentacion Usuario'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            const buscarArchivo = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaUsuario.data.files[0].id}'`,
            });

            if (buscarArchivo.data.files.length > 0) {
              for await (const item of buscarArchivo.data.files) {
                if (item.id == idDocumentoEliminar) {
                  let res = await drive.files.delete({
                    fileId: item.id,
                  });
                  if (res.data == '') {
                    retorno.status = 200;
                    retorno.statusText = 'Archivo eliminado';
                    retorno.cantArchivosEliminados = retorno.cantArchivosEliminados + 1;
                  } else {
                    retorno.status = 500;
                    retorno.statusText = 'Error al eliminar el archivo de DRIVE';
                  }
                } else {
                  retorno.statusText = 'El ID de la BD no coincide con el ID de archivo de Drive';
                  retorno.status = 400;
                }
              }
            } else {
              retorno.statusText = 'Archivo no encontrado';
              retorno.status = 400;
            }
          } else {
            retorno.statusText = 'No existe la carpeta del usuario';
            retorno.status = 400;
          }
        } else {
          retorno.statusText = 'La carpeta Fotos Perfil no existe';
          retorno.status = 400;
        }

        pr = new Promise(resolve => {
          resolve(retorno);
        });
        return pr;
      } catch (error) {
        return error;
      }
    }

    async function cargarFotoPerfil(auth) {
      try {
        let retorno = {
          nombreImagen: '',
          tipo: '',
          tamanio: 0,
          idDrive: '',
          linkDeVistaWeb: '',
          linkDeDescarga: '',
          statusText: '',
        };
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let pr;
        let res;

        const drive = google.drive({version: 'v3', auth});

        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          pageSize: 100,
          fields: 'nextPageToken, files(id, name)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Fotos Perfil'",
        });

        let fileMetadataCarpetaHijo = {
          name: idProyecto,
          mimeType: 'application/vnd.google-apps.folder',
        };

        if (buscarCarpetaPadre.data.files.length) {
          // Existe la carpeta padre, me fijo si existe la carpeta del usuario
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });
          if (buscarCarpetaUsuario.data.files.length > 0) {
            let fileMetadata = {
              name: archivos.archivos.name,
              parents: [buscarCarpetaUsuario.data.files[0].id],
            };
            let media = {
              mimeType: archivos.archivos.type,
              body: fs.createReadStream(archivos.archivos.path),
            };
            res = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'id, name,size,mimeType, webViewLink,webContentLink,permissions',
            });
          } else {
            let fileMetadataCarpetaHijo = {
              name: idProyecto,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [buscarCarpetaPadre.data.files[0].id],
            };
            let resHijo = await drive.files.create({
              resource: fileMetadataCarpetaHijo,
              fields: 'id,name',
            });

            let fileMetadata = {
              name: archivos.archivos.name,
              parents: [resHijo.data.id],
            };
            let media = {
              mimeType: archivos.archivos.type,
              body: fs.createReadStream(archivos.archivos.path),
            };
            res = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'id, name,size,mimeType, webViewLink, webContentLink,permissions',
            });
          }
        } else {
          let fileMetadataCarpetaPadre = {
            name: 'Fotos Perfil',
            mimeType: 'application/vnd.google-apps.folder',
          };
          let resPadre = await drive.files.create({
            resource: fileMetadataCarpetaPadre,
            fields: 'id,name',
          });

          let fileMetadataCarpetaHijo = {
            name: idUsuario,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [resPadre.data.id],
          };
          let resHijo = await drive.files.create({
            resource: fileMetadataCarpetaHijo,
            fields: 'id,name',
          });

          let fileMetadata = {
            name: archivos.archivos.name,
            parents: [resHijo.data.id],
          };
          let media = {
            mimeType: archivos.archivos.type,
            body: fs.createReadStream(archivos.archivos.path),
          };
          res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name,size,mimeType, webViewLink,webContentLink,permissions',
          });
        }

        console.log(res.data.permissions);
        if (res && res.status == 200) {
          retorno.nombreImagen = res.data.name;
          retorno.tamanio = res.data.size;
          retorno.tipo = res.data.mimeType;
          retorno.idDrive = res.data.id;
          retorno.statusText = res.statusText;
          retorno.linkDeVistaWeb = res.data.webViewLink;
          retorno.linkDeDescarga = res.data.webContentLink;
        } else {
          retorno.nombreImagen = '';
          retorno.statusText = res.statusText;
        }

        pr = new Promise(resolve => {
          resolve(retorno);
        });
        return pr;
      } catch (error) {
        return new Promise(reject => {
          reject(error);
        });
      }
    }

    async function obtenerFotoPerfil(auth) {
      try {
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let pr;
        let retorno = {
          status: 0,
          statusText: '',
          archivo: [],
        };

        const drive = google.drive({version: 'v3', auth});
        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType, size)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Fotos Perfil'",
        });

        if (buscarCarpetaPadre.data.files.length) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length) {
            const buscarArchivo = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: 'nextPageToken, files(id, name, mimeType, size,webViewLink, webContentLink)',
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaUsuario.data.files[0].id}'`,
            });

            if (buscarArchivo.data.files.length) {
              retorno.status = buscarArchivo.status;
              retorno.statusText = buscarArchivo.statusText;
              retorno.archivo.push(buscarArchivo.data.files[0]);
            } else {
              retorno.status = 400;
            }
          } else {
            retorno.status = 400;
          }
        } else {
          retorno.status = 400;
        }

        pr = new Promise(resolve => {
          resolve(retorno);
        });
        return pr;
      } catch (error) {
        return error;
      }
    }

    async function modificarFotoPerfil(auth) {
      try {
        let archivoBD = idArchivo;
        // console.log(archivoBD);
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let pr;
        let retorno = {
          status: 0,
          statusText: '',
          nombreImagen: '',
          tipo: '',
          tamanio: 0,
          idDrive: '',
        };
        const drive = google.drive({version: 'v3', auth});
        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Fotos Perfil'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            const buscarArchivo = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaUsuario.data.files[0].id}'`,
            });

            if (buscarArchivo.data.files.length > 0) {
              if (buscarArchivo.data.files[0].id == archivoBD.idDrive) {
                let res = await drive.files.delete({
                  fileId: buscarArchivo.data.files[0].id,
                });
                if (res.data == '') {
                  let fileMetadata = {
                    name: archivos.archivos.name,
                    parents: [buscarCarpetaUsuario.data.files[0].id],
                  };
                  let media = {
                    mimeType: archivos.archivos.type,
                    body: fs.createReadStream(archivos.archivos.path),
                  };
                  let resp = await drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: 'id, name,size,mimeType',
                  });
                  if (resp.status == 200) {
                    retorno.status = 200;
                    retorno.statusText = 'OK';
                    retorno.nombreImagen = resp.data.name;
                    retorno.tipo = resp.data.mimeType;
                    retorno.tamanio = resp.data.size;
                    retorno.idDrive = resp.data.id;
                  } else {
                    retorno.status = 500;
                    retorno.statusText = 'Error al insertar la nueva imágen';
                  }
                } else {
                  retorno.statusText = 'Error al eliminar la foto de perfil';
                  retorno.status = 400;
                }
              } else {
                retorno.statusText = 'El ID de la BD no coincide con el ID de archivo de Drive';
                retorno.status = 400;
              }
            } else {
              retorno.statusText = 'No existe el archivo para el usuario especificado';
              retorno.status = 400;
            }
          } else {
            retorno.statusText = 'No existe la carpeta del usuario';
            retorno.status = 400;
          }
        } else {
          retorno.statusText = 'La carpeta Fotos Perfil no existe';
          retorno.status = 400;
        }
        return (pr = new Promise(resolve => {
          resolve(retorno);
        }));
      } catch (error) {
        return error;
      }
    }

    async function eliminarFotoPerfil(auth) {
      try {
        let archivoBD = idArchivo;
        let pr;
        let idUsuario = idProyecto;
        let idUsuarioBuscar = "'" + idUsuario + "'";
        let retorno = {
          status: 0,
          statusText: '',
        };
        const drive = google.drive({version: 'v3', auth});

        const buscarCarpetaPadre = await drive.files.list({
          spaces: 'drive',
          fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = 'Fotos Perfil'",
        });

        if (buscarCarpetaPadre.data.files.length > 0) {
          const buscarCarpetaUsuario = await drive.files.list({
            spaces: 'drive',
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaPadre.data.files[0].id}' and name = ${idUsuarioBuscar}`,
          });

          if (buscarCarpetaUsuario.data.files.length > 0) {
            const buscarArchivo = await drive.files.list({
              spaces: 'drive',
              pageSize: 100,
              fields: 'nextPageToken, files(id, name, mimeType, modifiedTime,createdTime)',
              q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false and parents in '${buscarCarpetaUsuario.data.files[0].id}'`,
            });

            if (buscarArchivo.data.files.length > 0) {
              if (buscarArchivo.data.files[0].id == archivoBD.idDrive) {
                let res = await drive.files.delete({
                  fileId: buscarArchivo.data.files[0].id,
                });
                if (res.data == '') {
                  retorno.status = 200;
                  retorno.statusText = 'Archivo eliminado';
                } else {
                  retorno.status = 500;
                  retorno.statusText = 'Error al eliminar el archivo de DRIVE';
                }
              } else {
                retorno.statusText = 'El ID de la BD no coincide con el ID de archivo de Drive';
                retorno.status = 400;
              }
            } else {
              retorno.statusText = 'Archivo no encontrado';
              retorno.status = 400;
            }
          } else {
            retorno.statusText = 'No existe la carpeta del usuario';
            retorno.status = 400;
          }
        } else {
          retorno.statusText = 'La carpeta Fotos Perfil no existe';
          retorno.status = 400;
        }

        pr = new Promise(resolve => {
          resolve(retorno);
        });
        return pr;
      } catch (error) {
        return error;
      }
    }

    async function eliminarArchivos(auth) {
      try {
        var cont = 0;
        let pr;
        let res;
        const drive = google.drive({version: 'v3', auth});

        const buscarArchivo = await drive.files.list({
          spaces: 'drive',
          pageSize: 100,
          fields: 'nextPageToken, files(id)',
          q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
        });

        if (buscarArchivo.data.files.length > 0) {
          //Encontró archivos
          buscarArchivo.data.files.map(async archivoDrive => {
            archivos.map(async archivoRequest => {
              if (archivoDrive.id == archivoRequest.idArchivo) {
                cont++;
                res = await drive.files.delete({
                  fileId: archivoRequest.idArchivo,
                });
              }
            });
          });
        }

        pr = new Promise((resolve, reject) => {
          resolve(cont);
        });

        return pr;
      } catch (error) {
        return new Promise(reject => {
          reject(error);
        });
      }
    }

    async function eliminarArchivo(auth) {
      try {
        var cont = 0;
        let pr;
        let res;
        const drive = google.drive({version: 'v3', auth});

        const buscarArchivo = await drive.files.list({
          spaces: 'drive',
          pageSize: 100,
          fields: 'nextPageToken, files(id)',
          q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
        });

        if (buscarArchivo.data.files.length > 0) {
          //Encontró archivos
          buscarArchivo.data.files.forEach(async element => {
            if (element.id == idArchivo) {
              cont++;
              res = await drive.files.delete({
                fileId: idArchivo,
              });
            }
          });
        }

        pr = new Promise((resolve, reject) => {
          resolve(cont);
        });

        return pr;
      } catch (error) {
        return new Promise(reject => {
          reject(error);
        });
      }
    }

    async function listarArchivos(auth) {
      let pr;
      var datosARetornar = {
        archivos: [],
        idProyecto: '',
        error: '',
      };
      const idProyectoBuscar = "'" + idProyecto + "'";
      const nombreTipoCategoriaBuscar = "'" + nombreTipoCategoria + "'";
      const drive = google.drive({version: 'v3', auth});
      const buscar = await drive.files.list({
        spaces: 'drive',
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, properties, modifiedTime,createdTime)',
        q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
        //name: nombre,
      });

      if (buscar.data.files.length > 0) {
        //Hay archivos, los proceso para retornarlos
        datosARetornar.idProyecto = idProyecto;
        buscar.data.files.forEach(element => {
          if (element.properties.idProyecto == idProyecto) {
            datosARetornar.archivos.push(element);
          } else {
            datosARetornar.error = 'No se encontraron archivos para el ID ingresado';
          }
        });
      } else {
        datosARetornar.error = 'No hay archivos almacenados';
      }

      // console.log(datosARetornar);
      // return false;
      pr = new Promise((resolve, reject) => {
        resolve(datosARetornar);
      });

      return pr;
    }

    async function crearCarpetaPadre(auth) {
      let res = {
        data: '',
      };
      let pr;
      if (nombreTipoCategoria != '') {
        let nombreTipoCategoriaBuscar = "'" + nombreTipoCategoria + "'";

        const drive = google.drive({
          version: 'v3',
          auth,
        });

        const buscar = await drive.files.list({
          pageSize: 10,
          fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime, description)',
          q:
            "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = " +
            nombreTipoCategoriaBuscar,
          //name: nombre,
        });

        // console.log(buscar.data.files.length);
        // return false;

        var fileMetadata = {
          name: nombreTipoCategoria,
          mimeType: 'application/vnd.google-apps.folder',
          description: idTipoCategoria,
        };

        if (buscar.data.files.length > 0) {
          res.data = {id: buscar.data.files[0].id};
        } else {
          //No existe la carpeta, la creo
          res = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, description',
          });
        }

        pr = new Promise(function (resolve) {
          resolve(res);
        });
        return pr;
      } else {
        return new Error(
          'Error al cargar la carpeta contenedora del proyecto. No se especificó el nombre de la misma.'
        );
      }
    }

    async function crearCarpetaHijo(auth, idCarpPadre) {
      let res = {
        data: '',
      };
      let pr;
      if (nombreProyecto != '') {
        //Busco el proyecto en el drive
        let nombreProyectoBuscar = "'" + nombreProyecto + "'";
        let proyectoIdBuscar = "'" + idProyecto + "'";
        const drive = google.drive({
          version: 'v3',
          auth,
        });

        const buscar = await drive.files.list({
          pageSize: 10,
          fields:
            'nextPageToken, files(id, name, parents, mimeType, modifiedTime,description,properties)',
          q:
            "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = " +
            proyectoIdBuscar,
        });

        var fileMetadata = {
          //id: idProyecto,
          //name: nombreProyecto,
          name: idProyecto,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [idCarpPadre],
          //description: proyectoIdBuscar,
          // properties: {
          //   idProyecto: idProyecto,
          //   nombreProyecto: nombreProyecto,
          // },
        };

        if (buscar.data.files.length > 0) {
          res.data = {id: buscar.data.files[0].id};
        } else {
          //console.log('no esta la carpeta, la creo');
          res = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, description, properties',
          });
        }

        let pr = new Promise((resolve, reject) => {
          resolve(res);
          //reject(new Error(res))
        });

        return pr;
      } else {
        return new Error(
          'Error al crear la carpeta del proyecto. No se especificó el nombre de la misma'
        );
      }
    }

    async function crearCarpetaAdjuntosPieza(auth, idCarpPadre) {
      let res = {
        data: '',
      };
      let pr;
      if (idPieza) {
        //Busco el proyecto en el drive
        //let nombreProyectoBuscar = "'" + nombreProyecto + "'";
        let piezaIdBuscar = "'" + idPieza + "'";
        const drive = google.drive({
          version: 'v3',
          auth,
        });

        const buscar = await drive.files.list({
          pageSize: 10,
          fields:
            'nextPageToken, files(id, name, parents, mimeType, modifiedTime,description,properties)',
          q:
            "mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = " +
            piezaIdBuscar,
        });

        var fileMetadata = {
          //id: idProyecto,
          //name: nombreProyecto,
          name: idPieza,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [idCarpPadre],
          //description: proyectoIdBuscar,
          properties: {
            idPieza: idPieza,
            idProyecto: idProyecto,
          },
        };

        if (buscar.data.files.length > 0) {
          res.data = {id: buscar.data.files[0].id};
        } else {
          //console.log('no esta la carpeta, la creo');
          res = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, description, properties',
          });
        }

        let pr = new Promise((resolve, reject) => {
          resolve(res);
          //reject(new Error(res))
        });

        return pr;
      } else {
        return new Error('Error al crear la carpeta de la pieza.');
      }
    }

    async function cargarArchivos(auth, idCarpHijo) {
      let res;
      var i = 0;
      var cont1 = 0;
      var cont2 = 0;
      var retorno = {
        archivosConErrores: [],
        archivosSinErrores: [],
        linksArchivos: [],
        idsArchivos: [],
        nombreArchivo: [],
        tipoArchivo: [],
        tamanioArchivo: [],
        fechaCreacionArchivo: [],
      };
      var nombreArchivo = '';

      const drive = google.drive({
        version: 'v3',
        auth,
      });

      if (archivos.archivos) {
        if (archivos.archivos.length) {
          for (i = 0; i < archivos.archivos.length; i++) {
            if (archivos.archivos[i].name == '') {
              nombreArchivo = 'archivoSinNombre' + (i + 1);
            } else {
              nombreArchivo = archivos.archivos[i].name;
            }

            if (archivos.archivos[i].path == '') {
              //arrayConErrores.push(archivos[i].name);
              retorno.archivosConErrores.push({
                name: archivos.archivos[i].name,
              });
              //retorno.archivosConErrores.name = archivos.archivos[i].name;
              cont2++;
            } else {
              retorno.archivosSinErrores.push({
                name: archivos.archivos[i].name,
              });
              //retorno.archivosSinErrores.name = archivos.archivos[i].name;
              var fileMetadata = {
                //Parametros para guardar el archivo
                name: nombreArchivo,
                parents: [idCarpHijo],
                properties: {
                  idProyecto: idProyecto,
                  nombreProyecto: nombreProyecto,
                },
              };

              var media = {
                //Tipo de archivo
                mimeType: archivos.archivos[i].type,
                body: fs.createReadStream(archivos.archivos[i].path),
              };

              res = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields:
                  'kind,id,name,size,mimeType,webViewLink,properties,modifiedTime,createdTime',
              });

              if (res.status == 200) {
                cont1++;
                retorno.linksArchivos.push(res.data.webViewLink);
                retorno.idsArchivos.push(res.data.id);
                retorno.nombreArchivo.push(res.data.name);
                retorno.tamanioArchivo.push(res.data.size);
                retorno.tipoArchivo.push(res.data.mimeType);
                retorno.fechaCreacionArchivo.push(res.data.createdTime);
              }
            }
          }
        } else {
          if (archivos.archivos.name == '') {
            nombreArchivo = 'archivoSinNombre' + (i + 1);
          } else {
            nombreArchivo = archivos.archivos.name;
          }

          if (archivos.archivos.path == '') {
            //arrayConErrores.push(archivos[i].name);
            retorno.archivosConErrores.push({name: archivos.archivos.name});
            //retorno.archivosConErrores.name = archivos.archivos.name;
            cont2++;
          } else {
            //retorno.archivosSinErrores.push({name: archivos.archivos.name});
            retorno.archivosSinErrores.push({name: archivos.archivos.name});
            var fileMetadata = {
              //Parametros para guardar el archivo
              name: nombreArchivo,
              parents: [idCarpHijo],
              properties: {
                idProyecto: idProyecto,
                nombreProyecto: nombreProyecto,
              },
            };

            var media = {
              //Tipo de archivo
              mimeType: archivos.archivos.type,
              body: fs.createReadStream(archivos.archivos.path),
            };

            res = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'kind,id,name,size,mimeType,webViewLink,properties,modifiedTime,createdTime',
            });

            if (res.status == 200) {
              cont1++;
              retorno.linksArchivos.push(res.data.webViewLink);
              retorno.idsArchivos.push(res.data.id);
              retorno.nombreArchivo.push(res.data.name);
              retorno.tamanioArchivo.push(res.data.size);
              retorno.tipoArchivo.push(res.data.mimeType);
              retorno.fechaCreacionArchivo.push(res.data.createdTime);
            }
          }
        }
      }

      retorno.status = {
        estado200: cont1,
        estado400: cont2,
      };

      // console.log(retorno);
      // return false;
      return new Promise((resolve, reject) => {
        resolve(retorno);
      });
    }
  };
}

module.exports = apiDrive;
