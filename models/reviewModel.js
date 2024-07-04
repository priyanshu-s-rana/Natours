const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
    review : {
        type : String,
        required : [true, "Review can not be empty!"]
    },
    rating : {
        type : Number,
        min : 1,
        max : 5,
    },
    createdAt : {
        type :Date,
        default : Date.now(),
    },

    //! Parent Referensing.
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : 'Tour',
        required :[true, 'Review must belong to a tour.'],
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required :[true,'Review must belong to a user.'],
    },
    
},{
    toJSON: { virtuals: true }, // When data is printed as json.
    toObject: { virtuals: true } // when data is printed as object
})


//! One user can give only one review in a tour.
reviewSchema.index({tour : 1,user : 1},{unique : true}); 

reviewSchema.pre(/^find/,function(next){
    this.populate({
     path: 'tour',
     select : 'name',
    });
    // this.populate({
    //     path : 'user',
    //     select : 'name photo',
    // })
    
    //! Only populating the user.s
    this.populate({
        path : 'user',
        select : 'name photo',
    })
    next();
})

//! Static Method.
reviewSchema.statics.calc_average_ratings = async function(tour_id){
   const stats = await this.aggregate([
        {
            $match : {tour : tour_id}
        },{
            $group :{
                _id : '$tour',
                nRatings : {$sum : 1},
                avgRating : {$avg : '$rating'}
            }
        }
    ]);
    //console.log(stats);

    await Tour.findByIdAndUpdate(tour_id,{
        ratingsQuantity :  stats.length>0 ? stats[0].nRatings : 0,
        ratingsAverage : stats.length>0 ? stats[0].avgRating : 0,
    })
}

reviewSchema.post('save',function(){
    // this points to current revie

    this.constructor.calc_average_ratings(this.tour);
})

// findByIdAndUpdate :- in background they are findOne and update.
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.review = await this.findOne();  //! this is the current querry; and findOne gives the current document.
    //console.log(this.review);
    next();
})

reviewSchema.post(/^findOneAnd/,async function(){
    //? this.findOne() does not work here because query has been already executed
  await this.review.constructor.calc_average_ratings(this.review.tour._id);
})
const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;