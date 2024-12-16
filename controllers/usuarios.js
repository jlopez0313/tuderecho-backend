const express = require("express");
const { sendEmail } = require("../helpers/mailer");
const { generarJWT } = require("../helpers/jwt");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const { getMyModel: getUsuarioModel } = require("../models/Usuario");
const { getMyModel: getPerfilModel } = require("../models/Perfil");
const { getMyModel: getEspecialidadModel } = require("../models/Especialidad");
const { getMyModel: getTagModel } = require("../models/Tag");

const { uploadBase64, removeFile } = require("../helpers/files");
const { getTenantModel } = require("../models/Tenant");

const recovery = async (req, res = express.response) => {
  const { tenant } = req;
  const { email } = req.fields;
  try {
    const TenantModel = await getTenantModel();
    const existe = await TenantModel.findOne({ name: tenant });

    if (!existe) {
      return res.status(400).json({
        ok: false,
        msg: "El Tenant no encuentra registrado",
      });
    }

    const Usuario = await getUsuarioModel(tenant);
    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no se encuentra registrado",
      });
    }

    const salt = bcrypt.genSaltSync();
    const token = bcrypt.hashSync(new Date().toString(), salt);
    await usuario.update({ token });

    const url = `https://${existe.domain}/claves?temporary_token=${token}`;

    const html = `
        <html>
            <head>
            </head>
            <body>
                <h1> Solicitud de cambio de contraseña. </h1>

                <p> Estimado <b>${usuario.name}</b>, accede al enlace que se incluye en este mensaje para crear <br />
                    una contraseña nueva. 
                </p>
                <p>
                    Enlace: <a href="${url}"> ${url} </a>
                </p>
                <p>
                    Este enlace solo será válido durante una hora. <br />
                    Por favor, borra este mensaje si lo has recibido por error.
                </p>
            </body>
        </html>
        `;

    sendEmail(email, "Olvidaste tu contraseña!", "", html);

    return res.status(201).json({
      ok: true,
      msg: "Email sent !!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "recovery: Internal Error",
    });
  }
};

const passwords = async (req, res = express.response) => {
  const { tenant } = req;
  const { password, password1, email } = req.fields;
  try {
    const Usuario = await getUsuarioModel(tenant);
    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no se encuentra registrado",
      });
    }

    if (!usuario.pts) {
      usuario.pts = 5;
    }

    const passwowrdValid = bcrypt.compareSync(password, usuario.password);
    if (!passwowrdValid) {
      return res.status(400).json({
        ok: false,
        msg: "El password actual no es valido",
      });
    }

    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password1, salt);
    await usuario.save();

    const html = `
        <html>
            <head>
            </head>
            <body>
                <h1> Notificación de cambio de contraseña. </h1>

                <p> Estimado <b>${usuario.name}</b>, hemos efectuado el cambio de contraseña de tu cuenta ${usuario.email}. 
                </p>
                <p>
                    Si no realizaste esta acción, por favor comunicate con nosotros al correo <b> correo@corre.com </b>
                </p>
            </body>
        </html>
        `;

    sendEmail(email, "Tu contraseña ha cambiado!", "", html);

    return res.status(201).json({
      ok: true,
      msg: "Tu cambio de contraseña fue satisfactorio",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "passwords: Internal Error",
    });
  }
};

const withToken = async (req, res = express.response) => {
  const { uid, tenant } = req;
  const { password1, token } = req.fields;
  try {
    const Usuario = await getUsuarioModel(tenant);
    let usuario = await Usuario.findOne({ token });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no se encuentra registrado",
      });
    }

    const tokenValid = token === usuario.token;
    if (!uid && !tokenValid) {
      return res.status(400).json({
        ok: false,
        msg: "El token actual no es valido",
      });
    }

    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password1, salt);
    usuario.token = "";
    await usuario.save();

    const html = `
        <html>
            <head>
            </head>
            <body>
                <h1> Notificación de cambio de contraseña. </h1>

                <p> Estimado <b>${usuario.name}</b>, hemos efectuado el cambio de contraseña de tu cuenta ${usuario.email}. 
                </p>
                <p>
                    Si no realizaste esta acción, por favor comunicate con nosotros al correo <b> correo@corre.com </b>
                </p>
            </body>
        </html>
        `;

    sendEmail(usuario.email, "Tu contraseña ha cambiado!", "", html);

    return res.status(201).json({
      ok: true,
      msg: "Tu cambio de contraseña fue satisfactorio",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "passwords: Internal Error",
    });
  }
};

