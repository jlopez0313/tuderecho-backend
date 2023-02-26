const express = require('express');
require('dotenv').config();
const { dbConnection } = require('../database/config');
const cors = require('cors');
const bodyParser = require('body-parser');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

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
        }

        this.connectToDB();
        this.addMiddlewares();
        this.setRoutes();
    }

    async connectToDB() {
        await dbConnection();
    }

    addMiddlewares() {
        const corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200, // For legacy browser support
            methods: "GET, PUT, POST, PATCH, DELETE",
        }

        this.app.use( cors() );
        this.app.use( express.static('public') )
        this.app.use( bodyParser.json({ limit: '50mb' }) );
    }

    setRoutes() {
        Object.keys(this.paths).forEach(path => {
            this.app.use( this.paths[path].path, require(this.paths[path].route) );
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor Corriendo en puerto', this.port);
        })
    }
}

module.exports = Server;