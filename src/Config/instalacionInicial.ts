// INSTALACION DE LOS DATOS INICIALES EN LA BD
import cliProgress from 'cli-progress';
import _colors from 'colors';
import CategoriaModel, {ICategoria} from '../Categoria/Categoria.model';
import {Estado, Prioridad, Soportes, Tipo_Categoria} from '../Config/enumeradores';
import EstadosModel, {IEstado} from '../Estados/Estado.model';
import PrioridadModel, {IPrioridad} from '../Prioridad/Prioridad.model';
import RolModel, {IRol} from '../Rol/Rol.model';
import TipoCategoriaModel, {ITipoCategoria} from '../Tipo_Categoria/TipoCategoria.model';
import SoportesModel, {ISoporte} from '../Soportes/Soportes_Models';
import Usuario_Models, {IUsuario} from '../Usuario/Usuario_Models';
import CodifClaves from './validaciones';

//barra de progreso
const barra = new cliProgress.SingleBar({
  format:
    'Instalando sistema |' +
    _colors.cyan('{bar}') +
    '| {percentage}% || {value}/{total}  || Progreso: {progreso}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

//INICIALIZACIONES

let inicializarEstados = async () => {
  let borrador: IEstado = new EstadosModel({
    nombreEstado: 'Borrador',
    color: '#B4C9C7',
    keyEstado: Estado.Borrador,
  });
  await borrador.save();

  let creado: IEstado = new EstadosModel({
    nombreEstado: 'Creado',
    color: '#CC6633',
    keyEstado: Estado.Creado,
  });
  await creado.save();

  let asignado: IEstado = new EstadosModel({
    nombreEstado: 'Asignado',
    color: '#339966',
    keyEstado: Estado.Asignado,
  });
  await asignado.save();

  let enCurso: IEstado = new EstadosModel({
    nombreEstado: 'En Curso',
    color: '#F9D99A',
    keyEstado: Estado.EnCurso,
  });
  await enCurso.save();

  let terminado: IEstado = new EstadosModel({
    nombreEstado: 'Terminado',
    color: '#84B6F4',
    keyEstado: Estado.Terminado,
  });
  await terminado.save();

  let correcciones: IEstado = new EstadosModel({
    nombreEstado: 'Correcciones',
    color: '#CC0000',
    keyEstado: Estado.Correcciones,
  });
  await correcciones.save();

  let aprobado: IEstado = new EstadosModel({
    nombreEstado: 'Aprobado',
    color: '#95FAB9',
    keyEstado: Estado.Aprobado,
  });
  await aprobado.save();

  let publicado: IEstado = new EstadosModel({
    nombreEstado: 'Publicado',
    color: '#FFCC99',
    keyEstado: Estado.Publicado,
  });
  await publicado.save();

  let descargado: IEstado = new EstadosModel({
    nombreEstado: 'Descargado',
    color: '#669933',
    keyEstado: Estado.Descargado,
  });
  await descargado.save();
};

let inicializarPrioridades = async () => {
  let urgente: IPrioridad = new PrioridadModel({
    keyPrioridad: Prioridad.Urgente,
    color: '#FF0000',
    nombrePrioridad: 'Urgente',
  });
  await urgente.save();

  let alta: IPrioridad = new PrioridadModel({
    keyPrioridad: Prioridad.Alta,
    color: '#FFFF00',
    nombrePrioridad: 'Alta',
  });
  await alta.save();

  let media: IPrioridad = new PrioridadModel({
    keyPrioridad: Prioridad.Media,
    color: '#0000FF',
    nombrePrioridad: 'Media',
  });
  await media.save();

  let baja: IPrioridad = new PrioridadModel({
    keyPrioridad: Prioridad.Baja,
    color: '#11B011',
    nombrePrioridad: 'Baja',
  });
  await baja.save();
};

let inicializarTipoCategorias = async () => {
  let figuraPublica: ITipoCategoria = new TipoCategoriaModel({
    keyTipoCategoria: Tipo_Categoria.FiguraPublica,
    nombreTipoCategoria: 'Figura Publica',
  });
  await figuraPublica.save();

  let comunicacionInstitucional: ITipoCategoria = new TipoCategoriaModel({
    keyTipoCategoria: Tipo_Categoria.ComunicacionInstitucional,
    nombreTipoCategoria: 'Comunicacion Institucional',
  });
  await comunicacionInstitucional.save();

  let comunicacionPolitica: ITipoCategoria = new TipoCategoriaModel({
    keyTipoCategoria: Tipo_Categoria.ComunicacionPolitica,
    nombreTipoCategoria: 'Comunicacion Politica',
  });
  await comunicacionPolitica.save();
};

let inicializarRol = async () => {
  let administrador: IRol = new RolModel({
    nombreRol: 'Administrador',
    keyRol: 1,
  });
  await administrador.save();

  let prensa: IRol = new RolModel({
    nombreRol: 'Prensa',
    keyRol: 2,
  });
  await prensa.save();

  let productor: IRol = new RolModel({
    nombreRol: 'Productor',
    keyRol: 3,
  });
  await productor.save();

  let medios: IRol = new RolModel({
    nombreRol: 'Medios',
    keyRol: 4,
  });
  await medios.save();
};

let inicializarCategorias = async () => {
  let ambiente: ICategoria = new CategoriaModel({
    nombreCategoria: 'Secretaría de Ambiente y Desarrollo Sustentable',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#7DCEA0',
    keyCategoria: 1,
  });
  await ambiente.save();

  let seciti: ICategoria = new CategoriaModel({
    nombreCategoria: 'Secretaría de Ciencia, Tecnología e Innovación',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#7FB3D5',
    keyCategoria: 2,
  });
  await seciti.save();

  let deportes: ICategoria = new CategoriaModel({
    nombreCategoria: 'Secretaría de Deportes',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#F7DC6F',
    keyCategoria: 3,
  });
  await deportes.save();

  let seguridad: ICategoria = new CategoriaModel({
    nombreCategoria: 'Secretaría de Estado de Seguridad y Orden Público',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#CD6155',
    keyCategoria: 4,
  });
  await seguridad.save();

  let sgg: ICategoria = new CategoriaModel({
    nombreCategoria: 'Secretaría General de la Gobernación',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#F1948A',
    keyCategoria: 5,
  });
  await sgg.save();

  let desarrollo: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Desarrollo Humano y Promoción Social',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#F5CBA7',
    keyCategoria: 6,
  });
  await desarrollo.save();

  let educacion: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Educación',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#AED6F1',
    keyCategoria: 7,
  });
  await educacion.save();

  let hacienda: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Hacienda y Finanzas',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#CC6633',
    keyCategoria: 8,
  });
  await hacienda.save();

  let mingob: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Gobierno',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#D98880',
    keyCategoria: 9,
  });
  await mingob.save();

  let mineria: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Minería',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#E59866',
    keyCategoria: 10,
  });
  await mineria.save();

  let obras: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Obras y Servicios Publicos',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#F9E79F',
    keyCategoria: 11,
  });
  await obras.save();

  let produccion: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Producción y Desarrollo Económico',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#AEB6BF',
    keyCategoria: 12,
  });
  await produccion.save();

  let salud: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Salud Publica',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#52BE80',
    keyCategoria: 13,
  });
  await salud.save();

  let turismo: ICategoria = new CategoriaModel({
    nombreCategoria: 'Ministerio de Turismo y Cultura',
    tipoCategoriaId: Tipo_Categoria.ComunicacionInstitucional,
    color: '#D2B4DE',
    keyCategoria: 14,
  });
  await turismo.save();

  let su: ICategoria = new CategoriaModel({
    nombreCategoria: 'Sergio Uñac',
    tipoCategoriaId: Tipo_Categoria.FiguraPublica,
    color: '#5499C7',
    keyCategoria: 15,
  });
  await su.save();

  let lr: ICategoria = new CategoriaModel({
    nombreCategoria: 'Luis Rueda',
    tipoCategoriaId: Tipo_Categoria.FiguraPublica,
    color: '#45B39D',
    keyCategoria: 16,
  });
  await lr.save();

  let fa: ICategoria = new CategoriaModel({
    nombreCategoria: 'Fabiola Aubone',
    tipoCategoriaId: Tipo_Categoria.FiguraPublica,
    color: '#EC7063',
    keyCategoria: 17,
  });
  await fa.save();

  let ml: ICategoria = new CategoriaModel({
    nombreCategoria: 'Marisa Lopez',
    tipoCategoriaId: Tipo_Categoria.FiguraPublica,
    color: '#AF7AC5',
    keyCategoria: 18,
  });
  await ml.save();

  let mmujeres: ICategoria = new CategoriaModel({
    nombreCategoria: 'Mesa de mujeres',
    tipoCategoriaId: Tipo_Categoria.ComunicacionPolitica,
    color: '#F06292',
    keyCategoria: 19,
  });
  await mmujeres.save();

  let jp: ICategoria = new CategoriaModel({
    nombreCategoria: 'Juventud Peronista',
    tipoCategoriaId: Tipo_Categoria.ComunicacionPolitica,
    color: '#4FC3F7',
    keyCategoria: 20,
  });
  await jp.save();

  let camp: ICategoria = new CategoriaModel({
    nombreCategoria: 'Campaña Electoral',
    tipoCategoriaId: Tipo_Categoria.ComunicacionPolitica,
    color: '#FFC107',
    keyCategoria: 21,
  });
  await camp.save();
};

