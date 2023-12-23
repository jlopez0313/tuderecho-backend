const { dbConnection } = require('../database/config');
const { Schema, model } = require('mongoose');
const url = process.env.DB_CONNECTION + 'admin_db';

let db ;

const tenantSchema = Schema({
    name: {
        type: String,
        unique: true
    },
    domain: {
        type: String,
        unique: true
    },
},{
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

const tenantModel = model('tenants', tenantSchema)

const getDB = async () => {
    return db ? db : await dbConnection( url );
}

const getTenantModel = async () => {
    const adminDB = await getDB();
    return adminDB.model('tenants', tenantSchema);
}

module.exports = {
    getTenantModel
}