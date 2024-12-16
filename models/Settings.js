const { Schema, model } = require("mongoose");
const { getModel } = require("../database/mongodb");

const SettingsSchema = Schema({
    title: {
        type: String,
        // required: true
    },
    logo: {
        type: String,
        // required: true
    },
    heroe: {
        type: String,
        // required: true
    },
    fondo: {
        type: String,
        // required: true
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

SettingsSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

const myModel = model('Settings', SettingsSchema)

const getMyModel = async (tenant) => {
    return getModel('Settings', SettingsSchema, tenant)
}

module.exports = {
    getMyModel
}
