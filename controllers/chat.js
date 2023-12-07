const express = require('express');
const {getMyModel: getRoomsModel} = require('../models/Rooms');
const {getMyModel: getChatModel} = require('../models/Chat');
const {getMyModel: getUsuarioModel} = require('../models/Usuario');
const {getMyModel: getPerfilModel} = require('../models/Perfil');

const create = async ( data ) => {
    try {
        const roomData = { room: data.room, users: data.room.split('-room-') }

        const Room = await getRoomsModel( data.tenant )
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

        const Chat = await getChatModel( data.tenant )
        const saved = new Chat( message );
        await saved.save();
        
        return true ;

    } catch(error) {
        console.log( error )
        return false ;
    }    
}

const list = async(req, res = express.response) => {
    const { tenant } = req
    try {
        const Chat = await getChatModel( tenant )
        const Room = await getRoomsModel( tenant )
        const room = await Room.findOne({room: req.params.id })
            .populate({
                path: 'chats',
                model: Chat
            });

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
    const { uid, tenant } = req
    
    try {
        const Perfil = await getPerfilModel( tenant )
        const Usuario = await getUsuarioModel( tenant )
        const Chat = await getChatModel( tenant )
        
        const Room = await getRoomsModel( tenant )
        const rooms = await Room.find(
            {
                room: {$regex: `.*${uid}.*`, $options: 'i'}
            },
        )
        .populate({
            path: 'chats',
            model: Chat,
            options: {
                sort: { updatedAt: -1 },
                limit: 1,
            },
        })
        .populate({
            path: 'users',
            model: Usuario,
            populate: {
                path: 'perfil',
                model: Perfil,
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
    const { tenant } = req

    try {
        const Chat = await getChatModel( tenant )
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