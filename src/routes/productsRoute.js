const express=require('express');
const productController=require('../controllers/productController')
const multer = require("multer");
const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;



const router= express.Router();
const storage = multer.diskStorage({
    destination: async (req, file, cb)=> {
        if (!fs.existsSync(path.join(__dirname, '..', 'public/img'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'public/img'))
        }
        cb(null, appRoot + '/src/public/img');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + Date.now());
    },
});
const imageFilter = function(req, file, cb) {
    
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|jfif)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
    
};

const upload = multer({
    storage: storage,
    // fileFilter: imageFilter,
    limits: { fileSize: 11000000, files: 10 }
});






router.get("/",productController.getAllProducts);
router.get("/_search",productController.getSearchProducts);
router.get("/deleted/product",productController.getDeletedProduct);


router.post("/create",productController.createProduct);
router.post("/post/img",upload.array("files"),productController.postImg);
router.post("/post/img/url",productController.postImgbyUrl);


router.patch("/:id/update",productController.updateProduct);
router.patch("/:id/update/likes",productController.likesProduct);


router.delete("/:id/delete",productController.deleteForever);

router.delete("/:id/soft/delete",productController.deleteProduct);

router.patch("/:id/restore",productController.productRestore);

router.post("/test",productController.testProduct);


module.exports = router;