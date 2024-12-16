const { DataTypes } = require("sequelize");
const { getModel } = require("../database/config");

const conferenciaModel = {
    user_id: {
        type: DataTypes.CHAR(24),
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    conferencista: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    objetivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gratis: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    archivo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
}

const getMyModel = async (tenant) => {
    return getModel(tenant, 'Conferencia', conferenciaModel)
}

module.exports = {
    getMyModel
}