const fs = require('fs');

const uploadFile = async ( tmpImage, type, path ) => {
    try {
        const data = await fs.readFileSync(tmpImage);
        const newPath = path + Date.now() + '.' + type.split('/').pop();
        await fs.writeFileSync(newPath, data);

        return  process.env.URL + newPath.replace('public', '');
    } catch ( err ) {
        console.log('uploadFile error', err);
    }
}

module.exports = {
    uploadFile
}