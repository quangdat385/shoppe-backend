const express=require('express');

const verifyJWT=require('../middleware/verifyJWT');
const productdetailsController=require('../controllers/productDetailsController');

const router=express.Router();

// router.use(verifyJWT);
router.get('/',productdetailsController.show );
router.post('/',productdetailsController.create );
router.patch('/:id/update',productdetailsController.update );
router.delete('/:id/delete',productdetailsController.delete );




module.exports = router;