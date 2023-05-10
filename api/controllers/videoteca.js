const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Videoteca = require('../models/Videoteca');

const create = async (req, res = express.request) => {
    const videoteca = new Videoteca( req.body );
    try {
        
        const saved = await videoteca.save();
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
}

const myList = async(req, res = express.request) => {
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const videoteca = await Videoteca.find(
                { 
                    
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            conferencista: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                    $and: [
                        { user: uid }
                    ]
                }
            )
            .sort( { updated_at: -1 } )

        return res.status(200).json({
            ok: true,
            videoteca
        })

    } catch(error) {
        console.log( error )

        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    } 
}

const list = async(req, res = express.request) => {
    const filter = req.params?.search || '';

    try {
        const videoteca = await Videoteca.find(
                { 
                    
                    $or: [
                        {
                            titulo: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                        {
                            conferencista: {$regex: `.*${filter}.*`, $options: 'i'}
                        },
                    ],
                }
            )
            .sort( { updated_at: -1 } )

        return res.status(200).json({
            ok: true,
            videoteca
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
        const videoteca = await Videoteca.findById(req.params.id);
        if ( !videoteca) {
            return res.status(404).json({
                ok: false,                
                msg: 'La videoteca no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            videoteca
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
        const videoteca = await Videoteca.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !videoteca) {
            return res.status(404).json({
                ok: false,
                message: 'La videoteca no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            videoteca
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
        const videoteca = await Videoteca.findByIdAndDelete(req.params.id);
        if ( !videoteca) {
            return res.status(404).json({
                ok: false,
                message: 'La videoteca no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            videoteca
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