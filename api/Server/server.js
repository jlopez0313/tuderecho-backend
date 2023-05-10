const express = require('express');
require('dotenv').config();
const { dbConnection } = require('../database/config');
const cors = require('cors');
const bodyParser = require('body-parser');
const { create } = require('../controllers/chat');

class Server {
    constructor() {

        this.corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200, // For legacy browser support
            methods: "GET, PUT, POST, PATCH, DELETE",
        }

        this.app = express();
        this.port = process.env.PORT;
        this.server = require('http').createServer( this.app );
        this.io = require('socket.io')(this.server, {
            cors: this.corsOptions
        })

        this.paths = {
            auth: {
                path: '/api/auth',
                route: '../routes/auth',
            },
            especialidades: {
                path: '/api/especialidades',
                route: '../routes/especialidades',
            },
            tags: {
                path: '/api/tags',
                route: '../routes/tags',
            },
            chat: {
                path: '/api/chat',
                route: '../routes/chat',
            },
            comentarios: {
                path: '/api/comentarios',
                route: '../routes/comentarios',
            },
            comunidades: {
                path: '/api/comunidades',
                route: '../routes/comunidades',
            },
            conferencias: {
                path: '/api/conferencias',
                route: '../routes/conferencias',
            },
            publicaciones: {
                path: '/api/publicaciones',
                route: '../routes/publicaciones',
            },
            usuarios: {
                path: '/api/usuarios',
                route: '../routes/usuarios',
            },
            videoteca: {
                path: '/api/videoteca',
                route: '../routes/videoteca',
            },
        }

        this.connectToDB();
        this.addMiddlewares();
        this.setRoutes();

        this.sockets();
    }

    async connectToDB() {
        await dbConnection();
    }

    addMiddlewares() {
        this.app.use( cors() );
        this.app.use( express.static('public') )
        this.app.use( bodyParser.json({ limit: '50mb' }) );
    }

    setRoutes() {
        Object.keys(this.paths).forEach(path => {
            this.app.use( this.paths[path].path, require(this.paths[path].route) );
        });
    }

    sockets() {
        let users = [];

        this.io.on('connection', socket => {
            console.log('Cliente Conectado', socket.id);

            socket.on('newUser', (data) => {
                const { uid, id } = data;
                !users.some( user => user.uid === uid ) && 
                    users.push({...data, socketID: socket.id});
                this.io.emit('getUsers', users);
            });

            socket.on('join', (payload, callback) => {
                const { id, friend } = payload;
                let room = '';

                if ( id <= friend ) {
                    room = id + '-room-' + friend
                } else {
                    room = friend + '-room-' + id
                }

                socket.join( room );
                callback( room )
            })

            socket.on('typing', (data) => {
                socket.broadcast.emit('typingResponse', data)
            });

            socket.on('sendMessage', async (payload, callback) => {
                const { room } = payload;
                this.io.to( room ).emit('getMessage', payload);
                socket.broadcast.emit('newMessage', payload);
                await ( create(payload) );
            })

            socket.on('disconnect', () => {
                users = users.filter((user) => user.socketID !== socket.id);
                this.io.emit('getUsers', users);
                socket.disconnect();
                console.log('Cliente Desconectado', socket.id);
            })
        })
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor Corriendo en puerto', this.port);
        })
    }
}

module.exports = Server;