const express = require('express');
const user_controller = require(`../controllers/user_controller`)
const auth_controller = require('./../controllers/auth_controller');
const review_router = require('./review_routes');


const router = express.Router();
router.use('/:userId/reviews',review_router);


//------------------------------------ Authorization --------------------------------------
router.post('/signup',auth_controller.signup);
router.post('/login',auth_controller.login);
router.get('/logout',auth_controller.logout);
router.post('/forgotPassword',auth_controller.forgot_password);
router.patch('/resetPassword/:token',auth_controller.reset_password);

//! All the middlewares below require protection.
router.use(auth_controller.protect);

// ----------------------------------- User's personalization -----------------------------
router.get('/me',user_controller.getMe,user_controller.get_user);
router.patch('/updateMe',user_controller.upload_user_photo,user_controller.resize_user_photo, user_controller.update_me);
router.delete('/deleteMe',user_controller.delete_me);
router.patch('/updatePassword',auth_controller.update_password);


//! All the routes below are accessed only to admin.
router.use(auth_controller.restrict_to('admin'))
// REST format
router.route('/').get(user_controller.get_all_users).post(user_controller.create_user);
//router.route('/forgotPassword').post(auth_controller.protect,auth_controller.forgot_password);
router.route('/:id').get(user_controller.get_user)
                    .patch(user_controller.update_user)
                    .delete(user_controller.delete_user);

module.exports = router;