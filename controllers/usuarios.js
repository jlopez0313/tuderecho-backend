const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require('../models/Usuario');

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

const update = async (req, res = express.request) => {
    const { name } = req.body;

    try {
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, {name});
        if ( !usuario) {
            return res.status(404).json({
                ok: false,
                message: 'El usuario no existe'
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

module.exports = {
    create,
    update,
    find,
    list,
    remove
}