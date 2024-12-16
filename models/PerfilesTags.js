const { getModel } = require("../database/config");
const { DataTypes } = require("sequelize");

const PerfilesTagsModel = {
  perfil_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: "El perfil es obligatorio" },
    },
  },

  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: "El TAG es obligatorio" },
    },
  },
};

const getMyModel = async (tenant) => {
  return getModel(tenant, "Perfiles_Tags", PerfilesTagsModel, {
    paranoid: true,
  });
};

module.exports = {
  getMyModel,
};
