const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const {getMyModel} = require('../models/Publicaciones');
const {getMyModel: getConferenciaModel } = require('../models/Conferencia');
const {getMyModel: getVideotecaModel } = require('../models/Videoteca');
const {getMyModel: getPerfilModel } = require('../models/Perfil');
const {getMyModel: getUsuarioModel } = require('../models/Usuario');
const {getMyModel: getComentarioModel } = require('../models/Comentario');

const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

const create = async (req, res = express.response) => {

    const { tenant } = req;

    const form = formidable({ multiples: true, keepExtensions: true });
    form.uploadDir = path.join(__dirname, "..", "public", "publicaciones");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        let medias = []

        if ( files?.files?.length ) {
            medias = files.files.map( file => {
                const pathUrl = `${ process.env.URL }/publicaciones/${ file.newFilename }`
                return pathUrl
            })
        } else if ( files?.files ){
            medias.push( `${ process.env.URL }/publicaciones/${ files.files.newFilename }` )
        }

        if( !fields.comunidad ) {
            delete fields.comunidad;
        }

        if( !fields.conferencia ) {
            delete fields.conferencia;
        }

        if( !fields.videoteca ) {
            delete fields.videoteca;
        }

        const campos = {...fields};
        const Publicacion = await getMyModel( tenant )
        const publicacion = new Publicacion({...campos, medias});
    
        try {            
            if ( campos.post ) {
                const shared = await addShare( tenant, campos.user, campos.post )
                
                if (!shared ) {
                    throw new Error('Post Not Found')
                }
            }
            
            const saved = await publicacion.save();

            closeConnection();

            return res.status(201).json({
                ok: true,
                saved
            })

        } catch(error) {
            console.log( 'Creating', error )
            return res.status(500).json({
                ok: false,
                msg: 'create: Internal Error'
            })
        }
    });

}

const list = async(req, res = express.response) => {
    const { tenant } = req
    const { comunidad } = req.body
    
    try {
        const limit = req.query.limit;
        const page = req.query.page - 1

        const find = {}
        if( comunidad ) {
            find.comunidad = comunidad;            
        } else {
            find.comunidad = { $exists : false };
        }
        
        const Comentario = await getComentarioModel( tenant )
        const Conferencia = await getConferenciaModel( tenant )
        const Videoteca = await getVideotecaModel( tenant )
        const Perfil = await getPerfilModel( tenant )
        const Usuario = await getUsuarioModel( tenant )

        const Publicacion = await getMyModel( tenant )
        const publicaciones =  await Publicacion
            .find(find)
            .populate({
                path: 'comentarios',
                model: Comentario
            })
            .populate({
                path: 'conferencia',
                model: Conferencia,
                options: { autopopulate: false },
            })
            .populate({
                path: 'videoteca',
                model: Videoteca,
                options: { autopopulate: false },
            })
            .populate({
                path: 'user',
                model: Usuario,
                populate: {
                    path: 'perfil',
                    model: Perfil,
                    select: 'photo',
                },
                select: 'name',
            })
            .populate({
                path: 'post',
                model: Publicacion,
                populate: {
                    path:'user',
                    model: Usuario,
                    populate:{
                        path: 'perfil',
                        model: Perfil,
                        select: 'photo',
                    },
                    select: 'name',

                }
            })
            .sort( { createdAt: -1 } )
            .skip(limit * page)
            .limit(limit)

        closeConnection();

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

const find = async(req, res = express.response) => {
    const { tenant } = req
    try {
        const Publicacion = await getMyModel( tenant )
        const publicacion = await Publicacion.findById(req.params.id);
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,                
                msg: 'El Publicacion no existe'
            })    
        }

        closeConnection();

        return res.status(200).json({
            ok: true,
            publicacion
        })

    } catch(error) {

        console.log( error );
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.response) => {
    const { tenant } = req
    const { name } = req.body

    try {
        const Publicacion = await getMyModel( tenant )
        const publicacion = await Publicacion.findByIdAndUpdate(req.params.id, {name}, { new: true });
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,
                message: 'La publicación no existe'
            })    
        }

        closeConnection();

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

const remove = async(req, res = express.response) => {
    const { tenant } = req

    try {
        const Publicacion = await getMyModel( tenant )
        const publicacion = await Publicacion.findByIdAndDelete(req.params.id);
        if ( !publicacion) {
            return res.status(404).json({
                ok: false,
                message: 'La publicación no existe'
            })    
        }

        publicacion.medias.forEach( async(media) => {
            const existe = await fs.existsSync(media)
            if ( existe ) {
                fs.unlink( media, (error) => {
                    if ( error ) {
                        console.log( 'Error eliminando', media )
                    }
                });
            } else {
                console.log( 'Imagen no existe', media )
            }
        })

        closeConnection();

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

const likes = async (req, res = express.response) => {
    const { uid, tenant } = req
    
    try {
        const Publicacion = await getMyModel( tenant )
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
        )

        closeConnection();

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

const addShare = async ( tenant, uid, postsID ) => {
    
    const Publicacion = await getMyModel( tenant )
    const publicacion = await Publicacion.findById(postsID).lean();

    if ( !publicacion) {
        return false    
    }

    const updated = await Publicacion.findByIdAndUpdate(
        postsID, 
        {
            $push: {"shares": uid }
        },
        { new: true, upsert: true }
    )

    return updated;
}

module.exports = {
    create,
    update,
    find,
    list,
    remove,
    likes
}