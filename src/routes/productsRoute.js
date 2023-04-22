const express=require('express');
const productController=require('../controllers/productController')



const router= express.Router();





router.get("/",productController.getAllProducts)
router.get("/deleted/product",productController.getDeletedProduct)


router.post("/create",productController.createProduct)


router.patch("/:id/update",productController.updateProduct)



router.delete("/:id/delete",productController.deleteForever)

router.delete("/:id/soft/delete",productController.deleteProduct)

router.patch("/:id/restore",productController.productRestore)


module.exports = router