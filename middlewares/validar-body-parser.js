const express = require('express');
const bodyParser = require('body-parser');
const bodyParse = bodyParser.json({ limit: '250mb' });

const binaryFiledUrls = [
    'api/publicaciones/',
    'api/comunidades/',
    'api/conferencias/',
    'api/videoteca/',
]
const validarBodyParser = (req, res=express.response, next) => {
    console.log('validarBodyParser');
    req.body = req.fields;
    next();
    /*
    console.log( 
        
        req.fields, // contains non-file fields
        req.files // contains files

     );
    hasLink = false;
    binaryFiledUrls.forEach( link => {
        if( req.originalUrl.includes(link) ) {
            hasLink = true;
            return;
        }
    })

    if ( hasLink ){ 
        console.log('object has url');
        next();
    }
    else bodyParse(req, res, next);

    */
}

module.exports = { validarBodyParser }