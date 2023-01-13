const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async (req, res = express.request) => {
    const {name, email, password} = req.body;
    try {

        let usuario = await Usuario.findOne({email});

        if ( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya se encuentra registrado'
            })
        }

        usuario = new Usuario(req.body);
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        await usuario.save();

        return res.status(201).json({
            ok: true,
            usuario
        })
    } catch(error) {
        return res.status(500).json({
            ok: false,
            message: 'Internal Error'
        })
    }    
}

const loginUsuario = async(req, res = express.request) => {
    const {email, password} = req.body;
    try {

        const usuario = await Usuario.findOne({email});
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

        const token = await( generarJWT( usuario.distinct, usuario.name ) );
        console.log('first')

        return res.status(200).json({
            ok: true,
            usuario,
            token
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            message: 'Internal Error'
        })
    }   
}

const revalidarToken = async (req, res = express.request) => {
    const {uid, name} = req;

    const token = await( generarJWT( uid, name ) );

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