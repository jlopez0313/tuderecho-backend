const database = require('./mysql');

const getTenantConnection = async( tenant ) => {
    return database.getTenantConnection( tenant );
}

const closeConnections = async () => {
    return database.closeConnections();
     
};

const getModel = async (tenant, modelName, modelDefinition, modelOptions) => {
    return database.getModel( tenant, modelName, modelDefinition, modelOptions );
}

const runTenantMigrations =  async (tenant, migrations) => {
    return database.runTenantMigrations( tenant, migrations )
}

module.exports = {
    getTenantConnection,
    closeConnections,
    getModel,
    runTenantMigrations
}