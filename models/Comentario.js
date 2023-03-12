const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const ComentarioSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        autopopulate: true
    },
    comentario: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})

// ComentarioSchema.plugin(autopopulate);


ComentarioSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Comentario', ComentarioSchema)
