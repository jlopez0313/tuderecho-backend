const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, paginate, find, findByDomain, create, update, remove } = require('../controllers/tenants');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

router.get('/domain/:domain', findByDomain);

// router.use( validarJWT )

router.get('/', validarJWT, list);
router.get('/paginate', validarJWT, paginate);
router.post(
    '/',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        validarJWT,
        validarCampos
    ],
    create
);

router.put(
    '/:id',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        validarJWT,
        validarCampos
    ],
    update
);

router.delete(
    '/:id',
    validarJWT,
    remove
);


module.exports = router;