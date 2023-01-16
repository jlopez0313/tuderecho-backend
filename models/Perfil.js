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
        require: true
    },
    biografia: {
        type: String,
        require: true
    },
    identificacion: {
        type: String,
        require: true
    },
    pais: {
        type: String,
        require: true
    },
    region: {
        type: String,
        require: true,
        unique: true
    },
    ciudad: {
        type: String,
        require: true
    },
    telefono: {
        type: String,
        require: true
    },
    estudiante: {
        type: String
    },
    decreto176: {
        type: String
    },
    cuenta: {
        type: String,
        require: true
    },
    photo: {
        type: String,
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: 'Tag',
        require: false
    }
})

PerfilSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Perfil', PerfilSchema)
