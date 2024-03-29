const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');
const { getModel } = require("../database/config");

const ComentarioSchema = Schema({
    comentarios: {
        type: [Schema.Types.ObjectId],
        ref: 'Comentario',
        required: false,
        autopopulate: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    parent: {
        type: String,
        required: false
    },
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        // autopopulate: true
    },
    comentario: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
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

ComentarioSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

ComentarioSchema.plugin(autopopulate);

const myModel = model('Comentario', ComentarioSchema)

const getMyModel = async (tenant) => {
    return getModel('Comentario', ComentarioSchema, tenant)
}

module.exports = {
    getMyModel
}