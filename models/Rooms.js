const { Schema, model } = require("mongoose");

const RoomsSchema = Schema({
    room: {
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

RoomsSchema.virtual('chats', {
    ref: 'Chat',
    localField: '_id',
    foreignField: 'room',
    justOne: false
})

RoomsSchema.method('toJSON', function() {
    const {__V, _id, ...object} = this.toObject();
    object.id = _id
    return object;
})

module.exports = model('Rooms', RoomsSchema)
