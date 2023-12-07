const { Schema, model } = require("mongoose");
const { getModel } = require("../database/config");

const ChatSchema = Schema({
    room: {
        type: Schema.Types.ObjectId,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
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

ChatSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

const myModel = model('Chat', ChatSchema)

const getMyModel = async (tenant) => {
    return getModel('Chat', ChatSchema, tenant)
}

module.exports = {
    getMyModel
}
