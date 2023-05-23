const express=require('express');

const verifyJWT=require('../middleware/verifyJWT');
const RatingController=require('../controllers/ratingController');

const router=express.Router();

// router.use(verifyJWT);
router.get('/',RatingController.show );
router.post('/post',RatingController.create );
router.patch('/update',RatingController.update );
router.delete('/:id/delete',RatingController.delete );



module.exports = router;