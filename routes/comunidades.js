const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, myList, search, find, create, update, remove } = require('../controllers/comunidades');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

router.use( validarJWT )

router.get('/:search?', list);
router.post('/my-list/:search?', myList);
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