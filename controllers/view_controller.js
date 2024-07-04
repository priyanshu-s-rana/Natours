const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catch_async = require('./../Utils/catch_async');
const App_error = require('./../Utils/app_error')
// exports.get_base = (req,res)=>{
//     res.status(200).render('base',{
//         tour : "The Forest Hiker",  // These options are available as variable in the mentioned " pug " file.
//         user : "Priyanshu"
//     });
// }

exports.get_overview =catch_async(async (req,res,next)=>{
    //! Get tour data from collection
    const tours = await Tour.find();
    //! Build template

    //! Render that template use tour data .

    res.status(200).render('overview',{
        title : 'All Tours',
        tours
    });
})

exports.get_tour =catch_async( async (req,res,next)=>{

    const tour = await Tour.findOne({slug : req.params.slug}).populate({
        path : 'reviews',
        fields : 'review rating user'
        }).populate('guides');
    if(!tour){
        return next(new App_error('There is no tour with that name',404));
    }


    res.status(200).render('tour',{
        title : `${tour.name} Tour`,
        tour
    });
})


exports.get_login_form = catch_async (async (req,res,next)=>{

    res.status(200).render('login',{
        title : 'Log into your account'
    })

})

exports.get_account =   (req,res)=>{
    res.status(200).render('account',{
        title : 'Your account',
    })
}

exports.update_user_data = catch_async(async (req,res,next)=>{
    const updated_user = await User.findByIdAndUpdate(req.user._id,{
        name : req.body.name,
        email : req.body.email
    },{
        new : true,
        runValidators : true
    });

    res.status(200).render('account',{
        title : 'Your account',
        user : updated_user
    })

})


exports.get_my_tours = catch_async(async(req,res,next)=>{
    //! Find all bookings
    const bookings = await Booking.find({user : req.user.id});
    //! Find tours with the returned IDs
    const tourIDs = bookings.map(el=>el.tour);
    const tours = await Tour.find({_id : {$in : tourIDs}});

    res.status(200).render('overview',{
        title : 'My Tours',
        tours
    })
})