const express=require('express');
const productController=require('../controllers/productController')
const verifyJWT=require('../middleware/verifyJWT')


const router= express.Router();



router.use(verifyJWT);

router.get("/",productController.getAllProducts)
router.get("/deleted/product",productController.getDeletedProduct)


router.post("/create",productController.createProduct)


router.patch("/:id/update",productController.updateProduct)


router.delete("/:id/delete",productController.deleteProduct)

router.delete("/:id/soft/delete",productController.deleteForever)

router.patch("/:id/restore",productController.productRestore)


module.exports = router