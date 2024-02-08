const express = require('express');
const router = express.Router();

const  { check } = require('express-validator');
const { list, madeBy, madeByMe, myList, find, create, update, remove, subscribe } = require('../controllers/videoteca');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

const { validarBodyParser } = require('../middlewares/validar-body-parser');
router.use( validarBodyParser )

const { validarTenant } = require('../middlewares/validar-tenant');
router.use( validarTenant )

router.use( validarJWT )

router.get('/madeByMe', madeByMe);
router.get('/madeBy/:id', madeBy);

router.get('/:search?', list);
router.post('/my-list/:search?', myList);
router.get('/:id', find);
router.post('/subscribe/:id', subscribe);

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