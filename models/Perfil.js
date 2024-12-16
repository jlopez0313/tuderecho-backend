const { DataTypes } = require("sequelize");
const { getModel } = require("../database/config");

const perfilModel = {
  user_id: {
    type: DataTypes.CHAR(24),
  },
  especialidad_id: {
    type: DataTypes.INTEGER,
  },
  tarjeta_profesional: {
    type: DataTypes.STRING,
  },
  biografia: {
    type: DataTypes.STRING,
  },
  tipoDoc: {
    type: DataTypes.STRING,
  },
  identificacion: {
    type: DataTypes.STRING,
  },
  pais: {
    type: DataTypes.STRING,
  },
  region: {
    type: DataTypes.STRING,
  },
  ciudad: {
    type: DataTypes.STRING,
  },
  telefono: {
    type: DataTypes.STRING,
  },
  estudiante: {
    type: DataTypes.STRING,
  },
  decreto176: {
    type: DataTypes.STRING,
  },
  cuenta: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
};

const getMyModel = async (tenant) => {
  return getModel(tenant, "Perfil", perfilModel);
};

module.exports = {
  getMyModel,
};
