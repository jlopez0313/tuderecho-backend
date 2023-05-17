const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

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
    },
    isLogged: {
        type: Boolean,
        required: false,
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

UsuarioSchema.virtual('perfil', {
    ref: 'Perfil',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
    // autopopulate: true,
})

UsuarioSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

UsuarioSchema.plugin(autopopulate);

module.exports = model('Usuario', UsuarioSchema)
