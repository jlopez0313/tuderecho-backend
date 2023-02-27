const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, find, create, update, remove } = require('../controllers/videoteca');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

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