const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const PublicacionSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
    },
    comment: {
        type: String,
    },
    gif: {
        type: String,
    },
    medias: {
        type: [String],
    },
    fecha: {
        type: String,
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

PublicacionSchema.virtual('comentarios', {
    ref: 'Comentario',
    localField: '_id',
    foreignField: 'publicacion',
    justOne: false
})

PublicacionSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Publicacion', PublicacionSchema)
