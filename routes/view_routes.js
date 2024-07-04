const express = require('express');
// const path = require('path');
const view_controller = require('./../controllers/view_controller');
const auth_controller = require('./../controllers/auth_controller');
const booking_controller = require('./../controllers/booking_controller');

const router = express.Router();


router.get('/me',auth_controller.protect,view_controller.get_account);
router.post('/submit-user-data',auth_controller.protect,view_controller.update_user_data);
router.get('/my-tours',auth_controller.protect,view_controller.get_my_tours)

router.use(auth_controller.isLoggedIn);
router.get('/',booking_controller.create_booking_checkout,view_controller.get_overview)
router.get('/tour/:slug',view_controller.get_tour)
router.get('/login',view_controller.get_login_form)

module.exports = router;