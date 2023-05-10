const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const ComunidadSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    titulo: {
        type: String,
        required: true
    },
    objetivo: {
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
    archivo: {
        type: String,
        required: true
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

ComunidadSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

ComunidadSchema.plugin(autopopulate);

module.exports = model('Comunidad', ComunidadSchema)
