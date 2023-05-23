const express=require('express');
const cataloController=require('../controllers/cataloController')
const verifyJWT=require('../middleware/verifyJWT')

const router=express.Router();

// router.use(verifyJWT);

router.get('/',cataloController.getCataloProduct)
router.get('/deleted',cataloController.getSoftCataloProduct)
router.post('/post',cataloController.createCataloProduct)
router.patch('/:id/update',cataloController.updateCataloProduct)
router.delete('/:id/delete',cataloController.deleteCataloProduct)
router.delete('/:id/softdelete',cataloController.softdeleteCataloProduct)
router.delete('/:id/restore',cataloController.restoreCataloProduct)

module.exports = router;