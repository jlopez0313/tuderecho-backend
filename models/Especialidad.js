const { Schema, model } = require("mongoose");

const EspecialidadSchema = Schema({
    name: {
        type: String,
        require: true
    }
})

EspecialidadSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Especialidad', EspecialidadSchema)
