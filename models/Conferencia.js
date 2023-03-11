const { Schema, model } = require("mongoose");

const ConferenciaSchema = Schema({
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
    fecha: {
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
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

})

ConferenciaSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Conferencia', ConferenciaSchema)
