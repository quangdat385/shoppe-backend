const express = require('express');


const productdetailsController = require('../controllers/productDetailsController');

const router = express.Router();


router.get('/', productdetailsController.show);
router.post('/', productdetailsController.create);
router.patch('/:id/update', productdetailsController.update);
router.patch('/update/many', productdetailsController.updateMany);
router.delete('/:id/delete', productdetailsController.delete);




module.exports = router;