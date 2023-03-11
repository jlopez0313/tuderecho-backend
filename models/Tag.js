const { Schema, model } = require("mongoose");

const TagSchema = Schema({
    name: {
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

TagSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Tag', TagSchema)
