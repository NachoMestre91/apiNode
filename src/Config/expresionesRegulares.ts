//Modulo de Implementacion de expresiones regulares

export const REGEXPASSWORD = new RegExp('^([a-zA-Z0-9]){8,16}$');

//Verifica que sea correo valido
export const REGEXEMAIL = new RegExp('^([a-z0-9-_.])+@([a-z])+.+([a-z]+).?([a-z]+)?$');

// Verifica que tenga minusculas,mayusculas y digitos
export const REGEXHASH = new RegExp('^[a-zA-Z0-9]+$');

// Verifica que sea un cuit solo numeros y extrictamente 11 digitos
export const REGEXCUIT = new RegExp('/^([0-9]){11}$/');

// Verifica que sea un usuario que contenga letras, numeros y solo los caracteres especiales (- y _)
export const REGEXUSER = new RegExp('/^([a-zA-Z0-9-])+$/');
