const express = require('express');

const verifyJWT = require('../middleware/verifyJWT');
const VoucherConTroller = require('../controllers/vourcherController');

const router = express.Router();

router.use(verifyJWT);
router.get('/', VoucherConTroller.getVoucher);
router.post('/create', VoucherConTroller.createVoucher);




module.exports = router;