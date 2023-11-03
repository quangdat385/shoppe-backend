const express = require('express');

const verifyJWT = require('../middleware/verifyJWT');
const DeliverController = require('../controllers/deliverControllers');

const router = express.Router();

router.use(verifyJWT);
router.get('/', DeliverController.getDelivery);
router.post('/post', DeliverController.createDelivery);
router.patch('/update', DeliverController.updateDelivery);
router.delete('/:id/delete', DeliverController.deleteDelivery);



module.exports = router;