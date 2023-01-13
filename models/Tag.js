const { Schema, model } = require("mongoose");

const TagSchema = Schema({
    name: {
        type: String,
        require: true
    }
})

TagSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Tag', TagSchema)
