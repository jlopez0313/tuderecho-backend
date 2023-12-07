const { Schema, model } = require("mongoose");
const { getModel } = require("../database/config");

const EspecialidadSchema = Schema({
    name: {
        type: String,
        require: true
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

EspecialidadSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

const myModel = model('Especialidad', EspecialidadSchema)

const getMyModel = async (tenant) => {
    return getModel('Especialidad', EspecialidadSchema, tenant)
}

module.exports = {
    getMyModel
}