const create = async (req, res = express.response) => {
  const { tenant } = req;
  const { name } = req.fields;
  const usuario = new Usuario({ ...req.fields, pts: 5 });
  try {
    const Usuario = await getUsuarioModel(tenant);
    let existe = await Usuario.findOne({ where: { name } });
    console.log("existe", existe);

    if (existe) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario ya se encuentra registrado",
      });
    }

    const saved = await usuario.save();

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

    const Usuario = await getUsuarioModel(tenant);

    const usuarios = await Usuario.findAll({
      except: ["password"],
      order: [["name", "ASC"]],
      offset: limit * page,
      limit: +limit,
    });

    const total = await Usuario.count();

    return res.status(200).json({
      ok: true,
      usuarios,
      total,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "list: Internal Error",
    });
  }
};

const byRol = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const limit = req.query.limit;
    const page = req.query.page - 1;

    const Usuario = await getUsuarioModel(tenant);
    const Perfil = await getPerfilModel(tenant);
    const Especialidad = await getEspecialidadModel(tenant);

    const usuarios = await Usuario.findOne({
      where: {
        rol: req.query.rol,
        estado: "A",
      },
      except: ["password"],
      order: [["pts", "ASC"]],
      offset: limit * page,
      limit: limit,
      include: [
        {
          model: Perfil,
          include: [
            {
              model: Especialidad,
              as: "especialidad",
            },
          ],
        },
      ],
    });

    const total = await Usuario.count({
      where: {
        rol: req.query.rol,
        estado: "A",
      },
    });

    return res.status(200).json({
      ok: true,
      usuarios,
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
    const Usuario = await getUsuarioModel(tenant);
    const usuarios = await Usuario.findAll({
      except: ["password"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      ok: true,
      usuarios,
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
    const Perfil = await getPerfilModel(tenant);
    const Usuario = await getUsuarioModel(tenant);
    const Tag = await getTagModel(tenant);

    const usuario = await Usuario.findByPk(req.params.id, {
      exclude: ["password"],
      include: [
        {
          model: Perfil,
          include: [
            {
              model: Tag,
            },
          ],
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "El usuario no existe",
      });
    }

    usuario.id = usuario._id;

    if (usuario.perfil) {
      usuario.perfil.oldImage = usuario.perfil.photo;
    }

    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      ok: false,
      msg: "find: Internal Error",
    });
  }
};

const update = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Usuario = await getUsuarioModel(tenant);
    const Tag = await getTagModel(tenant);

    const [affectedUser] = await Usuario.update(
      {
        ...req.fields,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    if (!affectedUser) {
      return res.status(404).json({
        ok: false,
        msg: "update: El usuario no existe",
      });
    }

    const { photo, oldImage } = req.fields.perfil || {
      photo: null,
      oldImage: null,
    };

    let imageUrl = oldImage;

    if (oldImage !== photo) {
      imageUrl = await uploadFile(photo, oldImage);
    }

    const Perfil = await getPerfilModel(tenant);
    const [affectedCount] = await Perfil.update(
      {
        ...req.fields.perfil,
        photo: imageUrl,
      },
      {
        where: { user_id: req.params.id },
      }
    );

    let perfil = await Perfil.findOne({ where: { user_id: req.params.id } });

    const tags = await Tag.findAll({
      where: {
        id: [...req.fields.perfil.tags],
      },
    });

    if (!affectedCount) {
      perfil = new Perfil({
        user_id: req.params.id,
        ...req.fields.perfil,
        photo: imageUrl,
      });

      perfil = await perfil.save();
    }

    await perfil.setTags(tags);

    const usuario = await Usuario.findByPk(req.params.id);
    usuario.perfil = { ...perfil };
    usuario.perfil.oldImage = imageUrl;

    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      ok: false,
      msg: "update: Internal Error",
    });
  }
};

const remove = async (req, res = express.response) => {
  const { tenant } = req;

  try {
    const Usuario = await getUsuarioModel(tenant);
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
      });
    }

    await usuario.destroy();

    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "remove: Internal Error",
    });
  }
};

const uploadFile = (strImage, oldImage) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (oldImage) {
        await removeFile(oldImage);
      }
    } catch (err) {
      console.log("No existe la imagen", oldImage, err);
    } finally {
      try {
        uploadBase64(strImage, resolve, reject);
      } catch (err) {
        resolve(strImage);
      }
    }
  });
};

module.exports = {
  recovery,
  passwords,
  withToken,
  create,
  update,
  find,
  list,
  paginate,
  byRol,
  remove,
};
