const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');
const { getModel } = require("../database/config");

const VideotecaSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    titulo: {
        type: String,
        required: true
    },
    conferencista: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    gratis: {
        type: String,
        required: true
    },
    precio: {
        type: String,
    },
    usuarios: {
        type: [Schema.Types.ObjectId],
        ref: 'Usuario',
        required: false
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

VideotecaSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

VideotecaSchema.plugin(autopopulate);

const myModel = model('Videoteca', VideotecaSchema)

const getMyModel = async (tenant) => {
    return getModel('Videoteca', VideotecaSchema, tenant)
}

module.exports = {
    getMyModel
}