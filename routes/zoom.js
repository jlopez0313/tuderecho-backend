const express = require('express');
const router = express.Router();

const { validarBodyParser } = require('../middlewares/validar-body-parser');
router.use( validarBodyParser )

const { auth } = require('../controllers/zoom');

router.get('/auth', auth);

module.exports = router;