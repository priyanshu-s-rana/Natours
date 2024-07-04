const express = require('express');
const tour_controller = require(`./../controllers/tour_controller`);
const auth_controller = require(`./../controllers/auth_controller`);
const review_router = require('./review_routes');
const router = express.Router(); //! Making a router.

//! Middle ware function specific to tour 
//router.param('id',check_id);
router.use('/:tourId/reviews',review_router);
router.route('/top5_best').get(tour_controller.alias_top_tours, tour_controller.get_all_tours); // aliasing.
router.route('/tour_stats').get(tour_controller.get_tour_stats); // Stats using aggregation pipeline.
router.route('/monthly_plan/:year')
      .get(auth_controller.protect,auth_controller.restrict_to('admin','lead-guide'),tour_controller.get_monthly_plan);


//------------------------------------------  GeoSpatial Routes --------------------------------------
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tour_controller.get_tours_within);
// tours-within/233/center/-40,45/unit/mi
// tours-within?distance=233&center=-40,45&unit=mi

router.route('/distances/:latlng/unit/:unit').get(tour_controller.get_distances)


//-------------------------------------------------- Standard Routes ----------------------------------
router.route('/').get(tour_controller.get_all_tours)
                 .post(auth_controller.protect,auth_controller.restrict_to('admin','lead-guide'),tour_controller.create_tour); // Setting up routes for different condition.
router.route('/:id').get(tour_controller.get_tour)
                    .patch(auth_controller.protect,
                           auth_controller.restrict_to('admin','lead-guide'), 
                           tour_controller.upload_tour_images,
                           tour_controller.resize_tour_images,
                           tour_controller.update_tour)
                    .delete(auth_controller.protect,auth_controller.restrict_to('admin','lead-guide'),tour_controller.delete_tour);

//router.route('/:tourId/reviews').post(auth_controller.protect,auth_controller.restrict_to('user'),review_controller.create_review);


module.exports = router;

// ------------------------------------------------------   GET Request  -----------------------------------------------
//! Sending all the tours
//app.get('/api/v1/tours',get_all_tours);
//app.get('/api/v1/tours/:id',get_tour);
// -------------------------------------------------------- POST Request  -----------------------------------------------------
//app.post('/api/v1/tours',create_tour);
// ------------------------------------------------------- PATCH Request ----------------------------------------------------------
//app.patch('/api/v1/tours/:id',update_tour);
//  ------------------------------------------------------ DELETE Request ---------------------------------------------------------------
//app.delete('/api/v1/tours/:id',delete_tour)