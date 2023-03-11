const express = require('express');
const { sendEmail } = require('../helpers/mailer');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require('../models/Usuario');
const Perfil = require('../models/Perfil');
const base64Img = require('base64-img');
const bcrypt = require('bcryptjs');
const fs = require('fs')

const recovery = async (req, res = express.request) => {
    const {email} = req.body;
    try {

        let usuario = await Usuario.findOne({email});

        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo no se encuentra registrado'
            })
        }

        sendEmail(email, 'Olvidaste tu contraseña!', 'Bla bla bla...')
        return res.status(201).json({
            ok: true,
            msg: 'Email sent !!'
        })

    } catch(error) {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: 'recovery: Internal Error'
        })
    }  
}

const passwords = async (req, res = express.request) => {
    const {password, password1, email} = req.body;
    try {

        let usuario = await Usuario.findOne({email});

        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo no se encuentra registrado'
            })
        }

        const passwowrdValid = bcrypt.compareSync(password, usuario.password);
        if ( !passwowrdValid ) {
            return res.status(400).json({
                ok: false,
                msg: 'El password actual no es valido'
            })
        }

        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password1, salt);
        await usuario.save();

        sendEmail(email, 'Tu contraseña ha cambiado!', 'Tu cambio de contraseña fue satisfactorio!')
        
        return res.status(201).json({
            ok: true,
            msg: 'Tu cambio de contraseña fue satisfactorio'
        })

    } catch(error) {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: 'passwords: Internal Error'
        })
    }    
}

const create = async (req, res = express.request) => {
    const { name } = req.body;
    const usuario = new Usuario( req.body );
    try {
        
        let existe = await Usuario.findOne({name});
        console.log('existe', existe)

        if ( existe ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya se encuentra registrado'
            })
        }

        const saved = await usuario.save();
        return res.status(201).json({
            ok: true,
            saved
        })

    } catch(error) {
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    }    
}

const list = async(req, res = express.request) => {
    try {
        const usuarios = await Usuario.find();

        return res.status(200).json({
            ok: true,
            usuarios
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const find = async(req, res = express.request) => {
    try {
        const usuario = await Usuario.findById(req.params.id).populate('perfil').lean();
        if ( !usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario no existe'
            })    
        }

        if ( usuario.perfil ) {
            usuario.perfil.oldImage = usuario.perfil.photo;            
        }

        return res.status(200).json({
            ok: true,
            usuario
        })

    } catch(error) {
        console.log('Error', error);
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.request) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id, 
            {
                ...req.body,
                updated_at:Date.now()
            }
        );

        if ( !usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'update: El usuario no existe'
            })    
        }

        const {
            photo,
            oldImage
        } = req.body.perfil;

        let imageUrl = oldImage;

        if ( oldImage !== photo ) {
            imageUrl = await uploadFile( photo, oldImage );
        }
        
        let perfil = await Perfil.findOneAndUpdate(
            { 
                user: req.params.id 
            },
            { 
                ...req.body.perfil,
                photo: imageUrl,
                updated_at: Date.now()
            },
            { new: true }
        )
        
        if ( !perfil) {
            perfil = new Perfil({ 
                user: req.params.id,
                ...req.body.perfil,
                photo: imageUrl
            })

            perfil = await perfil.save();
        }

        usuario.perfil = {...perfil};
        usuario.perfil.oldImage = imageUrl
        
        return res.status(200).json({
            ok: true,
            usuario
        })

    } catch(error) {
        console.log( 'error', error )
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const remove = async(req, res = express.request) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if ( !usuario) {
            return res.status(404).json({
                ok: false,
            })    
        }

        return res.status(200).json({
            ok: true,
            usuario
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'remove: Internal Error'
        })
    } 
}

const uploadFile = ( strImage, oldImage ) => {  
    return new Promise( async (resolve, reject) => {
        const folderPath = './public';
        try {            
            if (oldImage)  {
                const erasingImage = oldImage?.split('/').pop()            
                const existe = await fs.existsSync(`${folderPath}/${erasingImage}`)
                if ( existe ) {
                    fs.unlink( `${folderPath}/${erasingImage}`, (error) => {
                        if ( error ) {
                            console.log( 'Error eliminando', `${folderPath}/${erasingImage}` )
                            throw new Error('Error eliminando');
                        }
                    });
                } else {
                    console.log( 'Imagen no existe', `${folderPath}/${erasingImage}` )
                    throw new Error('No existe la imagen');
                }
            }
        } catch( err ) {
            console.log( 'No existe la imagen', oldImage, err );
        } finally {
            try {
                uploadBase64(strImage, resolve, reject)
            } catch(err) {
                resolve(strImage)
            }
        }
    })

}

const uploadBase64 = (strImage, resolve, reject) => {
    base64Img.img(strImage, './public', Date.now(), function(err, path) {
        if (err ){
            console.log('error', error)
            reject( err )
        }
        const fileName = path.split('/').pop().split('\\').pop();
        resolve(`${process.env.URL}/${fileName}`);
    })
}

const uploadfromUrl = (photoUrl, resolve, reject) => {
    base64Img.requestBase64(photoUrl, function(error, res, body) {
        if ( error ) {
            console.log('error', error)
            reject( err )
        }

        resolve(body);
    })
}

module.exports = {
    recovery,
    passwords,
    create,
    update,
    find,
    list,
    remove
}