const { Schema, model } = require("mongoose");

const VideotecaSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    titulo: {
        type: String,
        required: true
    },
    conferencista: {
        type: String,
        required: true
    },
    video: {
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
})

VideotecaSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Conferencia', VideotecaSchema)
