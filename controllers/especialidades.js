const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Especialidad = require('../models/Especialidad');

const create = async (req, res = express.request) => {
    const { name } = req.body;
    const especialidad = new Especialidad( req.body );
    try {
        
        let existe = await Especialidad.findOne({name});
        console.log('existe', existe)

        if ( existe ) {
            return res.status(400).json({
                ok: false,
                msg: 'La Especialidad ya se encuentra registrada'
            })
        }

        const saved = await especialidad.save();
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
        const especialidades = await Especialidad.find();

        return res.status(200).json({
            ok: true,
            especialidades
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
        const especialidad = await Especialidad.findById(req.params.id);
        if ( !especialidad) {
            return res.status(404).json({
                ok: false,
                msg: 'La Especialidad no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            especialidad
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
        const especialidad = await Especialidad.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !especialidad) {
            return res.status(404).json({
                ok: false,
                msg: 'La Especialidad no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            especialidad
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
        const especialidad = await Especialidad.findByIdAndDelete(req.params.id);
        if ( !especialidad) {
            return res.status(404).json({
                ok: false,
            })    
        }

        return res.status(200).json({
            ok: true,
            especialidad
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