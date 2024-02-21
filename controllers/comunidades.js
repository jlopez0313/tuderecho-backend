const express = require('express');
const { generarJWT } = require('../helpers/jwt');

const {getMyModel: getComunidadModel} = require('../models/Comunidad');
const {getMyModel: getUsuarioModel} = require('../models/Usuario');
const { closeConnection } = require('../database/config');


const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { uploadFile, removeFile } = require('../helpers/files');

const create = async (req, res = express.response) => {
    const {uid, tenant} = req;

    // const form = formidable({ multiples: true, keepExtensions: true });
    // form.uploadDir = path.join(__dirname, "..", "public", "comunidades");
    const {fields, files} = req;
    const pathUrl = await uploadFile( files.files.path, files.files.type, 'public/comunidades/')

    const Comunidad = await getComunidadModel(tenant)
    const comunidad = new Comunidad( {...fields, archivo: pathUrl } );

    try {
    
        const saved = await comunidad.save();

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"comunidades": saved.id }
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
    const comunidad = new Comunidad( req.fields );
    try {
        
        const saved = await comunidad.save();
        
        closeConnection();

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

const madeBy = async(req, res = express.response) => {
    const { tenant } = req
    
    try {

        const Comunidad = await getComunidadModel(tenant)
        const comunidades = await Comunidad.find({ user: req.params.id })

        closeConnection();

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

const madeByMe = async(req, res = express.response) => {
    const { uid, tenant } = req
    
    try {

        const Comunidad = await getComunidadModel(tenant)
        const comunidades = await Comunidad.find({ user: uid })

        closeConnection();

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

const myList = async(req, res = express.response) => {    
    const { uid, tenant } = req

    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        
        const Usuario = await getUsuarioModel( tenant )
        const user =  await Usuario.findById( uid );
        
        const Comunidad = await getComunidadModel(tenant)
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
                        { 
                            _id: { $in: user.comunidades || [] } 
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
    const { uid, tenant } = req
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        
        const Usuario = await getUsuarioModel( tenant )
        const user =  await Usuario.findById( uid );

        const Comunidad = await getComunidadModel(tenant)
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
                        { 
                            _id: { $nin: user.comunidades || [] } 
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
    const { tenant } = req
    
    try {
        const Comunidad = await getComunidadModel(tenant)
        const comunidad = await Comunidad.findById(req.params.id);
        
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,                
                msg: 'La comunidad no existe'
            })    
        }

        closeConnection();

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
    const { tenant } = req
    
    // const form = formidable({ multiples: true, keepExtensions: true });
    // form.uploadDir = path.join(__dirname, "..", "public", "comunidades");

    const {fields, files} = req;

    let pathUrl = ''
    if ( files.archivo ) {
        pathUrl = await uploadFile( files.files.path, files.files.type, 'public/comunidades/')
    }

    try {
    
        delete fields.usuarios;

        const body = {...fields }
        
        if ( pathUrl )
            body.archivo = pathUrl            
        
        const Comunidad = await getComunidadModel(tenant)
        const comunidad = await Comunidad.findByIdAndUpdate( fields.id, body);

        closeConnection();

        return res.status(201).json({
            ok: true,
            comunidad
        })

    } catch(error) {
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    }
}

const remove = async(req, res = express.response) => {

    const { uid, tenant } = req

    try {
        const Comunidad = await getComunidadModel(tenant)
        const comunidad = await Comunidad.findByIdAndDelete(req.params.id);
        
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,
                message: 'La comunidad no existe'
            })    
        }

        await removeFile( comunidad.archivo )

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $pull: {"comunidades": comunidad.id }
            }
        );

        closeConnection();

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

const subscribe = async (req, res = express.response) => {
    const { uid, tenant } = req

    try {
        const Comunidad = await getComunidadModel(tenant)
        const comunidad = await Comunidad.findByIdAndUpdate(
            req.params.id,
            {
                $push: {"usuarios": uid }
            }
        );
        
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,
                message: 'La comunidad no existe'
            })    
        }

        const Usuario = await getUsuarioModel( tenant )
        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"comunidades": comunidad.id }
            }
        );

        closeConnection();

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