const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Conferencia = require('../models/Conferencia');
const Usuario = require('../models/Usuario');

const formidable = require('formidable');
const path = require('path');
const fs = require('fs')

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

        const user =  await Usuario.findById( uid );
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
                        { 
                            _id: { $in: user.conferencias || [] } 
                        }
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
    
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const user =  await Usuario.findById( uid );

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
                        { 
                            _id: { $nin: user.conferencias || [] } 
                        }
                    ]
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
    const form = formidable({ multiples: true, keepExtensions: true });
    
    form.uploadDir = path.join(__dirname, "..", "..", "public", "conferencias");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        let pathUrl = ''
        if ( files.archivo ) {
            console.log(files.archivo);
            pathUrl = `${ process.env.URL }/conferencias/${ files.archivo.newFilename }`
        }

        try {
        
            const body = {...fields }
            
            if ( pathUrl )
                body.archivo = pathUrl

            const conferencia = await Conferencia.findByIdAndUpdate( fields.id, body);

            return res.status(201).json({
                ok: true,
                conferencia
            })
    
        } catch(error) {
            return res.status(500).json({
                ok: false,
                msg: 'create: Internal Error'
            })
        }
        
    });
}

const remove = async(req, res = express.response) => {
    const { uid } = req;

    try {
        const conferencia = await Conferencia.findByIdAndDelete(req.params.id);
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        const existe = await fs.existsSync(conferencia.archivo)
        if ( existe ) {
            fs.unlink( conferencia.archivo, (error) => {
                if ( error ) {
                    console.log( 'Error eliminando', conferencia.archivo )
                }
            });
        } else {
            console.log( 'Imagen no existe', conferencia.archivo )
        }

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $pull: {"conferencias": conferencia.id }
            }
        );
        
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

const subscribe = async (req, res = express.response) => {
    const { uid } = req;

    try {
        const conferencia = await Conferencia.findById(req.params.id);
        
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"conferencias": conferencia.id }
            }
        );

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

module.exports = {
    create,
    update,
    find,
    list,
    myList,
    remove,
    subscribe
}