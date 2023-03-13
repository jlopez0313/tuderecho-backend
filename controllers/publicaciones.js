const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Publicacion = require('../models/Publicaciones');

const create = async (req, res = express.request) => {
    const publicacion = new Publicacion( req.body );
    try {
        
        const saved = await publicacion.save();
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

const list = async(req, res = express.request) => {
    try {
        const publicaciones = 
        await Publicacion
        .find()
        .populate(
            {
                path : 'comentarios',
                populate : {
                  path : 'user',
                  populate : {
                    path : 'perfil'
                  }
                }
            }
        )
        .populate(
            {
                path : 'user',
                populate : {
                  path : 'perfil'
                }
            },
        ).sort( { created_at: -1 } )

        return res.status(200).json({
            ok: true,
            publicaciones
        })

    } catch(error) {
        console.log( error )
        res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }
}

const find = async(req, res = express.request) => {
    try {
        const publicacion = await Publicacion.findById(req.params.id);
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,                
                msg: 'El Publicacion no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            publicacion
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
        const publicacion = await Publicacion.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,
                message: 'La publicación no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            publicacion
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
        const publicacion = await Publicacion.findByIdAndDelete(req.params.id);
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,
                message: 'La publicación no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            publicacion
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'remove: Internal Error'
        })
    } 
}

const likes = async (req, res = express.request) => {
    const {uid} = req;
    
    try {
        const publicacion = await Publicacion.findById(req.params.id).lean();

        if ( !publicacion) {
            return res.status(404).json({
                ok: false,
                message: 'La publicación no existe'
            })    
        }

        const hasLike = publicacion.likes.find( like => like === uid );

        let query = {}
        if ( hasLike ) {
            query = {
                $pull: {"likes": uid }
            }
        } else {
            query = {
                $push: {"likes": uid }
            }
        }

        const updated = await Publicacion.findByIdAndUpdate(req.params.id, 
            query,
            { new: true, upsert: true }
        ).populate(
            {
                path : 'comentarios',
                populate : {
                  path : 'user',
                  populate : {
                    path : 'perfil'
                  }
                }
            }
        )
        .populate(
            {
                path : 'user',
                populate : {
                  path : 'perfil'
                }
            },
        )

        return res.status(200).json({
            ok: true,
            hasLike,
            updated
        })

    } catch(error) {
        console.log( error )
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
    remove,
    likes
}