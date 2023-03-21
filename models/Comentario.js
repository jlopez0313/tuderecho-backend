const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const ComentarioSchema = Schema({
    comentarios: {
        type: [Schema.Types.ObjectId],
        ref: 'Comentario',
        autopopulate: true,
        required: false
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
        autopopulate: true
    },
    comentario: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
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

ComentarioSchema.plugin(autopopulate);

ComentarioSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Comentario', ComentarioSchema)
