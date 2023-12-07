const express = require('express');
const router = express.Router();

const { list, all } = require('../controllers/chat');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

const { validarTenant } = require('../middlewares/validar-tenant');
router.use( validarTenant )

router.use( validarJWT )

router.get('/all', [validarCampos], all);
router.get('/:id', [validarCampos], list);

module.exports = router;