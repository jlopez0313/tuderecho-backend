const express = require('express');
require('dotenv').config();
const { dbConnection } = require('../database/config');
const cors = require('cors');
const bodyParser = require('body-parser');
const { create, read } = require('../controllers/chat');

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

        this.paths = [
            {
                path: '/api/auth',
                route: '../routes/auth',
            },
            {
                path: '/api/especialidades',
                route: '../routes/especialidades',
            },
            {
                path: '/api/tenants',
                route: '../routes/tenants',
            },
            {
                path: '/api/tags',
                route: '../routes/tags',
            },
            {
                path: '/api/chat',
                route: '../routes/chat',
            },
            {
                path: '/api/comentarios',
                route: '../routes/comentarios',
            },
            {
                path: '/api/comunidades',
                route: '../routes/comunidades',
            },
            {
                path: '/api/conferencias',
                route: '../routes/conferencias',
            },
            {
                path: '/api/publicaciones',
                route: '../routes/publicaciones',
            },
            {
                path: '/api/settings',
                route: '../routes/settings',
            },
            {
                path: '/api/usuarios',
                route: '../routes/usuarios',
            },
            {
                path: '/api/videoteca',
                route: '../routes/videoteca',
            },
            {
                path: '/api/zoom',
                route: '../routes/zoom',
            },
        ]

        this.connectToDB();
        this.addMiddlewares();
        this.setRoutes();

        this.sockets();
    }

    async connectToDB() {
        // await dbConnection( process.env.DB_CONNECTION + process.env.DB_NAME );
    }

    addMiddlewares() {
        this.app.use( cors() );
        this.app.use( express.static('public') )
        this.app.use( express.urlencoded({ extended: false }) );
        this.app.use( bodyParser.json({ limit: '250mb' }) );

        // this.app.use( express.json({ limit: '250mb' }) );

    }

    setRoutes() {
        this.paths.forEach( path => {
            this.app.use( path.path, require(path.route) );
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

            socket.on('read', async (payload, callback) => {
                const { room } = payload;
                this.io.to( room ).emit('read', payload);
                socket.broadcast.emit('read', payload);
                await ( read(payload) );
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