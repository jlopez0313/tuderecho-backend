const express = require("express");
const { generarJWT } = require("../helpers/jwt");
const { getMyModel: getConferenciaModel } = require("../models/Conferencia");
const { getMyModel: getUsuarioModel } = require("../models/Usuario");

const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

const { createMeeting } = require("../helpers/zoom");
const { uploadFile, removeFile } = require("../helpers/files");
const { Op, fn, where, col } = require("sequelize");

const create = async (req, res = express.response) => {
  const { uid, tenant } = req;

  // const form = formidable({ multiples: true, keepExtensions: true });
  // form.uploadDir = path.join(__dirname, "..", "public", "conferencias");

  const { fields, files } = req;
  const pathUrl = await uploadFile(
    files.archivo.path,
    files.archivo.type,
    "public/conferencias/"
  );

  // const meeting = await createMeeting('me', fields.access_token, res);
  // console.log('meeting', meeting);

  try {
    const Conferencia = await getConferenciaModel(tenant);
    const conferencia = new Conferencia({
      ...fields,
      user_id: uid,
      archivo: pathUrl,
    });
    const saved = await conferencia.save();

    const Usuario = await getUsuarioModel(tenant);
    const usuario = await Usuario.findByPk(uid);

    console.log(conferencia);

    await usuario.addConferencia(conferencia);

    return res.status(201).json({
      ok: true,
      saved,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "create: Internal Error",
    });
  }

  /*
    const conferencia = new Conferencia( req.fields );
    try {
        
        const saved = await conferencia.save();

        closeConnection();

        return res.status(201).json({
            ok: true,
            saved
        })

    } catch(error) {
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    }

    */
};

const madeBy = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Conferencia = await getConferenciaModel(tenant);
    const conferencias = await Conferencia.findAll({
      where: { user_id: req.params.id },
    });

    return res.status(200).json({
      ok: true,
      conferencias,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      msg: "myList: Internal Error",
    });
  }
};

const madeByMe = async (req, res = express.response) => {
  const { uid, tenant } = req;

  try {
    const Conferencia = await getConferenciaModel(tenant);
    const conferencias = await Conferencia.findAll({
      where: { user: uid },
    });

    return res.status(200).json({
      ok: true,
      conferencias,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      msg: "myList: Internal Error",
    });
  }
};

const myList = async (req, res = express.response) => {
  const { uid, tenant } = req;
  const filter = req.params?.search || "";

  try {
    const limitDate = new Date();
    limitDate.setHours(-1);

    const limit = req.query.limit;
    const page = req.query.page - 1;

    const Usuario = await getUsuarioModel(tenant);
    const user = await Usuario.findByPk(uid);

    const Conferencia = await getConferenciaModel(tenant);
    const conferencias = await Conferencia.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.in]: user.conferencias || [] } },
          { fecha: { [Op.gt]: limitDate } },
          {
            [Op.or]: [
              where(fn("LOWER", col("titulo")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
              where(fn("LOWER", col("conferencista")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
              where(fn("LOWER", col("objetivo")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
            ],
          },
        ],
      },
      order: [["updatedAt", "DESC"]],
      offset: limit * page,
      limit: +limit,
    });

    return res.status(200).json({
      ok: true,
      conferencias,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      msg: "list: Internal Error",
    });
  }
};

const list = async (req, res = express.response) => {
  const { uid, tenant } = req;
  const filter = req.params?.search || "";

  try {
    const limitDate = new Date();
    limitDate.setHours(-1);

    const limit = req.query.limit;
    const page = req.query.page - 1;

    const Usuario = await getUsuarioModel(tenant);
    const user = await Usuario.findByPk(uid, {
      include:[
        {
          model: Conferencia,
          through: { attributes: [] }
        }
      ]
    });

    const Conferencia = await getConferenciaModel(tenant);

    console.log( user.conferencias ) 

    const conferencias = await Conferencia.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.notIn]: user.conferencias || [] } },
          { fecha: { [Op.gt]: limitDate } },
          {
            [Op.or]: [
              where(fn("LOWER", col("titulo")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
              where(fn("LOWER", col("conferencista")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
              where(fn("LOWER", col("objetivo")), {
                [Op.like]: `%${filter.toLowerCase()}%`,
              }),
            ],
          },
        ],
      },
      order: [["updatedAt", "DESC"]],
      offset: limit * page,
      limit: +limit,
      include: [
        {
          model: Usuario,
          through: { attributes: [] },
          as: "usuarios",
        },{
          model: Usuario,
          as: 'user'
        },
      ],
    });

    return res.status(200).json({
      ok: true,
      conferencias,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      msg: "list: Internal Error",
    });
  }
};

const find = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Usuario = await getUsuarioModel(tenant);

    const Conferencia = await getConferenciaModel(tenant);
    const conferencia = await Conferencia.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    }).populate({
      select: "name",
    });

    if (!conferencia) {
      return res.status(404).json({
        ok: false,
        msg: "La conferencia no existe",
      });
    }

    return res.status(200).json({
      ok: true,
      conferencia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "find: Internal Error",
    });
  }
};

const update = async (req, res = express.response) => {
  const { tenant } = req;
  const { fields, files } = req;

  // const form = formidable({ multiples: true, keepExtensions: true });
  // form.uploadDir = path.join(__dirname, "..", "public", "conferencias");

  let pathUrl = "";
  if (files.archivo) {
    pathUrl = await uploadFile(
      files.files.path,
      files.files.type,
      "public/conferencias/"
    );
  }

  try {
    delete fields.usuarios;

    const body = { ...fields };

    if (pathUrl) body.archivo = pathUrl;

    const Conferencia = await getConferenciaModel(tenant);
    const conferencia = await Conferencia.update(
      { ...body },
      { where: { id: fields.id } }
    );

    return res.status(201).json({
      ok: true,
      conferencia,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "update: Internal Error",
    });
  }
};

const remove = async (req, res = express.response) => {
  const { uid, tenant } = req;

  try {
    const Conferencia = await getConferenciaModel(tenant);
    const conferencia = await Conferencia.findByPk(req.params.id);
    if (!conferencia) {
      return res.status(404).json({
        ok: false,
        message: "La conferencia no existe",
      });
    }

    await removeFile(conferencia.archivo);

    await conferencia.destroy();

    const Usuario = await getUsuarioModel(tenant);
    const usuario = await Usuario.findByPk(uid);
    await usuario.removeConferencia(conferencia.id);

    return res.status(200).json({
      ok: true,
      conferencia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "remove: Internal Error",
    });
  }
};

const subscribe = async (req, res = express.response) => {
  const { uid, tenant } = req;

  try {
    const Conferencia = await getConferenciaModel(tenant);
    const conferencia = await Conferencia.findByPk(req.params.id);

    if (!conferencia) {
      return res.status(404).json({
        ok: false,
        message: "La conferencia no existe",
      });
    }

    const Usuario = await getUsuarioModel(tenant);
    const usuario = await Usuario.findByPk(uid);
    await usuario.addConferencia(conferencia);

    return res.status(200).json({
      ok: true,
      conferencia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "update: Internal Error",
    });
  }
};

module.exports = {
  create,
  update,
  find,
  list,
  madeBy,
  madeByMe,
  myList,
  remove,
  subscribe,
};
