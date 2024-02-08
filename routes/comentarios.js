const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, find, create, update, remove, likes } = require('../controllers/comentarios');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

const { validarBodyParser } = require('../middlewares/validar-body-parser');
router.use( validarBodyParser )

const { validarTenant } = require('../middlewares/validar-tenant');
router.use( validarTenant )

router.use( validarJWT )

router.get('/', list);
router.get('/:id', find);
router.post(
    '/',
    [
        validarCampos
    ],
    create
);

router.post(
    '/likes/:id',
    [
        validarCampos
    ],
    likes
);

router.put(
    '/:id',
    [
        validarCampos
    ],
    update
);

router.delete(
    '/:id',
    remove
);


module.exports = router;