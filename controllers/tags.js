const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const {getMyModel} = require('../models/Tag');
const { closeConnection } = require('../database/config');

const create = async (req, res = express.response) => {
    const { tenant } = req;
    const { name } = req.body;
    try {
        const Tag = await getMyModel(tenant);
        const tag = new Tag( req.body );
        
        let existe = await Tag.findOne({name});
        console.log('existe', existe)

        if ( existe ) {
            return res.status(400).json({
                ok: false,
                msg: 'La etiqueta ya se encuentra registrada'
            })
        }

        const saved = await tag.save();

        closeConnection();

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

const paginate = async(req, res = express.response) => {
    const { tenant } = req;
    
    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        
        const Tag = await getMyModel(tenant);
        const tags = await Tag.find()
            .sort( { name: 1 } )
            .skip(limit * page)
            .limit(limit);

        const total = await Tag.find().count();
        
        closeConnection();

        return res.status(200).json({
            ok: true,
            tags,
            total
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const list = async(req, res = express.response) => {
    const { tenant } = req;
    
    try {
        const Tag = await getMyModel(tenant);
        const tags = await Tag.find().sort( { name: 1 } );

        closeConnection();

        return res.status(200).json({
            ok: true,
            tags
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const find = async(req, res = express.response) => {
    const { tenant } = req;
    
    try {
        const Tag = await getMyModel(tenant);
        const tag = await Tag.findById(req.params.id);
        if ( !tag) {
            return res.status(404).json({
                ok: false,                
                msg: 'El Tag no existe'
            })    
        }

        closeConnection();

        return res.status(200).json({
            ok: true,
            tag
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.response) => {
    const { tenant } = req;
    const { name } = req.body;

    try {
        const Tag = await getMyModel(tenant);
        const tag = await Tag.findByIdAndUpdate(
            req.params.id,
            {
                name,
            },
            {
                new: true
            }
        );

        if ( !tag) {
            return res.status(404).json({
                ok: false,
                message: 'La etiqueta no existe'
            })    
        }

        closeConnection();

        return res.status(200).json({
            ok: true,
            tag
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const remove = async(req, res = express.response) => {
    const { tenant } = req;
    
    try {
        const Tag = await getMyModel(tenant);
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if ( !tag) {
            return res.status(404).json({
                ok: false,
                message: 'La etiqueta no existe'
            })    
        }

        closeConnection();

        return res.status(200).json({
            ok: true,
            tag
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
    paginate,
    remove
}