const { Schema, model } = require("mongoose");
const autopopulate = require('mongoose-autopopulate');

const ConferenciaSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        autopopulate: true
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
    usuarios: {
        type: [Schema.Types.ObjectId],
        ref: 'Usuario',
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

ConferenciaSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

ConferenciaSchema.plugin(autopopulate);

module.exports = model('Conferencia', ConferenciaSchema)