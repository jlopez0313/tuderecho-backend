const { getModel } = require("../database/config");
const { DataTypes } = require("sequelize");

const ConferenciasUsuariosSchema = {
  user_id: {
    type: DataTypes.CHAR(24),
    allowNull: false,
    validate: {
      notNull: { msg: "El usuario es obligatorio" },
    },
  },

  conferencia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: "La Conferencia es obligatorio" },
    },
  },
};

const getMyModel = async (tenant) => {
  return getModel(tenant, "conferencias_usuarios", ConferenciasUsuariosSchema, {
    paranoid: true,
  });
};

module.exports = {
  getMyModel,
};
