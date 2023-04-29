const express = require('express');
const router = express.Router();

const { list } = require('../controllers/chat');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

router.use( validarJWT )

router.get('/:id', [validarCampos], list);

module.exports = router;