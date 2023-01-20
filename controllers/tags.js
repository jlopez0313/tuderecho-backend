const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Tag = require('../models/Tag');

const create = async (req, res = express.request) => {
    const { name } = req.body;
    const tag = new Tag( req.body );
    try {
        
        let existe = await Tag.findOne({name});
        console.log('existe', existe)

        if ( existe ) {
            return res.status(400).json({
                ok: false,
                msg: 'La etiqueta ya se encuentra registrada'
            })
        }

        const saved = await tag.save();
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
        const tags = await Tag.find();

        return res.status(200).json({
            ok: true,
            tags
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
        const tag = await Tag.findById(req.params.id);
        if ( !tag) {
            return res.status(404).json({
                ok: false,
            })    
        }

        return res.status(200).json({
            ok: true,
            tag
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
        const tag = await Tag.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !tag) {
            return res.status(404).json({
                ok: false,
                message: 'La etiqueta no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tag
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
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if ( !tag) {
            return res.status(404).json({
                ok: false,
                message: 'La etiqueta no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tag
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