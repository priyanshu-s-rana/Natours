const express = require('express');
const auth_controller = require('./../controllers/auth_controller');
const booking_controller = require('./../controllers/booking_controller');

const router = express.Router();

router.use(auth_controller.protect)
router.get('/checkout-session/:tour_id',auth_controller.protect,booking_controller.get_checkout_session);

router.use(auth_controller.restrict_to('admin', 'lead-guide'))
router.route('/').get(booking_controller.get_all_booking).post(booking_controller.create_booking);
router.route('/:id').get(booking_controller.get_booking).patch(booking_controller.update_booking)
                    .delete(booking_controller.delete_booking);

module.exports = router;