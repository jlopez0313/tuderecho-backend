const express = require('express');
const { generarJWT } = require('../helpers/jwt');
const Comunidad = require('../models/Comunidad');

const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const Usuario = require('../models/Usuario');

const create = async (req, res = express.response) => {
    const {uid} = req;

    const form = formidable({ multiples: true, keepExtensions: true });
    form.uploadDir = path.join(__dirname, "..", "public", "comunidades");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        const pathUrl = `${ process.env.URL }/comunidades/${ files.archivo.newFilename }`

        const comunidad = new Comunidad( {...fields, archivo: pathUrl } );

        try {
        
            const saved = await comunidad.save();

            await Usuario.findByIdAndUpdate(
                uid,
                {
                    $push: {"comunidades": saved.id }
                }
            );

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
    const comunidad = new Comunidad( req.body );
    try {
        
        const saved = await comunidad.save();
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
    
    try {

        const comunidades = await Comunidad.find({ user: req.params.id })

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
    const { uid } = req;
    
    try {

        const comunidades = await Comunidad.find({ user: uid })

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
    
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        const user =  await Usuario.findById( uid );
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
    
    const { uid } = req;
    const filter = req.params?.search || '';

    try {
        const limit = req.query.limit;
        const page = req.query.page - 1
        const user =  await Usuario.findById( uid );

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
    try {
        const comunidad = await Comunidad.findById(req.params.id);
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,                
                msg: 'La comunidad no existe'
            })    
        }

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
    
    const form = formidable({ multiples: true, keepExtensions: true });
    
    form.uploadDir = path.join(__dirname, "..", "public", "comunidades");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }

        let pathUrl = ''
        if ( files.archivo ) {
            console.log(files.archivo);
            pathUrl = `${ process.env.URL }/comunidades/${ files.archivo.newFilename }`
        }

        try {
        
            const body = {...fields }
            
            if ( pathUrl )
                body.archivo = pathUrl

            const comunidad = await Comunidad.findByIdAndUpdate( fields.id, body);

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
        
    });
}

const remove = async(req, res = express.response) => {

    const { uid } = req;

    try {
        const comunidad = await Comunidad.findByIdAndDelete(req.params.id);
        if ( !comunidad) {
            return res.status(404).json({
                ok: false,
                message: 'La comunidad no existe'
            })    
        }

        const existe = await fs.existsSync(comunidad.archivo)
        if ( existe ) {
            fs.unlink( comunidad.archivo, (error) => {
                if ( error ) {
                    console.log( 'Error eliminando', comunidad.archivo )
                }
            });
        } else {
            console.log( 'Imagen no existe', comunidad.archivo )
        }

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $pull: {"comunidades": comunidad.id }
            }
        );


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
    const { uid } = req;

    try {
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

        await Usuario.findByIdAndUpdate(
            uid,
            {
                $push: {"comunidades": comunidad.id }
            }
        );

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