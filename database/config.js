const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        mongoose.set('strictQuery', false);

        mongoose.connect(process.env.DB_CONNECTION, {
            autoIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })


        console.log('DB Online');
    } catch(error) {
        console.log( 'Error mongo', process.env.DB_CONNECTION, error );
        throw new Error('Error al conectar a la DB');
    }
}

module.exports = { dbConnection }