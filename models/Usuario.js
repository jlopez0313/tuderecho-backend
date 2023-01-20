const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
    rol: {
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    }
})

UsuarioSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Usuario', UsuarioSchema)
