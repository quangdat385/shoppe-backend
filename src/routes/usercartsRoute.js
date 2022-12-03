const express=require('express');
const usercartController=require('../controllers/usercartController')
const verifyJWT=require('../middleware/verifyJWT');

const router= express.Router();

router.use(verifyJWT);

router.get('/',usercartController.show);
router.get('/soft',usercartController.softShow);

router.post('/purchase',usercartController.purchase);
router.put('/:id/update',usercartController.updateCart);

router.patch('/:id/restore',usercartController.restore);

router.delete('/id/delete',usercartController.deleteOne);
router.delete('/delete',usercartController.deleteMany);





module.exports = router;