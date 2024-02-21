const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const {getMyModel: getConferenciaModel} = require('../models/Conferencia');
const {getMyModel: getUsuarioModel} = require('../models/Usuario');
const { closeConnection } = require('../database/config');

const formidable = require('formidable');
const path = require('path');
const fs = require('fs')

const { createMeeting } = require('../helpers/zoom');
const { uploadFile, removeFile } = require('../helpers/files');

const create = async (req, res = express.response) => {
    const {uid, tenant} = req;

    // const form = formidable({ multiples: true, keepExtensions: true });
    // form.uploadDir = path.join(__dirname, "..", "public", "conferencias");

    const {fields, files} = req;
    const pathUrl = await uploadFile( files.archivo.path, files.archivo.type, 'public/conferencias/')

    const meeting = await createMeeting('me', fields.access_token, res);

    const Conferencia = await getConferenciaModel( tenant )
    const conferencia = new Conferencia( {...fields, url: meeting.join_url, archivo: pathUrl } );

    try {
    
        const saved = await conferencia.save();

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"conferencias": saved.id }
            }
        );

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
        

    /*
    const conferencia = new Conferencia( req.fields );
    try {
        
        const saved = await conferencia.save();

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

    */
}

const madeBy = async(req, res = express.response) => {
    const { tenant } = req
    
    try {
        const Conferencia = await getConferenciaModel( tenant )
        const conferencias = await Conferencia.find({ user: req.params.id })

        closeConnection();

        return res.status(200).json({
            ok: true,
            conferencias
        })

    } catch(error) {
        console.log( error )

        res.status(500).json({
            ok: false,
            msg: 'myList: Internal Error'
        })
    }   
}

const madeByMe = async(req, res = express.response) => {
    const { uid, tenant } = req
    
    try {
        const Conferencia = await getConferenciaModel( tenant )
        const conferencias = await Conferencia.find({ user: uid })

        closeConnection();

        return res.status(200).json({
            ok: true,
            conferencias
        })

    } catch(error) {
        console.log( error )

        res.status(500).json({
            ok: false,
            msg: 'myList: Internal Error'
        })
    }   
}

const myList = async(req, res = express.response) => {
    const { uid, tenant } = req
    const filter = req.params?.search || '';

    try {

        const limit = req.query.limit;
        const page = req.query.page - 1

        const Usuario = await getUsuarioModel( tenant )
        const user =  await Usuario.findById( uid );
        
        const Conferencia = await getConferenciaModel( tenant )
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
                            objetivo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                    $and: [
                        { 
                            _id: { $in: user.conferencias || [] },
                        },
                        {
                            fecha: { $gt: new Date() }
                        }
                    ]
                }
            )
            .sort( { updatedAt: -1 } )
            .skip(limit * page)
            .limit(limit)

        closeConnection();

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

    const { uid, tenant } = req
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1

        const Usuario = await getUsuarioModel( tenant )
        const user =  await Usuario.findById( uid );

        const Conferencia = await getConferenciaModel( tenant )
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
                            objetivo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                    $and: [
                        { 
                            _id: { $nin: user.conferencias || [] },
                        },
                        {
                            fecha: { $gt: new Date() }
                        }
                    ]
                }
            )
            .sort( { updatedAt: -1 } )
            .skip(limit * page)
            .limit(limit)

        closeConnection();

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
    const { tenant } = req
    
    try {
        const Usuario = await getUsuarioModel( tenant )

        const Conferencia = await getConferenciaModel( tenant )
        const conferencia = await Conferencia.findById(req.params.id)
        .populate({
            path: 'usuarios',
            model: Usuario,
            select: 'name'
        });

        if ( !conferencia) {
            return res.status(404).json({
                ok: false,                
                msg: 'La conferencia no existe'
            })    
        }

        closeConnection();

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
    const { tenant } = req
    const {fields, files} = req;

    // const form = formidable({ multiples: true, keepExtensions: true });
    // form.uploadDir = path.join(__dirname, "..", "public", "conferencias");
    
    let pathUrl = ''
    if ( files.archivo ) {
        pathUrl = await uploadFile( files.files.path, files.files.type, 'public/conferencias/')
    }

    try {
    
        delete fields.usuarios;
        
        const body = {...fields }
        
        if ( pathUrl )
            body.archivo = pathUrl


        const Conferencia = await getConferenciaModel( tenant )
        const conferencia = await Conferencia.findByIdAndUpdate( fields.id, body);

        closeConnection();

        return res.status(201).json({
            ok: true,
            conferencia
        })

    } catch(error) {
        console.log( error );
        return res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    }    
}

const remove = async(req, res = express.response) => {
    const { uid, tenant } = req

    try {

        const Conferencia = await getConferenciaModel( tenant )
        const conferencia = await Conferencia.findByIdAndDelete(req.params.id);
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        await removeFile( conferencia.archivo )

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $pull: {"conferencias": conferencia.id }
            }
        );
        
        closeConnection();

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
    const { uid, tenant } = req

    try {
        const Conferencia = await getConferenciaModel( tenant )
        const conferencia = await Conferencia.findByIdAndUpdate(
            req.params.id,
            {
                $push: {"usuarios": uid }
            }
        );
        
        if ( !conferencia) {
            return res.status(404).json({
                ok: false,
                message: 'La conferencia no existe'
            })    
        }

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"conferencias": conferencia.id }
            }
        );

        closeConnection();

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
    madeBy,
    madeByMe,
    myList,
    remove,
    subscribe
}