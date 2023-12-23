const express = require('express');
const { getTenantModel } = require('../models/Tenant');

const {getMyModel} = require('../models/Usuario');
const {getMyModel: getPerfilModel} = require('../models/Perfil');

const { sendEmail } = require('../helpers/mailer');
const bcrypt = require('bcryptjs');


const create = async (req, res = express.response) => {
    const { name } = req.body;
    
    try {
        const TenantModel = await getTenantModel();
        const tenant = new TenantModel( req.body );
        
        let existe = await TenantModel.findOne({name});
        console.log('existe', existe)

        if ( existe ) {
            return res.status(400).json({
                ok: false,
                msg: 'El Tenant ya se encuentra registrado'
            })
        }

        const saved = await tenant.save();
        
        const rq = {
            tenant: saved,
            body: {
                rol: 'Admin',
                name: 'Admin Admin',
                email: 'admin@correo.com',
                password: '123456',
                estado: 'A',
                provider: 'WEB',
            }
        }

        const Usuario = await getMyModel(name);
        const usuario = new Usuario(rq.body);
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(usuario.password, salt);
        await usuario.save();

        const Perfil = await getPerfilModel(name);
        let perfil = new Perfil({ user: usuario.id })
        await perfil.save();

        if ( usuario.provider === 'GMAIL' ) {
            sendEmail(usuario.email, 'Bienvenido!', 'Mensaje de bienvenida a Tu Derecho!')
        }
        
        return res.status(201).json({
            ok: true,
            saved,
            usuario
        })

    } catch(error) {
        console.log( error );
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    }    
}

const paginate = async(req, res = express.response) => {
    try {
        const limit = req.query.limit;
        const page = req.query.page - 1

        const TenantModel = await getTenantModel();
        const tenants = await TenantModel.find()
            .sort( { name: 1 } )
            .skip(limit * page)
            .limit(limit);

        const total = await TenantModel.find().count();
        
        return res.status(200).json({
            ok: true,
            tenants,
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
    try {
        const TenantModel = await getTenantModel();
        const tenants = await TenantModel.find().sort( { name: 1 } );

        return res.status(200).json({
            ok: true,
            tenants
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

const findByDomain = async(req, res = express.response) => {
    try {
        const TenantModel = await getTenantModel();
        const tenant = await TenantModel.findOne({domain: req.params.domain});
        if ( !tenant) {
            return res.status(404).json({
                ok: false,                
                msg: 'El tenant no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tenant
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const find = async(req, res = express.response) => {
    try {
        const TenantModel = await getTenantModel();
        const tenant = await TenantModel.findById(req.params.id);
        if ( !tenant) {
            return res.status(404).json({
                ok: false,                
                msg: 'El tenant no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tenant
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
        const TenantModel = await getTenantModel();
        const tenant = await TenantModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
            },
            {
                new: true
            }
        );

        if ( !tenant) {
            return res.status(404).json({
                ok: false,
                message: 'La tenant no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tenant
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
        const TenantModel = await getTenantModel();
        const tenant = await TenantModel.findByIdAndDelete(req.params.id);
        if ( !tenant) {
            return res.status(404).json({
                ok: false,
                message: 'La etiqueta no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            tenant
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
    findByDomain,
    list,
    paginate,
    remove
}