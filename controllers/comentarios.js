const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Comentario = require('../models/Comentario');
const Publicacion = require('../models/Publicaciones');

const create = async (req, res = express.response) => {
    const comentario = new Comentario( req.body );
    const { parent, publicacionID } = req.body;
    try {

        const comment = await comentario.save();
        if ( parent ) {
            await Comentario.findByIdAndUpdate(
                parent,
                { $push: {"comentarios": comment.id } },
                { new: true, upsert: true }
            )
        }

        let saved = {} ;
        if ( publicacionID ) {
            saved = await Publicacion.findOneAndUpdate(
                {_id : publicacionID},
                {$inc : 
                    {'total_comments' : 1}
                },
                { new: true }
            );
        }

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

const list = async(req, res = express.response) => {
    try {
        const comentarios = await Comentario.find();

        return res.status(200).json({
            ok: true,
            comentarios
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
        const comentario = await Comentario.findById(req.params.id);
        if ( !comentario) {
            return res.status(404).json({
                ok: false,
                msg: 'El Comentario no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comentario
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
        const comentario = await Comentario.findByIdAndUpdate(
            req.params.id,
            {
                name,
            },
            { 
                new: true
            }
        );

        if ( !comentario) {
            return res.status(404).json({
                ok: false,
                msg: 'El Comentario no existe'
            })    
        }

        return res.status(200).json({
            ok: true,
            comentario
        })

    } catch(error) {
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const remove = async(req, res = express.response) => {
    const { publicacionID } = req.body;
    try {
        const comentario = await Comentario.findByIdAndDelete(req.params.id);
        if ( !comentario) {
            return res.status(404).json({
                ok: false,
            })    
        }

        let saved = {} ;
        if ( publicacionID ) {
            saved = await Publicacion.findOneAndUpdate(
                {_id : publicacionID},
                {$inc : 
                    {'total_comments' : -1}
                },
                { new: true }
            );
        }

        return res.status(200).json({
            ok: true,
            publi: saved
        })

    } catch(error) {
        console.log( error )
        res.status(500).json({
            ok: false,
            msg: 'remove: Internal Error'
        })
    } 
}



const likes = async (req, res = express.response) => {
    const {uid} = req;
    
    try {
        const comentario = await Comentario.findById(req.params.id).lean();

        if ( !comentario) {
            return res.status(404).json({
                ok: false,
                message: 'El comentario no existe'
            })    
        }

        const hasLike = comentario.likes.find( like => like === uid );

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

        const updated = await Comentario.findByIdAndUpdate(req.params.id, 
            query,
            { new: true, upsert: true }
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