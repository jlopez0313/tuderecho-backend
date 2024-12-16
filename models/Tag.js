const { getModel } = require("../database/config");
const { DataTypes } = require("sequelize");

const TagModel = {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El nombre es obligatorio" },
    },
  },
};

const getMyModel = async (tenant) => {
  return getModel(tenant, "Tag", TagModel, {
    paranoid: true,
  });
};

module.exports = {
  getMyModel,
};
