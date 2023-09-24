const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Videoteca = require('../models/Videoteca');
const Usuario = require('../models/Usuario');

const create = async (req, res = express.response) => {
    const {uid} = req;

    const videoteca = new Videoteca( req.body );
    try {
        
        const saved = await videoteca.save();

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"videoteca": saved.id }
            }
        );

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

const madeBy = async(req, res = express.response) => {
    try {
        const videoteca = await Videoteca.find({ user: req.params.id })

        return res.status(200).json({
            ok: true,
            videoteca
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
    const { uid } = req;
    
    try {
        const videoteca = await Videoteca.find({ user: uid })

        return res.status(200).json({
            ok: true,
            videoteca
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
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        const user =  await Usuario.findById( uid );

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
                        { 
                            _id: { $in: user.videoteca || [] } 
                        }
                    ]
                }
            )
            .sort( { updatedAt: -1 } )
            .skip(limit * page)
            .limit(limit)

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

const list = async(req, res = express.response) => {
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        const user =  await Usuario.findById( uid );

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
                        { 
                            _id: { $nin: user.videoteca || [] } 
                        }
                    ]
                }
            )
            .sort( { updatedAt: -1 } )
            .skip(limit * page)
            .limit(limit)

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

const find = async(req, res = express.response) => {
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

const update = async (req, res = express.response) => {
    const { name } = req.body;

    try {
        delete req.body.usuarios;

        const videoteca = await Videoteca.findByIdAndUpdate(req.params.id, {...req.body}, { new: true });
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

const remove = async(req, res = express.response) => {
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

const subscribe = async (req, res = express.response) => {
    const { uid } = req;

    try {
        const videoteca = await Videoteca.findByIdAndUpdate(
            req.params.id,
            {
                $push: {"usuarios": uid }
            }
        );
        
        if ( !videoteca) {
            return res.status(404).json({
                ok: false,
                message: 'La videoteca no existe'
            })    
        }

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"videoteca": videoteca.id }
            }
        );

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