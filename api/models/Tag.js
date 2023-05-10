const { Schema, model } = require("mongoose");

const TagSchema = Schema({
    name: {
        type: String,
        required: true
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

TagSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Tag', TagSchema)