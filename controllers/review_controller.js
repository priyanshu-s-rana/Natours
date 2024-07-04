const Review = require('./../models/reviewModel');
//const catch_async = require('./../Utils/catch_async');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');
const App_error = require('./../Utils/app_error');
const factory = require('./handlerFactory.js');


exports.get_all_reviews = factory.getAll(Review);


exports.set_tour_user_id = (req,res,next)=>{
      // const tour = await Tour.findById(req.params.tourId);
    // if(!tour){
    //     return next(new App_error("No such tour exist for the review!",404));
    // }
    if(!req.body.tour) req.body.tour = req.params.tourId;
    console.log(req.user._id);
    if(!req.body.user) req.body.user = req.user._id;
    next();
}

exports.get_review = factory.getOne(Review);
exports.create_review = factory.createOne(Review);
exports.delete_review = factory.deleteOne(Review);
exports.update_review = factory.updateOne(Review);