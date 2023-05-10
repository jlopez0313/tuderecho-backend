const { Schema, model } = require("mongoose");

const ChatSchema = Schema({
    room: {
        type: Schema.Types.ObjectId,
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
    }
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

module.exports = model('Chat', ChatSchema)
