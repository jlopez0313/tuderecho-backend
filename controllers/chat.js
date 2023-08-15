const express = require('express');
const Room = require('../models/Rooms');
const Chat = require('../models/Chat');

const create = async ( data ) => {
    try {
        const roomData = { room: data.room, users: data.room.split('-room-') }

        let room = await Room.findOne( roomData );
        if ( !room ) {
            room = new Room( roomData )
            await room.save();
        }

        const message = {
            to: data.to,
            room: room.id,
            read: data.read,
            from: data.from,
            text: data.text,
            sender: data.id,
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

const all = async(req, res = express.response) => {
    const {uid} = req;
    
    try {
        const rooms = await Room.find(
            {
                room: {$regex: `.*${uid}.*`, $options: 'i'}
            },
        )
        .populate({
            path: 'chats',
            options: {
                sort: { updatedAt: -1 },
                limit: 1,
            },
        })
        .populate({
            path: 'users',
            populate: {
                path: 'perfil',
                select: 'photo',
            },
            select: 'name',
        })
        .sort( { updatedAt: -1 } )

        return res.status(200).json({
            ok: true,
            rooms
        })

    } catch(error) {
        console.log( error );
        return res.status(500).json({
            ok: false,
            msg: 'all: Internal Error'
        })
    }   
}

const read = async( data ) => {
    try {

        const saved = await Chat.update(
            {room : data.room, from: data.from, read: false},
            { read: true },
            { new: true }
        );
        await saved.save();
        
        return true ;
    } catch (error) {
        console.log( error )
        return false ;
    }
}

module.exports = {
    create,
    list,
    all,
    read
}