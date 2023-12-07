const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, paginate, find, create, update, remove } = require('../controllers/tenants');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

router.use( validarJWT )

router.get('/', list);
router.get('/paginate', paginate);
router.get('/:id', find);
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