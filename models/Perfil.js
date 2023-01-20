const { Schema, model } = require("mongoose");

const PerfilSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    especialidad: {
        type: Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: false
    },
    tarjeta_profesional: {
        type: String,
        required: false
    },
    biografia: {
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
    }
})

PerfilSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Perfil', PerfilSchema)