const { Schema, model } = require("mongoose");
const { getModel } = require("../database/config");

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

const myModel = model('Tag', TagSchema)

const getMyModel = async (tenant) => {
    return getModel('Tag', TagSchema, tenant)
}

module.exports = {
    getMyModel
}