let inicializarUsuarios = async () => {
  const cifrar = new CodifClaves();

  const productor1: IUsuario = new Usuario_Models({
    nombre: 'Productor',
    apellido: 'Uno',
    email: 'productor1@lowa.com',
    nombreUsuario: 'productor1@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456780',
    rolId: '3',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  productor1.password = cifrar.HashClave('0000');
  productor1.save().then(() => {
    barra.increment();
    barra.update(56);
  });

  const productor2: IUsuario = new Usuario_Models({
    nombre: 'Productor',
    apellido: 'Dos',
    email: 'productor2@lowa.com',
    nombreUsuario: 'productor2@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456781',
    rolId: '3',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  productor2.password = cifrar.HashClave('0000');
  productor2.save().then(() => {
    barra.increment();
    barra.update(57);
  });

  const productor3: IUsuario = new Usuario_Models({
    nombre: 'Productor',
    apellido: 'Tres',
    email: 'productor3@lowa.com',
    nombreUsuario: 'productor3@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456782',
    rolId: '3',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  productor3.password = cifrar.HashClave('0000');
  productor3.save().then(() => {
    barra.increment();
    barra.update(58);
  });

  const prensa: IUsuario = new Usuario_Models({
    nombre: 'Prensa',
    apellido: 'Uno',
    email: 'prensa@lowa.com',
    nombreUsuario: 'prensa@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456783',
    rolId: '2',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  prensa.password = cifrar.HashClave('0000');
  prensa.save().then(() => {
    barra.increment();
    barra.update(59);
  });

  const medios1: IUsuario = new Usuario_Models({
    nombre: 'Medios',
    apellido: 'Uno',
    email: 'medios1@lowa.com',
    nombreUsuario: 'medios1@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456784',
    rolId: '4',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  medios1.password = cifrar.HashClave('0000');
  medios1.save().then(() => {
    barra.increment();
    barra.update(60);
  });

  const medios2: IUsuario = new Usuario_Models({
    nombre: 'Medios',
    apellido: 'Dos',
    email: 'medios2@lowa.com',
    nombreUsuario: 'medios2@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456785',
    rolId: '4',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  medios2.password = cifrar.HashClave('0000');
  medios2.save().then(() => {
    barra.increment();
    barra.update(61);
  });

  const administrador1: IUsuario = new Usuario_Models({
    nombre: 'Administrador',
    apellido: 'Uno',
    email: 'administrador1@lowa.com',
    nombreUsuario: 'administrador1@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456786',
    rolId: '1',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  administrador1.password = cifrar.HashClave('0000');
  administrador1.save().then(() => {
    barra.increment();
    barra.update(62);
  });

  const administrador2: IUsuario = new Usuario_Models({
    nombre: 'Administrador',
    apellido: 'Dos',
    email: 'administrador2@lowa.com',
    nombreUsuario: 'administrador2@lowa.com',
    isActivado: true,
    password: '0000',
    cuit: '20123456787',
    rolId: '1',
    documentacionAdjunta: {
      docAfip: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docRentas: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docProveedorEstado: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
      docConstanciaPublicacion: {
        nombre: '',
        usuario: '',
        tipoDocumento: 0,
        idDrive: '',
        tipo: '',
        tamanio: 0,
        linkDeDescarga: '',
        linkDeVistaWeb: '',
      },
    },
  });
  administrador2.password = cifrar.HashClave('0000');
  administrador2.save().then(() => {
    barra.increment();
    barra.update(63);
  });
};

let inicializarSoportes = async () => {
  let grafica: ISoporte = new SoportesModel({
    nombre: 'Gráfica',
    keySoporte: Soportes.Grafica,
  });
  await grafica.save();

  let television: ISoporte = new SoportesModel({
    nombre: 'Televisión',
    keySoporte: Soportes.Television,
  });
  await television.save();

  let radio: ISoporte = new SoportesModel({
    nombre: 'Radio',
    keySoporte: Soportes.Radio,
  });
  await radio.save();

  let viaPublica: ISoporte = new SoportesModel({
    nombre: 'Vía Pública',
    keySoporte: Soportes.Via_Publica,
  });
  await viaPublica.save();

  let VPLED: ISoporte = new SoportesModel({
    nombre: 'VP LED',
    keySoporte: Soportes.VP_LED,
  });
  await VPLED.save();

  let web: ISoporte = new SoportesModel({
    nombre: 'Web',
    keySoporte: Soportes.Web,
  });
  await web.save();

  let redesSociales: ISoporte = new SoportesModel({
    nombre: 'Redes Sociales',
    keySoporte: Soportes.Redes_Sociales,
  });
  await redesSociales.save();
};

//Proceso de instalacion

export const instalarBD = async () => {
  try {
    //inicializacion de barra
    barra.start(100, 0, {
      progreso: 'N/A',
    });
    await inicializarTipoCategorias();
    barra.increment();
    barra.update(10, {
      progreso: 'Tipo categorias',
    });
    await inicializarPrioridades();
    barra.increment();
    barra.update(25, {
      progreso: 'Prioridades',
    });
    await inicializarEstados();
    barra.increment();
    barra.update(55, {
      progreso: 'Estados',
    });
    await inicializarUsuarios();
    barra.increment();
    barra.update(65, {
      progreso: 'Usuarios',
    });
    await inicializarRol();
    barra.increment();
    barra.update(74, {
      progreso: 'Roles',
    });
    await inicializarSoportes();
    barra.increment();
    barra.update(90, {
      progreso: 'Soportes',
    });
    await inicializarCategorias();
    barra.increment();
    barra.update(100, {
      progreso: 'Categorias',
    });
    barra.stop();
    console.log('instalacion finalizada');
    return 'Instalacion finalizada';
  } catch (error) {
    console.log('Ocurrio un error: ' + error);
    return 'Ocurrio un error';
  }
};
