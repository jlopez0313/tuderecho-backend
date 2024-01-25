const mongoose = require('mongoose');

const dbConnection = async( url ) => {
    try {
        
        const options = {
            autoIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tls: true            
        }
        
        return new Promise( async (resolve, reject) => {
            mongoose.set('strictQuery', false);
            const connection = await mongoose.createConnection(url, options).asPromise();
            console.log('DB Online');
            resolve(connection)
        })

    } catch(error) {
        console.log( 'Error mongo', url, error );
        throw new Error('Error al conectar a la DB');
    }
}

const closeConnection = async () => {
    try {
        console.log("db connection closed");
        if ( mongoose.connection.readyState) {
            await mongoose.disconnect();
        }
        return true;       
    } catch (error) {
      console.log("Error in closeConnection => ", error);
      return false;
    } 
  };


let db ;
const getTenantModel = async (tenant) => {
    const dbName = `tenant-${tenant}`;
    db = db ? db : await dbConnection( process.env.DB_CONNECTION)
    return db.useDb(dbName, {useCache: true});    
}

const getModel = async (model, schema, tenant) => {
    const tenantDB = await getTenantModel(tenant);
    return tenantDB.model(model, schema)
}

module.exports = {
    dbConnection,
    closeConnection,
    getModel
}