const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const PerfilSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    especialidad: {
        type: Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: false,
        autopopulate: true
    },
    tarjeta_profesional: {
        type: String,
        required: false
    },
    biografia: {
        type: String,
        required: false
    },
    tipoDoc: {
        type: String,
        required: false
    },
    identificacion: {
        type: String,
        required: false
    },
    pais: {
        type: String,
        required: false
    },
    region: {
        type: String,
        required: false,
    },
    ciudad: {
        type: String,
        required: false
    },
    telefono: {
        type: String,
        required: false
    },
    estudiante: {
        type: String
    },
    decreto176: {
        type: String
    },
    cuenta: {
        type: String,
        required: false
    },
    photo: {
        type: String,
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: 'Tag',
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

PerfilSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

PerfilSchema.plugin(autopopulate);

module.exports = model('Perfil', PerfilSchema)
