const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Publicacion = require('../models/Publicaciones');

const formidable = require('formidable');
const path = require('path');
const fs = require('fs')

const create = async (req, res = express.response) => {

    const form = formidable({ multiples: true, keepExtensions: true });
    form.uploadDir = path.join(__dirname, "..", "..", "public", "publicaciones");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        const medias = files?.files?.map( file => {
            const pathUrl = `${ process.env.URL }/publicaciones/${ file.newFilename }`
            return pathUrl
        })

        if( !fields.comunidad ) {
            delete fields.comunidad;
        }

        if( !fields.conferencia ) {
            delete fields.conferencia;
        }

        if( !fields.videoteca ) {
            delete fields.videoteca;
        }

        const publicacion = new Publicacion({...fields, medias});
    
        try {

            console.log('object', fields);
            
            if ( fields.post ) {
                const shared = await addShare( fields.user, fields.post )
                
                if (!shared ) {
                    throw new Error('Post Not Found')
                }
            }

            const saved = await publicacion.save();

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
    });

}

const list = async(req, res = express.response) => {
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

        const publicaciones =  await Publicacion
            .find(find)
            .populate({
                path: 'conferencia',
                options: { autopopulate: false },
            })
            .populate({
                path: 'videoteca',
                options: { autopopulate: false },
            })
            .populate({
                path: 'user',
                populate: {
                    path: 'perfil',
                    select: 'photo',
                },
                select: 'name',
            })
            .populate({
                path: 'post',
                populate: {
                    path:'user',
                    populate:{
                        path: 'perfil',
                        select: 'photo',
                    },
                    select: 'name',

                }
            })
            .sort( { createdAt: -1 } )
            .skip(limit * page)
            .limit(limit)

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

const update = async (req, res = express.response) => {
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

const remove = async(req, res = express.response) => {
    try {
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

const addShare = async ( uid, postsID ) => {

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