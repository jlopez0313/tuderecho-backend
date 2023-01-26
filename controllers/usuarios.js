const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Perfil = require('../models/Perfil');
const Usuario = require('../models/Usuario');
const base64Img = require('base64-img');
const { unlink } = require('fs/promises');

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
            message: 'Internal Error'
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
            message: 'Internal Error'
        })
    }   
}

const find = async(req, res = express.request) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if ( !usuario) {
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
            })    
        }

        const perfil = await Perfil.findOne({ user: usuario.id }).populate('tags', 'name');
        let oldImage = '';
        if ( perfil ) {
            oldImage = perfil.photo
            if ( usuario.provider === 'WEB' ) {
                perfil.photo = `${process.env.URL}/${perfil.photo}`
            }
        }

        return res.status(200).json({
            ok: true,
            usuario,
            perfil,
            oldImage
        })

    } catch(error) {
        console.log('Error', error);
        res.status(500).json({
            ok: false,
            message: 'Internal Error'
        })
    }   
}

const update = async (req, res = express.request) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body);
        if ( !usuario) {
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
            })    
        }

        const {
            photo,
            oldImage
        } = req.body;

        let imageUrl = oldImage;

        if ( `${process.env.URL}/${oldImage}` !== photo ) {
            imageUrl = await uploadFile( photo, oldImage );
        }
        
        let perfil = await Perfil.findOneAndUpdate(
            { 
                user: req.params.id 
            },
            { 
                ...req.body,
                photo: imageUrl,
            },
            { new: true }
        )
        
        if ( !perfil) {
            perfil = new Perfil({ 
                user: req.params.id,
                ...req.body,
                photo: imageUrl,
            })

            perfil = await perfil.save();
        }

        perfil.photo = `${process.env.URL}/${perfil.photo}`

        return res.status(200).json({
            ok: true,
            usuario,
            perfil,
            oldImage: imageUrl
        })

    } catch(error) {
        console.log( 'error', error )
        res.status(500).json({
            ok: false,
            message: 'Internal Error'
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
            message: 'Internal Error'
        })
    } 
}

const uploadFile = ( strImage, oldImage ) => {
    return new Promise( async (resolve, reject) => {
        const folderPath = './public';
        try {
            await oldImage && unlink( `${folderPath}/${oldImage}` );
        } catch( err ) {
            console.log( err );
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
        resolve(fileName);
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
    create,
    update,
    find,
    list,
    remove
}