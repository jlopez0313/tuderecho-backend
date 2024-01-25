const express = require('express');
const base64Img = require('base64-img');
const fs = require('fs');
const {getMyModel} = require('../models/Settings');

const find = async(req, res = express.response) => {
    const {tenant} = req
    
    try {
        const Settings = await getMyModel(tenant);
        const settings = await Settings.findOne({}) || {};
        
        closeConnection();

        return res.status(200).json({
            ok: true,
            settings
        })

    } catch(error) {
        console.log('Error', error);
        res.status(500).json({
            ok: false,
            msg: 'find: Internal Error'
        })
    }   
}

const update = async (req, res = express.response) => {
    const {tenant} = req

    try {

        const Settings = await getMyModel(tenant);
        let settings = await Settings.findOne({}) || {};

        const {
            title,
            heroe,
            logo,
            fondo
        } = req.body || {
                title: settings?.title, 
                heroe: settings?.heroe,
                logo: settings?.logo,
                fondo: settings?.fondo
            } ;

        let heroeUrl = settings?.heroe;
        if ( !heroeUrl || heroe ) {
            heroeUrl = await uploadFile( heroe, settings?.heroe );
        }

        let logoUrl = settings?.logo;
        if ( !logoUrl || logo ) {
            logoUrl = await uploadFile( logo, settings?.logo );
        }

        let fondoUrl = settings?.fondo;
        if ( !fondoUrl || fondo ) {
            fondoUrl = await uploadFile( fondo, settings?.fondo );
        }

        settings.title = title;
        settings.logo = logoUrl;
        settings.heroe = heroeUrl;
        settings.fondo = fondoUrl;

        let saved = {}

        if ( !settings?.id ) {
            settings = new Settings( settings );
        }

        saved = await settings.save();
        
        closeConnection();

        return res.status(201).json({
            ok: true,
            saved
        })

    } catch(error) {
        console.log( 'error', error )
        res.status(500).json({
            ok: false,
            msg: 'update: Internal Error'
        })
    } 
}

const uploadFile = ( strImage, oldImage ) => {  
    return new Promise( async (resolve, reject) => {
        const folderPath = './public/settings';
        try {            
            if (oldImage)  {
                const erasingImage = oldImage?.split('/').pop()            
                const existe = await fs.existsSync(`${folderPath}/${erasingImage}`)
                if ( existe ) {
                    fs.unlink( `${folderPath}/${erasingImage}`, (error) => {
                        if ( error ) {
                            console.log( 'Error eliminando', `${folderPath}/${erasingImage}` )
                            throw new Error('Error eliminando');
                        }
                    });
                } else {
                    console.log( 'Imagen no existe', `${folderPath}/${erasingImage}` )
                    throw new Error('No existe la imagen');
                }
            }
        } catch( err ) {
            console.log( 'No existe la imagen', oldImage, err );
        } finally {
            try {
                uploadBase64(strImage, resolve, reject)
            } catch(err) {
                resolve(strImage)
            }
        }
    })

}

const uploadBase64 = (strImage, resolve, reject) => {
    base64Img.img(strImage, './public/settings', Date.now(), function(err, path) {
        if (err ){
            console.log('error', error)
            reject( err )
        }
        const fileName = path.split('/').pop().split('\\').pop();
        resolve(`${process.env.URL}/settings/${fileName}`);
    })
}

module.exports = {
    update,
    find,
}