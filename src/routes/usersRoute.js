const express=require('express');
const usersController = require('../controllers/usersController')
const verifyJWT=require('../middleware/verifyJWT')


const router = express.Router();
router.use(verifyJWT);

router.get('/',usersController.show);


router.get('/show/delete',usersController.showDeleted);


router.post('/create',usersController.create);


router.patch('/:id/update',usersController.updateUser);


router.patch('/update',usersController.updateManager);


router.delete('/:id/soft/delete',usersController.softDelete);


router.delete('/:id/delete',usersController.delete);


router.patch('/:id/restore',usersController.restore);


router.put('/:id/change/password',usersController.changePassworded);



module.exports = router;