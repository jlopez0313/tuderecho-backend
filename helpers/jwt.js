const jwt = require('jsonwebtoken');

const generarJWT = (uid, name, rol) => {
    return new Promise( (resolve, reject) => {
        const payload = {uid, name, rol}
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (error, token) => {
            if ( error ) {
                console.log( error );
                reject('No se pudo generar el token');
            }
            resolve(token);
        })
    })
}

module.exports = { generarJWT }