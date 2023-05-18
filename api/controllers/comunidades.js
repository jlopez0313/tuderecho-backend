const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Comunidad = require('../models/Comunidad');
const formidable = require('formidable');
const path = require('path');

const create = async (req, res = express.response) => {

    const form = formidable({ multiples: true, keepExtensions: true });
    form.uploadDir = path.join(__dirname, "..", "..", "public", "comunidades");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        const pathUrl = `${ process.env.URL }/comunidades/${ files.archivo.newFilename }`

        const comunidad = new Comunidad( {...fields, archivo: pathUrl } );

        try {
        
            const saved = await comunidad.save();
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
        
    });
    
    /*
    const comunidad = new Comunidad( req.body );
    try {
        
        const saved = await comunidad.save();
        return res.status(201).json({
            ok: true,
            saved
        })

    } catch(error) {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    }
    */
}

const myList = async(req, res = express.response) => {
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const comunidades = await Comunidad.find(
                { 
                    
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            objetivo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                    $and: [
                        { user: uid }
                    ]
                }
            )
            .sort( { updatedAt: -1 } )

        return res.status(200).json({
            ok: true,
            comunidades
        })

    } catch(error) {
        console.log( error )

        res.status(500).json({
            ok: false,
            msg: 'myList: Internal Error'
        })
    }   
}

const list = async(req, res = express.response) => {
    const filter = req.params?.search || '';

    try {
        const comunidades = await Comunidad.find(
                {
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            objetivo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ]
                }
            )
            .sort( { updatedAt: -1 } )

        return res.status(200).json({
            ok: true,
            comunidades
        })

    } catch(error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const find = async(req, res = express.response) => {
    try {
        const comunidad = await Comunidad.findById(req.params.id);
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,                
                msg: 'La comunidad no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comunidad
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.response) => {
    const { name } = req.body;

    try {
        const comunidad = await Comunidad.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,
                message: 'La comunidad no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comunidad
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const remove = async(req, res = express.response) => {
    try {
        const comunidad = await Comunidad.findByIdAndDelete(req.params.id);
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,
                message: 'La comunidad no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comunidad
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
    myList,
    remove
}