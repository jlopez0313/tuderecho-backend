const { Schema, model } = require("mongoose");

const PublicacionSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    comment: {
        type: String,
    },
    gif: {
        type: String,
    },
    medias: {
        type: [String],
    }
})

PublicacionSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Publicacion', PublicacionSchema)
