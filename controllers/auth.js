const express = require('express');
const bcrypt = require('bcryptjs');
const {getMyModel} = require('../models/Usuario');
const {getMyModel: getPerfilModel} = require('../models/Perfil');

const { generarJWT } = require('../helpers/jwt');
const { sendEmail } = require('../helpers/mailer');

const crearUsuario = async (req, res = express.response) => {
    const {tenant} = req;
    const {name, email, password, provider} = req.body;
    
    try {
        const Usuario = await getMyModel(tenant);
        let usuario = await Usuario.findOne({email});

        if ( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya se encuentra registrado'
            })
        }

        usuario = new Usuario({...req.body, pts: 5});
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        await usuario.save();

        const Perfil = await getPerfilModel(tenant);
        let perfil = new Perfil({ user: usuario.id })
        await perfil.save();

        const token = await( generarJWT( usuario.id, usuario.name, usuario.rol, usuario.perfil?.photo ) );

        if ( provider === 'GMAIL' ) {
            sendEmail(email, 'Bienvenido!', 'Mensaje de bienvenida a Tu Derecho!')
        }

        return res.status(201).json({
            ok: true,
            usuario,
            token
        })
    } catch(error) {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: 'crearUsuario: Internal Error'
        })
    }    
}

const loginUsuario = async(req, res = express.response) => {
    const {tenant} = req;
    const {email, password} = req.body;
    try {
        const Perfil = await getPerfilModel(tenant);

        const Usuario = await getMyModel(tenant);
        const usuario = await Usuario.findOne({email})
            .populate({
                path: 'perfil',
                model: Perfil
            });

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
                msg: 'El password no es valido'
            })
        }

        await Usuario.findByIdAndUpdate( usuario.id, { isLogged: true } )

        const token = await( generarJWT( usuario.id, usuario.name, usuario.rol, usuario.perfil?.photo ) );
        
        return res.status(200).json({
            ok: true,
            usuario,
            token
        })

    } catch(error) {
        console.log( error )
        res.status(500).json({
            ok: false,
            msg: 'loginUsuario: Internal Error'
        })
    }   
}

const revalidarToken = async (req, res = express.response) => {
    const {uid, name, rol, photo} = req;

    const token = await( generarJWT( uid, name, rol, photo ) );

    res.status(200).json({
        ok: true,
        token
    })
}

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}