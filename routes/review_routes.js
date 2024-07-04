const express = require('express');
const review_controller = require('./../controllers/review_controller')
const auth_controller = require('./../controllers/auth_controller');

//* Both of them will be redirected here.
// POST /tour/23df3jki/reviews
// GET /reviews 

const router = express.Router({mergeParams : true});
router.use(auth_controller.protect);
router.route('/')
    .get(review_controller.get_all_reviews) // if this is the only get here then  GET /tour/23efdfk/reviews will also be executed
    .post(auth_controller.restrict_to('user'),review_controller.set_tour_user_id,review_controller.create_review)

router.route('/:id').get(review_controller.get_review)
                    .delete(auth_controller.restrict_to('user','admin'),review_controller.delete_review)
                    .patch(auth_controller.restrict_to('user'),review_controller.update_review);
                    


module.exports = router;