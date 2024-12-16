// models/associations.js
const { getMyModel: getUsuarioModel } = require("./Usuario");
const { getMyModel: getPerfilModel } = require("./Perfil");
const { getMyModel: getEspecialidadModel } = require("./Especialidad");
const { getMyModel: getTagModel } = require("./Tag");
const { getMyModel: getConferenciaModel } = require("./Conferencia");
const {
  getMyModel: getConferenciasUsuariosModel,
} = require("./ConferenciasUsuarios");
const { getMyModel: getPerfilesTagsModel } = require("./PerfilesTags");

let associationsInitialized = false;

const defineAssociations = async (tenant) => {

  if (associationsInitialized) {
    console.log("Las asociaciones ya están definidas.");
    return;
  } else {
    console.log("Definiendo asociaciones.....");
  }

  const PerfilesTags = await getPerfilesTagsModel(tenant);
  const ConferenciasUsuarios = await getConferenciasUsuariosModel(tenant);

  const Usuario = await getUsuarioModel(tenant);
  const Perfil = await getPerfilModel(tenant);
  const Especialidad = await getEspecialidadModel(tenant);
  const Tag = await getTagModel(tenant);
  const Conferencia = await getConferenciaModel(tenant);

  const associations = {
    Usuario: [
      {
        method: "hasOne",
        model: Perfil,
        options: {
          foreignKey: "user_id",
        },
      },
      {
        method: "belongsToMany",
        model: Conferencia,
        options: {
          through: ConferenciasUsuarios,
          foreignKey: "user_id",
          otherKey: "conferencia_id",
        },
      },
    ],

    Perfil: [
      {
        method: "belongsTo",
        model: Usuario,
        options: {
          foreignKey: "user_id",
        },
      },
      {
        method: "belongsTo",
        model: Especialidad,
        options: {
          foreignKey: "especialidad_id",
        },
      },
      {
        method: "belongsToMany",
        model: Tag,
        options: {
          through: PerfilesTags,
          foreignKey: "perfil_id",
          otherKey: "tag_id",
        },
      },
    ],

    Conferencia: [
      {
        method: "belongsToMany",
        model: Usuario,
        options: {
          through: ConferenciasUsuarios,
          foreignKey: "conferencia_id",
          otherKey: "user_id",
          as: "usuarios",
        },
      },
      {
        method: "belongsTo",
        model: Usuario,
        options: {
          foreignKey: "user_id",
          as: "user",
        },
      },
    ],

    Especialidad: [
      {
        method: "hasMany",
        model: Perfil,
        options: {
          foreignKey: "especialidad_id",
        },
      },
    ],

    Tag: [
      {
        method: "belongsToMany",
        model: Perfil,
        options: {
          through: PerfilesTags,
          foreignKey: "tag_id",
          otherKey: "perfil_id",
        },
      },
    ],
  };

  const models = {
    Usuario,
    Perfil,
    Conferencia,
    Especialidad,
    Tag,
  };

  for (const [modelName, associationsList] of Object.entries(associations)) {
    const modelInstance = models[modelName];

    if (!modelInstance) continue;

    for (const { method, model, options } of associationsList) {
      if (modelInstance[method]) {
        console.log(
          `Asociando ${modelName} con ${model.name} usando ${method}`
        );
        modelInstance[method](model, options);
      }
    }
  }

  associationsInitialized = true;
  console.log("models has been associated");
};

module.exports = {
  defineAssociations,
};
