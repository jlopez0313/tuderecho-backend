const fs = require('fs');
const base64Img = require('base64-img');

const uploadBase64 = (strImage, resolve, reject) => {
    base64Img.img(strImage, './public', Date.now(), function(err, path) {
        if (err ){
            console.log('error', error)
            reject( err )
        }
        const fileName = path.split('/').pop().split('\\').pop();
        resolve(`${process.env.URL}/${fileName}`);
    })
}

const uploadFile = async ( tmpImage, type, path ) => {
    try {
        const data = await fs.readFileSync(tmpImage);
        const newPath = path + Date.now() + '.' + type.split('/').pop();
        
        if ( ! fs.existsSync(path) ) {
            fs.mkdirSync( path, { recursive: true } )
        }

        await fs.writeFileSync(newPath, data);

        return  process.env.URL + newPath.replace('public', '');
    } catch ( err ) {
        console.log('uploadFile error', err);
    }
}


const removeFile = async ( pathInDB ) => {
    try {
        const media = pathInDB.replace( process.env.URL, 'public' )
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
    } catch ( err ) {
        console.log('removeFile error', err );
    }
}

module.exports = {
    uploadBase64,
    uploadFile,
    removeFile
}