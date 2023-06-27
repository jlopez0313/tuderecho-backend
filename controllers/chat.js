const express = require('express');
const Room = require('../models/Rooms');
const Chat = require('../models/Chat');

const create = async ( data ) => {
    try {
        const roomData = { room: data.room }

        let room = await Room.findOne( roomData );
        if ( !room ) {
            room = new Room( roomData )
            await room.save();
        }

        const message = {
            room: room.id,
            to: data.to,
            sender: data.id,
            text: data.text,
        }

        const saved = new Chat( message );
        await saved.save();
        
        return true ;

    } catch(error) {
        console.log( error )
        return false ;
    }    
}

const list = async(req, res = express.response) => {
    
    try {
        const room = await Room.findOne({room: req.params.id }).populate('chats');

        return res.status(200).json({
            ok: true,
            room
        })

    } catch(error) {
        console.log( error );
        return res.status(500).json({
            ok: false,
            msg: 'list: Internal Error'
        })
    }   
}

module.exports = {
    create,
    list,
}