const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const PublicacionSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        // autopopulate: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        // autopopulate: true,
        required: false,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Comunidad',
        // autopopulate: true,
        required: false,
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
    shares: {
        type: [String],
        required: false
    },
    total_comments: {
        type: Number,
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

PublicacionSchema.virtual('comentarios', {
    ref: 'Comentario',
    localField: '_id',
    foreignField: 'publicacion',
    justOne: false,
    autopopulate: true
})

PublicacionSchema.plugin(autopopulate);

module.exports = model('Publicacion', PublicacionSchema)
