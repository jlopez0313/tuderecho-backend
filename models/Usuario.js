const { DataTypes } = require("sequelize");
const { getModel } = require("../database/config");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

const UsuarioModel = {
  id: {
    type: DataTypes.CHAR(24),
    primaryKey: true,
    defaultValue: ObjectId().toString(),
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El rol es requerido" },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El nombre es requerido" },
    },
  },
  suscription: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "La suscripción es requerida" },
    },
  },
  days_left: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: "Los días restantes son requeridos" },
    },
  },
  plan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: "El plan es requerido" },
    },
  },
  storage: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notNull: { msg: "El almacenamiento es requerido" },
    },
  },
  total_storage: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notNull: { msg: "El almacenamiento total es requerido" },
    },
  },
  pts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: "Los puntos son requeridos" },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: "Debe ser un correo electrónico válido" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "La contraseña es requerida" },
      len: [6, 100], // Longitud mínima de contraseña
    },
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El estado es requerido" },
    },
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El proveedor es requerido" },
    },
  },
  isLogged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
};

// Función para obtener el modelo para un tenant específico
const getMyModel = async (tenant) => {
  return getModel(tenant, "usuario", UsuarioModel);
};

module.exports = {
  getMyModel,
};
