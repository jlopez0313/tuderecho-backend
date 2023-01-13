const express = require('express');
require('dotenv').config();
const { dbConnection } = require('../database/config');
const cors = require('cors');

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
        this.app.use( cors() );
        this.app.use(express.json());
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