const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { recovery, passwords, withToken, list, paginate, find, create, update, remove } = require('../controllers/usuarios');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

router.post(
    '/recovery',
    [
        check('email', 'El password es obligatorio').not().isEmpty(),
        validarCampos
    ],
    recovery
);

router.post(
    '/with-token',
    [
        check('password1', 'El password es obligatorio').not().isEmpty(),
        validarCampos
    ],
    withToken
);

router.use( validarJWT )

router.get('/', list);
router.get('/paginate', paginate);
router.get('/:id', find);

router.post(
    '/passwords',
    [
        check('password1', 'El password es obligatorio').not().isEmpty(),
        validarCampos
    ],
    passwords
);

router.post(
    '/',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos
    ],
    create
);

router.put(
    '/:id',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos
    ],
    update
);

router.delete(
    '/:id',
    remove
);


module.exports = router;