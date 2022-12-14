const express=require('express');
const authController=require('../controllers/authController');
const loginLimiter=require('../middleware/loginLimiter');

const router=express.Router();

router.post('/register',authController.register);

router.post('/login',loginLimiter,authController.login);

router.put('/update/login',authController. updateAndLogin);

router.get('/refresh',authController.refreshToken);

router.post('/logout',authController.logout);

router.post('/confirm',authController.confirm);

router.put('/forgot/password',authController.forgotPassword);



module.exports = router;