const { Schema, model } = require("mongoose");
const { getModel } = require("../database/config");

const RoomsSchema = Schema({
    room: {
        type: String,
        required: true
    },
    users: {
        type: [Schema.Types.ObjectId],
        ref: 'Usuario',
        required: false
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

const myModel = model('Rooms', RoomsSchema)

const getMyModel = async (tenant) => {
    return getModel('Rooms', RoomsSchema, tenant)
}

module.exports = {
    getMyModel
}
