const express = require("express");
const bcrypt = require("bcryptjs");
const { getMyModel } = require("../models/Usuario");
const { getMyModel: getPerfilModel } = require("../models/Perfil");

const { generarJWT } = require("../helpers/jwt");
const { sendEmail } = require("../helpers/mailer");
const { GIGAS, DAYS_LEFT } = require("../constants/constants");

const crearUsuario = async (req, res = express.response) => {
  const { tenant } = req;
  const { name, email, password, provider } = req.fields;

  try {
    const Usuario = await getMyModel(tenant);
    const Perfil = await getPerfilModel(tenant);

    let usuario = await Usuario.findOne({
      where: { email },
    });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya se encuentra registrado",
      });
    }

    const today = new Date();
    today.setDate(today.getDate() + DAYS_LEFT);

    usuario = await Usuario.create({
      ...req.fields,
      pts: 5,
      plan: 1,
      storage: 0,
      total_storage: GIGAS,
      suscription: "F",
      days_left: today,
      estado: "P",
      provider: provider || "LOCAL",
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    });

    await Perfil.create({ user: usuario.id });

    const token = await generarJWT(
      usuario.id,
      usuario.name,
      usuario.rol,
      usuario.perfil?.photo
    );

    if (provider === "GMAIL") {
      sendEmail(email, "Bienvenido!", "Mensaje de bienvenida a Tu Derecho!");
    }

    return res.status(201).json({
      ok: true,
      usuario: usuario.toJSON(),
      token,
    });
  } catch (error) {
    console.log(error);

    // Manejo de errores de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        ok: false,
        msg: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      ok: false,
      msg: "crearUsuario: Internal Error",
    });
  }
};

const loginUsuario = async (req, res = express.response) => {
  const { tenant } = req;
  const { email, password } = req.fields;
  try {
    const Perfil = await getPerfilModel(tenant);
    const Usuario = await getMyModel(tenant);

    const usuario = await Usuario.findOne({
      where: { email },
      include: [
        {
          model: Perfil,
        },
      ],
    });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no se encuentra registrado",
      });
    }

    const passwowrdValid = bcrypt.compareSync(password, usuario.password);
    if (!passwowrdValid) {
      return res.status(501).json({
        ok: false,
        msg: "El password no es valido",
      });
    }

    usuario.isLogged = true;
    await usuario.save();

    const token = await generarJWT(
      usuario.id,
      usuario.name,
      usuario.rol,
      usuario.perfil?.photo
    );

    return res.status(200).json({
      ok: true,
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "loginUsuario: Internal Error",
    });
  }
};

const revalidarToken = async (req, res = express.response) => {
  const { uid, name, rol, photo } = req;

  const token = await generarJWT(uid, name, rol, photo);

  res.status(200).json({
    ok: true,
    token,
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
