const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Comentario = require('../models/Comentario');

const create = async (req, res = express.request) => {
    const comentario = new Comentario( req.body );
    try {

        const saved = await comentario.save();
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
        const comentarios = await Comentario.find();

        return res.status(200).json({
            ok: true,
            comentarios
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
        const comentario = await Comentario.findById(req.params.id);
        if ( !comentario) {
            return res.status(404).json({
                ok: false,
                msg: 'El Comentario no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comentario
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.request) => {
    const { name } = req.body;

    try {
        const comentario = await Comentario.findByIdAndUpdate(
            req.params.id,
            {
                name,
                updated_at:Date.now()
            },
            { 
                new: true
            }
        );

        if ( !comentario) {
            return res.status(404).json({
                ok: false,
                msg: 'El Comentario no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comentario
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const remove = async(req, res = express.request) => {
    try {
        const comentario = await Comentario.findByIdAndDelete(req.params.id);
        if ( !comentario) {
            return res.status(404).json({
                ok: false,
            })    
        }

        return res.status(200).json({
            ok: true,
            comentario
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'remove: Internal Error'
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