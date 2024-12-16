const express = require("express");
const { getMyModel } = require("../models/Especialidad");

const create = async (req, res = express.response) => {
  const { tenant } = req;
  const { name } = req.fields;
  try {
    const Especialidad = await getMyModel(tenant);
    const especialidad = new Especialidad(req.fields);

    let existe = await Especialidad.findOne({ where: { name } });
    console.log("existe", existe);

    if (existe) {
      return res.status(400).json({
        ok: false,
        msg: "La Especialidad ya se encuentra registrada",
      });
    }

    const saved = await especialidad.save();

    return res.status(201).json({
      ok: true,
      saved,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "create: Internal Error",
    });
  }
};

const paginate = async (req, res = express.response) => {
  const { tenant } = req;
  try {
    const limit = req.query.limit;
    const page = req.query.page - 1;

    const Especialidad = await getMyModel(tenant);
    const especialidades = await Especialidad.findAll({
      order: [["name", "asc"]],
      offset: limit * page,
      limit: +limit,
    });

    const total = await Especialidad.count();

    return res.status(200).json({
      ok: true,
      especialidades,
      total,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "list: Internal Error",
    });
  }
};

const list = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Especialidad = await getMyModel(tenant);
    const especialidades = await Especialidad.findAll({
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      ok: true,
      especialidades,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "list: Internal Error",
    });
  }
};

const find = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Especialidad = await getMyModel(tenant);
    const especialidad = await Especialidad.findByPk(req.params.id);

    if (!especialidad) {
      return res.status(404).json({
        ok: false,
        msg: "La Especialidad no existe",
      });
    }

    return res.status(200).json({
      ok: true,
      especialidad,
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
  const { name } = req.fields;

  try {
    const Especialidad = await getMyModel(tenant);
    const [affectedCount] = await Especialidad.update(
      {
        name,
      },
      {
        where: { id: req.params.id },
      }
    );

    if (!affectedCount) {
      return res.status(404).json({
        ok: false,
        msg: "La Especialidad no existe",
      });
    }

    const especialidad = await Especialidad.findByPk( req.params.id );

    return res.status(200).json({
      ok: true,
      especialidad,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "update: Internal Error",
    });
  }
};

const remove = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Especialidad = await getMyModel(tenant);

    const especialidad = await Especialidad.findByPk( req.params.id );

    if (!especialidad) {
      return res.status(404).json({
        ok: false,
      });
    }

    await especialidad.destroy();

    return res.status(200).json({
      ok: true,
      especialidad,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "remove: Internal Error",
    });
  }
};

module.exports = {
  create,
  update,
  find,
  list,
  paginate,
  remove,
};
