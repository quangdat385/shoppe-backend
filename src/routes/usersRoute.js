const express=require('express');
const usersController = require('../controllers/usersController')
const verifyJWT=require('../middleware/verifyJWT')
const multer = require("multer");
const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;


const router = express.Router();
// router.use(verifyJWT);

const storage = multer.diskStorage({
    destination: async (req, file, cb)=> {
        if (!fs.existsSync(path.join(__dirname, '..', 'public/img/avatar'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'public/img/avatar'))
        }
        cb(null, appRoot + '/src/public/img/avatar');
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
    fileFilter: imageFilter,
    limits: { fileSize: 11000000 }
});




router.get('/',usersController.show);


router.get('/show/delete',usersController.showDeleted);


router.post('/create',usersController.create);


router.patch('/:id/update',usersController.updateUser);
router.patch('/:id/update/avatar',upload.single("avatar"),usersController.updateAvatar);


router.patch('/update',usersController.updateManager);


router.delete('/:id/soft/delete',usersController.softDelete);


router.delete('/:id/delete',usersController.delete);


router.patch('/:id/restore',usersController.restore);


router.put('/:id/change/password',usersController.changePassworded);



module.exports = router;