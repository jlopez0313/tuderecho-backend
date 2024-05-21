const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');
const { getModel } = require("../database/config");

const UsuarioSchema = Schema({
    rol: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    suscription: {
        type: String,
        required: true
    },
    days_left: {
        type: Date,
        required: true
    },
    plan: {
        type: Number,
        required: true
    },
    storage: {
        type: Schema.Types.Decimal128,
        required: true
    },
    total_storage: {
        type: Schema.Types.Decimal128,
        required: true
    },
    pts: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
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
    token: {
        type: String,
        required: false,
    },
    comunidades: {
        type: [Schema.Types.ObjectId],
        ref: 'Comunidad',
        required: false
    },
    conferencias: {
        type: [Schema.Types.ObjectId],
        ref: 'Conferencia',
        required: false
    },
    videoteca: {
        type: [Schema.Types.ObjectId],
        ref: 'Videoteca',
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

const myModel = model('Usuario', UsuarioSchema)

const getMyModel = async (tenant) => {
    return getModel('Usuario', UsuarioSchema, tenant)
}

module.exports = {
    getMyModel
}
