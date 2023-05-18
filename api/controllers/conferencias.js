const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Conferencia = require('../models/Conferencia');
const formidable = require('formidable');
const path = require('path');

const create = async (req, res = express.response) => {

    const form = formidable({ multiples: true, keepExtensions: true });
    form.uploadDir = path.join(__dirname, "..", "..", "public", "conferencias");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        const pathUrl = `${ process.env.URL }/conferencias/${ files.archivo.newFilename }`

        const conferencia = new Conferencia( {...fields, archivo: pathUrl } );

        try {
        
            const saved = await conferencia.save();
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
    const conferencia = new Conferencia( req.body );
    try {
        
        const saved = await conferencia.save();
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

    */
}

const myList = async(req, res = express.response) => {
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const conferencias = await Conferencia.find(
                { 
                    
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            conferencista: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            fecha: {$regex: `.*${filter}.*`, $options: 'i'}
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
            conferencias
        })

    } catch(error) {
        console.log( error )

        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    } 
}

const list = async(req, res = express.response) => {
    const filter = req.params?.search || '';

    try {
        const conferencias = await Conferencia.find(
                {
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            conferencista: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            fecha: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            objetivo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                }
            )
            .sort( { updatedAt: -1 } )

        return res.status(200).json({
            ok: true,
            conferencias
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const find = async(req, res = express.response) => {
    try {
        const conferencia = await Conferencia.findById(req.params.id);
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,                
                msg: 'La conferencia no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            conferencia
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
        const conferencia = await Conferencia.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            conferencia
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
        const conferencia = await Conferencia.findByIdAndDelete(req.params.id);
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            conferencia
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