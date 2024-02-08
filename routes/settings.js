const express = require('express');
const router = express.Router();

const { find, update } = require('../controllers/settings');
const { validarJWT } = require('../middlewares/validar-token');

const { validarBodyParser } = require('../middlewares/validar-body-parser');
router.use( validarBodyParser )

const { validarTenant } = require('../middlewares/validar-tenant');
router.use( validarTenant )

router.get('/', find);
router.put('/', validarJWT, update );

module.exports = router;