const { DataTypes } = require("sequelize");
const { getModel } = require("../database/config");

const EspecialidadModel = {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El nombre es requerido" },
    },
  },
};

const getMyModel = async (tenant) => {
  return getModel(tenant, "Especialidad", EspecialidadModel, {
    paranoid: true,
  });
};

module.exports = {
  getMyModel,
};
