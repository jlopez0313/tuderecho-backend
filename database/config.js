const mongoose = require("mongoose");

const connections = {};

const dbConnection = async (url) => {
  try {
    const options = {
      // auth:{
      //     authdb: 'admin',
      // },
      // user: 'JSFadmin',
      // pass: 'N2xgftAFzNLlg',
      autoIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50,
      minPoolSize: 5,
      // ssl: true,
      // tls: true
    };
    mongoose.set("strictQuery", false);

    if (!connections["main"]) {
      connections["main"] = await mongoose.createConnection(url, options);
      console.log("Conexión principal a MongoDB establecida.");
    }

    console.log("DB Online");
    return connections["main"];
  } catch (error) {
    console.log("Error mongo", url, error);
    throw new Error("Error al conectar a la DB");
  }
};

const getTenantModel = async (tenant) => {
  try {
    const dbName = `tenant-${tenant}`;

    if (!connections[dbName]) {
      const mainConnection = await dbConnection(process.env.DB_CONNECTION);
      const tenantDB = mainConnection.useDb(dbName, { useCache: true });
      connections[dbName] = tenantDB;

      console.log(`Base de datos cargada para el tenant: ${dbName}`);
    }

    return connections[dbName];
  } catch (error) {
    console.error(`Error al obtener conexión para tenant ${tenant}:`, error);
    throw new Error("Error al obtener la base de datos del tenant");
  }
};

const getModel = async (model, schema, tenant) => {
  try {
    const tenantDB = await getTenantModel(tenant);

    if (!tenantDB.models[model]) {
      console.log(`Modelo ${model} creado para tenant ${tenant}`);
    }

    return tenantDB.model(model, schema);
  } catch (error) {
    console.error(
      `Error al obtener el modelo ${model} para el tenant ${tenant}:`,
      error
    );
    throw error;
  }
};

const closeConnection = async () => {
  try {
    /*
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    console.log("db connection closed");
*/

    /*
    for (const [dbName, connection] of Object.entries(connections)) {
      console.log(`Conexión cerrada: ${dbName}`);
    }

    for (const dbName in connections) {
      delete connections[dbName];
    }

    console.log("Todas las conexiones a MongoDB han sido cerradas.");
*/
    return true;
  } catch (error) {
    console.log("Error in closeConnection => ", error);
    return false;
  }
};

module.exports = {
  dbConnection,
  closeConnection,
  getModel,
};
